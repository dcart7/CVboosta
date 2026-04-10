from dataclasses import dataclass
from functools import lru_cache
import json
import logging
import typing
import tenacity

from google import genai
from google.genai import errors as genai_errors

from app.core.config import settings
from app.schemas.keywords import KeywordExtractionResult


logger = logging.getLogger(__name__)

_GEMINI_FALLBACK_MODELS = ("gemini-2.5-flash",)

# BCP-47-style codes from the frontend LanguageContext
_UI_LANGUAGE_NAMES: dict[str, str] = {
    "en": "English",
    "uk": "Ukrainian",
    "pl": "Polish",
    "sk": "Slovak",
    "es": "Spanish",
}


def _is_model_unavailable(message: str) -> bool:
    lowered = message.lower()
    return (
        "not_found" in lowered
        or "is not found" in lowered
        or "not supported for generatecontent" in lowered
        or "not supported for generate_content" in lowered
    )


def _candidate_models(primary: str) -> list[str]:
    candidates = [primary, *_GEMINI_FALLBACK_MODELS]
    unique: list[str] = []
    seen: set[str] = set()
    for model in candidates:
        value = (model or "").strip()
        if not value or value in seen:
            continue
        seen.add(value)
        unique.append(value)
    return unique


def _generate_content_with_fallback(
    client: genai.Client,
    model: str,
    contents: str,
) -> typing.Any:
    last_error: genai_errors.ClientError | None = None
    for candidate in _candidate_models(model):
        try:
            return _safe_generate_content(
                client=client,
                model=candidate,
                contents=contents,
            )
        except genai_errors.ClientError as exc:
            message = str(exc)
            last_error = exc
            if _is_model_unavailable(message):
                logger.warning(
                    "Gemini model unavailable (%s). Trying fallback if available.",
                    candidate,
                )
                continue
            raise
    if last_error is not None:
        raise last_error
    raise genai_errors.ClientError("Gemini model selection failed")


def _retry_error_message(exc: tenacity.RetryError) -> str:
    # tenacity's RetryError wraps the last attempt's exception
    try:
        last_attempt = exc.last_attempt  # type: ignore[attr-defined]
        outcome = getattr(last_attempt, "outcome", None)
        if outcome is not None and getattr(outcome, "failed", False):
            last_exc = outcome.exception()
            if last_exc is not None:
                return str(last_exc)
    except Exception:
        pass
    return str(exc)


def _is_retryable_error(exception: Exception) -> bool:
    if isinstance(exception, genai_errors.ServerError):
        return True
    return False


@tenacity.retry(
    retry=tenacity.retry_if_exception(_is_retryable_error),
    stop=tenacity.stop_after_attempt(3),
    wait=tenacity.wait_exponential(multiplier=1, min=2, max=10),
    before_sleep=tenacity.before_sleep_log(logger, logging.WARNING),
)
def _safe_generate_content(client: genai.Client, model: str, contents: str) -> typing.Any:
    return client.models.generate_content(
        model=model,
        contents=contents,
    )


@dataclass
class LLMResult:
    optimized_cv: str
    feedback: str


class LLMServiceError(RuntimeError):
    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.status_code = status_code


def generate_optimized_cv(
    cv_text: str,
    job_text: str,
    cv_analysis: str | None = None,
    job_analysis: str | None = None,
    ats_keywords: list[str] | None = None,
    target_role: str | None = None,
    target_company: str | None = None,
) -> LLMResult:
    cv_text = _truncate(cv_text, settings.max_cv_chars)
    job_text = _truncate(job_text, settings.max_job_chars)
    if cv_analysis is None:
        cv_analysis = analyze_cv_text(cv_text)
    if job_analysis is None:
        job_analysis = analyze_job_text(job_text)
    return _generate_with_gemini(
        cv_text=cv_text,
        job_text=job_text,
        cv_analysis=cv_analysis,
        job_analysis=job_analysis,
        ats_keywords=ats_keywords,
        target_role=target_role,
        target_company=target_company,
    )


def analyze_cv_text(cv_text: str) -> str:
    cv_text = _truncate(cv_text, settings.max_cv_chars)
    prompt = (
        "You are a CV analyst. Provide a concise, structured critique.\n"
        "Include strengths, risks for ATS, and top improvement priorities.\n"
        "Keep it short and actionable.\n\n"
        f"CV:\n{cv_text}\n"
    )
    return _generate_text_with_gemini(prompt)


def analyze_job_text(job_text: str) -> str:
    job_text = _truncate(job_text, settings.max_job_chars)
    prompt = (
        "You are a job posting analyst. Summarize role expectations and key skills.\n"
        "Highlight must-have requirements and nice-to-haves.\n"
        "Keep it short and actionable.\n\n"
        f"Job description:\n{job_text}\n"
    )
    return _generate_text_with_gemini(prompt)


