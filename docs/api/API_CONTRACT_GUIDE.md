# API Contract Guide

## Overview

This guide documents the API contracts for the Cloud Admissions System. The primary specification is **OpenAPI 3.0**, defined in `openapi.yaml`.

## Quick Start

### API Base URLs

- **Primary (Flask)**: `http://localhost:5000`
- **Frontend Server (Node.js)**: `http://localhost:3000`
- **Production (Planned)**: Single API Gateway at `http://api.admissions.local` (See ADR-003)

### Endpoints Quick Reference

| Method | Path | Purpose | Auth Required |
|--------|------|---------|----------------|
| POST | `/api/login` | User authentication | ❌ No (current) |
| POST | `/api/apply` | Submit application | ❌ No (SHOULD be required - see ADR-004) |
| GET | `/api/applications` | List all applications | ❌ No (SHOULD be admin-only - see ADR-004) |

## Authentication

### Current Implementation

**No real authentication** — demo token only. See [ADR-002](../decisions/ADR-002-Authentication-Strategy.md).

```bash
# Login returns demo token
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"anything"}'

# Response:
{
  "message": "Login successful",
  "token": "demo_token_user@example.com",
  "user": {"email": "user@example.com"}
}
```

### Using Token (Future - ADR-002)

```bash
# Include token in Authorization header
curl -X GET http://localhost:5000/api/applications \
  -H "Authorization: Bearer <token>"
```

## Request/Response Contracts

### 1. POST /api/login

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK)**:
```json
{
  "message": "Login successful",
  "token": "demo_token_user@example.com",
  "user": {
    "email": "user@example.com"
  }
}
```

**Response (401 Unauthorized)**:
```json
{
  "error": "Invalid credentials"
}
```

**See Also**: 
- OpenAPI spec: `openapi.yaml` → `paths./api/login`
- ADR: [ADR-002-Authentication-Strategy](../decisions/ADR-002-Authentication-Strategy.md)

---

### 2. POST /api/apply

**Request**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "date_of_birth": "2005-06-15",
  "high_school": "Central High School",
  "gpa": 3.95,
  "major": "Computer Science",
  "essay": "I am passionate about computer science because..."
}
```

**Response (201 Created)**:
```json
{
  "message": "Application submitted successfully",
  "id": 42
}
```

**Response (400 Bad Request)**:
```json
{
  "error": "Missing required field 'first_name'"
}
```

**Important Notes**:
- ⚠️ **No authentication required currently** (SECURITY ISSUE - see ADR-004)
- ⚠️ **Minimal validation** — See KNOWN_GOTCHAS.md #5
- All fields are required
- GPA is converted to float automatically
- Date format assumed to be ISO 8601 (YYYY-MM-DD)

**See Also**:
- OpenAPI spec: `openapi.yaml` → `paths./api/apply`
- Known issue: [KNOWN_GOTCHAS.md #2](../KNOWN_GOTCHAS.md) - No input validation
- Security concern: [ADR-004-Admission-Application-Security](../decisions/ADR-004-Admission-Application-Security.md)

---

### 3. GET /api/applications

**Request**:
```
GET /api/applications HTTP/1.1
Host: localhost:5000
```

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "date_of_birth": "2005-06-15",
    "high_school": "Central High School",
    "gpa": 3.95,
    "major": "Computer Science",
    "essay": "I am passionate about...",
    "status": "Pending",
    "created_at": "2024-01-15T10:30:45.123456"
  },
  {
    "id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "date_of_birth": "2005-08-22",
    "high_school": "Lincoln High School",
    "gpa": 4.0,
    "major": "Biology",
    "essay": "Biology is my passion...",
    "status": "Pending",
    "created_at": "2024-01-15T11:45:20.654321"
  }
]
```

**Important Notes**:
- ⚠️ **No authentication required** — PRIVACY VIOLATION
- ⚠️ **All applications returned at once** — Performance issue at scale
- ⚠️ **No pagination** — See KNOWN_GOTCHAS.md #4
- Status values: `Pending`, `Accepted`, `Rejected`, `Deferred`

