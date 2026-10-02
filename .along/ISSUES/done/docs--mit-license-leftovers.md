---
protocol: along
protocol_version: "4.4.1"
slug: mit-license-leftovers
type: docs
status: done
completed: 2026-10-02
priority: high
created: 2026-10-02
updated: 2026-10-02
agent: claude-code
tags: [license, docs, release]
milestone: v2.0.0-along-transition
blocked_by: []
related: [task--standardize-mit-license]
---

# Docs: remove leftover "Proprietary" license text

`package.json` is MIT since the 2026-09-10 license standardization, but `LICENSE` is a merge of the old proprietary text and MIT, and the README badge / License section, `docs/topic--license.md`, the VitePress footer and `llms-full.txt` still say Proprietary.

## Acceptance Criteria
- [ ] `LICENSE` is the plain MIT text
- [ ] README badge and License section say MIT
- [ ] `docs/topic--license.md`, `docs/INDEX.md` tags, `docs/.vitepress/config.ts` footer say MIT
- [ ] `llms-full.txt` and `docs/public/llms-full.txt` have no "Proprietary"
