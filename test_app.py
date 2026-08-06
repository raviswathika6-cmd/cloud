"""Unit tests for app.py — College Admission Application."""

import pytest
from app import app, db, Application


@pytest.fixture
def client():
    """Create a test client with an in-memory SQLite database."""
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


@pytest.fixture
def sample_application_data():
    """Valid application payload."""
    return {
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "jane@example.com",
        "date_of_birth": "2005-03-15",
        "high_school": "Springfield High",
        "gpa": 3.85,
        "major": "Computer Science",
        "essay": "I want to study CS because I love problem-solving.",
    }


# ── Model tests ──────────────────────────────────────────────────────────


class TestApplicationModel:
    def test_to_dict_returns_all_fields(self, client):
        with app.app_context():
            record = Application(
                first_name="Alice",
                last_name="Smith",
                email="alice@example.com",
                date_of_birth="2004-01-01",
                high_school="Central High",
                gpa=3.9,
                major="Biology",
                essay="My essay.",
            )
            db.session.add(record)
            db.session.commit()

            d = record.to_dict()
            assert d["first_name"] == "Alice"
            assert d["last_name"] == "Smith"
            assert d["email"] == "alice@example.com"
            assert d["date_of_birth"] == "2004-01-01"
            assert d["high_school"] == "Central High"
            assert d["gpa"] == 3.9
            assert d["major"] == "Biology"
            assert d["essay"] == "My essay."
            assert d["status"] == "Pending"
            assert "id" in d
            assert "created_at" in d

    def test_default_status_is_pending(self, client):
        with app.app_context():
            record = Application(
                first_name="Bob",
                last_name="Brown",
                email="bob@example.com",
                date_of_birth="2003-06-10",
                high_school="East High",
                gpa=3.5,
                major="Engineering",
                essay="Essay text.",
            )
            db.session.add(record)
            db.session.commit()
            assert record.status == "Pending"


# ── Index route ──────────────────────────────────────────────────────────


class TestIndexRoute:
    def test_index_returns_html(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert b"College Admission" in resp.data


# ── Login page route ─────────────────────────────────────────────────────


class TestLoginPageRoute:
    def test_login_page_returns_html(self, client):
        resp = client.get("/login")
        assert resp.status_code == 200
        assert b"Login" in resp.data


# ── POST /api/login ──────────────────────────────────────────────────────


class TestApiLogin:
    def test_login_success(self, client):
        resp = client.post(
            "/api/login",
            json={"email": "user@example.com", "password": "secret"},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["message"] == "Login successful"
        assert "token" in data
        assert data["user"]["email"] == "user@example.com"

    def test_login_missing_email(self, client):
        resp = client.post("/api/login", json={"password": "secret"})
        assert resp.status_code == 401
        assert resp.get_json()["error"] == "Invalid credentials"

    def test_login_missing_password(self, client):
        resp = client.post("/api/login", json={"email": "user@example.com"})
        assert resp.status_code == 401
        assert resp.get_json()["error"] == "Invalid credentials"

    def test_login_empty_credentials(self, client):
        resp = client.post("/api/login", json={"email": "", "password": ""})
        assert resp.status_code == 401

    def test_login_no_body(self, client):
        resp = client.post(
            "/api/login",
            data="",
            content_type="application/json",
        )
        # request.json will be None → .get returns None → 401
        assert resp.status_code in (400, 401, 500)


# ── POST /api/apply ─────────────────────────────────────────────────────


class TestApiApply:
    def test_submit_application_success(self, client, sample_application_data):
        resp = client.post("/api/apply", json=sample_application_data)
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["message"] == "Application submitted successfully"
        assert "id" in data

    def test_submit_application_persists(self, client, sample_application_data):
        client.post("/api/apply", json=sample_application_data)
        with app.app_context():
            assert Application.query.count() == 1
            record = Application.query.first()
            assert record.first_name == "Jane"
            assert record.gpa == 3.85

    def test_submit_application_missing_field(self, client):
        incomplete = {"first_name": "Incomplete"}
        resp = client.post("/api/apply", json=incomplete)
        assert resp.status_code == 400
        assert "error" in resp.get_json()

    def test_submit_multiple_applications(self, client, sample_application_data):
        client.post("/api/apply", json=sample_application_data)
        second = sample_application_data.copy()
        second["email"] = "other@example.com"
        resp = client.post("/api/apply", json=second)
        assert resp.status_code == 201
        with app.app_context():
            assert Application.query.count() == 2

    def test_gpa_stored_as_float(self, client, sample_application_data):
        sample_application_data["gpa"] = "3.75"
        resp = client.post("/api/apply", json=sample_application_data)
        assert resp.status_code == 201
        with app.app_context():
            record = Application.query.first()
            assert isinstance(record.gpa, float)
            assert record.gpa == 3.75


# ── GET /api/applications ───────────────────────────────────────────────


class TestApiApplications:
    def test_empty_list(self, client):
        resp = client.get("/api/applications")
        assert resp.status_code == 200
        assert resp.get_json() == []

    def test_returns_all_applications(self, client, sample_application_data):
        client.post("/api/apply", json=sample_application_data)
        second = sample_application_data.copy()
        second["first_name"] = "John"
        client.post("/api/apply", json=second)

        resp = client.get("/api/applications")
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) == 2
        names = {a["first_name"] for a in data}
        assert names == {"Jane", "John"}

    def test_application_fields_in_response(self, client, sample_application_data):
        client.post("/api/apply", json=sample_application_data)
        resp = client.get("/api/applications")
        entry = resp.get_json()[0]
        for key in (
            "id",
            "first_name",
            "last_name",
            "email",
            "date_of_birth",
            "high_school",
            "gpa",
            "major",
            "essay",
            "status",
            "created_at",
        ):
            assert key in entry
