import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData, text, Integer
from sqlalchemy.orm import sessionmaker

# 1. Load environment variables
load_dotenv(".env")
load_dotenv("../.env") # try root if run from backend

# 2. Setup paths to import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db.base import Base

def migrate():
    # Source PG URL
    old_url = os.environ.get("OLD_DATABASE_URL")
    # Target (Neon) PG URL
    new_url = os.environ.get("DATABASE_URL")

    if not old_url:
        print("Error: OLD_DATABASE_URL is not set in environment.")
        sys.exit(1)
    if not new_url:
        print("Error: DATABASE_URL is not set in environment.")
        sys.exit(1)

    print(f"--- Migration Started ---")
    print(f"Source: {old_url.split('@')[-1]}") # Print only host for safety
    print(f"Target: {new_url.split('@')[-1]}")

    old_engine = create_engine(old_url)
    new_engine = create_engine(new_url)

    # Ensure tables exist in target
    print("Initializing target schema...")
    Base.metadata.create_all(new_engine)

    # Reflect source metadata to read existing tables
    old_meta = MetaData()
    old_meta.reflect(bind=old_engine)

    with old_engine.connect() as old_conn:
        # Iterate over tables in dependency order
        for table in Base.metadata.sorted_tables:
            if table.name not in old_meta.tables:
                print(f"Skipping table {table.name} (not found in source)")
                continue

            print(f"Migrating table: {table.name}...")
            
            # Fetch data from source
            query = text(f'SELECT * FROM "{table.name}"')
            try:
                rows = old_conn.execute(query).fetchall()
            except Exception as e:
                print(f"  -> Could not query source for {table.name}: {e}")
                continue

            if not rows:
                print(f"  -> Table is empty in source.")
                continue
            
            # Prepare rows
            keys = rows[0]._mapping.keys()
            dict_rows = [dict(zip(keys, row)) for row in rows]
            
            # Execute transfer
            with new_engine.begin() as new_conn:
                try:
                    # Clear target table
                    new_conn.execute(text(f'TRUNCATE TABLE "{table.name}" CASCADE;'))
                    # Insert data
                    new_conn.execute(table.insert(), dict_rows)
                    print(f"  -> Successfully migrated {len(dict_rows)} rows.")
                except Exception as e:
                    print(f"  -> Error inserting to {table.name}: {e}")
                
        # Update sequences (PostgreSQL manual fix for IDs)
        print("\nSyncing sequences...")
        for table in Base.metadata.sorted_tables:
            for column in table.columns:
                if column.primary_key and isinstance(column.type, Integer):
                    with new_engine.begin() as new_conn:
                        try:
                            seq_query = text(f"SELECT setval(pg_get_serial_sequence('\"{table.name}\"', '{column.name}'), coalesce(max(\"{column.name}\"), 1), max(\"{column.name}\") IS NOT null) FROM \"{table.name}\";")
                            new_conn.execute(seq_query)
                            print(f"  -> Sequence fixed: {table.name}.{column.name}")
                        except Exception as e:
                            # Not all primary keys have sequences, this is okay
                            pass

    print("\n--- Migration Completed Successfully ---")

if __name__ == "__main__":
    migrate()
