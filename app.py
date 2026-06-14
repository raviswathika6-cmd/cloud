from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import logging
import os

app = Flask(__name__, static_folder='.')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///admissions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    date_of_birth = db.Column(db.String(20), nullable=False)
    high_school = db.Column(db.String(100), nullable=False)
    gpa = db.Column(db.Float, nullable=False)
    major = db.Column(db.String(100), nullable=False)
    essay = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "date_of_birth": self.date_of_birth,
            "high_school": self.high_school,
            "gpa": self.gpa,
            "major": self.major,
            "essay": self.essay,
            "status": self.status,
            "created_at": self.created_at.isoformat()
        }

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/login')
def login():
    return send_from_directory('.', 'login.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Simple authentication (replace with real auth logic)
    # For demo purposes, accept any credentials
    return jsonify({
        "message": "Login successful",
        "token": "demo_token_" + email,
        "user": {"email": email}
    }), 200

@app.route('/api/apply', methods=['POST'])
def submit_application():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    required_fields = [
        'first_name', 'last_name', 'email', 'date_of_birth',
        'high_school', 'gpa', 'major', 'essay'
    ]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({
            "error": f"Missing required fields: {', '.join(missing)}"
        }), 400

    try:
        gpa = float(data['gpa'])
    except (ValueError, TypeError):
        return jsonify({"error": "GPA must be a valid number"}), 400

    try:
        new_app = Application(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            date_of_birth=data['date_of_birth'],
            high_school=data['high_school'],
            gpa=gpa,
            major=data['major'],
            essay=data['essay']
        )
        db.session.add(new_app)
        db.session.commit()
        return jsonify({"message": "Application submitted successfully", "id": new_app.id}), 201
    except Exception as e:
        db.session.rollback()
        logger.error("Failed to submit application: %s", e)
        return jsonify({"error": "Failed to submit application. Please try again."}), 500

@app.route('/api/applications', methods=['GET'])
def get_applications():
    try:
        apps = Application.query.all()
        return jsonify([a.to_dict() for a in apps])
    except Exception as e:
        logger.error("Failed to fetch applications: %s", e)
        return jsonify({"error": "Failed to retrieve applications"}), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404


@app.errorhandler(500)
def internal_error(e):
    db.session.rollback()
    logger.error("Internal server error: %s", e)
    return jsonify({"error": "An internal server error occurred"}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
