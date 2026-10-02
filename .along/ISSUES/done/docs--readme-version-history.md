---
protocol: along
protocol_version: "4.4.1"
slug: readme-version-history
type: docs
status: done
completed: 2026-10-02
priority: medium
created: 2026-10-02
updated: 2026-10-02
agent: claude-code
tags: [docs, changelog, release]
milestone: v2.0.0-along-transition
blocked_by: []
related: [task--release-v1-8-0]
---

# Docs: bring README changelog up to date

The `## Changelog` section in `README.md` stops at 1.2.5. Add 1.2.6 through the unpublished 1.8.0 from git history (`package.json` version per commit) and the actual diffs.

## Acceptance Criteria
- [ ] README changelog covers 1.2.6 - 1.8.0
- [ ] `CHANGELOG.md` "Earlier versions" points to the README section
- [ ] `__pycache__/` ignored in `.gitignore`
- [ ] Committed and pushed to origin/main
