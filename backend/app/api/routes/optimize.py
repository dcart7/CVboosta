from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException
from starlette.concurrency import run_in_threadpool

from app.schemas.optimize import (
    CoverLetterRequest,
    CoverLetterResponse,
    OptimizeRequest,
    OptimizeResponse,
)
from app.services.llm import (
    LLMServiceError,
    extract_job_keywords,
    generate_cover_letter,
    generate_optimized_cv,
)
from app.services.matching import compute_match_score
from app.services.recommendations import build_recommendations
from app.services.keyword_store import get_keyword_list_by_source_text, save_keyword_list
from app.services.keyword_fallback import extract_keywords_fallback
from app.services.keyword_crf import extract_keywords_crf
from app.services.keyword_transformer import extract_keywords_transformer
from app.services.keyword_clean import (
    clean_job_text,
    normalize_keywords,
    extract_whitelist_keywords,
)
from app.core.config import settings
from app.api.routes.auth import get_current_user_optional
from app.services.activity_logger import record_activity
from app.services.fair_use import enforce_fair_use_or_raise
from app.services.usage import consume_feature_or_raise, refund_feature_best_effort
from app.services.analysis_crypto import (
    encrypt_text_for_user,
)
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.models.analysis import Analysis
from app.models.user import User
from app.services.push_notifications import (
    end_ats_live_activity_best_effort,
    send_analysis_ready_push_best_effort,
    update_ats_live_activity_best_effort,
)
from app.services.idempotency import (
    begin_idempotent_request,
    canonical_request_hash,
    complete_idempotent_request,
    fail_idempotent_request,
    normalize_idempotency_key,
)
from app.services.entitlements import require_paid_entitlement

router = APIRouter()


