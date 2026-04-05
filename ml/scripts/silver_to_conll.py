import argparse
import csv
import re
from pathlib import Path


def tokenize(text: str) -> list[str]:
    return re.findall(r"[A-Za-z0-9]+|[^\\w\\s]", text)


def match_spans(tokens: list[str], skills: list[str]) -> list[str]:
    tags = ["O"] * len(tokens)
    token_text = " ".join(tokens).lower()
    # naive matching on token windows
    for skill in skills:
        skill_tokens = tokenize(skill.lower())
        if not skill_tokens:
            continue
        for i in range(len(tokens) - len(skill_tokens) + 1):
            window = [t.lower() for t in tokens[i : i + len(skill_tokens)]]
            if window == skill_tokens:
                tags[i] = "B-Skill"
                for j in range(1, len(skill_tokens)):
                    tags[i + j] = "I-Skill"
    return tags


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert silver dataset to CoNLL CSV")
    parser.add_argument("--input", required=True, help="Path to silver TSV (text\\tskills|skills)")
    parser.add_argument("--output", required=True, help="Path to output CoNLL CSV")
    args = parser.parse_args()

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    sentence_id = 0
    with out_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["sentence_id", "word", "pos", "tag"])
        for line in Path(args.input).read_text(encoding="utf-8").splitlines():
            if "\t" not in line:
                continue
            text, skills_str = line.split("\t", 1)
            skills = [s.strip() for s in skills_str.split("|") if s.strip()]
            tokens = tokenize(text)
            if not tokens:
                continue
            tags = match_spans(tokens, skills)
            sentence_id += 1
            for token, tag in zip(tokens, tags):
                writer.writerow([sentence_id, token, "NN", tag])
    print(f"Saved {sentence_id} sentences to {out_path}")


if __name__ == "__main__":
    main()
