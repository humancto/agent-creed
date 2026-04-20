#!/usr/bin/env node
// Generates every agent-specific rule file from principles.md.
// Run `node scripts/sync.mjs` to write. Run with `--check` for CI drift detection.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = readFileSync(join(ROOT, 'principles.md'), 'utf8').trimEnd() + '\n';

const BANNER =
  '<!-- Generated from principles.md by scripts/sync.mjs — do not edit directly. -->\n\n';

const plain = (body) => BANNER + body;

const frontmatter = (fields) => {
  const lines = Object.entries(fields).map(([k, v]) =>
    typeof v === 'string' ? `${k}: ${v}` : `${k}: ${JSON.stringify(v)}`
  );
  return `---\n${lines.join('\n')}\n---\n\n`;
};

const DESCRIPTION =
  "Behavioral principles for coding agents — surface assumptions, keep it simple, change only what's needed, verify before reporting.";

const targets = [
  // Plain always-on instruction files (the AGENTS.md family):
  { path: 'CLAUDE.md', render: () => plain(SRC) },
  { path: 'AGENTS.md', render: () => plain(SRC) },
  { path: 'GEMINI.md', render: () => plain(SRC) },
  { path: '.github/copilot-instructions.md', render: () => plain(SRC) },
  { path: 'CONVENTIONS.md', render: () => plain(SRC) },
  { path: '.clinerules', render: () => plain(SRC) },
  { path: '.goosehints', render: () => plain(SRC) },
  { path: '.junie/guidelines.md', render: () => plain(SRC) },
  { path: '.qwen/QWEN.md', render: () => plain(SRC) },
  { path: '.amp/AGENT.md', render: () => plain(SRC) },

  // Frontmatter-flavored targets:
  {
    path: '.cursor/rules/agent-creed.mdc',
    render: () =>
      frontmatter({ description: DESCRIPTION, alwaysApply: true }) + SRC,
  },
  {
    path: '.windsurf/rules/agent-creed.md',
    render: () =>
      frontmatter({ trigger: 'always_on', description: DESCRIPTION }) + SRC,
  },
  {
    path: '.continue/rules/agent-creed.md',
    render: () =>
      frontmatter({ name: 'agent-creed', alwaysApply: true }) + SRC,
  },
  {
    path: '.openhands/microagents/repo.md',
    render: () =>
      frontmatter({ name: 'agent-creed', agent: 'CodeActAgent' }) + SRC,
  },
  {
    path: 'skills/agent-creed/SKILL.md',
    render: () =>
      frontmatter({ name: 'agent-creed', description: DESCRIPTION, license: 'MIT' }) +
      SRC,
  },
];

const check = process.argv.includes('--check');
let drift = 0;

for (const t of targets) {
  const content = t.render();
  const full = join(ROOT, t.path);
  if (check) {
    const existing = existsSync(full) ? readFileSync(full, 'utf8') : '';
    if (existing !== content) {
      console.error(`DRIFT: ${t.path}`);
      drift++;
    }
  } else {
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
    console.log(`wrote ${t.path}`);
  }
}

if (check) {
  if (drift > 0) {
    console.error(
      `\n${drift} file(s) out of sync with principles.md. Run: node scripts/sync.mjs`
    );
    process.exit(1);
  }
  console.log('All agent files are in sync with principles.md.');
}