@router.post("", response_model=OptimizeResponse)
async def optimize_cv(
    payload: OptimizeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> OptimizeResponse:
    scan_receipt = None
    idempotency_attempt = None
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required to optimize CV.",
        )

    normalized_key = normalize_idempotency_key(idempotency_key)
    if normalized_key:
        attempt = begin_idempotent_request(
            db,
            operation="optimize.cv",
            scope=f"user:{current_user.id}",
            key=normalized_key,
            request_hash=canonical_request_hash(payload.model_dump(mode="json")),
            user_id=current_user.id,
        )
        idempotency_attempt = attempt
        if attempt.is_replay:
            return OptimizeResponse.model_validate(attempt.replay_response)

    try:
        require_paid_entitlement(
            db,
            current_user,
            feature="scan",
            detail="Upgrade or purchase a scan to generate the full optimized CV.",
        )
        enforce_fair_use_or_raise(db, current_user)
        scan_receipt = consume_feature_or_raise(
            db,
            user_id=current_user.id,
            feature="scan",
            exhausted_detail="Daily scan limit reached. Please upgrade your plan.",
        )
    except Exception:
        fail_idempotent_request(db, attempt=idempotency_attempt)
        raise

    async def push_ats_progress(progress: float, detail: str, eta_text: str) -> None:
        await run_in_threadpool(
            update_ats_live_activity_best_effort,
            current_user.id,
            progress,
            detail,
            eta_text,
        )

    await push_ats_progress(0.08, "Preparing ATS scan", "~15s")

    try:
        cleaned_text = clean_job_text(payload.job_text)
        await push_ats_progress(0.24, "Extracting ATS keywords", "~12s")
        cached = get_keyword_list_by_source_text(db, payload.job_text)
        if cached:
            keyword_result = cached
            ats_keywords = normalize_keywords(
                extract_whitelist_keywords(cleaned_text, limit=settings.max_ats_keywords)
                + keyword_result.skills
                + keyword_result.requirements,
                limit=settings.max_ats_keywords,
            )
        else:
            try:
                keyword_result = extract_job_keywords(cleaned_text)
                ats_keywords = normalize_keywords(
                    extract_whitelist_keywords(cleaned_text, limit=settings.max_ats_keywords)
                    + keyword_result.skills
                    + keyword_result.requirements,
                    limit=settings.max_ats_keywords,
                )
            except LLMServiceError:
                keyword_result = extract_keywords_transformer(cleaned_text)
                if keyword_result and keyword_result.skills:
                    ats_keywords = normalize_keywords(
                        extract_whitelist_keywords(cleaned_text, limit=settings.max_ats_keywords)
                        + keyword_result.skills
                        + keyword_result.requirements,
                        limit=settings.max_ats_keywords,
                    )
                else:
                    keyword_result = extract_keywords_crf(cleaned_text)
                    if keyword_result and keyword_result.skills:
                        ats_keywords = normalize_keywords(
                            extract_whitelist_keywords(cleaned_text, limit=settings.max_ats_keywords)
                            + keyword_result.skills
                            + keyword_result.requirements,
                            limit=settings.max_ats_keywords,
                        )
                    else:
                        keyword_result = extract_keywords_fallback(cleaned_text)
                        ats_keywords = normalize_keywords(
                            extract_whitelist_keywords(cleaned_text, limit=settings.max_ats_keywords)
                            + keyword_result.skills
                            + keyword_result.requirements,
                            limit=settings.max_ats_keywords,
                        )
            save_keyword_list(
                db=db,
                source_text=payload.job_text,
                skills=normalize_keywords(keyword_result.skills),
                requirements=normalize_keywords(keyword_result.requirements),
            )
        await push_ats_progress(0.48, "Optimizing your resume", "~8s")
        result = await run_in_threadpool(
            generate_optimized_cv,
            payload.cv_text,
            payload.job_text,
            payload.cv_analysis,
            payload.job_analysis,
            ats_keywords,
            payload.target_role,
            payload.target_company,
            None,  # initial forced_keywords
        )
        await push_ats_progress(0.76, "Scoring ATS match", "~4s")
        match_before, _, original_missing = await run_in_threadpool(compute_match_score, payload.cv_text, ats_keywords)
        optimized_text = result.optimized_cv
        match_after, _, missing_skills = await run_in_threadpool(compute_match_score, optimized_text, ats_keywords)
        
        added_keywords = list(set(original_missing) - set(missing_skills))


        recommendations = await run_in_threadpool(build_recommendations, missing_skills)
    except Exception as exc:
        if scan_receipt:
            refund_feature_best_effort(db, receipt=scan_receipt)
        fail_idempotent_request(db, attempt=idempotency_attempt)
        if isinstance(exc, LLMServiceError):
            raise HTTPException(
                status_code=503,
                detail={
                    "code": "optimization_unavailable",
                    "message": "AI optimization is temporarily unavailable. Your credit was not used.",
                },
                headers={"Retry-After": "3"},
            ) from exc
        if isinstance(exc, RuntimeError):
            raise HTTPException(status_code=500, detail="Optimization service failed safely.") from exc
        raise HTTPException(status_code=500, detail="Unexpected server error") from exc

    analysis_id: int | None = None
    feedback = result.feedback
    optimized_cv = result.optimized_cv

    try:
        await push_ats_progress(0.92, "Saving your analysis", "~2s")
        analysis = Analysis(
            user_id=current_user.id,
            # Do not persist plaintext CV/JD in columns.
            original_cv="",
            job_description="",
            score=match_after,
            result_json={
                "optimized_cv_enc": encrypt_text_for_user(current_user.id, result.optimized_cv),
                "job_description_enc": encrypt_text_for_user(current_user.id, payload.job_text),
                "missing_skills": missing_skills,
                "added_keywords": added_keywords,
                "recommendations": recommendations,
                "role": payload.target_role or None,
                "company": payload.target_company or None,
                "match_before": match_before,
                "match_after": match_after,
                # Single-use purchases permanently unlock the analysis
                # they paid for even after the balance reaches zero.
                "access_entitlement": (
                    "single_purchase"
                    if scan_receipt
                    and scan_receipt.bucket in {"single_credit", "app_store_credit"}
                    else "subscription"
                ),
            },
        )
        db.add(analysis)
        db.flush()
        analysis_id = analysis.id

        response_payload = OptimizeResponse(
            optimized_cv=optimized_cv,
            feedback=feedback,
            missing_skills=missing_skills,
            added_keywords=added_keywords,
            recommendations=recommendations,
            match_before=match_before,
            match_after=match_after,
            analysis_id=analysis_id,
            can_export=analysis_id is not None,
            access_entitlement=(
                "single_purchase"
                if scan_receipt
                and scan_receipt.bucket in {"single_credit", "app_store_credit"}
                else "subscription"
            ),
        )
        if idempotency_attempt:
            complete_idempotent_request(
                db,
                attempt=idempotency_attempt,
                user_id=current_user.id,
                response=response_payload.model_dump(mode="json"),
                resource_id=analysis_id,
                commit=False,
            )
        db.commit()
    except Exception as exc:
        db.rollback()
        if scan_receipt:
            refund_feature_best_effort(db, receipt=scan_receipt)
        fail_idempotent_request(db, attempt=idempotency_attempt)
        raise HTTPException(status_code=500, detail="Failed to save the optimized CV safely.") from exc

    record_activity(db, user_id=current_user.id, action="CV optimized", meta={})

    background_tasks.add_task(
        end_ats_live_activity_best_effort,
        current_user.id,
        match_after,
    )
    if analysis_id is not None:
        background_tasks.add_task(
            send_analysis_ready_push_best_effort,
            current_user.id,
            analysis_id,
        )

    return response_payload


@router.post("/cover-letter", response_model=CoverLetterResponse)
def optimize_cover_letter(
    payload: CoverLetterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
) -> CoverLetterResponse:
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required.")

    require_paid_entitlement(
        db,
        current_user,
        feature="cl",
        detail="A paid plan is required to generate a cover letter.",
    )
    enforce_fair_use_or_raise(db, current_user)
    receipt = consume_feature_or_raise(
        db,
        user_id=current_user.id,
        feature="cl",
        exhausted_detail="Daily Cover Letter limit reached. Please upgrade your plan.",
    )

    try:
        content = generate_cover_letter(
            cv_text=payload.cv_text,
            job_text=payload.job_text,
            ui_language=payload.ui_language,
        )
    except LLMServiceError:
        refund_feature_best_effort(db, receipt=receipt)
        raise
    except Exception as exc:
        refund_feature_best_effort(db, receipt=receipt)
        raise HTTPException(status_code=500, detail="Failed to generate cover letter") from exc

    if current_user:
        if payload.analysis_id:
            from sqlalchemy.orm.attributes import flag_modified
            analysis = db.query(Analysis).filter(
                Analysis.id == payload.analysis_id,
                Analysis.user_id == current_user.id
            ).first()
            if analysis:
                new_result = dict(analysis.result_json or {})
                new_result["cover_letter_enc"] = encrypt_text_for_user(current_user.id, content)
                analysis.result_json = new_result
                flag_modified(analysis, "result_json")
                db.add(analysis)
                db.commit()
        record_activity(db, user_id=current_user.id, action="Cover letter generated", meta={"analysis_id": payload.analysis_id})

    return CoverLetterResponse(content=content)
