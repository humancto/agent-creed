import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('sync.mjs --check passes (all generated files match principles.md)', () => {
  const r = spawnSync('node', ['scripts/sync.mjs', '--check'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, `drift detected:\n${r.stdout}\n${r.stderr}`);
});

test('principles.md exists and contains all five principles', () => {
  const src = readFileSync(join(ROOT, 'principles.md'), 'utf8');
  for (const header of [
    '## 1. Think Before Coding',
    '## 2. Simplicity First',
    '## 3. Surgical Changes',
    '## 4. Goal-Driven Execution',
    '## 5. Verify Before Reporting',
  ]) {
    assert.ok(src.includes(header), `missing: ${header}`);
  }
});

test('every generated file includes the principles body', () => {
  const generated = [
    'CLAUDE.md',
    'AGENTS.md',
    'GEMINI.md',
    '.github/copilot-instructions.md',
    'CONVENTIONS.md',
    '.clinerules',
    '.goosehints',
    '.junie/guidelines.md',
    '.qwen/QWEN.md',
    '.amp/AGENT.md',
    '.cursor/rules/agent-creed.mdc',
    '.windsurf/rules/agent-creed.md',
    '.continue/rules/agent-creed.md',
    '.openhands/microagents/repo.md',
    'skills/agent-creed/SKILL.md',
  ];
  for (const f of generated) {
    const path = join(ROOT, f);
    assert.ok(existsSync(path), `missing: ${f}`);
    const body = readFileSync(path, 'utf8');
    assert.ok(
      body.includes('## 5. Verify Before Reporting'),
      `${f} missing principle 5`
    );
  }
});

test('CLI: agent-creed list prints every registered agent', () => {
  const r = spawnSync('node', ['bin/agent-creed.mjs', 'list'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(r.status, 0);
  for (const id of ['claude', 'codex', 'gemini', 'cursor', 'copilot', 'openhands']) {
    assert.ok(r.stdout.includes(id), `list missing: ${id}`);
  }
});

test('CLI: agent-creed print emits principles.md exactly', () => {
  const r = spawnSync('node', ['bin/agent-creed.mjs', 'print'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(r.status, 0);
  const src = readFileSync(join(ROOT, 'principles.md'), 'utf8').trimEnd() + '\n';
  assert.equal(r.stdout, src);
});

test('Claude plugin manifest references the agent-creed skill', () => {
  const plugin = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/plugin.json'), 'utf8'));
  assert.equal(plugin.name, 'agent-creed');
  assert.ok(plugin.skills.some((s) => s.includes('agent-creed')));
});
