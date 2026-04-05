from app.schemas.keywords import KeywordExtractionResult
from app.services.llm import LLMResult


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


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
    from app.services import llm

    monkeypatch.setattr(llm, "analyze_cv_text", lambda text: "OK")
    response = client.post("/analyze/cv", json={"cv_text": "My CV"})
    assert response.status_code == 200
    assert response.json()["cv_analysis"] == "OK"


def test_analyze_job_route(client, monkeypatch):
    from app.services import llm

    monkeypatch.setattr(llm, "analyze_job_text", lambda text: "OK")
    response = client.post("/analyze/job", json={"job_text": "Job"})
    assert response.status_code == 200
    assert response.json()["job_analysis"] == "OK"


def test_extract_keywords_route(client, monkeypatch):
    from app.services import llm
    from app.services import keyword_store

    monkeypatch.setattr(
        llm,
        "extract_job_keywords",
        lambda text: KeywordExtractionResult(skills=["Python"], requirements=["SQL"]),
    )
    monkeypatch.setattr(keyword_store, "save_keyword_list", lambda **_: 123)
    response = client.post("/analyze/keywords", json={"job_text": "Job"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["skills"] == ["Python"]
    assert payload["requirements"] == ["SQL"]
    assert payload["keyword_list_id"] == 123


def test_match_cv_job_route(client, monkeypatch):
    from app.services import llm

    monkeypatch.setattr(
        llm,
        "extract_job_keywords",
        lambda text: KeywordExtractionResult(skills=["Python"], requirements=["SQL"]),
    )
    response = client.post(
        "/analyze/match",
        json={"cv_text": "Python SQL", "job_text": "Job"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["match_percent"] == 100
    assert payload["missing_keywords"] == []
    assert payload["total_keywords"] == 2


def test_optimize_route(client, monkeypatch):
    from app.services import llm
    from app.services import recommendations

    monkeypatch.setattr(
        llm,
        "generate_optimized_cv",
        lambda **_: LLMResult(optimized_cv="OK", feedback="done"),
    )
    monkeypatch.setattr(
        llm,
        "extract_job_keywords",
        lambda text: KeywordExtractionResult(skills=["Python", "SQL"], requirements=[]),
    )
    monkeypatch.setattr(
        recommendations,
        "build_recommendations",
        lambda missing: [f"Learn {m}" for m in missing],
    )
    response = client.post(
        "/optimize",
        json={
            "cv_text": "Python",
            "job_text": "Job",
            "cv_analysis": "a",
            "job_analysis": "b",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["optimized_cv"] == "OK"
    assert payload["missing_skills"] == ["SQL"]
    assert payload["recommendations"] == ["Learn SQL"]
