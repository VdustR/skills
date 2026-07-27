# Command Reference

Read the installed CLI's help for the current command surface, flags, source
formats, supported agents, and defaults. Use a repository-pinned version when
the repository declares one.

Common operation families are:

- preview or list skills from a source;
- install selected or all skills;
- list installed skills and linked agents;
- search the public registry;
- update or check installations;
- remove selected skills.

Quote wildcard-like agent selectors so the shell does not expand them. Prefer
machine-readable output for verification, but do not assume every installed
skill is rooted under the same agent directory; universal and agent-specific
installations may be reported differently.

Pass explicit source, scope, agents, and confirmation flags only after those
choices are known. Current help is authoritative over examples in this
repository.
