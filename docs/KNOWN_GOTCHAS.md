# Known Gotchas & Issues

## 🚨 Critical Issues (Must Fix Before Production)

### 1. **No Authentication on Application Endpoints**
**Severity**: 🔴 CRITICAL  
**Affected**: `/api/apply`, `/api/applications`  
**Problem**: Any unauthenticated user can submit applications and view all submissions  
**Impact**: 
- FERPA privacy violations
- Bot attacks possible
- Data exposure risk

**Reference**: [ADR-004-Admission-Application-Security](./decisions/ADR-004-Admission-Application-Security.md)

**Fix Timeline**: Q2 2024  
**Workaround**: Deploy behind IP whitelist or VPN

---

### 2. **Demo Authentication Without Real Validation**
**Severity**: 🔴 CRITICAL  
**Affected**: `/api/login`  
**Problem**: 
```python
# Current implementation - accepts ANY credentials
if email and password:  # Just checks if fields exist
    return jsonify({"message": "Login successful", "token": "demo_token_" + email})
```
No actual validation, no JWT verification, no password hashing

**Impact**:
- Anyone can impersonate anyone
- No real access control possible
- Admin functions completely unprotected

**Reference**: [ADR-002-Authentication-Strategy](./decisions/ADR-002-Authentication-Strategy.md)

**Fix Timeline**: Q2 2024  
**Workaround**: Use internal network only, API key on reverse proxy

---

### 3. **No CORS Configuration**
**Severity**: 🟠 HIGH  
**Affected**: Frontend-Backend Communication  
**Problem**: 
- Flask app has no CORS headers configured
- Cross-origin requests may be blocked
- If Node.js and Flask on different ports, browser blocks requests

**Reference**: OpenAPI spec, [ADR-003](./decisions/ADR-003-API-Gateway-Implementation.md)

**Fix Timeline**: Before multi-domain deployment  
**Workaround**: Use API Gateway (ADR-003) to proxy all requests through single origin

```python
# Required addition to app.py:
from flask_cors import CORS
CORS(app, origins=["http://localhost:3000", "http://localhost:5000"])
```

---

## ⚠️ High Priority Issues (Fix Within 3 Months)

### 4. **No Pagination on /api/applications**
**Severity**: 🟡 HIGH  
**Affected**: `/api/applications GET`  
**Problem**: 
```python
# Returns ALL applications at once
apps = Application.query.all()
return jsonify([a.to_dict() for a in apps])
```

**Impact**:
- Performance degrades with scale
- Browser may hang with large datasets
- Unoptimized database queries
- Memory issues on server

**Example**: 10,000 applications = 10MB+ response

**Reference**: [ADR-005-Pagination-Strategy](./decisions/ADR-005-Pagination-Strategy.md) (proposed)

**Fix Timeline**: Before 1,000+ applications  
**Solution Pattern**:
```python
@app.route('/api/applications', methods=['GET'])
def get_applications():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    pagination = Application.query.paginate(page=page, per_page=per_page)
    return jsonify({
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page,
        "data": [a.to_dict() for a in pagination.items]
    })
```

---

### 5. **No Input Validation on /api/apply**
**Severity**: 🟡 HIGH  
**Affected**: `/api/apply POST`  
**Problem**: 
```python
new_app = Application(
    first_name=data['first_name'],  # No length check
    gpa=float(data['gpa']),          # No range validation
    essay=data['essay']              # No max length
)
```

**Risks**:
- SQL injection (if query building is done wrong)
- Buffer overflow on huge strings
- Invalid data in database
- Type conversion errors crash endpoint

**Reference**: OpenAPI `components/schemas` section

**Fix Timeline**: Q2 2024  
**Solution**: Use Marshmallow or Pydantic for validation

```python
from marshmallow import Schema, fields, validate

class ApplicationSchema(Schema):
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    gpa = fields.Float(required=True, validate=validate.Range(min=0.0, max=4.0))
    essay = fields.Str(required=True, validate=validate.Length(min=10, max=5000))
```

---

### 6. **No Error Handling - Generic 500 Errors**
**Severity**: 🟡 HIGH  
**Affected**: All endpoints  
**Problem**: 
```python
except Exception as e:
    return jsonify({"error": str(e)}), 400  # Leaks internal errors
```

**Impact**:
- Stack traces exposed to client
- Debugging info visible to attackers
- Confusing error messages
- Hard to diagnose issues in production

**Fix Timeline**: Q2 2024  
**Solution**:
```python
class ValidationError(Exception):
    pass

@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({"error": "Invalid request data"}), 400

@app.errorhandler(500)
def handle_internal_error(e):
    logging.error(f"Internal error: {e}", exc_info=True)
    return jsonify({"error": "Internal server error"}), 500
```

---

## 📋 Medium Priority Issues (Fix Within 6 Months)

### 7. **SQLite Not Suitable for Production**
**Severity**: 🟡 MEDIUM  
**Affected**: Data Persistence  
**Problem**: 
- SQLite is file-based, single-writer
- Not designed for concurrent access
- No network access
- No backup/recovery features

**Impact**:
- Write locks under concurrent load
- Database corruption risk
- No HA/failover possible
- Backups are manual file copy

**Reference**: [ADR-006-Database-Strategy](./decisions/ADR-006-Database-Strategy.md) (proposed)

