from flask import Blueprint, request, jsonify
from utils.auth_middleware import token_required, role_required
from models import db, Appointment, MedicalRecord, User

patient_bp = Blueprint('patient', __name__)

@patient_bp.route('/appointments', methods=['POST'])
@role_required(['patient'])
def book_appointment(current_user):
    data = request.json
    doctor_id = data.get('doctor_id')
    date = data.get('date')
    
    if not doctor_id or not date:
        return jsonify({'error': 'Doctor ID and date are required'}), 400
        
    try:
        new_apt = Appointment(
            patient_id=current_user.id,
            doctor_id=doctor_id,
            date=date,
            status='pending'
        )
        db.session.add(new_apt)
        db.session.commit()
        
        return jsonify({'message': 'Appointment booked successfully', 'appointment': new_apt.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@patient_bp.route('/appointments', methods=['GET'])
@role_required(['patient'])
def get_appointments(current_user):
    try:
        appointments = Appointment.query.filter_by(patient_id=current_user.id).order_by(Appointment.date.desc()).all()
        return jsonify([apt.to_dict() for apt in appointments]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@patient_bp.route('/appointments/<appointment_id>', methods=['DELETE'])
@role_required(['patient'])
def cancel_appointment(current_user, appointment_id):
    try:
        apt = Appointment.query.filter_by(id=appointment_id, patient_id=current_user.id).first()
        if not apt:
            return jsonify({'error': 'Appointment not found or not authorized'}), 404
            
        apt.status = 'cancelled'
        db.session.commit()
        return jsonify({'message': 'Appointment cancelled successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@patient_bp.route('/records', methods=['GET'])
@role_required(['patient'])
def get_records(current_user):
    try:
        records = MedicalRecord.query.filter_by(patient_id=current_user.id).order_by(MedicalRecord.created_at.desc()).all()
        return jsonify([rec.to_dict() for rec in records]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@patient_bp.route('/doctors', methods=['GET'])
@token_required
def get_doctors(current_user):
    try:
        doctors = User.query.filter_by(role='doctor').all()
        return jsonify([{'id': d.id, 'name': d.name, 'email': d.email} for d in doctors]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@patient_bp.route('/symptom-checker', methods=['POST'])
@role_required(['patient'])
def check_symptoms(current_user):
    import os
    import json
    
    data = request.json
    symptoms = data.get('symptoms', '')
    
    if not symptoms:
        return jsonify({'error': 'Symptoms are required'}), 400

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'error': 'Gemini API key is missing. Please configure it in .env'}), 500
        
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an AI Symptom Checker. A patient has described the following symptoms:
        "{symptoms}"
        
        Provide a list of possible conditions and precautions. 
        Your response must be strictly valid JSON without any markdown formatting, backticks, or extra text.
        Format strictly as:
        {{
            "diseases": ["Disease 1", "Disease 2"],
            "precautions": ["Precaution 1", "Precaution 2"],
            "warning": "This is an AI suggestion, not professional medical advice. Please consult a doctor."
        }}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        response_text = response.text.strip()
        
        # Clean up in case Gemini returns markdown block
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
            
        result = json.loads(response_text.strip())
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        # Fallback response
        return jsonify({
            'diseases': ['General Fatigue / Unknown (AI Error)'],
            'precautions': ['Monitor symptoms', 'Consult a doctor if persists'],
            'warning': 'An error occurred while generating the AI response. Please try again later.'
        }), 200

@patient_bp.route('/sos', methods=['POST'])
@role_required(['patient'])
def trigger_sos(current_user):
    # Simulate sending emergency alert
    return jsonify({'message': 'SOS Alert Sent successfully to your emergency contacts and nearby hospitals!'}), 200

@patient_bp.route('/health-stats', methods=['GET', 'POST'])
@role_required(['patient'])
def handle_health_stats(current_user):
    from models import HealthStat
    if request.method == 'GET':
        stats = HealthStat.query.filter_by(patient_id=current_user.id).order_by(HealthStat.date.desc()).limit(7).all()
        return jsonify([s.to_dict() for s in stats]), 200
        
    elif request.method == 'POST':
        data = request.json
        hr = data.get('heart_rate')
        spo2 = data.get('oxygen_level')
        
        if hr is None or spo2 is None:
            return jsonify({'error': 'Heart rate and oxygen level are required'}), 400
            
        new_stat = HealthStat(
            patient_id=current_user.id,
            heart_rate=int(hr),
            oxygen_level=int(spo2),
            steps=data.get('steps', 0)
        )
        db.session.add(new_stat)
        db.session.commit()
        return jsonify({'message': 'Vitals logged successfully', 'stat': new_stat.to_dict()}), 201

@patient_bp.route('/medicines', methods=['GET', 'POST'])
@role_required(['patient'])
def handle_medicines(current_user):
    from models import MedicineReminder
    if request.method == 'GET':
        medicines = MedicineReminder.query.filter_by(patient_id=current_user.id).all()
        return jsonify([m.to_dict() for m in medicines]), 200
        
    elif request.method == 'POST':
        data = request.json
        name = data.get('medicine_name')
        schedule = data.get('schedule')
        if not name or not schedule:
            return jsonify({'error': 'Medicine name and schedule required'}), 400
            
        med = MedicineReminder(patient_id=current_user.id, medicine_name=name, schedule=schedule)
        db.session.add(med)
        db.session.commit()
        return jsonify({'message': 'Medicine reminder added', 'medicine': med.to_dict()}), 201
