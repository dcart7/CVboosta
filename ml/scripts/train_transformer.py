import argparse
from collections import defaultdict
from pathlib import Path

import numpy as np # type: ignore
import pandas as pd # type: ignore
from datasets import Dataset # type: ignore
from seqeval.metrics import f1_score, precision_score, recall_score # type: ignore
from transformers import ( # type: ignore
    AutoModelForTokenClassification,
    AutoTokenizer,
    DataCollatorForTokenClassification,
    Trainer,
    TrainingArguments,
)

def load_conll_csv(path: Path):
    df = pd.read_csv(path)
    grouped = defaultdict(list)
    for row in df.itertuples(index=False):
        word = "" if row.word is None else str(row.word)
        tag = "O" if row.tag is None else str(row.tag)
        grouped[str(row.sentence_id)].append((word, tag))
    sentences = []
    tags = []
    for _, items in grouped.items():
        tokens = [t for t, _ in items]
        labels = [lab for _, lab in items]
        sentences.append(tokens)
        tags.append(labels)
    return sentences, tags

def keep_only_skill_labels(labels: list[list[str]]) -> list[list[str]]:
    filtered: list[list[str]] = []
    for seq in labels:
        next_seq = []
        for lab in seq:
            if lab.endswith("Skill"):
                next_seq.append(lab)
            else:
                next_seq.append("O")
        filtered.append(next_seq)
    return filtered

def tokenize_and_align_labels(examples, tokenizer, label2id, max_length: int | None):
    tokenized = tokenizer(
        examples["tokens"],
        truncation=True,
        is_split_into_words=True,
        padding=False,
        max_length=max_length,
    )
    labels = []
    for i, word_ids in enumerate(tokenized.word_ids(batch_index=i) for i in range(len(examples["tokens"]))):
        example_labels = examples["labels"][i]
        aligned = []
        prev_word_id = None
        for word_id in word_ids:
            if word_id is None:
                aligned.append(-100)
            elif word_id != prev_word_id:
                aligned.append(label2id[example_labels[word_id]]) # type: ignore
            else:
                aligned.append(label2id[example_labels[word_id]]) # type: ignore
            prev_word_id = word_id
        labels.append(aligned)
    tokenized["labels"] = labels
    return tokenized

def compute_metrics(label_list):
    def _metrics(p):
        predictions, labels = p
        preds = np.argmax(predictions, axis=2)
        true_labels = []
        true_preds = []
        for pred, lab in zip(preds, labels):
            seq_labels = []
            seq_preds = []
            for p_id, l_id in zip(pred, lab):
                if l_id == -100:
                    continue
                seq_labels.append(label_list[l_id])
                seq_preds.append(label_list[p_id])
            true_labels.append(seq_labels)
            true_preds.append(seq_preds)
        return {
            "precision": precision_score(true_labels, true_preds),
            "recall": recall_score(true_labels, true_preds),
            "f1": f1_score(true_labels, true_preds),
        }

    return _metrics

def main() -> None:
    parser = argparse.ArgumentParser(description="Train transformer token-classification model")
    parser.add_argument("--train", required=True, help="Path to train CSV")
    parser.add_argument("--test", required=True, help="Path to test CSV")
    parser.add_argument("--model", default="distilbert-base-uncased")
    parser.add_argument("--out", default="ml/models/skill_bert")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--max-length", type=int, default=256)
    parser.add_argument("--learning-rate", type=float, default=2e-5, help="Learning rate for optimizer")
    parser.add_argument("--warmup-steps", type=int, default=500, help="Warmup steps for scheduler")
    parser.add_argument("--weight-decay", type=float, default=0.0, help="Weight decay for optimizer")
    parser.add_argument("--gradient-accumulation-steps", type=int, default=1, help="Steps for gradient accumulation")
    parser.add_argument("--skill-only", action="store_true", help="Train on Skill tags only")
    parser.add_argument("--cpu", action="store_true", help="Force CPU training")
    args = parser.parse_args()

    train_tokens, train_labels = load_conll_csv(Path(args.train))
    test_tokens, test_labels = load_conll_csv(Path(args.test))
    if args.skill_only:
        train_labels = keep_only_skill_labels(train_labels)
        test_labels = keep_only_skill_labels(test_labels)

    label_list = sorted({lab for seq in train_labels for lab in seq})
    label2id = {lab: i for i, lab in enumerate(label_list)}
    id2label = {i: lab for lab, i in label2id.items()}

    # Resolve local paths to absolute to prevent HF from searching the Hub
    if Path(str(args.model)).exists(): # type: ignore
        args.model = str(Path(str(args.model)).resolve()) # type: ignore

    tokenizer = AutoTokenizer.from_pretrained(args.model)
    model = AutoModelForTokenClassification.from_pretrained(
        args.model, num_labels=len(label_list), id2label=id2label, label2id=label2id
    )

    train_ds = Dataset.from_dict({"tokens": train_tokens, "labels": train_labels})
    test_ds = Dataset.from_dict({"tokens": test_tokens, "labels": test_labels})

    train_ds = train_ds.map(
        lambda x: tokenize_and_align_labels(x, tokenizer, label2id, args.max_length),
        batched=True,
    )
    test_ds = test_ds.map(
        lambda x: tokenize_and_align_labels(x, tokenizer, label2id, args.max_length),
        batched=True,
    )

    # Shuffle training data
    train_ds = train_ds.shuffle(seed=42)

    data_collator = DataCollatorForTokenClassification(tokenizer)
    training_args = TrainingArguments(
        output_dir="ml/models/skill_runs",
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        num_train_epochs=args.epochs,
        learning_rate=args.learning_rate,
        warmup_steps=args.warmup_steps,
        weight_decay=args.weight_decay,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        eval_strategy="steps",
        eval_steps=500,
        save_strategy="steps",
        save_steps=500,
        logging_steps=50,
        use_cpu=args.cpu,
        fp16=False, # MPS often has issues with fp16, bf16 is better but let's stay safe
        logging_dir="ml/models/logs",
        save_total_limit=2,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=test_ds,
        data_collator=data_collator,
        compute_metrics=compute_metrics(label_list),
    )

    print(f"Starting training for {args.epochs} epochs...")
    trainer.train()
    
    print(f"Saving best model to {args.out}...")
    # Path(args.out).mkdir(parents=True, exist_ok=True)
    trainer.save_model(args.out)
    tokenizer.save_pretrained(args.out)
    print(f"Successfully saved transformer model to {args.out}")


if __name__ == "__main__":
    main()
