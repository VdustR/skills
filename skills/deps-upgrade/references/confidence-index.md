<!-- Shared: deps-upgrade (source of truth) / deps-migrate (copy). Keep in sync. -->

# Confidence Index Specification

## Factor Weights

| Factor | Weight | How Measured |
|--------|--------|-------------|
| API mapping completeness | 25% | % of source APIs with confirmed target equivalents |
| Test verification | 25% | Pass rate of /tmp tests, or subagent review score |
| Documentation quality | 15% | Context7 available + changelog coverage |
| Codemod/tool coverage | 15% | % of changes handled by codemods vs manual |
| Breaking change coverage | 20% | % of breaking changes with confirmed migration paths |

## Thresholds

| Level | Range | Meaning |
|-------|-------|---------|
| 🟢 High | 80%+ | Safe to proceed |
| 🟡 Medium | 60-79% | Review boost options |
| 🔴 Low | <60% | Strongly recommend boosting before proceeding |

**Floor rule**: If ANY single factor scores below 40%, overall indicator is forced to 🔴 regardless of weighted average.

## Example Output

### Confidence Index: 79% 🟡

| Factor | Score | Reason |
|--------|-------|--------|
| API mapping completeness | 85% | 42/50 APIs have direct equivalents |
| Test verification | 90% | 3/3 representative tests passed |
| Documentation quality | 70% | Context7 docs available, some gaps |
| Codemod coverage | 60% | No official codemod, manual transforms |
| Breaking change coverage | 80% | Changelog reviewed, 2 potential hidden breaks |

### To increase confidence:

- [ ] **+5%** Run subagent Critical Think review on API mapping
- [ ] **+5%** Test 2 more edge case patterns in /tmp
- [ ] **+3%** Manually verify potential hidden breaks
- [ ] **+5%** Run full test suite with new package (slower)
- [ ] **+2%** Check community issues for migration gotchas

Proceed with current confidence, or boost first? [proceed / boost / abort]

## Boost Options

Each boost option includes:
- **Estimated % improvement** — how much it raises the confidence index
- **What it verifies** — which factor it improves
- **Time/cost trade-off** — fast vs thorough

Always let user choose: proceed at current confidence, boost specific factors, or abort.

## Scoring Guidelines

### API Mapping Completeness (25%)
- 100%: Every source API has a confirmed, tested target equivalent
- 80%: Most APIs mapped, a few with documented workarounds
- 60%: Core APIs mapped, some gaps flagged
- <40%: Significant gaps — many APIs with no known equivalent

### Test Verification (25%)
- 100%: All representative patterns tested and passing in /tmp
- 80%: Most patterns tested, minor issues resolved
- 60%: Basic patterns tested, complex patterns reviewed by subagent
- <40%: No testing performed (should never happen — fallback to subagent review)

### Documentation Quality (15%)
- 100%: Context7 + changelog + migration guide all available
- 70%: Two of three sources available
- 40%: Only one source (e.g., changelog only)
- <40%: No documentation found — proceed with caution

### Codemod/Tool Coverage (15%)
- 100%: Official codemod handles all breaking changes
- 70%: Codemod handles most, some manual changes needed
- 40%: No codemod, all manual — but changes are straightforward
- <40%: No codemod, complex manual changes required

### Breaking Change Coverage (20%)
- 100%: All breaking changes identified with clear migration paths
- 80%: Most breaking changes covered, some potential hidden changes
- 60%: Known breaking changes covered, code analysis incomplete
- <40%: Significant uncertainty about breaking changes
