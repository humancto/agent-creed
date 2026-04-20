# Contributing to agent-creed

Thanks for helping. agent-creed is intentionally small — changes that keep it small and airtight are easiest to land.

## Project shape

```
principles.md                        canonical source of truth
scripts/sync.mjs                     generator (principles.md → every agent file)
bin/agent-creed.mjs                  CLI (install / list / print)
install.sh                           no-Node bash fallback
tests/sync.test.mjs                  drift + CLI tests
.github/workflows/ci.yml             regenerates and runs tests
```

Everything else (CLAUDE.md, AGENTS.md, .cursor/rules/agent-creed.mdc, …) is generated. **Do not edit generated files by hand** — CI will fail.

## Editing the principles

1. Edit `principles.md`.
2. `npm run sync` — regenerates every per-agent file.
3. `npm test` — confirms the drift check passes.
4. Commit both `principles.md` and all regenerated files in the same commit.

## Adding support for a new coding agent

Two places to add the agent:

1. **`scripts/sync.mjs`** — append to the `targets` array. Provide `path` and a `render` function that wraps `SRC` in any agent-specific frontmatter.
2. **`bin/agent-creed.mjs`** — append to the `AGENTS` array and the `DETECTORS` map.

Then:

```bash
npm run sync                        # generate the new file
npm test                            # make sure drift check still passes
```

Update the "Supported agents" table in `README.md` and add a test entry to the `generated` list in `tests/sync.test.mjs` so CI guards against the new file disappearing.

## Style

- No dependencies in `package.json` unless absolutely required. The generator and CLI are pure Node std-lib.
- No TypeScript. Keep it to one `.mjs` file where possible.
- Match `principles.md` tone: short, declarative, example-free in the canonical file (examples live elsewhere).

## Principles apply to agent-creed itself

Before opening a PR:

- **Think before coding** — state what the change does and why in the PR description.
- **Simplicity first** — the smallest diff that solves the problem.
- **Surgical changes** — no drive-by edits to unrelated files.
- **Goal-driven execution** — include a test or a reproducible verification step.
- **Verify before reporting** — run `npm test` locally and confirm it passes.
