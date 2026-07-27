# Code Style

Repository formatting and lint rules are authoritative. As fallbacks:

- prefer inference for local values;
- annotate meaningful API and callback boundaries;
- use regular-word acronym casing;
- avoid wrapper object types and redundant aliases;
- keep type-only imports consistent with compiler and bundler settings;
- choose readable narrowing over assertion chains.

Do not refactor unrelated style while fixing a type error. A shorter annotation
is not better if it obscures the consumer contract.
