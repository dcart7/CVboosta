import json

from fastapi import APIRouter, File, Form, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session

from app.schemas.analysis import AnalysisResponse
from app.schemas.cv import ParsedCvResponse
from app.schemas.keywords import (
    KeywordExtractionRequest,
    KeywordExtractionResponse,
)
from app.schemas.matching import MatchRequest, MatchResponse
from app.schemas.pipeline import (
    AnalyzeCvRequest,
    AnalyzeCvResponse,
    AnalyzeJobRequest,
    AnalyzeJobResponse,
    InterviewPrepRequest,
    InterviewPrepResponse,
)
from app.services.cv_parser import parse_cv
from app.services.keyword_clean import (
    clean_job_text,
    normalize_keywords,
    extract_whitelist_keywords,
)
from app.services.keyword_fallback import extract_keywords_fallback
from app.services.llm import (
    LLMServiceError,
    generate_interview_prep,
)
from app.core.config import settings
from app.services.matching import compute_match_score
from app.db.session import get_db
from app.api.routes.auth import get_current_user_optional
from app.services.activity_logger import record_activity
from app.services.fair_use import enforce_fair_use_or_raise
from app.services.usage import consume_feature_or_raise, refund_feature_best_effort
from app.services.analysis_crypto import encrypt_json_for_user
from app.services.entitlements import require_paid_entitlement

router = APIRouter()


def _deterministic_job_keywords(job_text: str) -> list[str]:
    cleaned_text = clean_job_text(job_text)
    fallback = extract_keywords_fallback(cleaned_text)
    return normalize_keywords(
        extract_whitelist_keywords(cleaned_text, limit=settings.max_ats_keywords)
        + fallback.skills
        + fallback.requirements,
        limit=settings.max_ats_keywords,
    )


@router.post("", response_model=AnalysisResponse)
async def analyze_cv(
    file: UploadFile = File(...),
    job_description: str = Form(...),
) -> AnalysisResponse:
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
    file_bytes = await file.read(MAX_FILE_SIZE + 1)
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5MB.")
    parsed = parse_cv(file_bytes=file_bytes, filename=file.filename or "")
    return AnalysisResponse(
        score=0,
        missing_keywords=[],
        optimized_cv=parsed.raw_text,
        feedback="Stage 3: extracted plain text from CV PDF/TXT.",
    )


@router.post("/upload", response_model=ParsedCvResponse)
async def upload_cv(file: UploadFile = File(...)) -> ParsedCvResponse:
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
    file_bytes = await file.read(MAX_FILE_SIZE + 1)
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5MB.")
    try:
        parsed = parse_cv(file_bytes=file_bytes, filename=file.filename or "")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Failed to parse CV file") from exc


    structured_payload = {
        "skills": parsed.skills,
        "work_experience": parsed.work_experience,
        "education": parsed.education,
        "achievements": parsed.achievements,
    }

    pretty_json = json.dumps(structured_payload, indent=2, ensure_ascii=False)
    markdown = (
        "## Skills\n"
        + ("\n".join(f"- {item}" for item in parsed.skills) or "- —")
        + "\n\n## Experience\n"
        + ("\n".join(f"- {item}" for item in parsed.work_experience) or "- —")
        + "\n\n## Education\n"
        + ("\n".join(f"- {item}" for item in parsed.education) or "- —")
        + "\n\n## Achievements\n"
        + ("\n".join(f"- {item}" for item in parsed.achievements) or "- —")
    )

    return ParsedCvResponse(
        raw_text=parsed.raw_text,
        skills=parsed.skills,
        work_experience=parsed.work_experience,
        education=parsed.education,
        achievements=parsed.achievements,
        pretty_json=pretty_json,
        markdown=markdown,
        feedback="CV text extracted.",
    )


@router.post("/cv", response_model=AnalyzeCvResponse)
def analyze_cv_text_route(
    payload: AnalyzeCvRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
) -> AnalyzeCvResponse:
    text = payload.cv_text
    word_count = len(text.split())
    has_metrics = any(character.isdigit() for character in text)
    analysis = (
        f"CV contains approximately {word_count} words. "
        f"Measurable evidence is {'present' if has_metrics else 'limited'}; "
        "compare the document with a target vacancy to identify role-specific gaps."
    )

    if current_user:
        record_activity(db, user_id=current_user.id, action="CV analysis", meta={})
    return AnalyzeCvResponse(
        cv_analysis=analysis,
        feedback="Deterministic CV diagnostic generated.",
    )


