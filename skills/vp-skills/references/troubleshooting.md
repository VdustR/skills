# Troubleshooting

## Stale Source Path

An update may fail when installation metadata references a skill path that moved
upstream. Re-preview the canonical source, confirm the replacement name, and
reinstall through the CLI. Verify that the stale skill is no longer listed.

## Partial Agent Links

An installed directory does not prove every requested agent is linked. Compare
machine-readable inventory with the intended agent set and repair only missing
links.

## Ambiguous Check Behavior

Some CLI versions use “check” as an update flow rather than a dry run. Inspect
current help and release behavior before running it against installed skills.

## Large Or Mixed Inventory

Inventory may include universal skills and installations rooted under individual
agents. Do not infer absence from one directory. Use CLI inventory and the
bundled reporting helper when a cross-agent table is needed.

## Network Or Clone Failure

Retry only after distinguishing authentication, source resolution, network, and
temporary clone failures. Do not mutate lock metadata to mask an unreachable or
unauthorized source.
