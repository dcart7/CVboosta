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


def export_skillspan(out_dir: Path) -> dict[str, Path]:
    ds = load_dataset("jjzha/skillspan")
    outputs = {}
    for split in ds.keys():
        rows = []
        for item in ds[split]:
            tokens = item.get("tokens") or []
            tags_skill = item.get("tags_skill") or []
            # tags_skill are B/I/O without label name
            mapped = ["O" if t == "O" else f"{t}-Skill" for t in tags_skill]
            rows.append((tokens, mapped))
        out_path = out_dir / f"skillspan_{split}.csv"
        write_conll(rows, out_path)
        outputs[split] = out_path
    return outputs


def export_techwolf(out_dir: Path) -> dict[str, Path]:
    ds = load_dataset("TechWolf/skill-extraction-tech")
    outputs = {}
    for split in ds.keys():
        rows = []
        # group by sentence to collect spans
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


def merge_conll(inputs: list[Path], output: Path) -> None:
    rows = []
    for path in inputs:
        if not path.exists():
            continue
        with path.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows.extend(reader)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["sentence_id", "word", "pos", "tag"])
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def main() -> None:
    parser = argparse.ArgumentParser(description="Export SkillSpan and TechWolf to CoNLL CSV")
    parser.add_argument("--out-dir", default="ml/data/gold")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    skillspan = export_skillspan(out_dir)
    techwolf = export_techwolf(out_dir)

    # build merged train/eval
    train_parts = []
    if "train" in skillspan:
        train_parts.append(skillspan["train"])
    if "dev" in skillspan:
        train_parts.append(skillspan["dev"])
    if "train" in techwolf:
        train_parts.append(techwolf["train"])
    if "validation" in techwolf:
        train_parts.append(techwolf["validation"])

    eval_parts = []
    if "test" in skillspan:
        eval_parts.append(skillspan["test"])
    if "validation" in techwolf:
        eval_parts.append(techwolf["validation"])

    merge_conll(train_parts, out_dir / "merged_train.csv")
    merge_conll(eval_parts, out_dir / "merged_eval.csv")
    print("Saved:", out_dir)


if __name__ == "__main__":
    main()
