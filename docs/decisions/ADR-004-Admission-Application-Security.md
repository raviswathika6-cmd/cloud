# ADR-004: Admission Application Security & Authorization

**Date**: 2024-01-20  
**Status**: DRAFT  
**Deciders**: Security Team  
**Affected Components**: `/api/apply`, `/api/applications`, Frontend

## Context

**Critical Security Gap**: The `/api/apply` and `/api/applications` endpoints have **no authentication or authorization checks**.

Currently:
- Any unauthenticated request can submit applications
- Any request can list all submitted applications
- No user isolation
- No audit trail

This is dangerous because:
1. Bot attacks can flood database with fake applications
2. Sensitive student data is exposed
3. Applications can be submitted on behalf of others
4. No accountability

## Problem Statement

We must implement authorization that:
- Allows students to submit their own applications only
- Restricts application listing to authorized admins
- Prevents cross-user access
- Maintains audit trail
- Complies with FERPA (Family Educational Rights and Privacy Act)

## Decision

### Tier 1: Immediate (Before Public Launch)

**Require authentication for all endpoints**:
1. `/api/apply` → Token required (any authenticated user can submit)
2. `/api/applications` → Admin-only authorization
3. Validate token on every request (See ADR-002)

### Tier 2: Medium-term (Within 6 months)

**User Role-based Access Control (RBAC)**:
- `student`: Can submit their own application only
- `admin`: Can view all applications, update status
- `reviewer`: Can view applications, leave comments
- `system`: Service accounts for batch processing

### Tier 3: Long-term (Strategic)

**Attribute-based Access Control (ABAC)**:
- Permission rules based on user attributes, resource attributes, context
- Example: "User can view applications from their school only"
- Example: "Admins can only view applications from current season"

## Alternatives Considered

### Option A: Open for now, secure later
- ✅ Faster to launch
- ❌ Security debt accumulates
- ❌ FERPA violation risk
- ❌ Difficult to add auth retroactively
- **Verdict**: REJECTED due to compliance risk

### Option B: Require authentication on all endpoints (chosen)
- ✅ Simple to implement
- ✅ Compliant with privacy regs
- ✅ Prevents bot attacks
- ✅ Scalable to RBAC later
- **Verdict**: ACCEPTED

### Option C: IP-based access control
- ✅ Simple
- ❌ Not scalable
- ❌ Doesn't work for distributed users
- **Verdict**: REJECTED

## Consequences

### Positive
- Protects student privacy (FERPA compliance)
- Prevents unauthorized submissions
- Creates audit trail for compliance
- Enables admin workflows

### Negative
- All endpoints require token management
- Client-side complexity increases
- Token expiration handling needed
- Logout/revocation must work

### Mitigation
- Implement with ADR-002 (Authentication Strategy)
- Use long-lived refresh tokens for user convenience
- Implement graceful token expiration handling on client
- Add comprehensive logging for audit trail

## Implementation Requirements

### Backend Changes
1. Decorator for `@require_auth` on `/api/apply`
2. Decorator for `@require_admin` on `/api/applications`
3. Extract user ID from token
4. Add `submitted_by` field to Application model
5. Add authorization check: `app.submitted_by == current_user.id`

### Database Schema Changes
```sql
-- Add to Application model
submitted_by INT FOREIGN KEY REFERENCES users(id)

-- Add users table (ADR-002 prerequisite)
CREATE TABLE users (
    id INT PRIMARY KEY,
    email VARCHAR(120) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'student',  -- student, admin, reviewer, system
    created_at TIMESTAMP
);
```

### Frontend Changes
1. Include Authorization header: `Authorization: Bearer <token>`
2. Handle 401 responses (token expired)
3. Handle 403 responses (forbidden - not authorized)
4. Implement token refresh logic

### Example Implementation

**Backend Decorator**:
```python
from functools import wraps
from flask import request, jsonify

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token or not validate_token(token):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/apply', methods=['POST'])
@require_auth
def submit_application():
    # Implementation
    pass
```

## Known Gotchas

⚠️ **FERPA Compliance**
- **Issue**: Student privacy regulations require authorization
- **Requirement**: Must not expose other students' applications
- **Solution**: Validate user_id on every query
- **Reference**: https://www2.ed.gov/policy/gen/guid/fpco/ferpa/

⚠️ **CSV Export Attack**
- **Issue**: Admins might export all applications to CSV, losing audit trail
- **Solution**: Log all data exports, require authentication for export
- **Reference**: ADR-005 (Data Export & Audit)

⚠️ **Token Hijacking**
- **Issue**: If token exposed (localStorage XSS), attacker can submit apps
- **Solution**: Use HttpOnly cookies, implement token rotation (ADR-002)
- **Reference**: OWASP Session Management

⚠️ **Admin Impersonation**
- **Issue**: Compromised admin account can submit apps as other users
- **Solution**: Require second factor (2FA) for admin accounts
- **Reference**: ADR-007 (Multi-factor Authentication)

## Related Decisions

- **ADR-002**: Authentication Strategy (prerequisite)
- **ADR-003**: API Gateway Implementation (centralized auth)
- **ADR-005**: Data Export & Audit (logging)
- **ADR-007**: Multi-factor Authentication (future)

## References

- [FERPA Privacy Guide](https://www2.ed.gov/policy/gen/guid/fpco/ferpa/)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [RFC 6750 - OAuth 2.0 Bearer Token Usage](https://tools.ietf.org/html/rfc6750)
- Implementation location: `/home/user/cloud/app.py` lines 65-83

## Future Revisions

- [ ] Implement @require_auth decorator (Q2 2024)
- [ ] Add users table and role management
- [ ] Implement RBAC (admin, reviewer, student roles)
- [ ] Add audit logging for all data access
- [ ] Implement multi-factor authentication for admins
