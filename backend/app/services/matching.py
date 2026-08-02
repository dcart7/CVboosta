import unicodedata


def compute_match_score(cv_text: str, keywords: list[str]) -> tuple[int, list[str], list[str]]:
    normalized_cv = _normalize_text(cv_text)
    cv_tokens = set(normalized_cv.split())
    
    # Improved stemming logic
    def get_stems(t: str) -> set[str]:
        # The suffix rules below are intentionally limited to ASCII English.
        # Applying them to Ukrainian/Polish/Slovak/Czech/Spanish words creates
        # false positives (for example, a legitimate trailing "s" in a name).
        if len(t) <= 3 or not t.isascii() or not t.isalpha():
            return {t}
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
            
        # Phrase matching must respect token boundaries.  The old substring
        # check treated short skills such as "Go" as present in "ongoing".
        if f" {normalized_kw} " in f" {normalized_cv} ":
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
                
        # One shared word must not become a claimed phrase match (for example,
        # "project" alone is not "project manager"). Exact phrases already
        # take the fast path above; token fallback requires strong coverage.
        if len(matches_found) / len(kw_tokens) >= 0.75:
            matched.append(keyword)
        else:
            missing.append(keyword)

    total = len(matched) + len(missing)
    if total == 0:
        return 0, matched, missing
    match_percent = round((len(matched) / total) * 100)
    return match_percent, matched, missing


def _normalize_text(text: str) -> str:
    """Normalize text without discarding non-ASCII alphabets.

    ``str.isalnum`` is Unicode-aware, so Cyrillic and accented Latin text are
    kept.  NFKC/casefold also makes visually equivalent forms compare
    consistently.  A small set of separators is retained for technical skills
    such as ``Node.js``, ``C++``, ``C#`` and ``CI/CD``.
    """
    normalized = unicodedata.normalize("NFKC", text or "").casefold()
    cleaned: list[str] = []
    technical_punctuation = {".", "+", "#", "/", "-"}
    for character in normalized:
        if character.isalnum() or character in technical_punctuation:
            cleaned.append(character)
        else:
            cleaned.append(" ")
    tokens = [token.strip("./-") for token in "".join(cleaned).split()]
    return " ".join(token for token in tokens if token)


def _unique_preserve_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        key = _normalize_text(item)
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(item)
    return result
