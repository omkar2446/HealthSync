from flask import Blueprint, jsonify
from utils.auth_middleware import role_required
from models import User, Appointment

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@role_required(['admin'])
def get_all_users(current_user):
    try:
        users = User.query.all()
        return jsonify([{'id': u.id, 'name': u.name, 'email': u.email, 'role': u.role, 'created_at': u.created_at.isoformat()} for u in users]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/analytics', methods=['GET'])
@role_required(['admin'])
def get_analytics(current_user):
    try:
        total_users = User.query.count()
        total_appointments = Appointment.query.count()
        
        return jsonify({
            'total_users': total_users,
            'total_appointments': total_appointments
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
