# Documentation Index & File Guide

## 📂 Complete File Structure

```
cloud/
└── docs/                                          # Root documentation directory
    ├── README.md                                  # START HERE - Navigation guide
    ├── KNOWN_GOTCHAS.md                          # All known issues (12 items, risk matrix)
    │
    ├── architecture/
    │   └── SYSTEM_ARCHITECTURE.md                # Component diagrams, request flows, tech stack
    │
    ├── api/
    │   ├── openapi.yaml                          # OpenAPI 3.0 specification (machine-readable)
    │   └── API_CONTRACT_GUIDE.md                 # Human-readable API documentation
    │
    └── decisions/                                 # Architecture Decision Records
        ├── README.md                              # ADR framework & guide
        ├── ADR-001-Frontend-Server-Architecture.md
        ├── ADR-002-Authentication-Strategy.md
        ├── ADR-003-API-Gateway-Implementation.md
        ├── ADR-004-Admission-Application-Security.md
        └── [Future ADRs will be added here]
```

## 🎯 File Purposes at a Glance

| File | Purpose | Audience | Read Time |
|------|---------|----------|-----------|
| **docs/README.md** | Documentation hub, navigation | Everyone | 5 min |
| **docs/KNOWN_GOTCHAS.md** | Known issues & workarounds | Dev, Sec, Ops | 10 min |
| **docs/architecture/SYSTEM_ARCHITECTURE.md** | Component diagrams & flows | Arch, Dev, Ops | 8 min |
| **docs/api/openapi.yaml** | API specification (YAML) | API consumers, Tools | 3 min (scan) |
| **docs/api/API_CONTRACT_GUIDE.md** | API docs (human) | Frontend, Backend, QA | 10 min |
| **docs/decisions/README.md** | How to write ADRs | Architects, Tech Leads | 5 min |
| **docs/decisions/ADR-001...004** | Specific decisions | Decision makers, Devs | 10 min each |

## 📖 How to Read This Documentation

### Scenario 1: "I'm new to the project"
**Read in this order**:
1. `docs/README.md` (2 min) — Get oriented
2. `docs/KNOWN_GOTCHAS.md` (5 min) — Understand limitations
3. `docs/architecture/SYSTEM_ARCHITECTURE.md` (8 min) — Learn architecture
4. `docs/api/API_CONTRACT_GUIDE.md` (10 min) — Understand API
5. Relevant ADRs as needed — Understand why decisions were made

**Total: ~30 minutes** to understand the system

---

### Scenario 2: "I need to add a new endpoint"
**Reference**:
- `docs/api/openapi.yaml` — Add your endpoint spec here
- `docs/api/API_CONTRACT_GUIDE.md` — Follow the patterns shown
- `docs/architecture/SYSTEM_ARCHITECTURE.md` — Update diagrams if needed
- `docs/KNOWN_GOTCHAS.md` — Note any new gotchas
- Consider `docs/decisions/` — If this is a significant decision

---

### Scenario 3: "We need to make an architectural decision"
**Follow this process**:
1. Read `docs/decisions/README.md` — Understand the framework
2. Look at existing ADRs (ADR-001 through ADR-004) — See the pattern
3. Create a new ADR using the template
4. Link from `docs/KNOWN_GOTCHAS.md` if there are implementation gotchas
5. Link from existing ADRs if this decision is related
6. Update `docs/README.md` to link the new ADR

---

### Scenario 4: "I found a bug or limitation"
**Add to documentation**:
1. Open `docs/KNOWN_GOTCHAS.md`
2. Add entry under appropriate severity section
3. Include: Problem, Impact, Workaround (if any), Reference to ADR, Timeline
4. Update the risk matrix at bottom
5. Commit with message: "docs: Add gotcha #X - [Issue Name]"

---

### Scenario 5: "We're changing how authentication works"
**Process**:
1. Do NOT edit `ADR-002-Authentication-Strategy.md`
2. Create new ADR: `ADR-002-Revised-New-Auth-Approach.md`
3. Add "Supersedes ADR-002" section at top
4. Link back to ADR-002
5. Update `docs/decisions/README.md` to mark ADR-002 as SUPERSEDED
6. Update KNOWN_GOTCHAS with new timeline and approach

---

## 🔍 Finding Things

### "Where do I find information about...?"

