#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$ROOT"

SKILLS_CLI_VERSION="1.5.3"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/validate-skills.sh

Options:
  -h, --help  Show this help.
EOF
}

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "unknown option: $1"
      ;;
  esac
done

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "missing required command: $1"
}

require_command awk
require_command bash
require_command comm
require_command find
require_command grep
require_command mktemp
require_command sort
require_command tr
require_command wc

frontmatter_value() {
  local key="$1"

  printf '%s\n' "$frontmatter" | awk -v key="$key" -v sq="'" '
    $0 ~ "^[[:space:]]*" key "[[:space:]]*:" {
      value = $0
      sub("^[[:space:]]*" key "[[:space:]]*:[[:space:]]*", "", value)
      sub(/[[:space:]]+#.*$/, "", value)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", value)
      if (value ~ /^".*"$/) {
        value = substr(value, 2, length(value) - 2)
      } else if (index(value, sq) == 1 && substr(value, length(value), 1) == sq) {
        value = substr(value, 2, length(value) - 2)
      }
      print value
      exit
    }
  '
}

mentions_skill() {
  local file="$1"
  local skill="$2"

  awk -v skill="$skill" '
    {
      line = $0
      needle = "$" skill
      while ((pos = index(line, needle)) > 0) {
        next_char = substr(line, pos + length(needle), 1)
        if (next_char == "" || next_char !~ /[[:alnum:]_-]/) {
          found = 1
          exit
        }
        line = substr(line, pos + length(needle))
      }
    }
    END { exit !found }
  ' "$file"
}

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

actual_skills="$tmp_dir/actual-skills.txt"
readme_skills="$tmp_dir/readme-skills.txt"
unpinned_commands="$tmp_dir/unpinned-commands.txt"
find skills -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort > "$actual_skills"
awk '/^### vp-/{print $2}' README.md | sort > "$readme_skills"

if ! diff_output="$(comm -3 "$actual_skills" "$readme_skills")" || [ -n "$diff_output" ]; then
  printf 'README skill list does not match skills/*:\n%s\n' "$diff_output" >&2
  exit 1
fi

if grep -RInE 'npx -y skills( |$)' README.md AGENTS.md scripts .github skills > "$unpinned_commands"; then
  cat "$unpinned_commands" >&2
  fail "found unpinned npx skills command; use npx -y skills@${SKILLS_CLI_VERSION}"
fi

while IFS= read -r skill_dir; do
  skill_name="$(basename "$skill_dir")"
  skill_md="$skill_dir/SKILL.md"
  [ -f "$skill_md" ] || fail "$skill_name is missing SKILL.md"

  frontmatter="$(awk '
    NR == 1 && $0 == "---" { in_fm = 1; next }
    in_fm && $0 == "---" { exit }
    in_fm { print }
  ' "$skill_md")"

  name="$(frontmatter_value name)"
  [ -n "$name" ] || fail "$skill_name is missing frontmatter name"
  [ "$name" = "$skill_name" ] || fail "$skill_name frontmatter name is $name"
  printf '%s\n' "$frontmatter" | awk -F': *' '$1 == "description" { found = 1 } END { exit !found }' \
    || fail "$skill_name is missing frontmatter description"

  if [ -d "$skill_dir/references" ]; then
    while IFS= read -r ref_file; do
      ref_rel="${ref_file#"$skill_dir"/}"
      if ! grep -Fq "$ref_rel" "$skill_md"; then
        fail "$ref_file is not directly referenced from $skill_md"
      fi
    done < <(find "$skill_dir/references" -type f | sort)
  fi

  if [ -d "$skill_dir/scripts" ]; then
    while IFS= read -r script_file; do
      [ -x "$script_file" ] || fail "$script_file is not executable"
      case "$script_file" in
        *.sh|*/envctl)
          bash -n "$script_file"
          ;;
      esac
    done < <(find "$skill_dir/scripts" -type f | sort)
  fi

  openai_yaml="$skill_dir/agents/openai.yaml"
  [ -f "$openai_yaml" ] || fail "$skill_name is missing agents/openai.yaml"
  grep -Fq 'display_name:' "$openai_yaml" || fail "$openai_yaml is missing display_name"
  grep -Fq 'short_description:' "$openai_yaml" || fail "$openai_yaml is missing short_description"
  grep -Fq 'default_prompt:' "$openai_yaml" || fail "$openai_yaml is missing default_prompt"
  mentions_skill "$openai_yaml" "$skill_name" || fail "$openai_yaml default_prompt must mention \$$skill_name"
done < <(find skills -mindepth 1 -maxdepth 1 -type d | sort)

printf 'Validated %s skills.\n' "$(wc -l < "$actual_skills" | tr -d ' ')"
