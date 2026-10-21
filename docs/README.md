# Cloud Admissions System - Documentation

Welcome to the documentation for the Cloud Admissions System. This folder contains all architectural, operational, and API documentation.

## 📚 Documentation Structure

```
docs/
├── README.md (you are here)
├── KNOWN_GOTCHAS.md         ← ⚠️ Read this first! Lists all known issues
├── 
├── architecture/
│   ├── SYSTEM_ARCHITECTURE.md     ← System diagrams and component interactions
│   └── ...
│
├── api/
│   ├── openapi.yaml               ← OpenAPI 3.0 specification (machine-readable)
│   ├── API_CONTRACT_GUIDE.md      ← Human-readable API documentation
│   └── ...
│
├── decisions/
│   ├── README.md                   ← Guide to ADRs (Architecture Decision Records)
│   ├── ADR-001-Frontend-Server-Architecture.md
│   ├── ADR-002-Authentication-Strategy.md
│   ├── ADR-003-API-Gateway-Implementation.md
│   ├── ADR-004-Admission-Application-Security.md
│   └── ... (historical ADRs preserved)
│
└── ...
```

## 🎯 Quick Navigation

### For **New Developers**

1. **Start here**: [KNOWN_GOTCHAS.md](./KNOWN_GOTCHAS.md) — Understand current limitations
2. **Understand architecture**: [architecture/SYSTEM_ARCHITECTURE.md](./architecture/SYSTEM_ARCHITECTURE.md)
3. **Learn API contracts**: [api/API_CONTRACT_GUIDE.md](./api/API_CONTRACT_GUIDE.md)
4. **Deep dive**: Read relevant ADRs in [decisions/](./decisions/)

### For **Decision Makers**

1. **Read ADR Index**: [decisions/README.md](./decisions/README.md)
2. **Understand critical issues**: [KNOWN_GOTCHAS.md](./KNOWN_GOTCHAS.md) (Priority matrix at bottom)
3. **Review active decisions**: [ADR-002](./decisions/ADR-002-Authentication-Strategy.md), [ADR-003](./decisions/ADR-003-API-Gateway-Implementation.md), [ADR-004](./decisions/ADR-004-Admission-Application-Security.md)

### For **API Consumers**

1. **Machine-readable spec**: [api/openapi.yaml](./api/openapi.yaml) (import into Postman, Swagger UI, etc.)
2. **Human guide**: [api/API_CONTRACT_GUIDE.md](./api/API_CONTRACT_GUIDE.md)
3. **Architecture overview**: [architecture/SYSTEM_ARCHITECTURE.md](./architecture/SYSTEM_ARCHITECTURE.md)

### For **Security Reviewers**

1. **Security issues**: [KNOWN_GOTCHAS.md](./KNOWN_GOTCHAS.md) — sorted by severity
2. **Auth design**: [decisions/ADR-002-Authentication-Strategy.md](./decisions/ADR-002-Authentication-Strategy.md)
3. **Authorization design**: [decisions/ADR-004-Admission-Application-Security.md](./decisions/ADR-004-Admission-Application-Security.md)
4. **API security**: [api/openapi.yaml](./api/openapi.yaml) — see security schemes

### For **Ops / DevOps**

1. **System components**: [architecture/SYSTEM_ARCHITECTURE.md](./architecture/SYSTEM_ARCHITECTURE.md)
2. **Deployment decisions**: [decisions/ADR-003](./decisions/ADR-003-API-Gateway-Implementation.md) (API Gateway)
3. **Config/Env variables**: [KNOWN_GOTCHAS.md](./KNOWN_GOTCHAS.md) #12

## 🚨 Critical Issues (Must Read)

**Before deploying to production, address these:**