**See Also**:
- OpenAPI spec: `openapi.yaml` → `paths./api/applications`
- Known issues: [KNOWN_GOTCHAS.md #1](../KNOWN_GOTCHAS.md) and [#4](../KNOWN_GOTCHAS.md)
- Security ADR: [ADR-004-Admission-Application-Security](../decisions/ADR-004-Admission-Application-Security.md)

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input, missing field, validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Endpoint doesn't exist |
| 500 | Internal Server Error | Unhandled exception (see logs) |

### Error Examples

**Missing Required Field**:
```
POST /api/apply
Content-Type: application/json

{"first_name": "John"}  // Missing required fields

Response (400):
{
  "error": "'last_name' is a required property"
}
```

**Authentication Failure** (future):
```
GET /api/applications
Authorization: Bearer invalid_token

Response (401):
{
  "error": "Invalid or expired token"
}
```

**Authorization Failure** (future):
```
GET /api/applications
Authorization: Bearer student_token

Response (403):
{
  "error": "Insufficient permissions to view applications"
}
```

### Error Handling Tips

⚠️ **Current Issue**: Error messages leak internal implementation details (See KNOWN_GOTCHAS.md #6)

```python
# Current (bad):
except Exception as e:
    return jsonify({"error": str(e)}), 400  # Shows full traceback

# Future (good):
except ValidationError as e:
    return jsonify({"error": "Invalid request data"}), 400
```

---

## Content Types

### Request Content Type

All requests use:
```
Content-Type: application/json
```

### Response Content Type

All responses use:
```
Content-Type: application/json
```

---

## Versioning Strategy (Planned)

Currently, API is unversioned. Future versions will use path-based versioning:

```
/api/v1/applications
/api/v2/applications  (future, if breaking changes)
```

See future ADR on API versioning.

---

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"demo"}'

# Submit application
curl -X POST http://localhost:5000/api/apply \
  -H "Content-Type: application/json" \
  -d '{
    "first_name":"John",
    "last_name":"Doe",
    "email":"john@example.com",
    "date_of_birth":"2005-06-15",
    "high_school":"Central High",
    "gpa":3.95,
    "major":"CS",
    "essay":"I love CS"
  }'

# List applications
curl http://localhost:5000/api/applications
```

### Using Postman

1. Import `openapi.yaml` into Postman
2. Set base URL: `{{baseUrl}}` = `http://localhost:5000`
3. Test endpoints using pre-built requests

### Using Python

```python
import requests

# Login
login_response = requests.post(
    'http://localhost:5000/api/login',
    json={'email': 'user@example.com', 'password': 'demo'}
)
token = login_response.json()['token']

# Submit application
app_response = requests.post(
    'http://localhost:5000/api/apply',
    json={
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john@example.com',
        'date_of_birth': '2005-06-15',
        'high_school': 'Central High',
        'gpa': 3.95,
        'major': 'Computer Science',
        'essay': 'I love CS'
    }
)
print(app_response.json())
```

### Using JavaScript/Fetch

```javascript
// Submit application
const response = await fetch('http://localhost:5000/api/apply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    date_of_birth: '2005-06-15',
    high_school: 'Central High',
    gpa: 3.95,
    major: 'Computer Science',
    essay: 'I love CS'
  })
});

const data = await response.json();
console.log(data);
```

---

## CORS Configuration (Current Issue)

⚠️ **Current Problem**: No CORS headers configured. If using frontend from different port, browser will block requests.

**Workaround**: 
1. Use API Gateway (see ADR-003)
2. Or configure CORS in Flask:

```python
from flask_cors import CORS
CORS(app, origins=["http://localhost:3000"])
```

**Future**: CORS configured at API Gateway level (ADR-003)

---

## Related Documentation

- **OpenAPI Specification**: [openapi.yaml](./openapi.yaml)
- **System Architecture**: [../architecture/SYSTEM_ARCHITECTURE.md](../architecture/SYSTEM_ARCHITECTURE.md)
- **Known Gotchas**: [../KNOWN_GOTCHAS.md](../KNOWN_GOTCHAS.md)
- **ADRs**:
  - [ADR-002: Authentication Strategy](../decisions/ADR-002-Authentication-Strategy.md)
  - [ADR-003: API Gateway Implementation](../decisions/ADR-003-API-Gateway-Implementation.md)
  - [ADR-004: Application Security](../decisions/ADR-004-Admission-Application-Security.md)
