# Configuration Bootstrapping

Introduce repository configuration only when cspell is an intended project tool.
Inspect package scripts, editor settings, CI, hooks, monorepo boundaries, and
existing dictionary files first.

Keep configuration minimal:

- declare the intended languages and file scope;
- inherit established shared configuration when available;
- keep reusable project terms separate from one-off directives;
- exclude generated or vendored content narrowly;
- avoid broad ignores that suppress real prose or identifiers.

Run the same entrypoint contributors and CI will use. Document setup only when
the repository's public contribution workflow changes.
