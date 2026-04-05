import argparse
import csv
import re
from pathlib import Path
from datasets import load_dataset


def tokenize(text: str) -> list[str]:
    return re.findall(r"[A-Za-z0-9]+|[^\w\s]", text)


def match_spans(tokens: list[str], spans: list[str]) -> list[str]:
    tags = ["O"] * len(tokens)
    for span in spans:
        span_tokens = tokenize(span.lower())
        if not span_tokens:
            continue
        for i in range(len(tokens) - len(span_tokens) + 1):
            window = [t.lower() for t in tokens[i : i + len(span_tokens)]]
            if window == span_tokens:
                tags[i] = "B-Skill"
                for j in range(1, len(span_tokens)):
                    tags[i + j] = "I-Skill"
    return tags


def write_conll(rows: list[tuple[list[str], list[str]]], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["sentence_id", "word", "pos", "tag"])
        sid = 0
        for tokens, tags in rows:
            if not tokens:
                continue
            sid += 1
            for token, tag in zip(tokens, tags):
                writer.writerow([sid, token, "NN", tag])


def export_techwolf(out_dir: Path) -> dict[str, Path]:
    ds = load_dataset("TechWolf/skill-extraction-tech")
    outputs = {}
    for split in ds.keys():
        rows = []
        grouped: dict[str, list[str]] = {}
        for item in ds[split]:
            sentence = (item.get("sentence") or "").strip()
            span = (item.get("span") or "").strip()
            label = (item.get("label") or "").strip()
            if not sentence:
                continue
            if label.upper() == "LABEL NOT PRESENT" or label.upper() == "UNDERSPECIFIED":
                continue
            if not span:
                continue
            grouped.setdefault(sentence, []).append(span)
        for sentence, spans in grouped.items():
            tokens = tokenize(sentence)
            tags = match_spans(tokens, spans)
            rows.append((tokens, tags))
        out_path = out_dir / f"techwolf_tech_{split}.csv"
        write_conll(rows, out_path)
        outputs[split] = out_path
    return outputs


def main() -> None:
    parser = argparse.ArgumentParser(description="Export TechWolf to CoNLL CSV")
    parser.add_argument("--out-dir", default="ml/data/gold")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    export_techwolf(out_dir)
    print("Saved TechWolf to", out_dir)


if __name__ == "__main__":
    main()
