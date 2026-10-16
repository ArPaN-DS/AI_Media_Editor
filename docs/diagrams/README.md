# System diagrams

The architecture has six designed SVG exports and a matching [interactive explorer](../architecture/README.md). Open `docs/architecture/index.html` locally to inspect components, trace connections, follow guided workflows, pan/zoom, change canvas theme and export vectors. Light is the default; dark is optional.

SVGs render directly in GitHub Markdown and scale without losing detail. The `.mmd` files are portable Mermaid references for the underlying topology and detailed sequence notation; their automatic layout is separate from the designed exports.

| View | Designed SVG | Mermaid reference |
|---|---|---|
| System context | [system-context.svg](system-context.svg) | [system-context.mmd](system-context.mmd) |
| Application components | [system-components.svg](system-components.svg) | [system-components.mmd](system-components.mmd) |
| Copilot request journey | [copilot-sequence.svg](copilot-sequence.svg) | [copilot-sequence.mmd](copilot-sequence.mmd) |
| Dependency-aware execution | [execution-lifecycle.svg](execution-lifecycle.svg) | [execution-lifecycle.mmd](execution-lifecycle.mmd) |
| Deployment and private data | [deployment-data.svg](deployment-data.svg) | [deployment-data.mmd](deployment-data.mmd) |
| Resource governance | [resource-governance.svg](resource-governance.svg) | [resource-governance.mmd](resource-governance.mmd) |

## Updating the designed exports

1. Edit content and routed layout in [`architecture.js`](../architecture/architecture.js), checking claims against the application source.
2. Open the explorer and select the affected view. Use **Export SVG** in the light theme to replace the corresponding SVG here.
3. Update the portable Mermaid reference if topology or sequence behavior changed. It need not reproduce the designed layout.
4. Update the architecture narrative and run `python scripts/update_architecture.py` and `python scripts/check_repository_hygiene.py`.

The export action includes the full diagram, title, legend and scope note. Current search, selection, tracing and zoom do not hide content in the exported image. The explorer is self-contained and uses no CDN or external runtime dependency.

## Rendering a portable Mermaid reference

Node.js, Mermaid CLI and its browser runtime are needed only when rendering `.mmd` files separately. Write to a temporary output so the reference render does not replace the designed SVG:

```powershell
npx --yes --package @mermaid-js/mermaid-cli@12.0.0 mmdc -i docs/diagrams/system-context.mmd -o "$env:TEMP/studio-context-reference.svg" -b transparent
```

The [source map](../ARCHITECTURE_SOURCE_MAP.md) remains the complete inventory. These diagrams choose readable component groupings rather than placing every function in one picture.
