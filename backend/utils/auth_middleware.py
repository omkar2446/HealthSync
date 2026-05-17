from functools import wraps
from flask import request, jsonify, current_app
import jwt
from models import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        auth_header = request.headers.get('Authorization')
        if auth_header:
            token = auth_header.split(" ")[1] if "Bearer " in auth_header else auth_header
            
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
            
        try:
            # Verify local JWT token
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found!'}), 401
        except Exception as e:
            print(f"Token verification error: {e}")
            return jsonify({'error': 'Token is invalid or expired!'}), 401
            
        return f(current_user, *args, **kwargs)
        
    return decorated

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(current_user, *args, **kwargs):
            print(f"ROLE CHECK: user={current_user.email}, role={current_user.role}, allowed={allowed_roles}")
            if current_user.role not in allowed_roles:
                print(f"ROLE REJECTED: {current_user.role} not in {allowed_roles}")
                return jsonify({'error': f'Unauthorized! Your role is {current_user.role}, required: {allowed_roles}'}), 403
                
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator
