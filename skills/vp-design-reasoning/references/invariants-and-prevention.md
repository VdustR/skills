# Invariants and Prevention

Use this reference for a design decision or recurring mistake that could be
prevented by changing a model, API, type, ownership rule, or enforcement boundary.
Routine implementation does not need a separate design exercise merely because
it uses types or collections.

Three signs suggest that domain modeling was skipped: a feature that grows an
existing if/else chain by one more branch, a second boolean that must stay in
sync with the first, and modules named for phases such as load, validate,
transform, and save that each repeat the same domain rule. Execution order is
not ownership: splitting modules by phase assigns no owner to the rule they
repeat. When one of these signs appears, state the invariant the code must
preserve, then consider a structure that encodes it, such as a state machine,
a lookup table, or a discriminated union, before extending the code.

## Establish the guarantee before choosing a mechanism

State the rule in observable terms. "One current value per key," "reject any
duplicate source entry," and "one record per business key across writers" are
different invariants. Identify the source of truth, key equality and any
canonicalization, permitted updates, and the boundary through which writes pass.
Then compare the smallest viable mechanisms that preserve the same requirement.

Making invalid states unavailable through a model or restricted API reduces the
operations callers must remember. This may still rely on validation at entry,
encapsulated mutation, or an authoritative storage constraint. State the scope
of the guarantee rather than claiming that a representation prevents every error.

## Representative decisions and counterexamples

| Situation | Decision and boundary | Evidence to seek |
| --- | --- | --- |
| Static configuration has one handler per known action; order and duplicate declarations have no business meaning. | Consider a keyed model rather than an entry list plus repeated uniqueness reminders. Preserve required key coverage; inspect construction and later writes. | Check missing or unknown keys, composition/spreads, and mutation. A final keyed value does not prove its sources never collided. |
| Imported entries must reject duplicate action names. | Validate duplicates before conversion to a Record or Map loses the evidence; define equality and normalization first. Restrict later insertions if duplicate insertion must also fail. | Accept distinct input; reject repeated and canonically equivalent keys. Exercise overwrite paths and confirm failures do not publish partial state. |
| Loading, success, and failure are encoded by independent booleans with optional payloads. | Consider a discriminated union with variant-specific data before a custom lint rule. Preserve legitimate transitions and concurrent substates if the domain permits them. | Verify valid variants and reject contradictory states. Validate external input before admitting it to the typed model; hand compiler details to the TypeScript skill. |
| A style rule has one behavior-preserving formatter correction. | Prefer existing safe formatting/autofix over reminders or a new type abstraction. | Check the actual tool and configuration preserve behavior, produce the required form, and are stable on a second pass. |
| Duplicate business records have conflicting values and no merge policy. | Reject with useful context or obtain the domain decision. A deterministic last-write-wins fix still lacks semantic justification. | Preserve both conflicting inputs for controlled diagnosis; verify the chosen policy only after it is established. |
| An isolated quote-style edit is proposed to need branded strings and generic builders. | Keep the existing formatter and local edit. The added model cost provides no needed domain guarantee. | Confirm the task has no semantic invariant requiring a new abstraction; avoid introducing a framework to satisfy the preference order. |

## Keyed collections do not establish duplicate rejection

A TypeScript `Record` describes a keyed shape; it does not validate runtime
inputs or reject assignment to an existing property. A JavaScript Map similarly
keeps one current value per key while `set` replaces that value. For example,
`new Map([["task", 1], ["task", 2]])` has one entry with value `2`;
`Object.fromEntries` on those entries also retains the later value.

If duplicate input is invalid, check before this conversion. Specify whether
each mutation inserts, replaces, merges, or rejects, and ensure callers cannot
bypass the promised boundary. If replacement is intentional, preserve it rather
than imposing duplicate rejection on every update.

An in-process check does not ensure uniqueness across concurrent processes.
Choose an authoritative atomic constraint or coordination mechanism for the
actual business key and writer topology. For a database constraint, verify
scope, null semantics, and conflict behavior for the relevant database version.
Types alone also do not establish that external JSON or persisted data conforms
to the model. Validation belongs where those values enter; a cast is not proof.

## Sources and limits

Reviewed October 24, 2026, with the pstack entry reviewed October 27, 2026.
The preference order is this skill's synthesis; these sources establish
specific techniques and boundaries, not a universal cost-independent hierarchy.

- [Scott Wlaschin: Making illegal states unrepresentable](https://fsharpforfunandprofit.com/posts/designing-with-types-making-illegal-states-unrepresentable/)
  demonstrates modeling allowed alternatives instead of permitting invalid
  combinations. Apply the principle within the target language's guarantees.
- [TypeScript handbook: Discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
  documents variant-specific narrowing. Use the TypeScript skill for concrete
  compiler settings, type tests, and runtime validation methods.
- [ECMAScript: Map.prototype.set](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-map.prototype.set)
  specifies replacement for an existing key; cardinality is not rejection.
- [ESLint: Applying fixes](https://eslint.org/docs/latest/extend/custom-rules#applying-fixes)
  recommends small fixes that avoid breaking runtime behavior. Its suggestions
  mechanism supports changes that need a developer's choice.
- [PostgreSQL 18: Unique constraints](https://www.postgresql.org/docs/18/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS)
  documents database-enforced uniqueness and null treatment. It does not prove
  a particular deployment's schema, topology, or cross-store guarantees.
- [pstack: Model the Domain](https://github.com/cursor/plugins/blob/main/pstack/skills/principle-model-the-domain/SKILL.md)
  names the signs that modeling was skipped. Its list of structures is a menu,
  not a requirement to abstract clear local code.
