from __future__ import annotations

import os
from pathlib import Path

from sqlalchemy import create_engine, text


def main() -> None:
    database_url = (os.environ.get("DATABASE_URL") or "").strip()
    if not database_url.startswith(
        ("postgresql://", "postgres://", "postgresql+psycopg://", "postgresql+psycopg2://")
    ):
        raise SystemExit("DATABASE_URL must point to PostgreSQL for production migrations")
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    if database_url.startswith("postgresql+psycopg://"):
        database_url = database_url.replace("postgresql+psycopg://", "postgresql://", 1)

    migrations_dir = Path(__file__).resolve().parents[1] / "migrations"
    engine = create_engine(database_url, pool_pre_ping=True)
    with engine.begin() as connection:
        connection.execute(
            text(
                "CREATE TABLE IF NOT EXISTS schema_migrations ("
                "version VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()"
                ")"
            )
        )

    for path in sorted(migrations_dir.glob("*.sql")):
        with engine.begin() as connection:
            already_applied = connection.execute(
                text("SELECT 1 FROM schema_migrations WHERE version = :version"),
                {"version": path.name},
            ).scalar()
            if already_applied:
                continue
            connection.exec_driver_sql(path.read_text(encoding="utf-8"))
            connection.execute(
                text("INSERT INTO schema_migrations(version) VALUES (:version)"),
                {"version": path.name},
            )
            print(f"Applied migration {path.name}")


if __name__ == "__main__":
    main()
