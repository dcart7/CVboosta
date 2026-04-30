from app.schemas.keywords import KeywordExtractionResult
from app.services.llm import LLMResult


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"


def test_upload_cv_text(client):
    content = b"Skills\nPython, SQL\nExperience\nBackend Developer"
    response = client.post(
        "/analyze/upload",
        files={"file": ("resume.txt", content, "text/plain")},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "raw_text" in payload
    assert payload["skills"] == ["Python", "SQL"]
    assert "Backend Developer" in payload["markdown"]


def test_analyze_cv_route(client, monkeypatch):
    from app.api.routes import analyze as analyze_routes
    monkeypatch.setattr(analyze_routes, "analyze_cv_text", lambda text: "OK")
    response = client.post("/analyze/cv", json={"cv_text": "My CV"})
    assert response.status_code == 200
    assert response.json()["cv_analysis"] == "OK"


def test_analyze_job_route(client, monkeypatch):
    from app.api.routes import analyze as analyze_routes
    monkeypatch.setattr(analyze_routes, "analyze_job_text", lambda text: "OK")
    response = client.post("/analyze/job", json={"job_text": "Job"})
    assert response.status_code == 200
    assert response.json()["job_analysis"] == "OK"


def test_extract_keywords_route(client, monkeypatch):
    from app.api.routes import analyze as analyze_routes
    from app.schemas.keywords import KeywordExtractionResult
    monkeypatch.setattr(
        analyze_routes,
        "extract_keywords_transformer",
        lambda text: KeywordExtractionResult(skills=["Python"], requirements=["SQL"]),
    )
    monkeypatch.setattr(analyze_routes, "save_keyword_list", lambda **_: 123)
    response = client.post("/analyze/keywords", json={"job_text": "Job"})
    assert response.status_code == 200
    payload = response.json()
    assert "Python" in payload["skills"]
    assert payload["keyword_list_id"] == 123


def test_match_cv_job_route(client, monkeypatch):
    from app.api.routes import analyze as analyze_routes
    from app.schemas.keywords import KeywordExtractionResult
    monkeypatch.setattr(
        analyze_routes,
        "extract_keywords_transformer",
        lambda text: KeywordExtractionResult(skills=["Python"], requirements=["SQL"]),
    )
    response = client.post(
        "/analyze/match",
        json={"cv_text": "Python SQL", "job_text": "Job"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["match_percent"] > 0


def test_optimize_route(client, monkeypatch):
    from app.api.routes import optimize as optimize_routes
    from app.schemas.keywords import KeywordExtractionResult
    from app.services.llm import LLMResult
    monkeypatch.setattr(
        optimize_routes,
        "generate_optimized_cv",
        lambda *_, **__: LLMResult(optimized_cv="OK", feedback="done"),
    )
    monkeypatch.setattr(
        optimize_routes,
        "extract_job_keywords",
        lambda text: KeywordExtractionResult(skills=["Python", "SQL"], requirements=[]),
    )
    monkeypatch.setattr(
        optimize_routes,
        "build_recommendations",
        lambda missing: [f"Learn {m}" for m in missing],
    )

    reg = client.post(
        "/auth/register",
        json={"email": "u@example.com", "password": "password123", "full_name": "U"},
    )
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    response = client.post(
        "/optimize",
        json={
            "cv_text": "Python",
            "job_text": "Job",
            "cv_analysis": "a",
            "job_analysis": "b",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["optimized_cv"] == "OK"

    # Free tier is limited to 1 scan/day.
    response2 = client.post(
        "/optimize",
        json={
            "cv_text": "Python",
            "job_text": "Job",
            "cv_analysis": "a",
            "job_analysis": "b",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response2.status_code == 402


def test_csrf_blocks_cookie_auth_without_origin(client, monkeypatch):
    from app.api.routes import optimize as optimize_routes
    from app.schemas.keywords import KeywordExtractionResult
    from app.services.llm import LLMResult

    monkeypatch.setattr(
        optimize_routes,
        "generate_optimized_cv",
        lambda *_, **__: LLMResult(optimized_cv="OK", feedback="done"),
    )
    monkeypatch.setattr(
        optimize_routes,
        "extract_job_keywords",
        lambda text: KeywordExtractionResult(skills=["Python", "SQL"], requirements=[]),
    )
    monkeypatch.setattr(
        optimize_routes,
        "build_recommendations",
        lambda missing: [f"Learn {m}" for m in missing],
    )

    reg = client.post(
        "/auth/register",
        json={"email": "csrf@example.com", "password": "password123", "full_name": "U"},
    )
    assert reg.status_code == 200

    # Cookie-based auth is now protected by Origin/Referer checks.
    blocked = client.post(
        "/optimize",
        json={
            "cv_text": "Python",
            "job_text": "Job",
            "cv_analysis": "a",
            "job_analysis": "b",
        },
    )
    assert blocked.status_code == 403

    allowed = client.post(
        "/optimize",
        json={
            "cv_text": "Python",
            "job_text": "Job",
            "cv_analysis": "a",
            "job_analysis": "b",
        },
        headers={"Origin": "http://localhost:3000"},
    )
    assert allowed.status_code == 200
