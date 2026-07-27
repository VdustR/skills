# Commit Strategy

Group by one logical change and its verification, not by reviewer, thread count,
or file count. A single fix may answer several comments; unrelated concerns
should remain separate.

Use repository commit conventions. Explain the behavioral reason in the message
when the diff alone is insufficient. Avoid generic messages such as “address
review comments.”

Before each commit, confirm the staged diff contains only the intended topic.
Afterward, use the commit identifier and focused verification as reply evidence.
Do not create empty or cosmetic commits merely to give every comment a separate
link.
