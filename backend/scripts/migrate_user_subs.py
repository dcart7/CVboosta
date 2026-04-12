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
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR DEFAULT 'free';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS paddle_customer_id VARCHAR;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS paddle_subscription_id VARCHAR;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_active_until TIMESTAMP WITH TIME ZONE;"
]

with engine.begin() as conn:
    for q in queries:
        try:
            conn.execute(text(q))
            print(f"Executed: {q}")
        except Exception as e:
            print(f"Failed to execute {q}: {e}")

print("Migration complete.")
