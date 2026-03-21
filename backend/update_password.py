from app import app, db
from models import User
import sys

def update_admin_password(new_password):
    with app.app_context():
        user = User.query.filter_by(username='admin').first()
        if user:
            user.set_password(new_password)
            db.session.commit()
            print(f"Successfully updated password for 'admin'.")
        else:
            print("Admin user not found. Did you run seed_admin.py first?")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python update_password.py YOUR_NEW_PASSWORD")
    else:
        update_admin_password(sys.argv[1])
