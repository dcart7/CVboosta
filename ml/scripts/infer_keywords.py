import argparse
import json
from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.services.keyword_crf import extract_keywords_crf
from app.services.keyword_fallback import extract_keywords_fallback


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract keywords from text")
    parser.add_argument("--text", help="Job description text")
    parser.add_argument("--file", help="Path to a text file")
    args = parser.parse_args()

    text = args.text
    if args.file:
        text = Path(args.file).read_text(encoding="utf-8")
    if not text:
        raise SystemExit("Provide --text or --file")

    result = extract_keywords_crf(text)
    if result is None or not result.skills:
        result = extract_keywords_fallback(text)
        source = "fallback"
    else:
        source = "crf"

    print(json.dumps({"source": source, "skills": result.skills}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