1. ❌ **No real authentication** — [ADR-002](./decisions/ADR-002-Authentication-Strategy.md), [Gotcha #2](./KNOWN_GOTCHAS.md)
2. ❌ **No authorization on app endpoints** — [ADR-004](./decisions/ADR-004-Admission-Application-Security.md), [Gotcha #1](./KNOWN_GOTCHAS.md)
3. ❌ **FERPA privacy violation risk** — [Gotcha #1](./KNOWN_GOTCHAS.md)
4. ⚠️ **No CORS configuration** — [Gotcha #3](./KNOWN_GOTCHAS.md)

**Full risk matrix**: [KNOWN_GOTCHAS.md — Risk Matrix](./KNOWN_GOTCHAS.md#-gotcha-risk-matrix)

## 📋 Key Concepts

### What is an ADR?

**Architecture Decision Record** — A document capturing:
- Why a decision was needed
- What was decided
- Why this over alternatives
- What changes as a result

ADRs are **permanent historical records**. We keep old ADRs even when decisions change.

**Learn more**: [decisions/README.md](./decisions/README.md)

### System Components

```
Browser Client
    ↓
[Node.js Server - Port 3000]  (Static files)
    ↓
[Flask API - Port 5000]       (REST API)
    ↓
[SQLite Database]             (admissions.db)
```

**Diagrams**: [architecture/SYSTEM_ARCHITECTURE.md](./architecture/SYSTEM_ARCHITECTURE.md)

### API Endpoints

| Endpoint | Method | Purpose | Auth? | Issue? |
|----------|--------|---------|-------|--------|
| `/api/login` | POST | User auth | ❌ No | Demo only |
| `/api/apply` | POST | Submit app | ❌ No | ⚠️ Requires auth |
| `/api/applications` | GET | List apps | ❌ No | ⚠️ Requires auth |

**Full API Reference**: [api/API_CONTRACT_GUIDE.md](./api/API_CONTRACT_GUIDE.md)  
**Machine-readable**: [api/openapi.yaml](./api/openapi.yaml)

## 🔄 Decision Making Process

### How to Make a Decision

1. **Identify the decision** — What problem needs solving?
2. **Research alternatives** — What are the options?
3. **Write an ADR** — Document context, decision, rationale, consequences
4. **Get approval** — Review with stakeholders
5. **Mark as ACCEPTED** — Update ADR status
6. **Implement** — Use decisions to guide implementation
7. **Link from docs** — Update KNOWN_GOTCHAS.md, README, related ADRs

### How to Change a Decision

1. **Do NOT delete the old ADR** — Keep it for historical context
2. **Write a new ADR** — Document why the old decision is being superseded
3. **Mark old as SUPERSEDED** — Update the old ADR status
4. **Link between them** — ADR-New says "Supersedes ADR-Old"

**Example**: If we later change from SQLite to PostgreSQL, we would create "ADR-006-Database-Migration" that references the original database decision.

## 📊 Project Status

### Current Phase: Early Development

- ✅ MVP Feature Set (login, submit app, view apps)
- ❌ Production-ready auth (in progress - ADR-002)
- ❌ Production database (SQLite → PostgreSQL planned)
- ⚠️ Limited error handling
- ⚠️ Minimal security hardening

### Timeline

| Quarter | Focus | ADRs |
|---------|-------|------|
| Q1 2024 | MVP, Architecture decisions | ADR-001, 002, 003, 004 |
| Q2 2024 | Auth implementation, Security | ADR-002 Phase 2, ADR-005 (Pagination) |
| Q3 2024 | Production readiness, Monitoring | ADR-006 (Database), Logging setup |
| Q4 2024 | Scale, HA, Performance optimization | ADR-007+ (HA, Clustering) |

## 🔗 Important Links

- **Repository**: `/home/user/cloud`
- **Backend**: Flask Python (`app.py`)
- **Frontend**: Node.js/HTML (`server.js`, `index.html`)
- **Database**: SQLite (`admissions.db`)
- **OpenAPI Editor**: https://editor.swagger.io (paste `openapi.yaml` content)

## ❓ FAQ

**Q: What if I find a bug or issue?**  
A: Add it to [KNOWN_GOTCHAS.md](./KNOWN_GOTCHAS.md) with:
- Severity (🔴 CRITICAL, 🟠 HIGH, 🟡 MEDIUM, 🟢 LOW)
- Impact description
- Reference to relevant ADR
- Workaround (if applicable)
- Fix timeline (estimated)

**Q: Can I delete an old ADR?**  
A: No. Keep old ADRs for historical context. If replacing a decision, create a new ADR that supersedes the old one.

**Q: How do I add a new endpoint?**  
A: 
1. Implement in `app.py` or `server.js`
2. Add to `docs/api/openapi.yaml`
3. Document any new gotchas in `KNOWN_GOTCHAS.md`
4. If major decision, create an ADR
5. Link from architecture diagram if it affects component interactions

**Q: Where do I report a security issue?**  
A: Add to [KNOWN_GOTCHAS.md](./KNOWN_GOTCHAS.md) under "Critical Issues" section. Mark severity as 🔴 CRITICAL if it affects authentication or data access.

## 🤝 Contributing

When adding documentation:

1. **Follow the ADR template** (if writing decisions)
2. **Link liberally** — Cross-reference related docs, ADRs, gotchas
3. **Use clear headings** — Structure for easy scanning
4. **Date everything** — ADRs, gotchas, decisions
5. **Keep history** — Don't delete old docs, archive them
6. **Add status** — Mark ADRs as DRAFT, PROPOSED, ACCEPTED, SUPERSEDED

---

**Last Updated**: 2024-01-20  
**Next Review**: 2024-02-15

For questions or contributions, contact the Architecture Team.
