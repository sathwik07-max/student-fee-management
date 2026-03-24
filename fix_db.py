
import sqlite3
import os

db_path = 'backend/instance/school.db'

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        # 1. Add is_active column to users table
        cursor.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1")
        print("Successfully added 'is_active' column to 'users' table.")
    except sqlite3.OperationalError:
        print("Column 'is_active' already exists in 'users'.")

    try:
        # 2. Add can_collect_fees column to users table
        cursor.execute("ALTER TABLE users ADD COLUMN can_collect_fees BOOLEAN DEFAULT 0")
        print("Successfully added 'can_collect_fees' column to 'users' table.")
    except sqlite3.OperationalError:
        print("Column 'can_collect_fees' already exists in 'users'.")

    try:
        # 3. Add status column to students table
        cursor.execute("ALTER TABLE students ADD COLUMN status VARCHAR(20) DEFAULT 'Active'")
        print("Successfully added 'status' column to 'students' table.")
    except sqlite3.OperationalError:
        print("Column 'status' already exists in 'students'.")
        
    try:
        # 4. Check for assigned_classes table or helper table
        # If the many-to-many relationship table doesn't exist, we should ensure the schema is updated
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_classrooms'")
        if not cursor.fetchone():
            cursor.execute("""
                CREATE TABLE user_classrooms (
                    user_id INTEGER, 
                    classroom_id INTEGER, 
                    PRIMARY KEY (user_id, classroom_id), 
                    FOREIGN KEY(user_id) REFERENCES users (id), 
                    FOREIGN KEY(classroom_id) REFERENCES classrooms (id)
                )
            """)
            print("Successfully created 'user_classrooms' association table.")
            
        conn.commit()
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column 'is_active' already exists.")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()
else:
    print(f"Database not found at {db_path}")
