# Interactive architecture explorer

Open [`index.html`](index.html) in a browser. It works directly from a local checkout: no build step, server, package installation, model service or internet connection is required for the explorer itself.

On Windows, from the repository root:

```powershell
Start-Process docs/architecture/index.html
```

The explorer starts with a light canvas. Dark mode is an optional toggle. All diagrams use semantic colors for browser, application, intelligence, media engines, resources, persistence and optional external services.

Databases use cylinder shapes with SQLite/PostgreSQL marks; browser windows, folders, clouds, processors and workflow steps have distinct notation. Flask, Python and FFmpeg use recognizable technology marks. See [icon sources](ICONS.md).

## Views

| View | What it explains |
|---|---|
| System components | Browser, Flask, copilot, processor and storage connections |
| System context | Application-host boundary, installation sources and optional services |
| Copilot journey | Request, planning, validation, short edits and background confirmation |
| Execution & recovery | Input dependencies, strict validation, output checks and selective recovery |
| Resource engineering | Headroom, reservations, quality ladders, model sessions and runtime feedback |
| Deployment & privacy | Local state, private files, caches, local CSV and optional PostgreSQL |

## Explore

- Select a component to inspect its behavior, source files, constraints and neighbors.
- Enable **Trace connections** to isolate immediate relationships.
- Search by component, behavior or source filename. Press Enter to inspect a match.
- Drag the canvas to pan. Use **+**, **−**, **Fit view**, or Ctrl/Command + scroll to zoom.
- Use the guided walkthrough controls on request, execution and resource views.
- On small screens the diagram opens focused on a readable component; pan to explore or choose **Fit view** for the entire map.
- Use Tab and Enter/Space to select components, `/` to search, and Escape to clear. On the focused canvas, `+`, `−` and `0` zoom or fit.
- **Export SVG** saves a self-contained vector image in the current canvas theme, with a title, legend and engineering scope note. Export includes the complete diagram, independent of current selection or zoom.

The URL fragment records the selected view, for example `index.html#resource-governance`. No browser storage or telemetry is used. Source links open files from the local checkout; the repository link is an explicit external navigation.

## Maintain the diagrams

[`architecture.js`](architecture.js) defines source-grounded component content, roles, positions and routed connections. [`explorer.js`](explorer.js) renders those definitions and supplies interaction and vector export. [`explorer.css`](explorer.css) and [`index.html`](index.html) define the responsive documentation interface.

After changing content or positions, use the explorer's **Export SVG** action to replace the corresponding file in [`../diagrams/`](../diagrams/). The six committed SVGs use the light theme. Portable Mermaid `.mmd` references remain available for the underlying topology and more detailed sequence notation; their automatic layout is separate from the designed exports.

Check facts against the [developer architecture](../SYSTEM_ARCHITECTURE_DETAILED.md) and refresh the [source map](../ARCHITECTURE_SOURCE_MAP.md) when source coverage changes. Diagram interactions are documentation features, not claims about streaming, distributed workers or new media capabilities.

GitHub Markdown displays the static SVGs. GitHub's repository file viewer does not execute this HTML/JavaScript; open the local explorer for interaction. No Pages deployment is required or configured by this documentation change.
