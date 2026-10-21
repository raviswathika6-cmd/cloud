# Quick Reference Card

## 📋 Documentation at a Glance

```
┌─────────────────────────────────────────────────────────┐
│          CLOUD ADMISSIONS SYSTEM DOCUMENTATION          │
└─────────────────────────────────────────────────────────┘

ENTRY POINT
├─ docs/README.md ........................ Start here!
├─ docs/INDEX.md ........................ This guide
└─ docs/KNOWN_GOTCHAS.md ............... Issues to know


ARCHITECTURE
├─ docs/architecture/SYSTEM_ARCHITECTURE.md
│  ├─ Component diagrams (Mermaid)
│  ├─ Sequence flows (login, submit, retrieve)
│  └─ Tech stack & deployment model
└─ [UPDATE WHEN: Adding new endpoints or changing topology]


API SPECIFICATION
├─ docs/api/openapi.yaml
│  ├─ POST /api/login ................ Authentication
│  ├─ POST /api/apply ................ Submit application
│  └─ GET /api/applications .......... List applications
├─ docs/api/API_CONTRACT_GUIDE.md .... Human-readable guide
└─ [UPDATE WHEN: Adding endpoints, changing schemas, new errors]


DECISIONS (Architecture Decision Records)
├─ docs/decisions/README.md .......... ADR framework
├─ ADR-001: Frontend Server .......... Node.js HTTP server
├─ ADR-002: Authentication .......... JWT-based auth (phased)
├─ ADR-003: API Gateway ............ Nginx reverse proxy
├─ ADR-004: Application Security ... RBAC + FERPA compliance
└─ [ADD NEW ADR WHEN: Major architectural decision needed]


ISSUES & GOTCHAS
├─ docs/KNOWN_GOTCHAS.md
│  ├─ 🔴 3 CRITICAL issues (must fix before launch)
│  ├─ 🟠 3 HIGH priority issues (fix in 3 months)
│  ├─ 🟡 3 MEDIUM priority issues (fix in 6 months)
│  ├─ 🟢 2 LOW priority issues (nice-to-have)
│  └─ Risk Matrix (Severity × Likelihood × Impact)
└─ [UPDATE WHEN: Finding new bugs, adding workarounds]
```

---

## 🎯 Common Tasks

### "I need to understand the architecture"
```
→ docs/architecture/SYSTEM_ARCHITECTURE.md (5 min read)
  - See Mermaid diagrams of components and flows
```

### "I'm implementing an API endpoint"
```
→ docs/api/openapi.yaml (add your endpoint schema)
→ docs/api/API_CONTRACT_GUIDE.md (document in human form)
→ Follow the patterns shown in existing endpoints
```

### "I found a bug or limitation"
```
→ docs/KNOWN_GOTCHAS.md
  - Add entry with: Severity, Problem, Impact, Workaround
  - Reference related ADR (if exists)
  - Add timeline estimate
```

### "We're making an architectural decision"
```
→ docs/decisions/README.md (read the ADR template first)
→ Create: docs/decisions/ADR-NNN-Your-Decision.md
→ Include: Context, Decision, Alternatives, Consequences
→ Link from: Related ADRs and KNOWN_GOTCHAS.md
```

### "I need to revise an existing decision"
```
⚠️ DO NOT edit old ADR!
→ Create NEW ADR that supersedes the old one
→ Mark old ADR as "SUPERSEDED"
→ Link between them
```

---

## 📊 Key Metrics

| Metric | Value |
|--------|-------|
| Total Documentation Files | 11 |
| Total Lines of Docs | 2,000+ |
| Architecture Diagrams | 3 Mermaid diagrams |
| API Endpoints Documented | 3 |
| ADRs Created | 4 |
| Known Issues Tracked | 12 |
| Critical Issues | 3 🔴 |

---

## 🚨 Critical Issues (Know These!)

