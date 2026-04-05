import argparse
from collections import defaultdict
from pathlib import Path

import joblib
import pandas as pd
import sklearn_crfsuite
from sklearn_crfsuite import metrics


def load_conll_csv(path: Path):
    df = pd.read_csv(path)
    grouped = defaultdict(list)
    for row in df.itertuples(index=False):
        word = "" if row.word is None else str(row.word)
        pos = "" if row.pos is None else str(row.pos)
        tag = "O" if row.tag is None else str(row.tag)
        grouped[str(row.sentence_id)].append((word, pos, tag))
    return list(grouped.values())


def word_features(sent, i):
    word, pos, _ = sent[i]
    features = {
        "bias": 1.0,
        "word.lower": word.lower(),
        "word.isupper": word.isupper(),
        "word.istitle": word.istitle(),
        "word.isdigit": word.isdigit(),
        "pos": pos,
        "pos[:2]": pos[:2],
        "suffix3": word[-3:].lower(),
        "suffix2": word[-2:].lower(),
    }
    if i > 0:
        prev_word, prev_pos, _ = sent[i - 1]
        features.update(
            {
                "-1:word.lower": prev_word.lower(),
                "-1:pos": prev_pos,
                "-1:pos[:2]": prev_pos[:2],
            }
        )
    else:
        features["BOS"] = True

    if i < len(sent) - 1:
        next_word, next_pos, _ = sent[i + 1]
        features.update(
            {
                "+1:word.lower": next_word.lower(),
                "+1:pos": next_pos,
                "+1:pos[:2]": next_pos[:2],
            }
        )
    else:
        features["EOS"] = True

    return features


def sent_to_features(sent):
    return [word_features(sent, i) for i in range(len(sent))]


def sent_to_labels(sent):
    return [label for _, _, label in sent]


def main():
    parser = argparse.ArgumentParser(description="Train CRF for skill extraction")
    parser.add_argument("--train", required=True, help="Path to train CSV")
    parser.add_argument("--test", required=True, help="Path to test CSV")
    parser.add_argument("--model-out", default="ml/models/skill_crf.joblib")
    args = parser.parse_args()

    train_sents = load_conll_csv(Path(args.train))
    test_sents = load_conll_csv(Path(args.test))

    X_train = [sent_to_features(s) for s in train_sents]
    y_train = [sent_to_labels(s) for s in train_sents]

    X_test = [sent_to_features(s) for s in test_sents]
    y_test = [sent_to_labels(s) for s in test_sents]

    crf = sklearn_crfsuite.CRF(
        algorithm="lbfgs",
        c1=0.1,
        c2=0.1,
        max_iterations=100,
        all_possible_transitions=True,
    )
    crf.fit(X_train, y_train)

    y_pred = crf.predict(X_test)
    labels = sorted({label for seq in y_train for label in seq if label != "O"})
    report = metrics.flat_classification_report(y_test, y_pred, labels=labels, digits=3)
    print(report)

    Path(args.model_out).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(crf, args.model_out)
    print(f"Saved model to {args.model_out}")


if __name__ == "__main__":
    main()
