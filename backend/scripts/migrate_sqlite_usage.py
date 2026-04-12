import sqlite3
import os

db_path = "smart_cv.db"

def migrate():
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    columns_to_add = [
        ("daily_scans_count", "INTEGER DEFAULT 0"),
        ("daily_cl_count", "INTEGER DEFAULT 0"),
        ("daily_prep_count", "INTEGER DEFAULT 0"),
        ("last_usage_reset", "DATETIME"),
        ("subscription_tier", "VARCHAR DEFAULT 'free'")
    ]

    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};")
            print(f"Added column {col_name} to users table.")
            if col_name == "last_usage_reset":
                 cursor.execute("UPDATE users SET last_usage_reset = CURRENT_TIMESTAMP;")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {col_name} already exists.")
            else:
                print(f"Error adding {col_name}: {e}")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
