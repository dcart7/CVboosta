from __future__ import annotations

import os
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
    model_path_str = settings.keyword_transformer_model_path
    model_path = Path(model_path_str)
    
    if not model_path.is_absolute():
        paths_to_try = [
            Path(__file__).resolve().parents[3] / model_path_str,  # Local dev
            Path("/app") / model_path_str,                        # Container standard
            Path(os.getcwd()) / model_path_str                    # Current dir
        ]
        for p in paths_to_try:
            if p.exists():
                model_path = p
                break
                
    if not model_path.exists():
        print(f"TRANSFORMER_SERVICE: Model not found at {model_path}")
        return None
        
    print(f"TRANSFORMER_SERVICE: Loading model from {model_path}")
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
