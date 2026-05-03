# Classification Patterns

Pattern reference for Phase 2 item classification. Used to categorize unchecked checklist items into verification strategies.

## Categories

### Auto — File/field existence and format checks

Verifiable by reading files and checking fields. Instant, deterministic.

**Keyword patterns** (case-insensitive):

| Pattern | Example Item |
|---------|-------------|
| `file.*exist` | "Config file exists" |
| `has.*field`, `required.*field` | "package.json has all required fields" |
| `prefix`, `naming`, `convention` | "Package name follows naming convention" |
| `sorted`, `alphabetical`, `order` | "Items sorted alphabetically" |
| `frontmatter`, `yaml.*valid` | "SKILL.md has valid frontmatter" |
| `version.*updated`, `version.*bump` | "Version updated in package.json" |
| `format`, `structure` | "JSON format is valid" |
| `registered`, `listed` | "Item listed in README" |
| `path.*correct`, `path.*valid` | "All paths are relative and correct" |

> **Note**: "No sensitive data" / "No credentials" without a specific file reference belong in **Scan**, not Auto. Auto only matches when the item explicitly references a specific file or field (e.g., "No sensitive data in config fields", "No credentials in package.json").

**Regex:**
```regex
(?i)(file.*(exist|present|created)|has.*(field|property|key)|required.*(field|property)|
(prefix|suffix|naming|convention)|sort(ed)?|alphabetical|order(ed)?|
frontmatter|yaml.*(valid|correct)|version.*(update|bump)|
format.*(valid|correct)|registered|listed|path.*(correct|valid|relative))
```

### CI — Continuous integration status checks

Verifiable via `gh pr checks` API. Single API call, no local execution needed.

**Keyword patterns:**

| Pattern | Example Item |
|---------|-------------|
| `test.*pass`, `tests? (pass|green|succeed)` | "Tests pass", "All tests green" |
| `lint`, `linting` | "Lint passes", "No linting errors" |
| `type.?check`, `tsc` | "Type check passes" |
| `build`, `compile` | "Build succeeds", "Project compiles" |
| `ci.*pass`, `pipeline`, `check.*pass` | "CI passes", "Pipeline green" |
| `(test\s+)?coverage.*(above\|threshold\|percent\|report)` | "Test coverage above threshold" |

**Regex:**
```regex
(?i)(tests?\s*(pass|green|succeed|ok)|lint(ing)?|type.?check|tsc|
build\s*(succeed|pass|ok)|compil(e|ation)|ci\s*(pass|green|ok)|
pipeline|check.*pass|(test\s+)?coverage.*(above|threshold|percent|report))
```

### Shell — Single-command grep/find/jq checks

Verifiable with one shell command. Quick, pattern-based.

**Keyword patterns:**

| Pattern | Example Item |
|---------|-------------|
| `no.*console\.log` | "No console.log statements" |
| `no.*todo`, `no.*fixme` | "No TODO comments remaining" |
| `no.*debugger` | "No debugger statements" |
| `unused.*import` | "No unused imports" |
| `no.*trailing`, `whitespace` | "No trailing whitespace" |
| `no.*hardcod` | "No hardcoded values" |
| `no.*console\.(warn|error)` | "No console.warn in production code" |

**Regex:**
```regex
(?i)(no.*(console\.|todo|fixme|debugger|trailing|whitespace|hardcod)|
unused.*(import|variable|export)|remove.*(log|debug|print))
```

### Scan — Semantic understanding via subagent

Requires reading and understanding code semantics. Needs a subagent for analysis.

**Keyword patterns:**

| Pattern | Example Item |
|---------|-------------|
| `no.*secret`, `no.*credential`, `no.*api.?key` | "No secrets in code" |
| `documentation.*updated`, `docs.*updated` | "Documentation updated" |
| `changelog`, `release.?note` | "Changelog entry added" |
| `readme.*updated` | "README updated" |
| `security.*review` | "Security review completed" |
| `error.*handling`, `edge.*case` | "Error handling is comprehensive" |
| `backward.*compat` | "Backward compatible" |

**Regex:**
```regex
(?i)(no.*(secret|credential|api.?key|token|password)|
(documentation|docs|readme|changelog|release.?note).*(update|add|modif)|
security.*(review|audit)|error.*handling|edge.*case|backward.*compat)
```

### Human — Requires human judgment

Cannot be automatically verified. Anything that doesn't match above categories.

**Common patterns (for documentation, not matching):**

| Pattern | Example Item |
|---------|-------------|
| `review`, `approved`, `sign.?off` | "Design reviewed by team" |
| `discuss`, `agree` | "Team agreed on approach" |
| `look.*good`, `quality` | "Code quality is good" |
| `ux`, `design`, `accessibility` | "UX reviewed" |
| `performance.*acceptable` | "Performance is acceptable" |

## Confidence Assignment

| Level | Criteria | Action |
|-------|----------|--------|
| **HIGH** | Exact keyword match, unambiguous category | Auto-proceed with verification |
| **MEDIUM** | Partial match, or matches a secondary pattern | Present classification, proceed unless user objects |
| **LOW** | No clear match, or matches multiple categories | Ask user to confirm or reclassify |

## Classification Algorithm

```text
function classify(item_text):
  normalized = lowercase(strip_markdown(item_text))

  # Match in priority order (most specific first)
  for category in [Auto, CI, Shell, Scan]:
    match = test_patterns(normalized, category.patterns)
    if match:
      if also_matches_other_category(normalized):
        confidence = MEDIUM  # ambiguous
      else:
        confidence = match.specificity  # HIGH or MEDIUM
      return (category, confidence)

  # Default: Human
  human_keywords = ["reviewed", "approved", "sign-off", "sign off"]
  if any(keyword in normalized for keyword in human_keywords):
    return (Human, HIGH)   # explicit human-judgment keyword
  else:
    return (Human, MEDIUM) # no pattern matched — uncertain classification
```

**Priority order for ambiguous matches:**

When an item matches multiple categories, prefer the most specific (cheapest) one:

1. **Auto** — instant, deterministic
2. **CI** — single API call
3. **Shell** — single command
4. **Scan** — subagent required
5. **Human** — always fallback

Example: "Tests pass and no console.log" → do NOT split compound items (rewriting PR body is out of scope). Classify by the dominant verification category (CI in this case) and note the compound nature. If the dominant category is unclear, classify as Human/LOW and ask the user.
