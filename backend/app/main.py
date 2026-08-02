import time
import logging
import re
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings, get_cors_origins
from app.api.routes.analyze import router as analyze_router
from app.api.routes.auth import router as auth_router
from app.api.routes.history import router as history_router
from app.api.routes.logs import router as logs_router
from app.api.routes.optimize import router as optimize_router
from app.api.routes.billing import router as billing_router
from app.api.routes.push import router as push_router
from app.api.routes.push_internal import router as push_internal_router
from app.api.routes.demo import router as demo_router
from app.core.api_key import api_key_middleware
from app.core.csrf import csrf_protect_middleware
from app.core.rate_limit import rate_limit_middleware, shared_rate_limit_ready
from app.db.session import get_engine
from sqlalchemy import inspect, text
from app.services.request_logger import capture_response_body, log_request_response
from app.services.llm import LLMServiceError

logger = logging.getLogger(__name__)
_REQUEST_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{8,64}$")


@asynccontextmanager
async def lifespan(_app: FastAPI):  # type: ignore[no-untyped-def]
    logger.info(
        "Application startup",
        extra={
            "database_configured": settings.database_url is not None,
            "cors_origin_count": len(get_cors_origins()),
        },
    )

    # Schema changes are an explicit deployment step. Startup and readiness
    # probes never run CREATE/ALTER statements.
    yield


app = FastAPI(title="Smart CV Optimizer API", lifespan=lifespan)

app.middleware("http")(csrf_protect_middleware)
app.middleware("http")(rate_limit_middleware)
app.middleware("http")(api_key_middleware)


@app.exception_handler(LLMServiceError)
async def llm_service_error_handler(request: Request, exc: LLMServiceError):
    # Hide raw internal Gemini error messages
    detail_str = str(exc)
    if "GEMINI_ERROR" in detail_str:
        detail_str = "AI Generation Service is currently unavailable. Please try again."
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": detail_str},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(
        "Unhandled server exception",
        extra={
            "path": request.url.path,
            "method": request.method,
            "request_id": getattr(request.state, "request_id", None),
        },
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. We are looking into it."},
    )


@app.middleware("http")
async def request_logger_middleware(request: Request, call_next):  # type: ignore[no-untyped-def]
    start_time = time.perf_counter()
    supplied_request_id = (request.headers.get("x-request-id") or "").strip()
    request_id = (
        supplied_request_id
        if _REQUEST_ID_PATTERN.fullmatch(supplied_request_id)
        else uuid.uuid4().hex
    )
    request.state.request_id = request_id

    # Fast path: avoid reading request bodies or buffering response streams when
    # persistent request logging is disabled (the production default).
    body = b""
    if settings.request_logging_enabled:
        content_type = request.headers.get("content-type", "")
        if "multipart/form-data" not in content_type:
            body = await request.body()
            request._body = body
    response = await call_next(request)
    # Add Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
    response.headers["X-Request-ID"] = request_id
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "base-uri 'self'; "
        "object-src 'none'; "
        "frame-ancestors 'none'; "
        "form-action 'self'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data: https://fonts.gstatic.com; "
        "style-src 'self' https://fonts.googleapis.com; "
        "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com; "
        "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com;"
    )
    is_https = (
        request.url.scheme.lower() == "https"
        or request.headers.get("x-forwarded-proto", "").split(",")[0].strip().lower() == "https"
    )
    if is_https:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

    if request.url.path.startswith(("/auth", "/billing", "/history", "/optimize", "/analyze")):
        response.headers["Cache-Control"] = "no-store"

    if settings.request_logging_enabled:
        response, response_body = await capture_response_body(response)
        await log_request_response(
            request,
            response,
            start_time=start_time,
            request_body=body,
            response_body=response_body,
        )
    return response

origins = get_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/analyze", tags=["analyze"])
app.include_router(optimize_router, prefix="/optimize", tags=["optimize"])
app.include_router(demo_router, prefix="/demo", tags=["demo"])
app.include_router(logs_router, tags=["logs"])
app.include_router(auth_router, tags=["auth"])
app.include_router(history_router, tags=["history"])
app.include_router(push_router, tags=["push"])
app.include_router(billing_router, prefix="/billing", tags=["billing"])
app.include_router(push_internal_router, prefix="/internal", tags=["internal"])


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "environment": settings.app_env}


@app.get("/health/live")
def health_live() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/ready")
async def health_ready() -> dict[str, str]:
    engine = get_engine()
    if engine is None:
        raise HTTPException(status_code=503, detail="Database is not configured.")
    required_tables = {
        "users",
        "analyses",
        "idempotency_records",
        "stripe_payment_applications",
        "app_store_purchase_owners",
        "pending_stripe_checkouts",
        "keyword_lists",
    }
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        missing = sorted(name for name in required_tables if not inspect(engine).has_table(name))
    except Exception as exc:
        logger.warning("Readiness database check failed", exc_info=exc)
        raise HTTPException(status_code=503, detail="Database is unavailable.") from exc
    if missing:
        raise HTTPException(status_code=503, detail="Database migrations are pending.")
    if not await shared_rate_limit_ready():
        raise HTTPException(status_code=503, detail="Shared abuse protection is unavailable.")
    return {"status": "ready"}
