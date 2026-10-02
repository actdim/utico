---
protocol: along
protocol_version: "4.4.1"
date: 2026-10-02
slug: readme-version-history
agent: claude-code
branch: main
commit: b83993d
summary: README changelog brought up to date (1.2.6 - 1.8.0), __pycache__ ignored, Along lifecycle scripts tracked
milestone: v2.0.0-along-transition
issues_advanced: []
issues_completed: [docs--readme-version-history]
decisions: []
risks_logged: []
spikes_conducted: []
---

# Session: Readme version history

## Summary
README changelog brought up to date (1.2.6 - 1.8.0), __pycache__ ignored, Along lifecycle scripts tracked

## Work Completed
- `README.md` `## Changelog`: added 1.2.6, 1.2.7, 1.5.5, 1.5.6 - 1.5.15, 1.7.0, 1.7.1, 1.7.2, 1.8.0 from git history (`package.json` version per commit) and the diffs; added dates to all existing headings.
- `CHANGELOG.md` "Earlier versions" now points to the README section.
- `.gitignore`: `__pycache__/`, `*.pyc` (bytecode from Along lifecycle scripts).
- Tracked the generated Along lifecycle hooks `.along/scripts/build.py`, `.along/scripts/test.py`.
- npm has up to 1.7.2; 1.8.0 is documented ahead of publishing.

## Code Review & Blast Radius
- Docs and ignore rules only; no source changes. Tests not run (no code affected).
- `.along/scripts/*.py` compile (`python -m py_compile`).
- Typography: new lines are ASCII only.
