import sys
import os

# Add the current directory to sys.path so we can import app and models
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.app import app
from backend.models import db, User

def create_admin():
    with app.app_context():
        # Check if any user exists
        user = User.query.filter_by(username='admin').first()
        if not user:
            print("Creating admin user...")
            new_user = User(username='admin')
            new_user.set_password('admin123')
            db.session.add(new_user)
            db.session.commit()
            print("Admin user created: admin / admin123")
        else:
            print("Admin user already exists.")

if __name__ == '__main__':
    create_admin()
