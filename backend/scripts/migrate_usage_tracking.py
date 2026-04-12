import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in .env")
    exit(1)

engine = create_engine(DATABASE_URL)

queries = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_scans_count INTEGER DEFAULT 0;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_cl_count INTEGER DEFAULT 0;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_prep_count INTEGER DEFAULT 0;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_usage_reset TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;"
]

with engine.begin() as conn:
    for q in queries:
        try:
            conn.execute(text(q))
            print(f"Executed: {q}")
        except Exception as e:
            print(f"Failed to execute {q}: {e}")

print("Migration complete.")
