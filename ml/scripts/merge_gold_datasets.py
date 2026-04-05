#!/usr/bin/env python3
"""
Merge all gold datasets for optimized fine-tuning.
Creates a combined training set with ~425K examples.
"""

import pandas as pd
import os
import sys
from pathlib import Path

# Paths
GOLD_DIR = Path("/Users/denys/CV AI Optimizer/CV-AI-Optimizer/ml/data/gold")
OUTPUT_PATH = GOLD_DIR / "merged_gold_combined.csv"

# Gold datasets to combine
DATASETS = [
    "skillspan_train.csv",          # 93K
    "skillspan_train_val.csv",      # 133K
    "merged_train.csv",              # 94K
    "large_resume_skills.csv",       # 100K
]

# Optional additional datasets (if available)
OPTIONAL_DATASETS = [
    "techwolf_train.csv",            # ~5K
]

def main():
    dfs = []
    total_rows = 0
    
    print("Merging gold datasets...")
    
    # Load required datasets
    for dataset_name in DATASETS:
        path = GOLD_DIR / dataset_name
        if path.exists():
            df = pd.read_csv(path)
            print(f"✓ {dataset_name}: {len(df):,} rows")
            dfs.append(df)
            total_rows += len(df)
        else:
            print(f"✗ {dataset_name}: NOT FOUND")
            return 1
    
    # Load optional datasets
    for dataset_name in OPTIONAL_DATASETS:
        path = GOLD_DIR / dataset_name
        if path.exists():
            df = pd.read_csv(path)
            print(f"✓ {dataset_name}: {len(df):,} rows")
            dfs.append(df)
            total_rows += len(df)
    
    # Combine all datasets
    print(f"\nCombining {len(dfs)} datasets...")
    combined_df = pd.concat(dfs, ignore_index=True)
    
    # Remove exact duplicates
    before_dedup = len(combined_df)
    combined_df = combined_df.drop_duplicates()
    after_dedup = len(combined_df)
    removed = before_dedup - after_dedup
    
    if removed > 0:
        print(f"Removed {removed:,} duplicate rows (before: {before_dedup:,}, after: {after_dedup:,})")
    else:
        print(f"No duplicates found. Total rows: {after_dedup:,}")
    
    # Ensure proper column names
    if 'word' not in combined_df.columns:
        print("ERROR: 'word' column not found")
        return 1
    
    # Save combined dataset
    combined_df.to_csv(OUTPUT_PATH, index=False)
    print(f"\n✓ Saved merged dataset: {OUTPUT_PATH}")
    print(f"  Total: {len(combined_df):,} examples")
    print(f"  Columns: {', '.join(combined_df.columns.tolist())}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