**Fix Timeline**: Before public launch  
**Migration Path**: SQLite → PostgreSQL (SQLAlchemy makes this easy)

```python
# Change one line:
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///admissions.db'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:pass@localhost/admissions'
```

---

### 8. **No Audit Trail**
**Severity**: 🟡 MEDIUM  
**Affected**: Compliance, Forensics  
**Problem**: 
- No logging of who viewed what applications
- No history of application status changes
- Cannot answer "who changed this application?" questions
- FERPA audit requirements unmet

**Reference**: [ADR-004-Admission-Application-Security](./decisions/ADR-004-Admission-Application-Security.md)

**Fix Timeline**: Before FERPA compliance required

**Solution**:
- Add `AuditLog` model
- Log all data access, modifications
- Track user identity, timestamp, action

```python
class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    action = db.Column(db.String(50))  # view, edit, delete
    resource = db.Column(db.String(50))  # applications
    resource_id = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
```

---

### 9. **No Rate Limiting**
**Severity**: 🟡 MEDIUM  
**Affected**: All endpoints  
**Problem**: 
- No protection against brute force attacks
- No protection against DoS
- Bot submissions not limited
- No per-user request throttling

**Reference**: [ADR-003-API-Gateway-Implementation](./decisions/ADR-003-API-Gateway-Implementation.md)

**Fix Timeline**: When load testing, or after Q1 2024  
**Solution**: Implement at API Gateway (Nginx) or use Flask-Limiter

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(app, key_func=get_remote_address)

@app.route('/api/apply', methods=['POST'])
@limiter.limit("10 per hour")
def submit_application():
    pass
```

---

### 10. **Token Stored in localStorage (XSS Risk)**
**Severity**: 🟡 MEDIUM  
**Affected**: Frontend Client  
**Problem**: 
- JWT token stored in JavaScript-accessible localStorage
- Vulnerable to Cross-Site Scripting (XSS)
- Any injected script can steal token
- Token has no expiration (demo token)

**Reference**: [ADR-002-Authentication-Strategy](./decisions/ADR-002-Authentication-Strategy.md)

**Fix Timeline**: Q2 2024 (with ADR-002)  
**Solution**: Store in HttpOnly cookies

```javascript
// Current (vulnerable):
localStorage.setItem('token', response.token);

// Future (safe):
// Use Set-Cookie with HttpOnly flag (backend sets this)
// JavaScript cannot access HttpOnly cookies
```

---

## 🟢 Low Priority / Design Considerations

### 11. **No Logging or Monitoring**
**Severity**: 🟢 LOW  
**Affected**: Observability  
**Problem**: 
- No application logs
- Cannot debug issues in production
- No metrics on performance
- Cannot detect security attacks

**Fix Timeline**: Q3 2024, or when production ready  
**Solution**: Add Python logging, monitoring service (DataDog, New Relic, etc.)

---

### 12. **Environment Configuration Hardcoded**
**Severity**: 🟢 LOW  
**Affected**: DevOps, Security  
**Problem**: 
- Database path hardcoded: `admissions.db`
- Ports hardcoded: 3000, 5000
- Debug mode always on: `debug=True`

**Fix Timeline**: Q3 2024, before multi-environment deployment  
**Solution**: Use `.env` files and environment variables

```python
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URI = os.getenv('DATABASE_URI', 'sqlite:///admissions.db')
DEBUG = os.getenv('FLASK_DEBUG', 'False') == 'True'

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.run(debug=DEBUG, port=int(os.getenv('PORT', 5000)))
```

---

## 📊 Gotcha Risk Matrix

| Issue | Severity | Likelihood | Impact | Fix Effort | Priority |
|-------|----------|-----------|--------|-----------|----------|
| No auth on /api/applications | 🔴 CRITICAL | High | FERPA violation | Medium | NOW |
| Demo auth only | 🔴 CRITICAL | High | Security breach | High | NOW |
| No CORS config | 🟠 HIGH | High | Integration failure | Low | Q1 2024 |
| No pagination | 🟡 HIGH | Medium | Performance issue | Low | Q2 2024 |
| No input validation | 🟡 HIGH | Medium | Data corruption | Medium | Q2 2024 |
| No error handling | 🟡 HIGH | High | Info leak | Medium | Q2 2024 |
| SQLite in prod | 🟡 MEDIUM | Low (not public yet) | Scalability | High | Pre-launch |
| No audit trail | 🟡 MEDIUM | Low | Compliance | Medium | Pre-launch |
| No rate limiting | 🟡 MEDIUM | Medium | Bot attacks | Low | Q2 2024 |
| Token in localStorage | 🟡 MEDIUM | Medium | XSS risk | Low | Q2 2024 |
| No logging | 🟢 LOW | Low | Debugging | Medium | Q3 2024 |
| Hardcoded config | 🟢 LOW | Low | DevOps pain | Low | Q3 2024 |

---

## Related Documentation

- **ADR Index**: [docs/decisions/README.md](./decisions/README.md)
- **API Reference**: [docs/api/openapi.yaml](./api/openapi.yaml)
- **Architecture**: [docs/architecture/SYSTEM_ARCHITECTURE.md](./architecture/SYSTEM_ARCHITECTURE.md)
- **Runbook**: [docs/RUNBOOK.md](./RUNBOOK.md) (planned)
