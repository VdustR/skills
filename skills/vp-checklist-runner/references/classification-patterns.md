# Classification

Classify each item by the evidence it actually requires:

- **Repository-static:** file, configuration, generated artifact, or diff state.
- **Executable:** focused test, build, type check, lint, or reproducible command.
- **Hosting-platform:** current check, deployment, approval, label, or release
  state.
- **External-system:** behavior in a device, service, account, or environment.
- **Manual or subjective:** visual quality, product approval, exploratory
  behavior, or stakeholder acceptance.
- **Compound:** multiple independent claims that must all pass.
- **Ambiguous:** wording does not define a verifiable outcome.

Do not downgrade an external or manual requirement into a repository check
because that evidence is easier to obtain. Split compound items in the internal
queue even when the source markdown must remain unchanged.
