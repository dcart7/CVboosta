import argparse
from pathlib import Path

from datasets import load_dataset


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare silver-labeled skill dataset")
    parser.add_argument("--out", default="ml/data/silver/job_skill_set.jsonl")
    parser.add_argument("--limit", type=int, default=5000)
    args = parser.parse_args()

    ds = load_dataset("batuhanmtl/job-skill-set", split="train")
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    count = 0
    with out_path.open("w", encoding="utf-8") as f:
        for row in ds:
            text = (row.get("job_description") or "").strip()
            skills = row.get("job_skill_set") or []
            if not text or not skills:
                continue
            f.write(
                f'{text.replace(chr(10), " ").strip()}\t'
                f'{"|".join(str(s).strip() for s in skills if str(s).strip())}\n'
            )
            count += 1
            if count >= args.limit:
                break
    print(f"Saved {count} rows to {out_path}")


if __name__ == "__main__":
    main()
