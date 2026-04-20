#!/usr/bin/env bash
# agent-creed installer — no-Node fallback. Downloads principles.md and writes
# per-agent rule files for the current directory.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/humancto/agent-creed/main/install.sh | bash
#   curl -fsSL https://.../install.sh | bash -s -- --all
#   curl -fsSL https://.../install.sh | bash -s -- --agent=claude,cursor

set -euo pipefail

REPO_RAW="${AGENT_CREED_RAW:-https://raw.githubusercontent.com/humancto/agent-creed/main}"
BANNER='<!-- Managed by agent-creed installer. Regenerate to update. -->'

ALL=0
FORCE=0
AGENTS=""
for arg in "$@"; do
  case "$arg" in
    --all) ALL=1 ;;
    --force) FORCE=1 ;;
    --agent=*) AGENTS="${arg#--agent=}" ;;
    *) echo "Unknown flag: $arg" >&2; exit 2 ;;
  esac
done

tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
curl -fsSL "$REPO_RAW/principles.md" -o "$tmp"

render_plain() {
  local dest=$1
  mkdir -p "$(dirname "$dest")"
  if [[ -f "$dest" && $FORCE -eq 0 ]]; then
    if ! head -n1 "$dest" | grep -qF "$BANNER"; then
      echo "  skip (exists, unmanaged): $dest"; return
    fi
  fi
  { echo "$BANNER"; echo; cat "$tmp"; } > "$dest"
  echo "  wrote: $dest"
}

render_fm() {
  local dest=$1
  local fm=$2
  mkdir -p "$(dirname "$dest")"
  if [[ -f "$dest" && $FORCE -eq 0 ]]; then
    if ! head -n1 "$dest" | grep -q '^---$'; then
      echo "  skip (exists, unmanaged): $dest"; return
    fi
  fi
  { printf -- "---\n%s\n---\n\n" "$fm"; cat "$tmp"; } > "$dest"
  echo "  wrote: $dest"
}

want() {
  local id=$1
  [[ $ALL -eq 1 ]] && return 0
  [[ ",$AGENTS," == *",$id,"* ]] && return 0
  return 1
}

detect() {
  local targets=()
  [[ -f CLAUDE.md || -d .claude ]] && targets+=("claude")
  [[ -f AGENTS.md || -d .codex ]] && targets+=("codex")
  [[ -f GEMINI.md || -d .gemini ]] && targets+=("gemini")
  [[ -d .github ]] && targets+=("copilot")
  [[ -d .cursor ]] && targets+=("cursor")
  [[ -d .windsurf || -f .windsurfrules ]] && targets+=("windsurf")
  [[ -d .continue ]] && targets+=("continue")
  [[ -f .clinerules || -d .roo ]] && targets+=("cline")
  [[ -f CONVENTIONS.md || -f .aider.conf.yml ]] && targets+=("aider")
  [[ -f .goosehints ]] && targets+=("goose")
  [[ -d .junie ]] && targets+=("junie")
  [[ -d .qwen ]] && targets+=("qwen")
  [[ -d .amp || -f AGENT.md ]] && targets+=("amp")
  [[ -d .openhands ]] && targets+=("openhands")
  AGENTS=$(IFS=,; echo "${targets[*]}")
}

if [[ $ALL -eq 0 && -z "$AGENTS" ]]; then
  detect
  if [[ -z "$AGENTS" ]]; then
    echo "No agent config detected. Re-run with --all or --agent=claude,cursor" >&2
    exit 2
  fi
  echo "Detected: $AGENTS"
fi

want claude    && render_plain "CLAUDE.md"
want codex     && render_plain "AGENTS.md"
want gemini    && render_plain "GEMINI.md"
want copilot   && render_plain ".github/copilot-instructions.md"
want aider     && render_plain "CONVENTIONS.md"
want cline     && render_plain ".clinerules"
want goose     && render_plain ".goosehints"
want junie     && render_plain ".junie/guidelines.md"
want qwen      && render_plain ".qwen/QWEN.md"
want amp       && render_plain ".amp/AGENT.md"
want cursor    && render_fm ".cursor/rules/agent-creed.mdc" $'description: Behavioral principles for coding agents.\nalwaysApply: true'
want windsurf  && render_fm ".windsurf/rules/agent-creed.md" $'trigger: always_on\ndescription: Behavioral principles for coding agents.'
want continue  && render_fm ".continue/rules/agent-creed.md" $'name: agent-creed\nalwaysApply: true'
want openhands && render_fm ".openhands/microagents/repo.md" $'name: agent-creed\nagent: CodeActAgent'

echo "Done."
