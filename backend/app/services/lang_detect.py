"""
Lightweight language detection utility — no external dependencies.

Strategy: count characters by unicode script block.
- Cyrillic chars → definitely not English (uk, ru, etc.)
- High ratio of accented Latin chars → likely non-English (pl, sk, es, etc.)
- Otherwise → treat as English-compatible (use ML models)

This is intentionally simple: we only need to decide
"can our English-trained ML models handle this?" not full language ID.
"""

import unicodedata

# Cyrillic block: U+0400–U+04FF
_CYRILLIC_START = 0x0400
_CYRILLIC_END = 0x04FF

# Latin Extended-A/B and Latin Supplement — accented chars common in PL/SK/ES
# Latin-1 Supplement: U+00C0–U+00FF (à á â ã ä å ç è é ê ë ì í etc.)
# Latin Extended-A:   U+0100–U+017F (ā ă ą ć ĉ ċ č etc.)
# Latin Extended-B:   U+0180–U+024F
_ACCENTED_RANGES = [
    (0x00C0, 0x00FF),
    (0x0100, 0x017F),
    (0x0180, 0x024F),
]

# Minimum text length to bother analysing
_MIN_CHARS = 20


def _is_cyrillic(ch: str) -> bool:
    cp = ord(ch)
    return _CYRILLIC_START <= cp <= _CYRILLIC_END


def _is_accented_latin(ch: str) -> bool:
    cp = ord(ch)
    return any(lo <= cp <= hi for lo, hi in _ACCENTED_RANGES)


def is_english_text(text: str) -> bool:
    """
    Return True if the text is safe to pass to English-trained ML models.
    Return False if the text appears to be in a non-English language
    (cyrillic, or heavily accented latin like Polish/Slovak/Spanish).
    """
    letters = [ch for ch in text if ch.isalpha()]
    if len(letters) < _MIN_CHARS:
        # Too short to decide — assume English so ML models at least try
        return True

    total = len(letters)

    cyrillic_count = sum(1 for ch in letters if _is_cyrillic(ch))
    if cyrillic_count / total > 0.05:
        # More than 5% cyrillic → not English
        return False

    accented_count = sum(1 for ch in letters if _is_accented_latin(ch))
    if accented_count / total > 0.08:
        # More than 8% accented Latin → likely PL/SK/ES etc.
        return False

    return True
