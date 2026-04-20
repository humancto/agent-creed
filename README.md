# agent-creed

[![CI](https://github.com/humancto/agent-creed/actions/workflows/ci.yml/badge.svg)](https://github.com/humancto/agent-creed/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Claude Code Plugin](https://img.shields.io/badge/Claude%20Code-plugin-8A63D2)](#install-as-a-claude-code-plugin)
[![Agents supported](https://img.shields.io/badge/agents-14-brightgreen)](#supported-agents)

> Five behavioral principles for coding agents. One source of truth. Every agent configured.

**agent-creed** is a tiny, focused package that writes the same coding-agent guardrails into every rule file your repo needs — `CLAUDE.md`, `.cursor/rules/`, `AGENTS.md`, `.clinerules`, `.github/copilot-instructions.md`, and 10 more — from a single source. Claude Code, Codex, Cursor, Copilot, Gemini, Windsurf, Cline, Aider, Continue, Goose, Junie, Qwen, Amp, OpenHands — every agent in your repo reads the same principles, in sync.

### Two ways to install

**Any repo, any agent (Node):**
```bash
npx agent-creed install         # auto-detects your agents and writes their rule files
```

**Claude Code users — one command inside the CLI:**
```
/plugin marketplace add humancto/agent-creed
/plugin install agent-creed@agent-creed
```

That's the whole idea.

---

## Why

LLM coding agents fail in a small number of reliable ways:

1. **They assume instead of asking.** They pick an interpretation silently and run.
2. **They overengineer.** Strategy patterns for one-line functions.
3. **They drift.** "I fixed the bug" becomes 40 unrelated formatting changes.
4. **They chase moving targets.** Without verifiable success criteria, they loop forever on the wrong thing.
5. **They claim done without checking.** "Tests pass" without running the tests.

agent-creed is five principles that name each failure and prescribe the fix. You ship them as the *same text* to every agent, so behavior stops depending on which tool a teammate happens to use.

These principles trace back to [Andrej Karpathy's observations on LLM coding pitfalls](https://x.com/karpathy/status/2015883857489522876), first codified into a named four-principle set by [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills). agent-creed extends that work with a fifth principle, a safety section, and 14 agents behind one source of truth. See [Credits & Lineage](#credits--lineage) for the full attribution and a comparison of what's inherited vs. added.

---

## The principles

| # | Principle | The failure it addresses |
|---|---|---|
| 1 | **Think Before Coding** | Silent assumptions, hidden confusion |
| 2 | **Simplicity First** | Premature abstraction, speculative features |
| 3 | **Surgical Changes** | Drive-by refactoring, style drift |
| 4 | **Goal-Driven Execution** | Vague work, no loop-to-done |
| 5 | **Verify Before Reporting** | "Probably works" = claimed done |

Plus a short **Safety** section (destructive ops, shared state, secrets, scope drift).

Full text: [`principles.md`](./principles.md).

---

## Install

### For one repo

```bash
# Node installed — recommended
npx agent-creed install

# Short alias (same binary)
npx creed install

# No Node — bash fallback
curl -fsSL https://raw.githubusercontent.com/humancto/agent-creed/main/install.sh | bash
```

`agent-creed install` detects which agents your repo is already set up for (by looking for `.cursor/`, `.github/`, `CLAUDE.md`, etc.) and writes their rule file. Files managed by agent-creed carry a banner; re-running is idempotent.

### Install for a specific agent

Generate just the rule file you need — `CLAUDE.md`, `.cursor/rules/agent-creed.mdc`, `AGENTS.md`, or any of the 14 supported outputs:

```bash
npx agent-creed install --agent=claude              # writes CLAUDE.md
npx agent-creed install --agent=cursor              # writes .cursor/rules/agent-creed.mdc
npx agent-creed install --agent=codex               # writes AGENTS.md
npx agent-creed install --agent=copilot             # writes .github/copilot-instructions.md
npx agent-creed install --agent=claude,cursor,codex # multiple at once
npx agent-creed install --all                       # every supported agent
npx agent-creed install --force                     # overwrite existing non-managed files
```

### Install as a Claude Code plugin

From inside Claude Code, this repo is its own [plugin marketplace](https://docs.claude.com/en/docs/claude-code/plugins-marketplaces) — no separate registry required:

```
/plugin marketplace add humancto/agent-creed
/plugin install agent-creed@agent-creed
```

This registers agent-creed as a Claude Skill available in every project. The underlying manifests are `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`.

---

## Supported agents

| Agent | File written |
|---|---|
| Claude Code | `CLAUDE.md` |
| OpenAI Codex CLI (AGENTS.md standard) | `AGENTS.md` |
| Gemini CLI | `GEMINI.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cursor | `.cursor/rules/agent-creed.mdc` |
| Windsurf | `.windsurf/rules/agent-creed.md` |
| Continue.dev | `.continue/rules/agent-creed.md` |
| Cline / Roo Code | `.clinerules` |
| Aider | `CONVENTIONS.md` (use with `aider --read CONVENTIONS.md`) |
| Block Goose | `.goosehints` |
| JetBrains Junie | `.junie/guidelines.md` |
| Qwen Code | `.qwen/QWEN.md` |
| Sourcegraph Amp | `.amp/AGENT.md` |
| OpenHands | `.openhands/microagents/repo.md` |

Missing your agent? [Open an issue](https://github.com/humancto/agent-creed/issues/new) or submit a PR against `bin/agent-creed.mjs` and `scripts/sync.mjs`.

---

## How it works

```
principles.md            ← canonical source of truth (edit this)
    │
    └── scripts/sync.mjs ← regenerates every per-agent file
        ├── CLAUDE.md
        ├── AGENTS.md
        ├── GEMINI.md
        ├── .cursor/rules/agent-creed.mdc
        └── …
```

CI runs `node scripts/sync.mjs --check` on every PR — if a generated file drifts from `principles.md`, the build fails. There is no "oops, I edited CLAUDE.md and forgot to update Cursor."

---

## FAQ

### What is a `CLAUDE.md` file?

`CLAUDE.md` at the root of your repo is [Claude Code's](https://docs.claude.com/en/docs/claude-code/overview) convention for project-level behavioral instructions — the model reads it automatically. agent-creed generates one from the five principles so you don't have to draft it yourself.

### Can the same rules work for Cursor, Claude Code, Codex, and Copilot at once?

Yes — that's the point. agent-creed writes `CLAUDE.md` for Claude Code, `.cursor/rules/agent-creed.mdc` for Cursor, `AGENTS.md` for Codex (and any tool following the AGENTS.md standard), `.github/copilot-instructions.md` for Copilot, plus 10 more, all from a single `principles.md`. One edit → every agent updates on the next `npm run sync`.

### I already have a `CLAUDE.md`. Do I need this?

Only if you want one or both of: (a) the five-principle behavioral core (hidden-assumption detection, simplicity, surgical edits, goal-driven execution, verify-before-reporting), or (b) automatic sync across more than one agent. If you hand-maintain a single file and it works, you don't.

### How do I keep `.cursor/rules` and `CLAUDE.md` in sync without forgetting one?

Edit `principles.md`, run `npm run sync` (or `npx agent-creed install`). Both files are regenerated from the same source. In CI, `node scripts/sync.mjs --check` fails the build if any derivative file has drifted — so the invariant is a test, not a social contract.

### Does this work with the AGENTS.md standard?

Yes. `AGENTS.md` is one of the 14 output files and contains the same content as `CLAUDE.md`. Any agent that reads `AGENTS.md` (OpenAI Codex CLI, and a growing list of others) gets the same principles.

### Can I customize the principles for my project?

Fork the repo, edit `principles.md`, run `npm run sync`, commit. The generator writes the exact content of `principles.md` into every target file — so the per-agent files are always a faithful copy of whatever `principles.md` says.

### What's the difference between this and `forrestchang/andrej-karpathy-skills`?

Upstream ships 4 principles for Claude Code + Cursor (2 agents). agent-creed extends it with a 5th principle (`Verify Before Reporting`), a safety guardrails section, 14 agents, a generator, a CLI, CI drift detection, and tests. See [Credits & Lineage](#credits--lineage) for the full comparison.

---

## For contributors

1. Edit `principles.md` (only).
2. `npm run sync` to regenerate all per-agent files.
3. `npm test` to verify the drift check and CLI.

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Philosophy

agent-creed itself follows its own principles:

- **No abstractions you didn't ask for.** One Node script generates files. One shell script is a no-Node fallback. That's it.
- **Every agent gets the same text.** Behavior parity beats per-agent cleverness.
- **CI verifies the invariant.** Drift is not a social contract; it's a test.

---

## Credits & Lineage

agent-creed did not invent these principles. It stands on three pieces of prior work:

1. **[Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876)** — the conceptual origin. The observations about how LLM coding agents fail (wrong assumptions, overengineering, drive-by refactoring, weak success criteria) come from Andrej's public post. Not affiliated with Andrej.

2. **[forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)** by [@jiayuan_jy](https://x.com/jiayuan_jy) — the first codification of Andrej's observations into four named principles with actionable bullets, plus a Claude Code plugin and a Cursor rule. The four principle names (`Think Before Coding`, `Simplicity First`, `Surgical Changes`, `Goal-Driven Execution`) and roughly 80% of their bullet prose come directly from this repo. MIT-licensed; attribution preserved.

3. **[humancto/andrej-karpathy-skills](https://github.com/humancto/andrej-karpathy-skills)** (branch `claude/evaluate-agent-compatibility-KEsuN`) — the scaffold this repo was imported from. It extended upstream with the 5th principle, the safety section, the generator architecture, the CLI, 14-agent coverage, tests, and CI.

### What agent-creed adds on top of forrestchang/andrej-karpathy-skills

| Dimension | forrestchang/andrej-karpathy-skills | agent-creed |
|---|---|---|
| Principles | 4 | **5** — adds `Verify Before Reporting` |
| Safety guardrails | — | ✅ Destructive ops, shared state, secrets, scope drift |
| Supported agents | 2 (Claude Code, Cursor) | **14** — Claude, Codex, Gemini, Copilot, Cursor, Windsurf, Continue, Cline, Aider, Goose, Junie, Qwen, Amp, OpenHands |
| Source of truth | `CLAUDE.md` + hand-maintained Cursor rule (two files in parallel) | Single `principles.md` → generator writes every derivative |
| Drift prevention | Social contract | `node scripts/sync.mjs --check` in CI |
| Install | curl / Claude Code plugin | `npx agent-creed install` with auto-detection, `--agent=...`, `--all`, `--force`; bash fallback |
| Idempotency | — | Managed-by banner; reinstall is a no-op unless principles change |
| Tests | — | 6 Node tests covering drift, CLI, manifest |
| Distribution | GitHub raw + Claude Code plugin marketplace | Same, plus npm-ready (`npx agent-creed`) |

### What agent-creed has *not* ported from upstream

- `README.zh.md` — Forrest ships a Chinese translation of the README. agent-creed is English-only. Contributions welcome.
- `EXAMPLES.md` — upstream's good-vs-bad example gallery.
- Separate `CURSOR.md` setup guide — folded into a row of the Supported Agents table here.

### One specific content change

agent-creed replaces upstream's principle 2 bullet *"No error handling for impossible scenarios"* with *"Validate only at system boundaries (user input, external APIs). Trust internal invariants."* — same spirit, more actionable.

---

## License

MIT © agent-creed contributors. Inherited text from forrestchang/andrej-karpathy-skills is likewise MIT-licensed.
