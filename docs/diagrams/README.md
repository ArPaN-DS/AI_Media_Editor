# Architecture diagrams

Editable Mermaid sources and rendered, searchable SVGs are versioned together. The diagrams describe implemented behavior; the [source map](../ARCHITECTURE_SOURCE_MAP.md) supplies the complete inventory.

| View | Editable source | SVG export |
|---|---|---|
| System context | [system-context.mmd](system-context.mmd) | [system-context.svg](system-context.svg) |
| Application components | [system-components.mmd](system-components.mmd) | [system-components.svg](system-components.svg) |
| Copilot request sequence | [copilot-sequence.mmd](copilot-sequence.mmd) | [copilot-sequence.svg](copilot-sequence.svg) |
| Dependency-aware execution | [execution-lifecycle.mmd](execution-lifecycle.mmd) | [execution-lifecycle.svg](execution-lifecycle.svg) |
| Deployment and private data | [deployment-data.mmd](deployment-data.mmd) | [deployment-data.svg](deployment-data.svg) |
| Resource governance | [resource-governance.mmd](resource-governance.mmd) | [resource-governance.svg](resource-governance.svg) |

## Rendering

Node.js and a Chromium-capable environment are required for Mermaid CLI. The initial render was validated with CLI 12.0.0. Pin the version when reproducing these exports:

```powershell
Get-ChildItem docs/diagrams/*.mmd | ForEach-Object {
    npx --yes --package @mermaid-js/mermaid-cli@12.0.0 mmdc -i $_.FullName -o ($_.FullName -replace '\.mmd$', '.svg') -b transparent
    if ($LASTEXITCODE -ne 0) { throw "Diagram rendering failed" }
}
```

For a PNG or PDF, render the desired source with the corresponding output extension. Keep the SVG for GitHub and source control; it remains sharp when enlarged. Mermaid source uses explicit labels and muted blue/teal/amber colors, with dashed optional/governance connections where identified in the overview.

After code changes, review affected arrows against actual handler calls, update the source and SVG together, then run `python scripts/update_architecture.py`. Diagram labels are deliberately less granular than the generated inventory so that each view remains readable.
