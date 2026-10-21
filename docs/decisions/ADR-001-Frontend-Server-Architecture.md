# ADR-001: Frontend Server Architecture Decision

**Date**: 2024-01-15  
**Status**: ACCEPTED  
**Deciders**: Architecture Team  
**Affected Components**: Node.js Server, Static File Serving

## Context

The system needs to serve static HTML/CSS/JavaScript files to clients. We need to decide whether to:

1. Use a simple Node.js HTTP server without a framework
2. Use Express.js
3. Integrate frontend serving into Flask

## Decision

**Use a simple Node.js HTTP server** (current implementation) for serving static files on port 3000.

### Rationale

- **Separation of concerns**: Frontend serving is independent from backend API logic
- **Lightweight**: No framework overhead for simple file serving
- **Quick to implement**: Minimal dependencies and boilerplate
- **Easy debugging**: Direct HTTP handler visibility
- **Scalability path**: Can later upgrade to Express/Nginx reverse proxy

## Alternatives Considered

### Express.js
- ✅ More features (routing, middleware)
- ✅ Mature ecosystem
- ❌ Additional dependencies
- ❌ Overkill for static file serving
- ✅ Better for future API expansion on frontend server

### Integrated Flask Frontend
- ✅ Single codebase
- ✅ Single port
- ❌ Mixes concerns (frontend serving + API)
- ❌ Harder to scale independently
- ❌ Python-specific tech stack

## Consequences

### Positive
- Minimal dependencies
- Clear separation between frontend and backend
- Easier to replace frontend server later
- Can serve on different port for independent scaling

### Negative
- Limited routing capabilities
- Manual content-type handling
- No built-in middleware support
- Manual error handling needed

### Mitigation
- Document simple HTTP patterns in style guide
- Plan upgrade to Express when complexity grows (See ADR-003)
- Add proxy configuration for unified API endpoints in future

## Related Decisions

- **ADR-002**: Authentication Strategy
- **ADR-003**: API Gateway Implementation (future)

## References

- [Node.js HTTP Module](https://nodejs.org/api/http.html)
- Current implementation: `/home/user/cloud/server.js`