@router.post("/job", response_model=AnalyzeJobResponse)
def analyze_job_text_route(
    payload: AnalyzeJobRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
) -> AnalyzeJobResponse:
    keywords = _deterministic_job_keywords(payload.job_text)
    analysis = (
        "Priority vacancy terms: " + ", ".join(keywords[:12])
        if keywords
        else "No reliable role-specific terms were detected."
    )

    if current_user:
        record_activity(db, user_id=current_user.id, action="Job analysis", meta={})
    return AnalyzeJobResponse(
        job_analysis=analysis,
        feedback="Deterministic job diagnostic generated.",
    )


@router.post("/keywords", response_model=KeywordExtractionResponse)
def extract_keywords(
    payload: KeywordExtractionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
) -> KeywordExtractionResponse:
    cleaned_text = clean_job_text(payload.job_text)
    result = extract_keywords_fallback(cleaned_text)
    feedback = "Deterministic keywords generated."
    whitelist_hits = extract_whitelist_keywords(cleaned_text, limit=settings.max_ats_keywords)
    result.skills = normalize_keywords(whitelist_hits + result.skills)
    result.requirements = normalize_keywords(result.requirements)

    # Public deterministic analysis never persists a guest's job description.
    keyword_list_id = None

    if current_user:
        record_activity(db, user_id=current_user.id, action="Keyword extraction", meta={})

    return KeywordExtractionResponse(
        skills=result.skills,
        requirements=result.requirements,
        keyword_list_id=keyword_list_id,
        feedback=feedback,
    )


@router.post("/match", response_model=MatchResponse)
def match_cv_job(
    payload: MatchRequest,
    db: Session = Depends(get_db),
) -> MatchResponse:
    # Note: this endpoint is intentionally unauthenticated.
    keywords: list[str] | None = None
    feedback = "Match score computed from extracted keywords."

    if payload.keywords:
        keywords = normalize_keywords(payload.keywords, limit=settings.max_ats_keywords)
        feedback = "Match score computed from provided keywords."
    else:
        cleaned_text = clean_job_text(payload.job_text)
        keyword_result = extract_keywords_fallback(cleaned_text)
        keywords = _deterministic_job_keywords(payload.job_text)
        feedback = "Match score computed from deterministic vacancy keywords."


    match_percent, matched, missing = compute_match_score(payload.cv_text, keywords or [])

    return MatchResponse(
        match_percent=match_percent,
        matched_keywords=matched,
        missing_keywords=missing,
        total_keywords=len(matched) + len(missing),
        feedback=feedback,
    )


@router.post("/interview-prep", response_model=InterviewPrepResponse)
def interview_prep_route(
    payload: InterviewPrepRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
) -> InterviewPrepResponse:
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required.")

    require_paid_entitlement(
        db,
        current_user,
        feature="prep",
        detail="A paid plan is required to generate interview preparation.",
    )
    enforce_fair_use_or_raise(db, current_user)
    receipt = consume_feature_or_raise(
        db,
        user_id=current_user.id,
        feature="prep",
        exhausted_detail="Daily Interview Prep limit reached. Please upgrade your plan.",
    )

    try:
        questions = generate_interview_prep(
            job_text=payload.job_text,
            missing_keywords=payload.missing_keywords,
            ui_language=payload.ui_language,
        )
    except LLMServiceError as exc:
        refund_feature_best_effort(db, receipt=receipt)
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    except Exception as exc:
        refund_feature_best_effort(db, receipt=receipt)
        raise HTTPException(status_code=500, detail="Unexpected server error") from exc

    if current_user:
        if payload.analysis_id:
            from app.models.analysis import Analysis
            from sqlalchemy.orm.attributes import flag_modified
            analysis = db.query(Analysis).filter(
                Analysis.id == payload.analysis_id,
                Analysis.user_id == current_user.id
            ).first()
            if analysis:
                new_result = dict(analysis.result_json or {})
                new_result["interview_questions_enc"] = encrypt_json_for_user(current_user.id, questions)
                analysis.result_json = new_result
                flag_modified(analysis, "result_json")
                db.add(analysis)
                db.commit()

        record_activity(db, user_id=current_user.id, action="Interview prep", meta={"analysis_id": payload.analysis_id})

    return InterviewPrepResponse(
        questions=questions, feedback="Interview questions generated by LLM."
    )
