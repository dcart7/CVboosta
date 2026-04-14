from __future__ import annotations

import os
import re
from functools import lru_cache
from pathlib import Path

from app.core.config import settings
from app.schemas.keywords import KeywordExtractionResult

# joblib removed from top level for faster startup


def _tokenize(text: str) -> list[str]:
    return re.findall(r"[A-Za-z0-9]+|[^\\w\\s]", text)


def _pos_heuristic(token: str) -> str:
    if token.isdigit():
        return "CD"
    if token[:1].isupper():
        return "NNP"
    lower = token.lower()
    if lower.endswith("ing"):
        return "VBG"
    if lower.endswith("ed"):
        return "VBD"
    return "NN"


def _word_features(tokens: list[str], i: int) -> dict[str, object]:
    word = tokens[i]
    pos = _pos_heuristic(word)
    features: dict[str, object] = {
        "bias": 1.0,
        "word.lower": word.lower(),
        "word.isupper": word.isupper(),
        "word.istitle": word.istitle(),
        "word.isdigit": word.isdigit(),
        "pos": pos,
        "pos[:2]": pos[:2],
        "suffix3": word[-3:].lower(),
        "suffix2": word[-2:].lower(),
    }
    if i > 0:
        prev_word = tokens[i - 1]
        prev_pos = _pos_heuristic(prev_word)
        features.update(
            {
                "-1:word.lower": prev_word.lower(),
                "-1:pos": prev_pos,
                "-1:pos[:2]": prev_pos[:2],
            }
        )
    else:
        features["BOS"] = True

    if i < len(tokens) - 1:
        next_word = tokens[i + 1]
        next_pos = _pos_heuristic(next_word)
        features.update(
            {
                "+1:word.lower": next_word.lower(),
                "+1:pos": next_pos,
                "+1:pos[:2]": next_pos[:2],
            }
        )
    else:
        features["EOS"] = True
    return features


def _extract_spans(tokens: list[str], tags: list[str], label: str = "Skill") -> list[str]:
    spans: list[str] = []
    current: list[str] = []
    current_label: str | None = None

    def flush() -> None:
        nonlocal current, current_label
        if current:
            spans.append(" ".join(current))
        current = []
        current_label = None

    for token, tag in zip(tokens, tags):
        if tag == "O":
            flush()
            continue
        if "-" in tag:
            prefix, tag_label = tag.split("-", 1)
        else:
            prefix, tag_label = "B", tag
        if tag_label.lower() != label.lower():
            flush()
            continue
        if prefix == "B" or (current_label and tag_label != current_label):
            flush()
            current_label = tag_label
            current = [token]
        else:
            current_label = tag_label
            current.append(token)

    flush()
    return spans


@lru_cache(maxsize=1)
def _load_model():
    try:
        import joblib
    except ImportError:
        print("CRF_SERVICE: joblib not installed")
        return None
    model_path_str = settings.keyword_crf_model_path
    model_path = Path(model_path_str)
    
    if not model_path.is_absolute():
        # Try local dev path first
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
        print(f"CRF_SERVICE: Model not found at {model_path}")
        return None
        
    print(f"CRF_SERVICE: Loading model from {model_path}")
    return joblib.load(model_path)


def extract_keywords_crf(job_text: str, limit: int = 30) -> KeywordExtractionResult | None:
    model = _load_model()
    if model is None:
        return None
    tokens = _tokenize(job_text)
    if not tokens:
        return KeywordExtractionResult(skills=[], requirements=[])
    features = [_word_features(tokens, i) for i in range(len(tokens))]
    tags = model.predict_single(features)
    spans = _extract_spans(tokens, tags, label="Skill")
    unique: list[str] = []
    seen: set[str] = set()
    for item in spans:
        key = item.strip().lower()
        if not key or key in seen:
            continue
        seen.add(key)
        unique.append(item.strip())
        if len(unique) >= limit:
            break
    return KeywordExtractionResult(skills=unique, requirements=[])
