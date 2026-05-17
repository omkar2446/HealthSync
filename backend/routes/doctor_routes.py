from flask import Blueprint, request, jsonify
from utils.auth_middleware import role_required
from models import db, Appointment, MedicalRecord, User

doctor_bp = Blueprint('doctor', __name__)

@doctor_bp.route('/appointments', methods=['GET'])
@role_required(['doctor'])
def get_appointments(current_user):
    try:
        appointments = Appointment.query.filter_by(doctor_id=current_user.id).order_by(Appointment.date.desc()).all()
        return jsonify([apt.to_dict() for apt in appointments]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@doctor_bp.route('/appointments/<appointment_id>/status', methods=['PUT'])
@role_required(['doctor'])
def update_appointment_status(current_user, appointment_id):
    data = request.json
    status = data.get('status')
    
    if status not in ['approved', 'rejected', 'completed']:
        return jsonify({'error': 'Invalid status'}), 400
        
    try:
        apt = Appointment.query.filter_by(id=appointment_id, doctor_id=current_user.id).first()
        if not apt:
            return jsonify({'error': 'Appointment not found or not authorized'}), 404
            
        apt.status = status
        db.session.commit()
        return jsonify({'message': f'Appointment {status} successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@doctor_bp.route('/records', methods=['POST'])
@role_required(['doctor'])
def add_medical_record(current_user):
    data = request.json
    patient_id = data.get('patient_id')
    diagnosis = data.get('diagnosis')
    prescription = data.get('prescription')
    
    if not patient_id or not diagnosis:
        return jsonify({'error': 'Patient ID and diagnosis are required'}), 400
        
    try:
        new_record = MedicalRecord(
            patient_id=patient_id,
            doctor_id=current_user.id,
            diagnosis=diagnosis,
            prescription=prescription
        )
        db.session.add(new_record)
        db.session.commit()
        
        return jsonify({'message': 'Record added successfully', 'record': new_record.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@doctor_bp.route('/patients', methods=['GET'])
@role_required(['doctor'])
def get_patients(current_user):
    try:
        appointments = Appointment.query.filter_by(doctor_id=current_user.id).all()
        
        # Deduplicate patients
        patients = []
        seen = set()
        for apt in appointments:
            if apt.patient and apt.patient.id not in seen:
                seen.add(apt.patient.id)
                patients.append(apt.patient.to_dict())
                
        return jsonify(patients), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
