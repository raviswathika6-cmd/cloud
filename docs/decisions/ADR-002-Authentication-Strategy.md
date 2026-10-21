# ADR-002: Authentication Strategy

**Date**: 2024-01-15  
**Status**: PROPOSED  
**Deciders**: Security Team, Architecture Team  
**Affected Components**: `/api/login`, Frontend Client

## Context

Current authentication implementation is a **demo placeholder** that accepts any credentials and returns a demo token without validation. This is inadequate for production use.

The system needs a real authentication mechanism that:
- Validates user credentials securely
- Issues verifiable tokens
- Prevents unauthorized access
- Complies with security standards

## Decision

**Implement JWT-based authentication** with the following approach:

1. Use **bcrypt** or **argon2** for password hashing
2. Issue **signed JWT tokens** (RS256 with RS256 key pair)
3. Validate tokens on protected endpoints
4. Implement token expiration and refresh mechanism
5. Store user credentials in dedicated `users` table

### Implementation Timeline

- **Phase 1** (Current): Demo token (placeholder)
- **Phase 2** (Q2 2024): Real credential validation + JWT
- **Phase 3** (Q3 2024): Token refresh, 2FA, OAuth2 (optional)

## Alternatives Considered

### Session-based Authentication (Cookie)
- ✅ Server-managed session state
- ✅ Traditional, well-understood
- ❌ Difficult for multi-server deployments
- ❌ Cross-domain issues (CORS)
- ✅ Good for same-origin requests

### OAuth2 / OIDC (External Provider)
- ✅ Delegates auth responsibility
- ✅ No password storage needed
- ✅ Supports 2FA, MFA
- ❌ Vendor lock-in risk
- ❌ Additional external dependency
- ✅ Future option: ADR-003

### API Key (Static Token)
- ✅ Simple to implement
- ❌ No expiration
- ❌ No per-user management
- ❌ Insecure for individual users
- ✅ Good for machine-to-machine communication

## Consequences

### Positive
- Stateless, scalable authentication
- Standard approach (JWT widely supported)
- Easy to implement across multiple servers
- Better separation of concerns

### Negative
- Token revocation is challenging (needs blacklist)
- Client-side token storage security
- Key management complexity

### Mitigation
- Implement token blacklist for logout/revocation
- Use short expiration times (15-30 min)
- Implement refresh token mechanism
- Store tokens securely (HttpOnly cookies preferred over localStorage)

## Known Gotchas

⚠️ **Token Storage on Frontend**
- **Issue**: Storing JWT in localStorage is vulnerable to XSS attacks
- **Current Status**: Demo implementation doesn't validate anyway
- **Solution**: Use HttpOnly cookies for production
- **Reference**: OWASP JWT Security Best Practices

⚠️ **Token Revocation**
- **Issue**: JWTs cannot be revoked before expiration
- **Solution**: Maintain blacklist of revoked tokens (if logout needed)
- **Alternative**: Use short expiration + refresh tokens

## Related Decisions

- **ADR-001**: Frontend Server Architecture (port 3000)
- **ADR-003**: API Gateway Implementation (may consolidate auth logic)
- **ADR-004**: Admission Application Security (different auth layer)

## References

- [JWT.io](https://jwt.io)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- Implementation location: `/home/user/cloud/app.py` lines 47-63

## Future Revisions

- [ ] Add actual credential validation (Q2 2024)
- [ ] Implement JWT signing/verification
- [ ] Add token refresh mechanism
- [ ] Consider OAuth2 for external integrations
