import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.routes.internal import router as internal_router
from app.services.llm import LLMServiceError

logger = logging.getLogger(__name__)

app = FastAPI(title="CVBoosta AI Core")


@app.exception_handler(LLMServiceError)
async def llm_service_error_handler(request: Request, exc: LLMServiceError):
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
        },
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. We are looking into it."},
    )


app.include_router(internal_router, prefix="/internal", tags=["internal"])
