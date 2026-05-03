# Decision Tree: Unknown Word Handling

## Flowchart

```text
cspell flags unknown word
        │
        ▼
  Repo has cspell config?
        │
   Yes ─┼─ No
   │        │
   ▼        ▼
 Continue  Notify user, offer
 below     bootstrap (config-bootstrapping.md)
   │
   ▼
  Can text be adjusted without
  changing meaning? (see exceptions below)
        │
   Yes ─┼─ No
   │        │
   ▼        ▼
 Adjust   Is it unchangeable?
 text     (npm lifecycle, library name,
          proper noun, runtime API, etc.)
              │
         Yes ─┼─ No (ambiguous)
         │        │
         ▼        ▼
   Frequency?   Ask user:
         │      - External API contract?
         │      - Intentional test data?
         │      - Domain-specific term?
         │      Then apply Frequency?
         │      logic based on answer.
         │
   2+ files ─┼─ One-off
    │              │
    ▼              ▼
  What kind?     What kind?
    │              │
  ┌─┴──┐        ┌─┴──┐
  ▼    ▼        ▼    ▼
Legit  Non-   Legit  Non-word/
term   word   term   Token
  │    │        │       │
  ▼    ▼        ▼       ▼
Project  Project   cspell:    cspell:disable-
words    ignore-   words      next-line or
         Words     (file-     cspell:disable-
         (or       wide)      line
         ignore-       │
         Paths     or cspell:ignore
         for       (for non-word
         generated  strings)
         files)
```

## Text Adjustment Strategy (Priority 1)

When cspell doesn't recognize a compound/combined word, try restructuring before dictionary additions:

- **Hyphenate in prose/comments**: `preprocess` → `pre-process` (only where safe)
- **CamelCase**: Applicable in code where naming conventions allow it
- **Never** replace with a semantically different word (e.g., don't change `unsubscribe` to `remove`)

### Exceptions — Do NOT Adjust

These are unchangeable terms; skip directly to dictionary/directive:

- **Runtime API identifiers**: `unref`, `hrtime`, `querySelector`, DOM methods
- **npm lifecycle scripts**: `preinstall`, `postbuild` (fixed names)
- **Library/package names**: `tsup`, `vitest`, `biomejs`
- **Proper nouns and brand names**
- **Technical terms with established spelling**
- **HTML/CSS attribute values**: `preload`, `prefetch`, `noninteractive`

## Project Dictionary vs Inline Directive (Priority 2 vs 3)

### Add to project config `words` when:

- Word appears in 2+ files or is expected to recur by design
- Project-wide term (technology name, domain term, team jargon)

### Add to project config `ignoreWords` when:

- Non-word tokens (hashes, encoded strings) appear frequently across multiple files
- Generated content patterns recur but can't use `ignorePaths`

### Use `ignorePaths` when:

- Entire generated files should be excluded from spell checking (e.g., `dist/`, lock files)

### Use inline directive when:

- Word appears only in one file/location
- Context-specific (font name in config, encoded value in test)

## Inline Directive Selection

| Directive | Use When | Scope |
|-----------|----------|-------|
| `cspell:words term1, term2` | Legitimate term not in dictionary (library name, domain abbreviation) | File-wide, appears in suggestions |
| `cspell:ignore term1, term2` | Non-word string (encoded values, intentional test data) | File-wide, no suggestions |
| `cspell:disable-next-line` | Line has tokens, hashes, base64, or mixed content | Next line only |
| `cspell:disable-line` | Same as above, but directive on the same line | Current line only |
| `cspell:disable` / `cspell:enable` | Block of generated content, large data literals | Block scope |

### Placement Convention

- `cspell:words` and `cspell:ignore` → file top (after shebangs/pragmas, before code)
- `cspell:disable-next-line` → directly above the target line
- `cspell:disable-line` → end of the target line
- `cspell:disable`/`enable` → wrap the minimal necessary block

## Edge Cases

- **Variable/function names**: If refactoring is too costly (public API, widely referenced), treat as unchangeable → add to dictionary
- **Comments with foreign words**: Use `cspell:ignore` for specific words, not `disable-line` (to keep checking the rest)
- **Generated files**: Consider adding to config `ignorePaths` instead of inline directives
- **Standard acronyms** (API, URL, HTTP, iOS): If flagged, check whether a relevant cspell dictionary (e.g., `@cspell/dict-software-terms`) is missing from config before adding to project `words`
- **Same word, different contexts in one file**: Handle each occurrence independently — a word may be correct in a variable name but misspelled in a comment
- **Monorepo override conflicts**: Child-package `overrides` win over root config; verify precedence with `cspell --config <path> <file>` if unsure
