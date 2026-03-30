from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.analyze import router as analyze_router
from app.api.routes.optimize import router as optimize_router
from app.core.api_key import api_key_middleware
from app.core.rate_limit import rate_limit_middleware
from app.db.init_db import init_db

app = FastAPI(title="Smart CV Optimizer API")

app.middleware("http")(rate_limit_middleware)
app.middleware("http")(api_key_middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/analyze", tags=["analyze"])
app.include_router(optimize_router, tags=["optimize"])


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
