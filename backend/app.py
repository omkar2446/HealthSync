import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from models import db
from routes.auth_routes import auth_bp
from routes.patient_routes import patient_bp
from routes.doctor_routes import doctor_bp
from routes.admin_routes import admin_bp

load_dotenv()

app = Flask(__name__)

frontend_origins = os.environ.get('FRONTEND_ORIGINS')
if frontend_origins:
    allowed_origins = [origin.strip() for origin in frontend_origins.split(',') if origin.strip()]
else:
    allowed_origins = [
        'https://health-sync-seven-eta.vercel.app',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]

CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database Configuration (PostgreSQL / SQLite fallback)
db_url = os.environ.get('DATABASE_URL')
if db_url and db_url != "postgresql://user:password@host:port/dbname":
    # SQLAlchemy requires 'postgresql://' instead of 'postgres://'
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///healthcare.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'super-secret-local-key')

db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(patient_bp, url_prefix='/api/patient')
app.register_blueprint(doctor_bp, url_prefix='/api/doctor')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

@app.route('/')
def index():
    return jsonify({"message": "Healthcare Management System API is running (Local DB)"}), 200

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
