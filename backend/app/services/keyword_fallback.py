from collections import Counter
import re

from app.schemas.keywords import KeywordExtractionResult
from app.services.keyword_stopwords import STOPWORDS


def extract_keywords_fallback(job_text: str, limit: int = 30) -> KeywordExtractionResult:
    cleaned = re.sub(r"[^a-z0-9]+", " ", job_text.lower())
    tokens = [token for token in cleaned.split() if len(token) >= 4]
    tokens = [
        token
        for token in tokens
        if token not in STOPWORDS and not token.isdigit()
    ]
    counts = Counter(tokens)
    most_common = [token for token, _ in counts.most_common(limit)]
    return KeywordExtractionResult(skills=most_common, requirements=[])
