from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__, static_folder='.')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///admissions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

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
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # Simple authentication (replace with real auth logic)
    if email and password:
        # For demo purposes, accept any credentials
        # Add your actual authentication logic here
        return jsonify({
            "message": "Login successful",
            "token": "demo_token_" + email,
            "user": {"email": email}
        }), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/apply', methods=['POST'])
def submit_application():
    data = request.json
    try:
        new_app = Application(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            date_of_birth=data['date_of_birth'],
            high_school=data['high_school'],
            gpa=float(data['gpa']),
            major=data['major'],
            essay=data['essay']
        )
        db.session.add(new_app)
        db.session.commit()
        return jsonify({"message": "Application submitted successfully", "id": new_app.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/applications', methods=['GET'])
def get_applications():
    apps = Application.query.all()
    return jsonify([a.to_dict() for a in apps])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
