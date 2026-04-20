#!/usr/bin/env node
// agent-creed CLI — install behavioral principles for any coding agent in a project.
//
// Usage:
//   npx agent-creed install                 Auto-detect and install for all known agents.
//   npx agent-creed install --agent=claude,cursor,codex
//   npx agent-creed install --all           Write rule files for every supported agent.
//   npx agent-creed list                    Print every supported agent and its target file.
//   npx agent-creed print                   Print the canonical principles to stdout.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(HERE, '..');
const SRC_PATH = join(PKG_ROOT, 'principles.md');
const SRC = readFileSync(SRC_PATH, 'utf8').trimEnd() + '\n';

const BANNER =
  '<!-- Managed by `npx agent-creed install`. Regenerate after editing principles.md. -->\n\n';

const frontmatter = (fields) => {
  const lines = Object.entries(fields).map(([k, v]) =>
    typeof v === 'string' ? `${k}: ${v}` : `${k}: ${JSON.stringify(v)}`
  );
  return `---\n${lines.join('\n')}\n---\n\n`;
};

const DESCRIPTION =
  "Behavioral principles for coding agents — surface assumptions, keep it simple, change only what's needed, verify before reporting.";

// Agent registry: id, target path, and how to render the file.
const AGENTS = [
  { id: 'claude', label: 'Claude Code', path: 'CLAUDE.md', render: () => BANNER + SRC },
  { id: 'codex', label: 'OpenAI Codex CLI / AGENTS.md standard', path: 'AGENTS.md', render: () => BANNER + SRC },
  { id: 'gemini', label: 'Gemini CLI', path: 'GEMINI.md', render: () => BANNER + SRC },
  { id: 'copilot', label: 'GitHub Copilot', path: '.github/copilot-instructions.md', render: () => BANNER + SRC },
  { id: 'aider', label: 'Aider (via CONVENTIONS.md)', path: 'CONVENTIONS.md', render: () => BANNER + SRC },
  { id: 'cline', label: 'Cline / Roo Code', path: '.clinerules', render: () => BANNER + SRC },
  { id: 'goose', label: 'Block Goose', path: '.goosehints', render: () => BANNER + SRC },
  { id: 'junie', label: 'JetBrains Junie', path: '.junie/guidelines.md', render: () => BANNER + SRC },
  { id: 'qwen', label: 'Qwen Code', path: '.qwen/QWEN.md', render: () => BANNER + SRC },
  { id: 'amp', label: 'Sourcegraph Amp', path: '.amp/AGENT.md', render: () => BANNER + SRC },
  {
    id: 'cursor',
    label: 'Cursor',
    path: '.cursor/rules/agent-creed.mdc',
    render: () => frontmatter({ description: DESCRIPTION, alwaysApply: true }) + SRC,
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    path: '.windsurf/rules/agent-creed.md',
    render: () => frontmatter({ trigger: 'always_on', description: DESCRIPTION }) + SRC,
  },
  {
    id: 'continue',
    label: 'Continue.dev',
    path: '.continue/rules/agent-creed.md',
    render: () => frontmatter({ name: 'agent-creed', alwaysApply: true }) + SRC,
  },
  {
    id: 'openhands',
    label: 'OpenHands',
    path: '.openhands/microagents/repo.md',
    render: () => frontmatter({ name: 'agent-creed', agent: 'CodeActAgent' }) + SRC,
  },
];

const AGENT_BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

// Detection: if any of these signals are present, the project already uses the agent.
const DETECTORS = {
  claude: ['CLAUDE.md', '.claude/'],
  codex: ['AGENTS.md', '.codex/'],
  gemini: ['GEMINI.md', '.gemini/'],
  copilot: ['.github/copilot-instructions.md', '.github/'],
  cursor: ['.cursor/'],
  windsurf: ['.windsurf/', '.windsurfrules'],
  continue: ['.continue/'],
  cline: ['.clinerules', '.roo/'],
  aider: ['.aider.conf.yml', 'CONVENTIONS.md'],
  goose: ['.goosehints'],
  junie: ['.junie/'],
  qwen: ['.qwen/'],
  amp: ['.amp/', 'AGENT.md'],
  openhands: ['.openhands/'],
};

function detect(cwd) {
  const found = new Set();
  for (const [id, signals] of Object.entries(DETECTORS)) {
    for (const s of signals) {
      if (existsSync(join(cwd, s))) {
        found.add(id);
        break;
      }
    }
  }
  return found;
}

function parseArgs(argv) {
  const args = { cmd: argv[0] || 'help', agents: null, all: false, yes: false, force: false };
  for (const a of argv.slice(1)) {
    if (a === '--all') args.all = true;
    else if (a === '--yes' || a === '-y') args.yes = true;
    else if (a === '--force') args.force = true;
    else if (a.startsWith('--agent=')) args.agents = a.slice('--agent='.length).split(',');
  }
  return args;
}

function cmdList() {
  const pad = Math.max(...AGENTS.map((a) => a.id.length));
  for (const a of AGENTS) {
    console.log(`${a.id.padEnd(pad)}  ${a.path.padEnd(42)}  ${a.label}`);
  }
}

function cmdPrint() {
  process.stdout.write(SRC);
}

function cmdInstall(args, cwd) {
  let chosen;
  if (args.all) {
    chosen = AGENTS;
  } else if (args.agents) {
    chosen = args.agents.map((id) => {
      const a = AGENT_BY_ID[id];
      if (!a) {
        console.error(`Unknown agent: ${id}. Run \`agent-creed list\` to see supported agents.`);
        process.exit(2);
      }
      return a;
    });
  } else {
    const detected = detect(cwd);
    if (detected.size === 0) {
      console.error('No agent config detected in this directory.');
      console.error('Run `agent-creed install --all` to write for every supported agent, or');
      console.error('`agent-creed install --agent=claude,cursor` to choose specific ones.');
      process.exit(2);
    }
    chosen = AGENTS.filter((a) => detected.has(a.id));
    console.log(`Detected: ${[...detected].join(', ')}`);
  }

  let written = 0;
  let skipped = 0;
  for (const a of chosen) {
    const target = join(cwd, a.path);
    const content = a.render();
    if (existsSync(target) && !args.force) {
      const existing = readFileSync(target, 'utf8');
      if (existing === content) {
        console.log(`  up-to-date  ${a.path}`);
        skipped++;
        continue;
      }
      if (!existing.startsWith(BANNER)) {
        console.log(`  skipped (exists, not managed)  ${a.path}  — use --force to overwrite`);
        skipped++;
        continue;
      }
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
    console.log(`  wrote       ${a.path}`);
    written++;
  }
  console.log(`\nDone. ${written} written, ${skipped} skipped.`);
}

function cmdHelp() {
  console.log(`agent-creed — behavioral principles for coding agents

Usage:
  agent-creed install                           Auto-detect agents in this repo and install.
  agent-creed install --agent=claude,cursor     Install for specific agents.
  agent-creed install --all                     Install for every supported agent.
  agent-creed install --force                   Overwrite existing files not managed by agent-creed.
  agent-creed list                              List all supported agents.
  agent-creed print                             Print the canonical principles to stdout.
  agent-creed help                              Show this help.

Alias: \`creed\` works the same as \`agent-creed\`.
`);
}

const args = parseArgs(process.argv.slice(2));
switch (args.cmd) {
  case 'install':
    cmdInstall(args, process.cwd());
    break;
  case 'list':
    cmdList();
    break;
  case 'print':
    cmdPrint();
    break;
  case 'help':
  case '--help':
  case '-h':
  default:
    cmdHelp();
}