def extract_job_keywords(job_text: str) -> KeywordExtractionResult:
    job_text = _truncate(job_text, settings.max_job_chars)
    prompt = (
        "You are a keyword extraction assistant for ATS matching.\n"
        "Extract skills and requirements from the job description.\n"
        "Return STRICT JSON only with the exact fields below.\n\n"
        "JSON schema:\n"
        "{\n"
        '  "skills": string[],\n'
        '  "requirements": string[]\n'
        "}\n\n"
        "Rules:\n"
        "- Use concise phrases.\n"
        "- Keep wording aligned to the posting.\n"
        "- Do not invent facts.\n\n"
        f"Job description:\n{job_text}\n"
    )
    data = _generate_json_with_gemini(prompt)
    return KeywordExtractionResult.model_validate(data)


def generate_interview_prep(
    job_text: str,
    missing_keywords: list[str],
    ui_language: str = "en",
) -> list[dict]:
    job_text = _truncate(job_text, settings.max_job_chars)
    keywords_str = ", ".join(missing_keywords) if missing_keywords else "General role requirements"
    lang_key = (ui_language or "en").strip().lower()
    output_language = _UI_LANGUAGE_NAMES.get(lang_key, "English")

    prompt = (
        "You are an expert Interview Coach. Generate a list of targeted interview questions "
        "based on the job description and the candidate's missing skills/keywords.\n\n"
        "GOAL:\n"
        "Create 5-8 questions that a recruiter would likely ask to probe these specific gaps "
        "or to verify the candidate's core competency for the role.\n\n"
        "MISSING KEYWORDS/SKILLS:\n"
        f"{keywords_str}\n\n"
        "JOB DESCRIPTION:\n"
        f"{job_text}\n\n"
        "OUTPUT FORMAT (STRICT JSON ONLY):\n"
        "{\n"
        '  "questions": [\n'
        "    {\n"
        '      "question": "The actual question text",\n'
        '      "why": "Brief explanation of why a recruiter asks this",\n'
        '      "tips": "Actionable tips for the candidate on how to answer effectively"\n'
        "    }\n"
        "  ]\n"
        "}\n\n"
        "Rules:\n"
        f"- Write every \"question\", \"why\", and \"tips\" field in {output_language}. "
        "Use clear, professional wording natural for that language.\n"
        "- The job description may be in any language; still write your JSON text in "
        f"{output_language}.\n"
        "- Make questions professional, challenging, and specific to the role.\n"
        "- Keep role-specific technical terms where they are standard (e.g. API, Kubernetes) "
        "even when the rest is in the target language.\n"
        "- Do not include any text outside the JSON block.\n"
    )

    data = _generate_json_with_gemini(prompt)
    return data.get("questions", [])


def _generate_with_gemini(
    cv_text: str,
    job_text: str,
    cv_analysis: str,
    job_analysis: str,
    ats_keywords: list[str] | None,
    target_role: str | None,
    target_company: str | None,
) -> LLMResult:
    if not settings.gemini_api_key:
        raise LLMServiceError("GEMINI_API_KEY is not set", status_code=500)

    client = _get_gemini_client()

    keyword_block = ""
    if ats_keywords:
        cleaned = [kw.strip() for kw in ats_keywords if kw.strip()]
        if cleaned:
            keyword_block = (
                "ATS KEYWORDS (prioritize these where truthful):\n"
                + " · ".join(cleaned)
                + "\n\n"
                "Requirement: If a keyword is already supported by the CV, ensure it appears verbatim at least once.\n"
                "Do not invent experience; if a keyword can't be supported, omit it.\n\n"
            )

    target_block = ""
    if (target_role or "").strip() or (target_company or "").strip():
        role = (target_role or "").strip() or "—"
        company = (target_company or "").strip() or "—"
        target_block = f"Target role: {role}\nTarget company: {company}\n\n"

    prompt = (
        "You are an expert CV optimization assistant. Your goal is to rewrite the input CV to maximize its match with the provided Job Description.\n\n"
        "RULES:\n"
        "1. KEYWORD INJECTION: You MUST identify and seamlessly inject ALL relevant skills and keywords from the Job Description into the CV. Reword existing accomplishments to include these keywords naturally.\n"
        "2. NO HALLUCINATION: You are STRICTLY FORBIDDEN from inventing fake job titles, companies, dates, or prior experience that isn't in the original CV. Only rephrase existing factual information.\n"
        "3. PROFESSIONAL TONE: Use active verbs, remove fluff, and ensure the formatting is clean.\n"
        "4. OUTPUT ONLY the final optimized CV text. No intro, no summary of changes, no explanations.\n\n"
        f"{target_block}"
        f"{keyword_block}"
        f"INPUT CV:\n{cv_text}\n\n"
        f"JOB DESCRIPTION:\n{job_text}\n\n"
        "OPTIMIZED CV:"
    )

    try:
        response = _generate_content_with_fallback(
            client=client,
            model=settings.gemini_model,
            contents=prompt,
        )
        optimized_cv = (getattr(response, "text", "") or "").strip()
        if not optimized_cv:
            raise LLMServiceError("GEMINI_ERROR: empty response", status_code=502)
        return LLMResult(
            optimized_cv=optimized_cv,
            feedback="Generated by Gemini API.",
        )
    except tenacity.RetryError as exc:
        message = _retry_error_message(exc)
        logger.warning("Gemini retries exhausted: %s", message)
        raise LLMServiceError(
            "GEMINI_ERROR: temporary upstream error, please retry",
            status_code=503,
        ) from exc
    except genai_errors.ClientError as exc:
        message = str(exc)
        status_code = _map_gemini_error_to_status(message)
        logger.warning("Gemini client error: %s", message)
        raise LLMServiceError(f"GEMINI_ERROR: {message}", status_code=status_code) from exc
    except Exception as exc:
        message = str(exc)
        logger.exception("Gemini unexpected error: %s", message)
        raise LLMServiceError(f"GEMINI_ERROR: {message}", status_code=503) from exc


