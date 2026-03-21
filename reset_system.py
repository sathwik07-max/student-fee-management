import sqlite3
import os

db_path = os.path.join('backend', 'instance', 'school.db')

def reset_database():
    if not os.path.exists(db_path):
        print("Database not found.")
        return

    print(f"Connecting to {db_path} for full data reset...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Tables to clear (ordering is important for foreign keys)
    tables_to_clear = [
        'payments',
        'student_fees',
        'student_attendance',
        'student_sessions',
        'admissions',
        'students',
        'audit_logs',
        'notifications'
    ]

    try:
        # Disable foreign keys temporarily for clean wipe
        cursor.execute("PRAGMA foreign_keys = OFF")
        
        # Check if sqlite_sequence exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'")
        has_sequence = cursor.fetchone() is not None

        for table in tables_to_clear:
            print(f"Clearing table: {table}...")
            # Use a safer check to see if table exists before deleting
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if cursor.fetchone():
                cursor.execute(f"DELETE FROM {table}")
                # Reset auto-increment counters only if system table exists
                if has_sequence:
                    cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}'")
            else:
                print(f"Table {table} does not exist, skipping.")
        
        cursor.execute("PRAGMA foreign_keys = ON")
        conn.commit()
        print("\nSUCCESS: All student and financial data has been wiped.")
        print("System is now ready for original data import.")
    except Exception as e:
        print(f"Error during reset: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    confirm = input("CRITICAL: This will delete ALL students and payments. Type 'RESET' to confirm: ")
    if confirm == "RESET":
        reset_database()
    else:
        print("Reset cancelled.")
