from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from app.core.config import settings
from app.schemas.keywords import KeywordExtractionResult

try:
    from transformers import AutoModelForTokenClassification, AutoTokenizer, pipeline
except Exception:  # pragma: no cover
    AutoModelForTokenClassification = None  # type: ignore[assignment]
    AutoTokenizer = None  # type: ignore[assignment]
    pipeline = None  # type: ignore[assignment]


@lru_cache(maxsize=1)
def _load_pipeline():
    if AutoTokenizer is None or AutoModelForTokenClassification is None or pipeline is None:
        return None
    model_path = Path(settings.keyword_transformer_model_path)
    if not model_path.is_absolute():
        model_path = Path(__file__).resolve().parents[3] / model_path
    if not model_path.exists():
        return None
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForTokenClassification.from_pretrained(model_path)
    return pipeline(
        "token-classification",
        model=model,
        tokenizer=tokenizer,
        aggregation_strategy="simple",
    )


def extract_keywords_transformer(job_text: str, limit: int = 30) -> KeywordExtractionResult | None:
    nlp = _load_pipeline()
    if nlp is None:
        return None
    entities = nlp(job_text)
    skills: list[str] = []
    for ent in entities:
        label = ent.get("entity_group") or ent.get("entity")
        if label and "skill" in str(label).lower():
            word = str(ent.get("word", "")).strip()
            if word:
                skills.append(word)
    unique: list[str] = []
    seen: set[str] = set()
    for item in skills:
        key = item.lower()
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)
        if len(unique) >= limit:
            break
    return KeywordExtractionResult(skills=unique, requirements=[])