```
🔴 CRITICAL #1: No real authentication
   └─ Problem: Demo token, accepts any password
   └─ Impact: Anyone can impersonate anyone
   └─ Reference: docs/decisions/ADR-002-*

🔴 CRITICAL #2: No authorization on app endpoints
   └─ Problem: Any user can view all applications
   └─ Impact: FERPA privacy violation
   └─ Reference: docs/decisions/ADR-004-*

🔴 CRITICAL #3: No CORS configuration
   └─ Problem: Cross-origin requests blocked
   └─ Impact: Frontend can't call backend
   └─ Solution: Set up API Gateway (ADR-003)
```

**→ Read full list**: `docs/KNOWN_GOTCHAS.md`

---

## 🔄 Decision Framework

### How to Make a Decision

1. **Write ADR** ← Use template in `docs/decisions/README.md`
2. **Document Alternatives** ← Show what was considered
3. **Record Consequences** ← Positive & negative impacts
4. **Reference** ← Link from related docs
5. **Archive** ← Never delete old decisions, only supersede

### ADR Lifecycle

```
DRAFT ──→ PROPOSED ──→ ACCEPTED ──→ (stays accepted or)
                                     ↓
                              SUPERSEDED (new ADR created)
                                     ↑
                           (Old ADR never deleted)
```

---

## 🛠️ Implementation Patterns

### Adding a New Endpoint

**Step 1**: Document in OpenAPI
```yaml
# In docs/api/openapi.yaml
paths:
  /api/new-endpoint:
    post:
      summary: Description
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewRequest'
```

**Step 2**: Document in API Guide
```markdown
# In docs/api/API_CONTRACT_GUIDE.md
### POST /api/new-endpoint
**Request**: { ... }
**Response**: { ... }
**See Also**: docs/decisions/ADR-X
```

**Step 3**: Update Architecture
```markdown
# In docs/architecture/SYSTEM_ARCHITECTURE.md
Update component interaction diagrams if needed
```

**Step 4**: Document Issues
```markdown
# In docs/KNOWN_GOTCHAS.md
Add any gotchas specific to this endpoint
```

---

## 📚 Related Resources

### External References
- [OpenAPI 3.0 Spec](https://swagger.io/specification/)
- [Mermaid Diagrams](https://mermaid.live)
- [ADR Template](https://github.com/joelparkerhenderson/architecture_decision_record)
- [OWASP Security](https://owasp.org/)
- [FERPA Privacy](https://www2.ed.gov/policy/gen/guid/fpco/ferpa/)

### Internal Files
- Backend: `/home/user/cloud/app.py` (Flask)
- Frontend: `/home/user/cloud/server.js` (Node.js)
- Database: `/home/user/cloud/admissions.db` (SQLite)

---

## ✅ Checklist for Documentation Review

Before committing code changes:

- [ ] Updated `docs/api/openapi.yaml` if API changed
- [ ] Updated `docs/api/API_CONTRACT_GUIDE.md` with examples
- [ ] Updated `docs/architecture/SYSTEM_ARCHITECTURE.md` if topology changed
- [ ] Added entry to `docs/KNOWN_GOTCHAS.md` if issues found
- [ ] Created new ADR in `docs/decisions/` if major decision
- [ ] Linked ADR from `docs/decisions/README.md`
- [ ] Cross-linked from related documentation
- [ ] Commit message includes "docs:" prefix

---

## 🤔 FAQ

**Q: Can I delete an old ADR?**  
A: No. Archive it, mark as SUPERSEDED, create new ADR if changing.

**Q: Where do I put the gotcha about issue X?**  
A: `docs/KNOWN_GOTCHAS.md`, sorted by severity (🔴🟠🟡🟢), with Reference to related ADR.

**Q: How detailed should an ADR be?**  
A: Detailed enough for someone in 5 years to understand WHY the decision was made, not just WHAT was decided.

**Q: Can I update someone else's ADR?**  
A: Only minor clarifications. For major changes, create a NEW ADR that supersedes it.

**Q: What if documentation is wrong?**  
A: Fix it! Documentation drift is dangerous. Update with: `git commit -m "docs: Fix incorrect X in Y"`

---

**Document Created**: 2024-01-20  
**Maintenance**: Update whenever architecture or API changes  
**Review Cycle**: Monthly  

For more details, see [`docs/README.md`](./README.md)
