# ADR-003: API Gateway Implementation

**Date**: 2024-01-20  
**Status**: PROPOSED  
**Deciders**: Architecture Team  
**Affected Components**: Node.js Server, Flask Backend, Frontend

## Context

Currently, the system has **two separate servers** handling similar concerns:
- **Node.js** (port 3000): Static files + `/api/login` stub handler
- **Flask** (port 5000): Primary API endpoints + `/api/login` real handler

This creates **API endpoint fragmentation**:
1. Client must know about multiple servers
2. `/api/login` exists in both places with different implementations
3. Cross-origin requests required (CORS complexity)
4. Difficult to add rate limiting, auth middleware centrally

## Decision

**Implement an API Gateway** (Nginx or Express gateway) that:
1. Routes all requests through a single entry point (port 8000 or 80)
2. Proxies static file requests to Node.js server
3. Proxies API requests to Flask backend
4. Centralizes authentication middleware
5. Handles CORS configuration
6. Provides rate limiting and request logging

### Architecture After Implementation

```
Client (Browser)
    ↓
[API Gateway - Single Port]
    ├─→ /static/* → Node.js Server (port 3000)
    ├─→ /api/* → Flask Backend (port 5000)
    └─→ Middleware: Auth, CORS, Rate Limit, Logging
```

### Technology Choice

**Nginx** (preferred over Express) because:
- ✅ Lightweight reverse proxy (not a full Node framework)
- ✅ High performance
- ✅ Industry standard
- ✅ Excellent documentation
- ✅ Easy to configure for routing, auth, rate limiting

## Alternatives Considered

### Keep Current Architecture
- ✅ No immediate work required
- ❌ CORS complexity grows
- ❌ No centralized auth
- ❌ Client-side complexity

### Express Gateway
- ✅ Pure Node.js
- ✅ JavaScript-based configuration
- ❌ Less efficient than Nginx
- ❌ More overhead
- ✅ Easier integration with Node.js ecosystem

### Kong API Gateway
- ✅ Full-featured
- ✅ Built-in plugins
- ❌ Requires Docker/Kubernetes
- ❌ Overkill for current scale
- ✅ Future option if scaling to microservices

## Consequences

### Positive
- Single entry point for all requests
- Centralized security (auth, rate limiting, CORS)
- Easier CORS configuration
- Better observability (single access log)
- Simpler client-side configuration

### Negative
- Additional infrastructure component
- Nginx configuration management needed
- Another layer to debug/troubleshoot
- SPOF (Single Point of Failure) if not clustered

### Mitigation
- Document gateway configuration in runbooks
- Use config-as-code (Nginx conf in version control)
- Plan for load balancing / HA in future (ADR-006)

## Implementation Plan

### Phase 1: Development Setup
1. Add Nginx container to docker-compose (or systemd service)
2. Create Nginx configuration for routing
3. Test proxying to both backends
4. Document local development setup

### Phase 2: Testing
1. Verify static file serving works
2. Test API proxying with auth
3. CORS behavior validation
4. Load testing

### Phase 3: Deployment
1. Deploy Nginx on production server
2. Update client configuration (single base URL)
3. Monitor gateway performance

## Known Gotchas

⚠️ **Sticky Sessions**
- **Issue**: If load balancing session affinity, JWT doesn't need it, but future sessions auth will
- **Solution**: Use JWT (stateless) or configure sticky sessions if needed
- **Reference**: ADR-002

⚠️ **WebSocket Support (Future)**
- **Issue**: If real-time features added, WebSocket proxying needed
- **Solution**: Nginx can proxy WebSocket; plan ahead
- **Reference**: http://nginx.org/en/docs/http/websocket.html

⚠️ **CORS Preflight Requests**
- **Issue**: Preflight OPTIONS requests will hit gateway
- **Solution**: Configure gateway to respond to OPTIONS quickly
- **Reference**: https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request

## Related Decisions

- **ADR-001**: Frontend Server Architecture (port 3000)
- **ADR-002**: Authentication Strategy (centralized at gateway)
- **ADR-004**: Admission Application Security
- **ADR-006**: High Availability (future)

## References

- [Nginx Reverse Proxy](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
- [CORS Proxy Configuration](https://enable-cors.org/)

## Future Revisions

- [ ] Implement Nginx gateway (Q2 2024)
- [ ] Add centralized rate limiting
- [ ] Implement auth middleware at gateway
- [ ] Plan HA/load balancing (ADR-006)
