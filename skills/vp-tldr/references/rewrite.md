# Rewrite Check

Update a summary from the current source rather than treating the old summary
as authoritative.

1. Read the current artifact, supplied context, and relevant decisions.
2. Draft the summary from that state.
3. Compare it with the old summary only to recover points that still hold.
4. Remove resolved questions, superseded claims, and obsolete owners.
5. Reclassify facts, inferences, unknowns, and blockers when their status has
   changed.
6. Check that the summary and body do not contradict each other.

Keep edit history in the surface intended for history, such as a changelog,
comment thread, or revision log. Avoid summary annotations such as `Update:`,
`previously`, `(confirmed)`, or `(fixed in ...)` unless the user explicitly asks
for a chronological summary.
