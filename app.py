import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from functools import wraps

from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

import jwt

app = Flask(__name__, static_folder='.')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///admissions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
db = SQLAlchemy(app)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


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
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

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


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
VALID_MAJORS = {"Computer Science", "Biology", "Engineering", "Business", "Art"}


def _issue_token(user: User) -> str:
    payload = {
        "sub": user.id,
        "email": user.email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=2),
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")


def _decode_token(token: str) -> dict:
    return jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authentication required"}), 401
        try:
            payload = _decode_token(auth_header.split(" ", 1)[1])
            request.current_user = payload
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return jsonify({"error": "Invalid or expired token"}), 401
        return f(*args, **kwargs)
    return decorated


# ---------------------------------------------------------------------------
# Security headers
# ---------------------------------------------------------------------------

@app.after_request
def set_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/login')
def login():
    return send_from_directory('.', 'login.html')


@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not EMAIL_RE.match(email):
        return jsonify({"error": "Invalid email format"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Registration successful"}), 201


@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = _issue_token(user)
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {"email": user.email}
    }), 200


@app.route('/api/apply', methods=['POST'])
def submit_application():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    errors = []

    first_name = (data.get('first_name') or '').strip()
    last_name = (data.get('last_name') or '').strip()
    email = (data.get('email') or '').strip()
    date_of_birth = (data.get('date_of_birth') or '').strip()
    high_school = (data.get('high_school') or '').strip()
    major = (data.get('major') or '').strip()
    essay = (data.get('essay') or '').strip()

    if not first_name or len(first_name) > 50:
        errors.append("first_name is required (max 50 chars)")
    if not last_name or len(last_name) > 50:
        errors.append("last_name is required (max 50 chars)")
    if not EMAIL_RE.match(email):
        errors.append("A valid email is required")
    if not date_of_birth:
        errors.append("date_of_birth is required")
    if not high_school or len(high_school) > 100:
        errors.append("high_school is required (max 100 chars)")
    if major not in VALID_MAJORS:
        errors.append(f"major must be one of {sorted(VALID_MAJORS)}")
    if not essay or len(essay) > 5000:
        errors.append("essay is required (max 5000 chars)")

    try:
        gpa = float(data.get('gpa', ''))
        if not (0.0 <= gpa <= 4.0):
            errors.append("gpa must be between 0.0 and 4.0")
    except (ValueError, TypeError):
        errors.append("gpa must be a valid number")

    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    new_app = Application(
        first_name=first_name,
        last_name=last_name,
        email=email,
        date_of_birth=date_of_birth,
        high_school=high_school,
        gpa=gpa,
        major=major,
        essay=essay,
    )
    db.session.add(new_app)
    db.session.commit()
    return jsonify({"message": "Application submitted successfully", "id": new_app.id}), 201


@app.route('/api/applications', methods=['GET'])
@login_required
def get_applications():
    apps = Application.query.all()
    return jsonify([a.to_dict() for a in apps])


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=os.environ.get('FLASK_DEBUG', 'false').lower() == 'true', port=5000)
