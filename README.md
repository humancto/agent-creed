# agent-creed

> Five behavioral principles for coding agents. One source of truth. Every agent configured.

**agent-creed** is a tiny, boring, airtight package that drops the same set of coding-agent guardrails into your repo — no matter which agent or IDE you use. Claude Code, Codex, Cursor, Copilot, Gemini, Windsurf, Cline, Aider, Continue, Goose, Junie, Qwen, Amp, OpenHands — all read the same principles, all stay in sync.

```bash
npx agent-creed install         # auto-detects your agents and writes their rule files
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

Content derived in part from [Andrej Karpathy's observations on LLM coding pitfalls](https://x.com/karpathy/status/2015883857489522876). Not affiliated with Andrej.

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

### Specific agents

```bash
npx agent-creed install --agent=claude,cursor,codex
npx agent-creed install --all       # every supported agent
npx agent-creed install --force     # overwrite non-managed files
```

### As a Claude Code plugin

From inside Claude Code:

```
/plugin marketplace add humancto/agent-creed
/plugin install agent-creed@agent-creed
```

This registers agent-creed as a Claude Skill available in every project.

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

## License

MIT © agent-creed contributors
