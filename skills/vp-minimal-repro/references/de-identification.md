# De-Identification

Applies once a reproduction becomes a demonstration or is about to leave the
machine. A working reproduction that stays where the work is does not need it.

## Why it is a minimality check

`demonstration-repro.md` sets the rule that the artifact shows the mechanism and
nothing else. De-identification is how that rule is enforced at the level of
names and values, and it is not a privacy step bolted on at the end.

Any domain detail that survives is by definition not part of the mechanism, so
its presence is evidence that the reproduction is still too large. It is also
what allows a reader to tell "this particular setup is broken" apart from "the
tool is broken" — every recognizable internal name gives them a reason to
suspect the setup instead.

Rename to neutral technical terms and keep them boring: `Box`, `seed`, `Item`,
`plain`, `handler`.

## Incidental channels leak more than prose

Renaming the visible identifiers is the easy half. The rest arrives through
output nobody wrote by hand:

- Absolute paths embedded in generated output, source maps, or stack traces.
- Directory, module, chunk, or artifact names derived from internal names.
- Fixture and seed values that came from real records.
- Log lines, error messages, and diagnostic dumps.
- Configuration excerpts pasted in for context.
- Lock files and registry URLs, including private registry hosts.
- Environment variable names, hostnames, and account or project identifiers.

Two habits handle most of this: build and run the reproduction from a neutral
path, and search the finished artifact and its output for domain terms, internal
names, and path fragments before it goes anywhere. Search rather than assume;
these strings are usually somewhere nobody thought to look.
