import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback
import sys

from app.core.config import settings, get_cors_origins
from app.api.routes.analyze import router as analyze_router
from app.api.routes.auth import router as auth_router
from app.api.routes.history import router as history_router
from app.api.routes.logs import router as logs_router
from app.api.routes.optimize import router as optimize_router
from app.api.routes.billing import router as billing_router
from app.core.api_key import api_key_middleware
from app.core.rate_limit import rate_limit_middleware
from app.services.request_logger import capture_response_body, log_request_response
from app.services.llm import LLMServiceError

app = FastAPI(title="Smart CV Optimizer API")

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
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. We are looking into it."},
    )


from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(Exception)
@app.exception_handler(StarletteHTTPException)
async def global_exception_handler(request: Request, exc: Exception):
    status_code = 500
    detail = str(exc)
    
    if isinstance(exc, StarletteHTTPException):
        status_code = exc.status_code
        detail = str(exc.detail)

    print(f"GLOBAL ERROR ({status_code}): {detail}")
    trace = traceback.format_exc()
    
    # Manually add CORS headers
    origin = request.headers.get("origin", "*")
    headers = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*"
    }
    
    return JSONResponse(
        status_code=status_code,
        headers=headers,
        content={
            "status_code": status_code,
            "detail": detail,
            "type": type(exc).__name__,
            "traceback": trace,
            "info": "Diagnostic mode enabled. All errors intercepted."
        }
    )

@app.middleware("http")
async def request_logger_middleware(request: Request, call_next):  # type: ignore[no-untyped-def]
    start_time = time.perf_counter()
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        body = b""
    else:
        body = await request.body()
        request._body = body
    response = await call_next(request)
    # Add Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"

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
app.include_router(logs_router, tags=["logs"])
app.include_router(auth_router, tags=["auth"])
app.include_router(history_router, tags=["history"])
app.include_router(billing_router, prefix="/billing", tags=["billing"])


@app.on_event("startup")
def on_startup() -> None:
    print("STARTUP: Application is booting...")
    print(f"STARTUP: Database URL present: {settings.database_url is not None}")
    print(f"STARTUP: CORS Origins: {get_cors_origins()}")
    
    # Verify model files
    from pathlib import Path
    crf_path = Path("/app") / settings.keyword_crf_model_path
    transformer_path = Path("/app") / settings.keyword_transformer_model_path
    print(f"STARTUP: CRF Model file exists at {crf_path}: {crf_path.exists()}")
    print(f"STARTUP: Transformer Model dir exists at {transformer_path}: {transformer_path.exists()}")

    # We no longer run init_db here to ensure fastest possible port binding for Cloud Run health checks.
    # DB initialization is handled lazily in get_db().
    print("STARTUP: Boot process complete. Ready for requests.")
    pass


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "environment": "production"}
