from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='patient') # patient, doctor, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    patient_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending') # pending, approved, rejected, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('User', foreign_keys=[patient_id], backref='patient_appointments')
    doctor = db.relationship('User', foreign_keys=[doctor_id], backref='doctor_appointments')

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'date': self.date,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'patient': self.patient.to_dict() if self.patient else None,
            'doctor': self.doctor.to_dict() if self.doctor else None
        }

class MedicalRecord(db.Model):
    __tablename__ = 'medical_records'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    patient_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    diagnosis = db.Column(db.Text, nullable=False)
    prescription = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('User', foreign_keys=[patient_id])
    doctor = db.relationship('User', foreign_keys=[doctor_id])

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'diagnosis': self.diagnosis,
            'prescription': self.prescription,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'doctor': self.doctor.to_dict() if self.doctor else None
        }

class HealthStat(db.Model):
    __tablename__ = 'health_stats'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    patient_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    heart_rate = db.Column(db.Integer)
    oxygen_level = db.Column(db.Integer)
    steps = db.Column(db.Integer)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'heart_rate': self.heart_rate,
            'oxygen_level': self.oxygen_level,
            'steps': self.steps,
            'date': self.date.isoformat() if self.date else None
        }

class MedicineReminder(db.Model):
    __tablename__ = 'medicine_reminders'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    patient_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    medicine_name = db.Column(db.String(100), nullable=False)
    schedule = db.Column(db.String(100), nullable=False) # e.g., '08:00, 20:00'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'medicine_name': self.medicine_name,
            'schedule': self.schedule,
            'is_active': self.is_active
        }
