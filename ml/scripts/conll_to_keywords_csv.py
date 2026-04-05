import argparse
import csv
from collections import defaultdict
from pathlib import Path
from typing import Iterable

PUNCT_NO_SPACE_BEFORE = {".", ",", ":", ";", ")", "]", "}", "%", "?", "!"}
PUNCT_NO_SPACE_AFTER = {"(", "[", "{"}
CLITICS = {"'s", "n't", "'re", "'ve", "'d", "'m"}


def detokenize(tokens: Iterable[str]) -> str:
    text = ""
    prev = ""
    for token in tokens:
        if not text:
            text = token
        elif token in PUNCT_NO_SPACE_BEFORE or token in CLITICS:
            text += token
        elif prev in PUNCT_NO_SPACE_AFTER:
            text += token
        else:
            text += " " + token
        prev = token
    return text


def extract_spans(tokens: list[str], tags: list[str], label: str | None) -> list[str]:
    spans: list[str] = []
    current: list[str] = []
    current_label: str | None = None

    def flush() -> None:
        nonlocal current, current_label
        if current:
            spans.append(detokenize(current))
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

        if label and tag_label.lower() != label.lower():
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


def convert(input_path: Path, output_path: Path, label: str | None) -> None:
    rows_by_sentence: dict[str, dict[str, list[str]]] = defaultdict(lambda: {"tokens": [], "tags": []})
    with input_path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            sentence_id = row.get("sentence_id")
            token = row.get("word") or ""
            tag = row.get("tag") or "O"
            if not sentence_id:
                continue
            rows_by_sentence[sentence_id]["tokens"].append(token)
            rows_by_sentence[sentence_id]["tags"].append(tag)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["sentence_id", "text", "keywords"])
        for sentence_id, data in rows_by_sentence.items():
            tokens = data["tokens"]
            tags = data["tags"]
            text = detokenize(tokens)
            spans = extract_spans(tokens, tags, label)
            writer.writerow([sentence_id, text, "|".join(spans)])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert CoNLL-style CSV to keywords CSV")
    parser.add_argument("--input", required=True, help="Path to input CSV (sentence_id, word, tag)")
    parser.add_argument("--output", required=True, help="Path to output CSV")
    parser.add_argument(
        "--label",
        default="Skill",
        help="Label to extract (default: Skill). Use 'ALL' for all labels.",
    )
    args = parser.parse_args()

    label = None if args.label.upper() == "ALL" else args.label
    convert(Path(args.input), Path(args.output), label)