| I'm looking for... | Look here |
|-------------------|-----------|
| System architecture diagram | `docs/architecture/SYSTEM_ARCHITECTURE.md` |
| API endpoints & contracts | `docs/api/API_CONTRACT_GUIDE.md` |
| API specification (YAML) | `docs/api/openapi.yaml` |
| Authentication approach | `docs/decisions/ADR-002-*` |
| Security authorization | `docs/decisions/ADR-004-*` |
| API Gateway design | `docs/decisions/ADR-003-*` |
| List of all known issues | `docs/KNOWN_GOTCHAS.md` |
| Production readiness | `docs/KNOWN_GOTCHAS.md` (scroll to Critical section) |
| Decision framework | `docs/decisions/README.md` |
| Project overview | `docs/README.md` |

---

## 🏗️ Documentation Principles

### These documents follow these principles:

1. **Immutability of History**: Old decisions are never deleted, only superseded
2. **Cross-linking**: Every major document links to related docs
3. **Accessibility**: Technical docs have both diagrams and text explanations
4. **Actionability**: Issues have workarounds, not just problems
5. **Temporality**: Decisions are dated; timelines are explicit
6. **Referenceability**: Every gotcha links to relevant ADR or code location
7. **Evolutionary**: Documentation grows over time; new ADRs will be added

---

## 📊 Statistics

**Current Documentation**:
- 🏗️ **4 ADRs** (Frontend, Auth, API Gateway, Security)
- 🐛 **12 Known Gotchas** (3 critical, 5 high, 3 medium, 1 low)
- 🔌 **3 API Endpoints** documented
- 📈 **~2000+ lines** of technical documentation

**Expected Growth**:
- Q1: ADRs 5-8 (Pagination, Database, HA, Monitoring)
- Q2: More security & compliance decisions
- Q3: Operational runbooks, deployment guides

---

## 🔗 Quick Links

**Key Documents**:
- [Main README](./README.md)
- [Known Gotchas](./KNOWN_GOTCHAS.md)
- [System Architecture](./architecture/SYSTEM_ARCHITECTURE.md)
- [API Guide](./api/API_CONTRACT_GUIDE.md)
- [OpenAPI Spec](./api/openapi.yaml)
- [ADR Index](./decisions/README.md)

**Specific ADRs**:
- [ADR-001: Frontend Architecture](./decisions/ADR-001-Frontend-Server-Architecture.md)
- [ADR-002: Authentication](./decisions/ADR-002-Authentication-Strategy.md)
- [ADR-003: API Gateway](./decisions/ADR-003-API-Gateway-Implementation.md)
- [ADR-004: Security](./decisions/ADR-004-Admission-Application-Security.md)

---

## ✏️ Contributing to Documentation

### Adding a new gotcha?
Format:
```markdown
### N. **Issue Title**
**Severity**: 🔴|🟠|🟡|🟢  
**Affected**: [Components]  
**Problem**: [What's wrong]  
**Impact**: [Why does this matter]  
**Reference**: [Link to ADR or code]  
**Fix Timeline**: [When this will be fixed]  
**Workaround**: [How to avoid or fix]
```

### Creating a new ADR?
1. Copy the template from `docs/decisions/README.md`
2. Name file: `ADR-NNN-Short-Title.md`
3. Include: Context, Decision, Rationale, Alternatives, Consequences, Related Decisions, References
4. Update `docs/decisions/README.md` to add to the index
5. If there are gotchas, link from `docs/KNOWN_GOTCHAS.md`

### Updating architecture diagrams?
- Edit `docs/architecture/SYSTEM_ARCHITECTURE.md`
- Use Mermaid syntax (rendered on GitHub automatically)
- Update sequence diagrams if request flows change
- Keep tech stack table current

### Updating API documentation?
- Update `docs/api/openapi.yaml` (machine-readable spec)
- Update `docs/api/API_CONTRACT_GUIDE.md` (human explanation)
- Keep examples current
- Document error cases
- Link from KNOWN_GOTCHAS if new issues arise

---

## 🚀 Getting Started

**For immediate action**:

1. **Read this file** (you're doing it!)
2. **Read `docs/README.md`** (main entry point)
3. **Scan `docs/KNOWN_GOTCHAS.md`** (understand current state)
4. **Pick a focus area**:
   - Backend dev? → Read `docs/api/API_CONTRACT_GUIDE.md`
   - Frontend dev? → Read `docs/architecture/SYSTEM_ARCHITECTURE.md`
   - Security review? → Read `docs/KNOWN_GOTCHAS.md` + `docs/decisions/ADR-004-*`
   - Architect? → Read `docs/decisions/README.md` + all ADRs

---

**Created**: 2024-01-20  
**Last Updated**: 2024-01-20  
**Next Review**: 2024-02-15
