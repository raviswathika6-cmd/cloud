# Architecture Decision Records (ADRs)

This directory contains all Architecture Decision Records for the Cloud Admissions System.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made in the project, including:
- **Context**: Why did we need to make a decision?
- **Decision**: What did we decide?
- **Rationale**: Why did we choose this over alternatives?
- **Consequences**: What will change as a result?
- **Alternatives**: What other options did we consider?

ADRs are **permanent records** — we keep old ADRs even when decisions change, to maintain historical context.

## Active ADRs (Current Decisions)

| ID | Title | Status | Last Updated |
|----|-------|--------|--------------|
| [ADR-001](./ADR-001-Frontend-Server-Architecture.md) | Frontend Server Architecture | ACCEPTED | 2024-01-15 |
| [ADR-002](./ADR-002-Authentication-Strategy.md) | Authentication Strategy | PROPOSED | 2024-01-15 |
| [ADR-003](./ADR-003-API-Gateway-Implementation.md) | API Gateway Implementation | PROPOSED | 2024-01-20 |
| [ADR-004](./ADR-004-Admission-Application-Security.md) | Admission Application Security | DRAFT | 2024-01-20 |

## Proposed ADRs (Not Yet Decided)

These are under consideration but not yet approved:

- **ADR-005**: Pagination Strategy (in discussion)
- **ADR-006**: Database Strategy - SQLite vs PostgreSQL (in discussion)
- **ADR-007**: Multi-factor Authentication (future)
- **ADR-008**: High Availability & Clustering (future)

## Superseded ADRs (Historical Record)

*None yet* — This is a new project. Decisions will accumulate here as the project evolves.

## How to Use ADRs

### When Making a Decision

1. **Create a new ADR file**: Use the format `ADR-NNN-Short-Title.md`
2. **Use the template** below
3. **Link from related decisions**: Update cross-references
4. **Link from KNOWN_GOTCHAS.md**: If there are known issues related to this ADR
5. **Commit to git** with message: `docs: Add ADR-NNN - Short Title`

### When Reverting a Decision

1. **Do NOT delete the old ADR**
2. **Create a new ADR** superseding the old one: `ADR-NNN-Revised-X-Y-Z-Title.md`
3. **Add "Supersedes ADR-###"** section
4. **Update this README** to mark the old one as superseded

### When Reading an ADR

1. **Understand context first** — read "Context" section
2. **Understand the decision** — read "Decision" section
3. **Check alternatives** — see what was rejected and why
4. **Check consequences** — understand impact
5. **Check gotchas** — link to KNOWN_GOTCHAS.md for implementation tips
6. **Check timeline** — some decisions are phased implementations

## ADR Template

```markdown
# ADR-###: [Decision Title]

**Date**: YYYY-MM-DD
**Status**: DRAFT | PROPOSED | ACCEPTED | SUPERSEDED
**Deciders**: [List of people who decided]
**Affected Components**: [List of affected modules]

## Context

[What problem or decision needed to be made? Why now?]

## Decision

[What did we decide? Be specific.]

## Rationale

[Why this decision? How does it solve the problem?]

## Alternatives Considered

### Alternative 1: [Name]
- ✅ Pro 1
- ❌ Con 1

### Alternative 2: [Name]
- ✅ Pro 1
- ✅ Pro 2
- ❌ Con 1

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Risk 1]
- [Risk 2]

### Mitigation
- [How we mitigate the negative consequences]

## Related Decisions

- **ADR-###**: [Related decision]
- **ADR-###**: [Related decision]

## References

- [Link to documentation]
- [Link to RFC or standard]
- Implementation location: [File path]

## Known Gotchas

⚠️ **[Issue Title]**
- **Problem**: [Description]
- **Solution**: [How to avoid or fix]
- **Reference**: [Related issue or doc]

## Future Revisions

- [ ] [Planned improvement] (Timeline)
- [ ] [Planned improvement] (Timeline)
```

## Key Principles for ADRs

1. **Immutable History**: Never delete old ADRs. Archive them instead.
2. **Timestamp Everything**: Date each decision for historical context.
3. **Document Rationale**: Future maintainers need to understand *why*, not just *what*.
4. **Capture Alternatives**: Record what was rejected and why (future decisions build on this).
5. **Link Liberally**: Cross-reference related ADRs, issues, gotchas.
6. **Accept Change**: If we later reverse a decision, create a new ADR explaining the change.

## Related Documentation

- **Known Gotchas & Issues**: [docs/KNOWN_GOTCHAS.md](../KNOWN_GOTCHAS.md)
- **System Architecture**: [docs/architecture/SYSTEM_ARCHITECTURE.md](../architecture/SYSTEM_ARCHITECTURE.md)
- **API Reference**: [docs/api/openapi.yaml](../api/openapi.yaml)

## Questions?

- Unsure if you should create an ADR? **Do it.** The cost of writing is low, the value of preserving context is high.
- Unsure about a decision? **Write an ADR in DRAFT status** — it clarifies your thinking and invites feedback.
- Found a flaw in an old ADR? **Create a new ADR superseding it** — never delete history.
