from fastapi import FastAPI

app = FastAPI(title="Safe Mode Diagnostics")

@app.get("/health")
def health():
    return {"status": "safe_mode_active", "info": "If you see this, the infrastructure is correctly configured."}

@app.get("/")
def read_root():
    return {"message": "Welcome to CVboosta Safe Mode"}
