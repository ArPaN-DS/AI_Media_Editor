<p align="center">
  <img src="static/brand-mark.svg" alt="Studio logo" width="72">
</p>

<h1 align="center">Audio, Video & Image Studio</h1>
<p align="center"><strong>A local multimedia workspace with resource-aware AI processing and a validated media copilot.</strong></p>
<p align="center">Audio / Video / Images / Natural-language workflows / Local model inference</p>

Edit media manually or describe an operation to the copilot. Studio combines browser editors, local processing engines, reusable workflows and optional neural model packs in one Python application. No hosted editing account or subscription is required.

## Why this project is interesting

The engineering goes beyond placing a chat box next to an editor:

| Capability | What it means in practice |
|---|---|
| **Resource-aware execution** | Separate admission classes for CPU, encoding, GPU and model work, with RAM/VRAM reservations for governed processing paths. |
| **Managed AI memory** | A single active managed heavy-model session, immediate offload by default and optional short retention for repeated operations. |
| **Adaptive processing quality** | Hardware-aware quality ladders, failure cooldowns, lower-cost fallbacks and learned runtime estimates. |
| **Validated agentic workflows** | 31 registered tools, specialist execution classes, argument and media-type validation, dependency tracking and clarification when needed. |
| **Failure-aware media execution** | Selected retries, output verification, blocked-dependent handling and separate main/branch artifacts. |
| **Practical pipeline optimization** | Block-oriented loudness/EQ processing, fused video soundtrack edits, native thread tuning and budgeted reasoning prompts. |
| **Reusable local context** | Versioned workflow skills plus optional SQLite FTS5/vector memory for preferences and repeatable edits. |
| **An inspectable open-source design** | Editable system diagrams, a generated route/tool/module inventory and repository privacy checks. |

Read [the engineering guide](docs/ENGINEERING.md) for the mechanisms, source references, tradeoffs and contribution opportunities. These are implementation characteristics; no comparative performance benchmark is claimed.

## System architecture

**Explore the system:** [Interactive architecture atlas](docs/architecture/README.md) — six views with component inspection, source links, connection tracing, guided walkthroughs, pan/zoom and SVG export. Open `docs/architecture/index.html` locally; GitHub displays the static diagrams below.

![Studio components: browser, Flask, copilot, processors and private local storage](docs/diagrams/system-components.svg)

Studio is a single Python/Flask application with four route blueprints. Its copilot plans validated media operations and dispatches Audio, Video, Vision and Inspector classes. Long jobs use background threads and HTTP polling. A separately hosted loopback model service is optional.

| Documentation | Purpose |
|---|---|
| [Architecture overview](docs/SYSTEM_ARCHITECTURE_OVERVIEW.md) | System context, boundaries and end-to-end behavior |
| [Developer architecture](docs/SYSTEM_ARCHITECTURE_DETAILED.md) | Execution, storage, resources, engine map and limitations |
| [Generated source map](docs/ARCHITECTURE_SOURCE_MAP.md) | Every declared route, copilot tool, application Python module, controller, template and built-in skill |
| [Interactive architecture explorer](docs/architecture/README.md) | Six interactive views with inspection, tracing and export |
| [Diagram sources and exports](docs/diagrams/README.md) | Designed SVG exports and portable Mermaid references |
| [Codebase review](docs/CODEBASE_REVIEW.md) | Evidence, fixes, verification and prioritized follow-up work |

## What you can do

| Workspace | Functionality |
|---|---|
| **Audio** | Waveform editing, cuts, fades, EQ, mixing, loudness processing, conversion, transcription, denoising, speech enhancement and optional stem separation |
| **Video** | Clip timelines, speed/audio controls, text overlays, transformations, export, thumbnails, subtitles and optional interpolation, scene detection and background matting |
| **Image** | Canvas cropping/transforms, adjustments, filters, text/drawing, export and optional server-side cutouts, restoration, inpainting and super-resolution |
| **Unified studio** | Shared media workspace, keyboard shortcuts, local project saves and reusable outputs |
| **Copilot** | Natural-language operations, validated multi-step plans, clarification, reusable skills, optional memory and downloadable artifacts |