def _generate_text_with_gemini(prompt: str) -> str:
    if not settings.gemini_api_key:
        raise LLMServiceError("GEMINI_API_KEY is not set", status_code=500)

    client = _get_gemini_client()
    try:
        response = _generate_content_with_fallback(
            client=client,
            model=settings.gemini_model,
            contents=prompt,
        )
    except tenacity.RetryError as exc:
        message = _retry_error_message(exc)
        logger.warning("Gemini retries exhausted: %s", message)
        raise LLMServiceError(
            "GEMINI_ERROR: temporary upstream error, please retry",
            status_code=503,
        ) from exc
    except genai_errors.ClientError as exc:
        message = str(exc)
        status_code = _map_gemini_error_to_status(message)
        logger.warning("Gemini client error: %s", message)
        raise LLMServiceError(f"GEMINI_ERROR: {message}", status_code=status_code) from exc
    except Exception as exc:
        message = str(exc)
        logger.exception("Gemini unexpected error: %s", message)
        raise LLMServiceError(f"GEMINI_ERROR: {message}", status_code=503) from exc

    text = (getattr(response, "text", "") or "").strip()
    if not text:
        raise LLMServiceError("GEMINI_ERROR: empty response", status_code=502)
    return text


def _generate_json_with_gemini(prompt: str) -> dict:
    if not settings.gemini_api_key:
        raise LLMServiceError("GEMINI_API_KEY is not set", status_code=500)

    client = _get_gemini_client()
    try:
        response = _generate_content_with_fallback(
            client=client,
            model=settings.gemini_model,
            contents=prompt,
        )
    except tenacity.RetryError as exc:
        message = _retry_error_message(exc)
        logger.warning("Gemini retries exhausted: %s", message)
        raise LLMServiceError(
            "GEMINI_ERROR: temporary upstream error, please retry",
            status_code=503,
        ) from exc
    except genai_errors.ClientError as exc:
        message = str(exc)
        status_code = _map_gemini_error_to_status(message)
        logger.warning("Gemini client error: %s", message)
        raise LLMServiceError(f"GEMINI_ERROR: {message}", status_code=status_code) from exc
    except Exception as exc:
        message = str(exc)
        logger.exception("Gemini unexpected error: %s", message)
        raise LLMServiceError(f"GEMINI_ERROR: {message}", status_code=503) from exc

    raw_text = (getattr(response, "text", "") or "").strip()
    if not raw_text:
        raise LLMServiceError("GEMINI_ERROR: empty response", status_code=502)
    return _extract_json(raw_text)


def _extract_json(raw_text: str) -> dict:
    text = raw_text.strip()
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise LLMServiceError("GEMINI_ERROR: invalid JSON response", status_code=502)
    
    start_idx: int = start
    end_idx: int = end + 1
    content = typing.cast(str, text)[start_idx : end_idx]
    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        raise LLMServiceError("GEMINI_ERROR: invalid JSON response", status_code=502) from exc


def _truncate(value: str, limit: int) -> str:
    if limit <= 0:
        return ""
    if len(value) <= limit:
        return value
    return typing.cast(str, value)[:limit].rstrip()


@lru_cache(maxsize=1)
def _get_gemini_client() -> genai.Client:
    return genai.Client(api_key=settings.gemini_api_key)


def _map_gemini_error_to_status(message: str) -> int:
    lowered = message.lower()
    if "resource_exhausted" in lowered or "quota" in lowered:
        return 429
    if "permission_denied" in lowered or "unauthorized" in lowered or "api key" in lowered:
        return 401
    if "deadline" in lowered or "timeout" in lowered or "unavailable" in lowered:
        return 503
    return 502
