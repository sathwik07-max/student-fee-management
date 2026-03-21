from app import app, db
from models import User

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
