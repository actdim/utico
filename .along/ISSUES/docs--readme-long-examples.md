---
protocol: along
slug: readme-long-examples
type: docs
status: in-progress
priority: low
created: 2026-10-27
updated: 2026-10-27
agent: claude-code
tags: [docs, readme]
blocked_by: []
related: []
---

# Move long README code examples into docs articles

The release gate of the mempart monorepo (doc-routing-compliance, strict) rejects README code fences longer than 50
lines; five utico README examples exceed it (typeCore, dateTimeDataFormat, StructEvent, asyncLock, cache), which
blocked the v1.9.4 release on 2026-10-27.

## Requirements
- REQ-1: The five long examples MUST move unchanged into a docs reference article, one section per module.
- REQ-2: Each README module section MUST keep its prose and link to the moved example (relative link).
- REQ-3: No README code fence MAY exceed 50 lines afterwards.

## Acceptance Criteria
- [ ] Doc routing gate reports no README violations for utico
- [ ] Links resolve (link integrity gate passes)
- [ ] Automated tests passing
