from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    name = (data.get('name') or '').strip()
    role = (data.get('role') or 'patient').strip().lower()

    if not email or not password or not name:
        return jsonify({'error': 'Missing required fields'}), 400

    if role not in {'patient', 'doctor'}:
        return jsonify({'error': 'Invalid role selected'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    try:
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(
            email=email,
            password_hash=hashed_password,
            name=name,
            role=role
        )
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Server error during registration'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    with open('login_debug.log', 'a') as f:
        f.write(f"LOGIN ATTEMPT: {data}\n")
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400

    user = User.query.filter_by(email=email).first()
    
    if not user:
        with open('login_debug.log', 'a') as f:
            f.write(f"LOGIN FAILED: User not found for email: {email}\n")
        return jsonify({'error': 'Invalid credentials'}), 401
        
    if not check_password_hash(user.password_hash, password):
        with open('login_debug.log', 'a') as f:
            f.write(f"LOGIN FAILED: Password hash mismatch for email: {email}\n")
        return jsonify({'error': 'Invalid credentials'}), 401

    try:
        # Generate JWT Token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'token': token
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Server error during login'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200
