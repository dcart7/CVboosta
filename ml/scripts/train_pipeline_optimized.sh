#!/bin/bash

# OPTIMIZED TRAINING PIPELINE FOR 98% F1-SCORE
set -e
# Stage 1: Pretrain on silver data with roberta-large (5 epochs)
export PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0
python3 "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/scripts/train_transformer.py" \
  --train "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/data/silver/df_answers_plus_silver.csv" \
  --test "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/data/gold/skillspan_test.csv" \
  --model "roberta-large" \
  --out "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/models/skill_roberta_large_silver" \
  --epochs 5 \
  --batch-size 1 \
  --gradient-accumulation-steps 16 \
  --learning-rate 2e-5 \
  --warmup-steps 500 \
  --weight-decay 0.01 \
  --skill-only 

# Stage 2: Fine-tune on CLEANED gold data (15 epochs - deeper fine-tuning)
python3 "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/scripts/train_transformer.py" \
  --train "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/data/gold/merged_gold_cleaned.csv" \
  --test "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/data/gold/skillspan_test.csv" \
  --model "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/models/skill_roberta_large_silver" \
  --out "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/models/skill_roberta_large_gold_98" \
  --epochs 15 \
  --batch-size 1 \
  --gradient-accumulation-steps 16 \
  --learning-rate 1e-5 \
  --warmup-steps 500 \
  --weight-decay 0.01 \
  --skill-only 

# Stage 3: final polish (5 epochs)
python3 "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/scripts/train_transformer.py" \
  --train "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/data/gold/merged_gold_cleaned.csv" \
  --test "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/data/gold/skillspan_test.csv" \
  --model "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/models/skill_roberta_large_gold_98" \
  --out "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/models/skill_roberta_large_gold_final" \
  --epochs 5 \
  --batch-size 1 \
  --gradient-accumulation-steps 16 \
  --learning-rate 5e-6 \
  --warmup-steps 200 \
  --weight-decay 0.01 \
  --skill-only 

echo "============================================"
echo "OPTIMIZED Training pipeline completed!"
echo "Target: 98% F1-Score"
echo "============================================"
echo "Models saved to:"
echo "  1. /ml/models/skill_roberta_large_silver"
echo "  2. /ml/models/skill_roberta_large_gold_98"
echo "  3. /ml/models/skill_roberta_large_gold_final (FINAL)"
echo "============================================"
