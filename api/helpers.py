from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from functools import wraps
from models import User

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                user = User.query.get(current_user_id)
                if not user or user.role != 'admin':
                    return jsonify(msg='Admins only!'), 403
                return fn(*args, **kwargs)
            except Exception as e:
                return jsonify(msg='Missing or invalid token'), 401
        return decorator
    return wrapper

def check_admin_password(password):
    # In a real app, this should check against the logged-in user's hash
    # For now, we'll check against the first admin user found
    admin = User.query.filter_by(role='admin').first()
    if not admin:
        # Fallback if no admin exists (shouldn't happen if seeded)
        return False
    return admin.check_password(password)