Advanced features depend on installed packages, model weights and FFmpeg. Direct editor functions and copilot tools have different coverage; see the [actual tool registry](docs/ARCHITECTURE_SOURCE_MAP.md#copilot-tool-registry).

## Quick start

Install **Python 3.11+** and **FFmpeg** for audio/video processing. On Windows, `run.bat` provides an automatic setup path. For manual setup in PowerShell:

```powershell
git clone https://github.com/ArPaN-DS/AI_audio_video_image_editor.git
cd AI_audio_video_image_editor
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_hex(32))"
# Set FLASK_SECRET_KEY in .env to the generated value.
python app.py
```

Open [localhost:5000](http://localhost:5000). For Unix-like shells, activate with `source venv/bin/activate` and copy the template with `cp .env.example .env`.

[Setup guide](docs/SETUP.md) / [User manual](docs/USER_MANUAL.md) / [Assistant guide](docs/ASSISTANT.md)

## Optional AI packs

```powershell
python download_models.py               # Pre-fetch supported image / transcription assets
python download_models.py --voice       # Local studio voice pack
python download_models.py --voice-lite  # Compact local voice pack
python download_models.py --stems       # Optional neural separator
python download_models.py --stems-fine  # Fine separation pack
```

Voiceover uses local Kokoro ONNX packs or available system speech. Copilot reasoning uses an operator-configured OpenAI-compatible **loopback** service; the built-in intent planner can work without that service. Downloading packages and weights requires network access. Offline runtime requires the relevant assets to be available locally.

## Configuration and privacy

Copy `.env.example` to a private `.env`; never commit local credentials or endpoint details.

| Key | Purpose |
|---|---|
| `FLASK_SECRET_KEY` | Persistent cryptographic session secret; generate a random value |
| `FLASK_PORT`, `FLASK_DEBUG` | Local port and explicit development debugger setting |
| `APP_PRODUCT_NAME`, `APP_ASSISTANT_NAME` | Runtime display names |
| `MEDIA_QUALITY_TIER` | `auto`, `lite`, `balanced` or `max` quality ceiling |
| `LOCAL_REASONING_*` | Optional loopback endpoint, served model IDs and prompt/routing controls |
| `COPILOT_MEMORY` | Local persistent memory (`on` by default; `off` to disable) |
| `MEDIA_ACTIVITY_LOGGING` | Upload activity metadata collection; **off by default** |
| `DB_*` | Optional PostgreSQL target, used only when activity logging is enabled |

Media is processed on the **application host**. Accessing a server on another computer uploads files to that computer. Runtime media, projects, local memory, personal skills, model caches and logs are ignored by Git. Browser chat storage, downloads, backups and optional database logs require separate deletion.

The current app is designed for a **trusted single-user environment**. It has no built-in user accounts or per-user storage isolation. Background job state and resource locks are process-local. Read [deployment constraints](docs/SYSTEM_ARCHITECTURE_DETAILED.md#trust-boundaries-and-deployment-constraints) before considering shared hosting.

[Storage lifecycle](docs/STORAGE.md) / [Repository privacy and history cleanup](docs/REPOSITORY_PRIVACY.md) / [Security policy](SECURITY.md)

## Contributing and maintenance

Useful contribution areas include processor capabilities, reusable workflows, accessibility, synthetic regression checks, model-download reproducibility and measured resource/performance improvements. The [engineering guide](docs/ENGINEERING.md#what-contributors-can-improve-next) identifies concrete next steps.

```powershell
python scripts/update_architecture.py
python scripts/update_architecture.py --check
python scripts/check_repository_hygiene.py --history
```

The inventory generator reads source without starting the application. The hygiene checker flags prohibited tracked artifacts and recognizable secret formats without displaying matched values; `--history` adds all locally reachable Git blobs. These checks do not certify that every possible secret format or remote copy is clean.

Historical personal test files and media fixtures were removed. Do not use real recordings, images, transcripts or credentials in contributions. Use generated inputs in temporary directories. There is currently no maintained end-to-end regression suite; checks and limits of this review are recorded in [CODEBASE_REVIEW.md](docs/CODEBASE_REVIEW.md).

[Contribution guide](docs/CONTRIBUTING.md) / [Code of conduct](CODE_OF_CONDUCT.md) / [Third-party notices](THIRD_PARTY_NOTICES.md)

## License

The project source is licensed under [MIT](LICENSE). Dependencies, model weights and voice assets have their own terms; review [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the applicable upstream licenses before enabling or distributing optional packs.
