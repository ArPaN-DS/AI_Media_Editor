# Contributing

Contributions should make the local media workspace more useful, inspectable and reliable. Start with the [README](../README.md), [engineering guide](ENGINEERING.md) and [architecture](SYSTEM_ARCHITECTURE_OVERVIEW.md).

## Development setup

Fork the repository through GitHub, then clone your fork and create a branch:

```powershell
git clone https://github.com/YOUR_USERNAME/AI_Media_Editor.git
cd AI_Media_Editor
git switch -c feature/describe-the-change
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Generate a random `FLASK_SECRET_KEY`, set it in your private `.env`, and follow [SETUP.md](SETUP.md). Keep the application in a trusted local environment during development.

## Scope a contribution

Describe the concrete problem and resulting behavior. Include affected media types, input constraints, optional dependencies, quality/resource implications and failure behavior. Keep unrelated refactors separate.

For a new copilot capability, update the processor, `ToolSpec`, specialist dispatch, validation, local intent support and relevant workflow instructions together. Document quality variants, model acquisition and licenses. A new HTTP route alone does not create a copilot tool.

For frontend changes, preserve keyboard access, focus behavior, responsive layouts and meaningful error/progress states. Use the existing styles and browser-controller structure unless a larger migration is explicitly part of the proposal.

## Privacy and validation

Do not commit private recordings, photos, videos, transcripts, chat histories, project saves, credentials or runtime logs. Use generated inputs in temporary directories. Existing personal test scripts/fixtures were removed; there is no maintained full regression suite. Report exactly what you ran and which optional engines were unavailable. New synthetic regression coverage is welcome when its files and ignore-policy changes are explicitly reviewed.

```powershell
python scripts/update_architecture.py
python scripts/update_architecture.py --check
python scripts/check_repository_hygiene.py --history
```

If changing a designed diagram, update its definition in `docs/architecture/architecture.js` and export its SVG from the interactive explorer using the [diagram guide](diagrams/README.md). Keep the portable Mermaid reference aligned with topology changes. The generated source map must remain current. It also checks for Python files unreachable from registered entry points; register legitimate standalone CLIs rather than keeping orphaned modules. CI also runs fatal Python lint checks; validate affected execution paths locally.

For performance changes, follow the [measurement requirements](PERFORMANCE.md). Do not publish speedup percentages without reproducible inputs, configuration, baseline and quality checks.

## Pull requests

Use the PR template, explain why the change is needed and describe the final behavior for a reviewer who has not seen prior conversation. Include meaningful validation and material limits. Inspect the staged diff before pushing; CI cannot retract private data already uploaded to the hosting provider.

Review the [code of conduct](../CODE_OF_CONDUCT.md), [third-party notices](../THIRD_PARTY_NOTICES.md) and [security policy](../SECURITY.md). Report vulnerabilities privately through the repository's security-advisory channel instead of public issues. Feature requests and ordinary bugs can use [GitHub Issues](https://github.com/ArPaN-DS/AI_Media_Editor/issues).
