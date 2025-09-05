import os
import sys
import psycopg2

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("DATABASE_URL not set")
    sys.exit(1)

try:
    print(f"Connecting to: {DATABASE_URL}")
    with psycopg2.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1;")
            print("Connection successful!")
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
