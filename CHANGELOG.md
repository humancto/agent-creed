# Changelog

All notable changes to agent-creed are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-04-20

Initial release.

### Added
- Five canonical principles in `principles.md`: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution, Verify Before Reporting, plus a Safety guardrails section.
- `scripts/sync.mjs` — generator that produces per-agent rule files from `principles.md`.
- `bin/agent-creed.mjs` — CLI with `install` (auto-detect or selective), `list`, and `print`. Exposes both `agent-creed` and short alias `creed`.
- `install.sh` — bash fallback for environments without Node.
- Support for 14 coding agents: Claude Code, Codex (AGENTS.md), Gemini, Copilot, Cursor, Windsurf, Continue, Cline/Roo, Aider, Goose, Junie, Qwen, Amp, OpenHands.
- Claude Code plugin and Skill manifests (`.claude-plugin/`, `skills/agent-creed/`).
- Drift-detection test suite (`tests/sync.test.mjs`) and CI workflow.
