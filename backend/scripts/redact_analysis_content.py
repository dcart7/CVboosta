import os
import sys
import json

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

SCRIPT_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

ROOT_ENV_PATH = os.path.join(BACKEND_DIR, "..", ".env")
load_dotenv(ROOT_ENV_PATH)

from app.services.analysis_crypto import encrypt_json_for_user, encrypt_text_for_user  # noqa: E402

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in .env")
    raise SystemExit(1)

engine = create_engine(DATABASE_URL)

select_sql = text(
    """
    SELECT id, user_id, job_description, result_json
    FROM analyses
    ORDER BY id ASC
    """
)

update_sql = text(
    """
    UPDATE analyses
    SET
      original_cv = '',
      job_description = '',
      result_json = CAST(:result_json AS jsonb)
    WHERE id = :id
    """
)

with engine.begin() as conn:
    rows = conn.execute(select_sql).mappings().all()
    updated = 0
    for row in rows:
        result_json = dict(row["result_json"] or {})
        user_id = int(row["user_id"])

        if not result_json.get("optimized_cv_enc") and result_json.get("optimized_cv"):
            result_json["optimized_cv_enc"] = encrypt_text_for_user(user_id, result_json.get("optimized_cv"))
        if not result_json.get("job_description_enc") and row.get("job_description"):
            result_json["job_description_enc"] = encrypt_text_for_user(user_id, row.get("job_description"))
        if not result_json.get("cover_letter_enc") and result_json.get("cover_letter"):
            result_json["cover_letter_enc"] = encrypt_text_for_user(user_id, result_json.get("cover_letter"))
        if not result_json.get("interview_questions_enc") and result_json.get("interview_questions") is not None:
            result_json["interview_questions_enc"] = encrypt_json_for_user(user_id, result_json.get("interview_questions"))

        result_json.pop("optimized_cv", None)
        result_json.pop("cover_letter", None)
        result_json.pop("interview_questions", None)

        conn.execute(
            update_sql,
            {
                "id": row["id"],
                "result_json": json.dumps(result_json, ensure_ascii=False),
            },
        )
        updated += 1

    print(f"Migrated analyses rows: {updated}")

print("Done. Plaintext fields removed and encrypted payload keys added.")
