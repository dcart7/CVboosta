import argparse
import json
from pathlib import Path

from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract keywords with transformer model")
    parser.add_argument("--model", default="ml/models/skill_bert")
    parser.add_argument("--text", help="Job description text")
    parser.add_argument("--file", help="Path to a text file")
    args = parser.parse_args()

    text = args.text
    if args.file:
        text = Path(args.file).read_text(encoding="utf-8")
    if not text:
        raise SystemExit("Provide --text or --file")

    tokenizer = AutoTokenizer.from_pretrained(args.model)
    model = AutoModelForTokenClassification.from_pretrained(args.model)
    nlp = pipeline("token-classification", model=model, tokenizer=tokenizer, aggregation_strategy="simple")
    entities = nlp(text)

    skills = []
    for ent in entities:
        label = ent.get("entity_group") or ent.get("entity")
        if label and "skill" in label.lower():
            word = ent.get("word", "").strip()
            if word:
                skills.append(word)

    unique = []
    seen = set()
    for item in skills:
        key = item.lower()
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)

    print(json.dumps({"skills": unique}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
