import argparse
import csv
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Merge two CoNLL CSV files")
    parser.add_argument("--base", required=True, help="Base CoNLL CSV")
    parser.add_argument("--extra", required=True, help="Extra CoNLL CSV")
    parser.add_argument("--out", required=True, help="Output CoNLL CSV")
    args = parser.parse_args()

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    rows = []
    for path in (Path(args.base), Path(args.extra)):
        with path.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)

    with out_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["sentence_id", "word", "pos", "tag"])
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
    print(f"Wrote {len(rows)} rows to {out_path}")


if __name__ == "__main__":
    main()
