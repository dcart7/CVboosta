#!/bin/bash

set -e

WORK_DIR="/Users/denys/CV AI Optimizer/CV-AI-Optimizer"
GOLD_DIR="$WORK_DIR/ml/data/gold"

echo "=========================================="
echo "CV AI Optimizer - Optimized Training Pipeline (Target: 98% F1)"
echo "=========================================="

# Step 0: Merge all gold datasets for fine-tuning
echo ""
echo "[Step 0/3] Merging gold datasets..."
python3 "$WORK_DIR/ml/scripts/merge_gold_datasets.py"
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to merge gold datasets"
    exit 1
fi

# Stage 1: Pretrain on silver data (5 epochs for better convergence)
echo ""
echo "[Stage 1/2] Pretraining on silver data (~9.6K examples, 5 epochs)..."
python3 "$WORK_DIR/ml/scripts/train_transformer.py" \
  --train "$WORK_DIR/ml/data/silver/df_answers_plus_silver.csv" \
  --test "$GOLD_DIR/skillspan_test.csv" \
  --model "roberta-base" \
  --out "$WORK_DIR/ml/models/skill_roberta_silver" \
  --epochs 5 \
  --batch-size 8 \
  --learning-rate 2e-5 \
  --skill-only \
  --cpu

if [ $? -ne 0 ]; then
    echo "ERROR: Stage 1 (pretrain) failed"
    exit 1
fi

# Stage 2: Fine-tune on combined gold data (15 epochs for 98% target)
echo ""
echo "[Stage 2/2] Fine-tuning on merged gold data (~425K examples, 15 epochs)..."
python3 "$WORK_DIR/ml/scripts/train_transformer.py" \
  --train "$GOLD_DIR/merged_gold_combined.csv" \
  --test "$GOLD_DIR/skillspan_test.csv" \
  --model "$WORK_DIR/ml/models/skill_roberta_silver" \
  --out "$WORK_DIR/ml/models/skill_roberta_gold_optimized" \
  --epochs 15 \
  --batch-size 8 \
  --learning-rate 5e-6 \
  --warmup-steps 1000 \
  --weight-decay 0.01 \
  --skill-only \
  --cpu

if [ $? -ne 0 ]; then
    echo "ERROR: Stage 2 (fine-tune) failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "✓ Training pipeline completed successfully!"
echo "=========================================="
echo ""
echo "Stage 1 (Pretrain): skill_roberta_silver"
echo "Stage 2 (Fine-tune): skill_roberta_gold_optimized"
echo ""
echo "Combined gold training set: ~425K examples"
echo "Expected F1-score: 85-98%"
echo ""