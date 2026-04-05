# Keyword Model Pipeline

This folder contains a lightweight training pipeline for a CRF-based keyword extractor using the `skill-extraction-dataset` (CoNLL-style CSV).

## 1) Dataset (already downloaded)
Dataset path:

```
ml/data/skill-extraction-dataset
```

The repo includes `preprocessed_data/df_answers.csv` (train) and `preprocessed_data/df_testset.csv` (test) with columns:
`sentence_id, word, pos, tag`.

## 2) Convert to simple CSV (optional)
Produces CSV with `sentence_id`, full sentence `text`, and `keywords` (pipe-separated spans).

```
python ml/scripts/conll_to_keywords_csv.py \
  --input ml/data/skill-extraction-dataset/preprocessed_data/df_answers.csv \
  --output ml/data/skill-extraction-dataset/preprocessed_data/train_keywords.csv

python ml/scripts/conll_to_keywords_csv.py \
  --input ml/data/skill-extraction-dataset/preprocessed_data/df_testset.csv \
  --output ml/data/skill-extraction-dataset/preprocessed_data/test_keywords.csv
```

## 3) Train CRF model
Install deps:

```
python -m pip install -r ml/requirements.txt
```

Train:

```
python ml/scripts/train_crf.py \
  --train ml/data/skill-extraction-dataset/preprocessed_data/df_answers.csv \
  --test ml/data/skill-extraction-dataset/preprocessed_data/df_testset.csv \
  --model-out ml/models/skill_crf.joblib
```

The script prints a classification report and saves the model.

## Next step
Once the model is trained, you can run a simple inference script:

```
python ml/scripts/infer_keywords.py --text "We are looking for a Python engineer with SQL and AWS."
```

The backend can now use the CRF model as a fallback when LLM is unavailable.
