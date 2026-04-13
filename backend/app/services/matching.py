import re


def compute_match_score(cv_text: str, keywords: list[str]) -> tuple[int, list[str], list[str]]:
    normalized_cv = _normalize_text(cv_text)
    cv_tokens = set(normalized_cv.split())
    
    # Improved stemming logic
    def get_stems(t: str) -> set[str]:
        if len(t) <= 3: return {t}
        stems = {t}
        if t.endswith('s'): stems.add(t[:-1])
        if t.endswith('es'): stems.add(t[:-2])
        if t.endswith('ies'): stems.add(t[:-3] + 'y')
        if t.endswith('ing'): stems.add(t[:-3])
        if t.endswith('ed'): stems.add(t[:-2])
        if t.endswith('er'): stems.add(t[:-2])
        return stems

    stemmed_cv_tokens = set()
    for t in cv_tokens:
        stemmed_cv_tokens.update(get_stems(t))
    
    matched: list[str] = []
    missing: list[str] = []

    for keyword in _unique_preserve_order(keywords):
        if not keyword:
            continue
        normalized_kw = _normalize_text(keyword)
        if not normalized_kw:
            continue
            
        if normalized_kw in normalized_cv:
            matched.append(keyword)
            continue
            
        kw_tokens = [t for t in normalized_kw.split() if len(t) >= 2]
        if not kw_tokens:
            missing.append(keyword)
            continue
            
        matches_found = []
        for kt in kw_tokens:
            kw_stems = get_stems(kt)
            if kt in cv_tokens or any(s in stemmed_cv_tokens for s in kw_stems if len(s) > 2):
                matches_found.append(kt)
                
        # Lower threshold for complex keywords to be more permissive
        if len(matches_found) / len(kw_tokens) >= 0.5:
            matched.append(keyword)
        else:
            missing.append(keyword)

    total = len(matched) + len(missing)
    if total == 0:
        return 0, matched, missing
    match_percent = round((len(matched) / total) * 100)
    return match_percent, matched, missing


def _normalize_text(text: str) -> str:
    # Preserve dots in technical terms like node.js or react.js
    # but otherwise clean to lowercase alpha-numeric
    cleaned = re.sub(r"[^a-z0-9.]+", " ", text.lower())
    # Clean leading/trailing dots that aren't part of a term
    cleaned = re.sub(r"\s+\.|\.\s+", " ", cleaned).strip()
    return " ".join(cleaned.split())


def _unique_preserve_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        key = item.strip().lower()
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(item)
    return result
