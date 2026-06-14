from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

from utils import success_response, error_response, get_json_data, get_required_fields

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
    data = get_json_data()
    values, err = get_required_fields(data, ['email', 'password'])
    if err:
        return error_response(err, 401)

    return success_response({
        "message": "Login successful",
        "token": "demo_token_" + values['email'],
        "user": {"email": values['email']}
    })

@app.route('/api/apply', methods=['POST'])
def submit_application():
    data = get_json_data()
    required = ['first_name', 'last_name', 'email', 'date_of_birth',
                'high_school', 'gpa', 'major', 'essay']
    values, err = get_required_fields(data, required)
    if err:
        return error_response(err)

    try:
        new_app = Application(
            first_name=values['first_name'],
            last_name=values['last_name'],
            email=values['email'],
            date_of_birth=values['date_of_birth'],
            high_school=values['high_school'],
            gpa=float(values['gpa']),
            major=values['major'],
            essay=values['essay']
        )
        db.session.add(new_app)
        db.session.commit()
        return success_response(
            {"message": "Application submitted successfully", "id": new_app.id},
            status_code=201
        )
    except Exception as e:
        return error_response(str(e))

@app.route('/api/applications', methods=['GET'])
def get_applications():
    apps = Application.query.all()
    return success_response([a.to_dict() for a in apps])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
