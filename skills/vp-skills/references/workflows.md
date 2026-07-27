# Workflows

## Discover Or Inspect

Resolve the intended source, skill name, install scope, and target agents. Use
the CLI's current listing or preview capability rather than assuming a
repository layout or registry name.

## Install

Prefer global installation for personal reusable skills and all supported agents
unless the user requests otherwise. Preview multi-skill sources, then install
only the intended set. Verify the installed source and agent links afterward.

## Update

Treat update and check-like operations as writes until current help establishes
their behavior. Record the installed source before updating, run the narrowest
operation available, and compare the resulting installation.

## Remove Or Replace

List exact installed names first. Remove superseded skills explicitly before or
after installing the replacement according to the user's desired continuity. In
`skills@1.5.3`, omit the agent selector to remove named skills from all their
existing links; the wildcard agent selector is invalid for removal. Do not use
broad “all” removal when a targeted operation exists.

## Repair

When metadata points to a stale upstream path, rediscover the skill from its
canonical source and reinstall through the CLI. Avoid hand-editing generated
locks unless the CLI cannot recover and the user accepts that fallback.
