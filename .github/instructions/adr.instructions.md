---
applyTo: "docs/adr/*.md"
---

# Writing ADRs

Follow the format and index in [docs/adr/README.md](../../docs/adr/README.md).

- File name `NNNN-title-with-hyphens.md`, using the next free number. Add a row to the index.
- One decision per ADR. Cite real paths from the codebase; state what enforces the decision.
- New ADRs start as `Proposed`. After acceptance, change only the Status line. To reverse
  a decision, write a new ADR and mark the old one `Superseded by [NNNN](...)`.
- Keep it short: Context, Decision, Consequences. Add a Mermaid diagram only when it
  explains something the text can't.
