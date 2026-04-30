# Smart CV Optimizer

SaaS for ATS-friendly CV optimization and honest feedback.

## Structure
- `frontend/` Next.js app (skeleton)
- `backend/` FastAPI app (skeleton)

## Services (Docker Compose)
- `frontend` public UI (proxied by `nginx`)
- `backend` public API (proxied as `/api/*`)
- `ai_core` private AI core API (served as `/internal/*`, not exposed by `nginx`)

### Using `ai_core` from another service (e.g. joboosta)
- Set `INTERNAL_API_KEY` in environment (see `.env.example`)
- (Optional) set `INTERNAL_ALLOWED_CIDRS` to restrict who can call `/internal/*`
- Call `POST /internal/optimize` with header `x-internal-api-key: <INTERNAL_API_KEY>`

## Next Steps
- Wire endpoints in `backend/app/api/routes/analyze.py`
- Implement parsing/scoring services in `backend/app/services/`
- Build UI in `frontend/app/`
