import sqlite3
import os

db_path = os.path.join('backend', 'instance', 'school.db')

def migrate():
    print(f"Connecting to database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Add default_tuition_fee to classrooms
    try:
        print("Adding 'default_tuition_fee' column to 'classrooms' table...")
        cursor.execute("ALTER TABLE classrooms ADD COLUMN default_tuition_fee FLOAT DEFAULT 0.0")
        print("Successfully added column.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column already exists, skipping.")
        else:
            print(f"Error adding column: {e}")

    # 2. Create bus_routes table if it doesn't exist
    print("Ensuring 'bus_routes' table exists...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bus_routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location_name VARCHAR(100) UNIQUE NOT NULL,
            monthly_fee FLOAT DEFAULT 0.0,
            yearly_fee FLOAT DEFAULT 0.0
        )
    """)
    print("Bus routes table ready.")

    conn.commit()
    conn.close()
    print("Migration complete! You can now run 'python backend/app.py'.")

if __name__ == "__main__":
    migrate()
