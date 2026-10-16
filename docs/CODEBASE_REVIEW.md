# Codebase review and maintenance findings

Reviewed: **17 October 2026**. Scope: first-party Python modules and routes, browser-controller interactions, configuration, model/resource orchestration, storage, repository artifacts and local Git history. The generated [source map](ARCHITECTURE_SOURCE_MAP.md) records inventory coverage. This was source review plus targeted runtime checks; it was not a complete media/model compatibility test or an independent penetration test.

## Outcome

The architecture documentation now follows actual handlers and execution code. It corrects nonexistent modules/endpoints, the old 43-tool claim, unsupported SSE descriptions, incorrect voiceover attribution and invented multi-model concurrency tiers. Six editable diagrams cover system context, components, copilot sequence, execution, resource governance and deployment/data boundaries.

The [engineering guide](ENGINEERING.md) explains distinctive mechanisms and tradeoffs with source references. The README connects these mechanisms to practical value without unsupported benchmark claims.

## Privacy issues fixed

### F01 - Model endpoint locality was not enforced

**Severity: Medium in the documented local-only trust model.** A nonlocal endpoint configured by an operator could receive chat/media context even though configuration promised loopback-only processing. This was a privacy-policy failure, not proof of remote attacker-controlled SSRF.

**Location:** `reasoning_models.py:82`, `normalize_base_url()` and the shared `open_local_request()` helper; `agent_memory.py`, `LocalServiceEmbedder.embed()`.

**Evidence before the fix:** the validator checked only HTTP/HTTPS and a hostname, then returned the configured URL. Discovery/completion and embedding calls used the default urllib opener.

**Fix:** accept loopback IP literals or `localhost`; reject embedded credentials, invalid ports, queries and fragments. Use one HTTP helper that rejects nonlocal redirects and disables environment proxy use. Embeddings use the same helper.

**Validation:** accepted IPv4/IPv6/localhost cases; rejected remote/private-network/lookalike hosts, non-HTTP URLs, credential URLs and malformed ports. A local HTTP server demonstrated rejection of a remote redirect and successful loopback access with an unusable HTTP proxy configured. No external service was contacted by these checks.

### F02 - Upload activity collected personal metadata by default

**Severity: Medium privacy exposure for local records.** Any normal upload path invoking the logger could persist filenames, client IP and user-agent metadata in CSV even when database logging was unconfigured. A reader of those logs could recover that metadata.

**Location:** `logger.py:38`, `log_upload_details()`; CSV fallback in `log_to_csv()`.

**Fix:** activity logging now returns before collecting metadata unless `MEDIA_ACTIVITY_LOGGING` is explicitly enabled. The public template documents CSV fallback and leaves the database name blank.

**Validation:** with logging disabled, a mocked sink received no call and no request object was accessed. With logging enabled and PostgreSQL unavailable, the CSV sink was called once. Synthetic metadata stayed in memory.

### F03 - Known example secret was accepted as a configured key

**Severity: Low for the current trusted-local deployment; hardening.** Copying `.env.example` unchanged supplied a public placeholder as the Flask secret. No session-forgery exploit was demonstrated because the current app does not establish an authenticated session boundary.

**Location:** `app.py:61`, secret initialization.

**Fix and validation:** recognize the template placeholder as unset and generate a cryptographic ephemeral key. Runtime smoke checks confirmed the configured placeholder was not used. Configure a persistent random key for stable session behavior.

### F04 - Earlier history cleanup missed two private artifact paths

**Severity: Medium privacy concern; original exposure not independently established.** `test.png` and `github_profile/README.md` were reachable from local refs after the prior cleanup. The review did not inspect or republish their contents.

**Fix:** removed both paths from local history in an isolated mirror, updated affected local refs while preserving tip trees and working changes, expired reflogs and pruned unreachable objects. Removed ignored profile directories from disk.

**Validation:** 418 reachable historical blobs scanned with zero prohibited-artifact or recognizable-secret findings; no unreachable objects reported by Git fsck. No remote push was performed. Provider caches, forks, remote-only refs and other clones remain outside this verification.

## Remaining findings and engineering priorities

| ID | Priority / severity | Evidence and consequence | Next action |
|---|---|---|---|
| R01 | High if exposed to untrusted users; deployment constraint locally | Media/project/memory/job routes have no built-in authenticated ownership boundary. A client able to reach the app can exercise shared workspace operations. `identity_guard.py` controls wording, not access. | Keep trusted/local; implement authentication, ownership and request-origin/CSRF protections before shared exposure. Verify any external access layer separately. |
| R02 | Medium for reachable untrusted upload clients | `routes/assistant.py:148`, `:186`: chunk requests have no aggregate upload-size or bounded chunk-count enforcement. `MAX_CONTENT_LENGTH` in `app.py:79` limits one request, not the assembled file. Repeated requests can consume disk beyond that limit. | Bound chunk count, assembled bytes and active upload sessions; enforce quotas during reception and assembly with race-safe accounting. |
| R03 | Engineering reliability | `app.py:672`, `_bg_job_worker()`: `_step_done()` is defined but not passed into the executor. Cancellation is checked only after execution returns. | Add executor progress hooks and connect the worker to cooperative cancellation; ensure supported subprocess/model operations have safe cancellation points. |
| R04 | Engineering reliability / resource pressure | `app.py`, `_bg_jobs`; `routes/assistant.py:488`, `agent_job_submit()`: each submission starts a daemon thread and completed entries have no retention policy. | Bound submission backlog and worker count; expire completed status records. Admission of processor work does not by itself bound HTTP submission threads. |
| R05 | Deployment architecture | Job dictionaries, scheduler state and model locks are process-local and jobs are not durable. | Use one app process. Externalize queue, state and reservations before multiprocess/shared deployment. |
| R06 | Functional consistency | Synchronous chat queues memory observations and computes follow-up inspection; the background worker does not share all of that postprocessing. | Centralize finalization so synchronous/background execution have intentional, tested parity. |
| R07 | Supply-chain reproducibility | `download_models.py` includes upstream mutable branch URLs and basic download/existence checks; optional packs do not share a uniform pin/checksum policy. | Pin revisions and hashes, download atomically, verify content and document each model license. No tampered model was found or tested. |
| R08 | Validation gap | Historical personal test files were deleted. Existing CI is primarily lint plus the added hygiene/inventory checks. | Add future regression coverage using generated, nonpersonal fixtures and temporary directories; prioritize dependency failure, upload quotas, cancellation and resource contention. |
| R09 | Operational privacy | Browser localStorage, externally configured memory/skill paths, optional PostgreSQL logs and downloads have separate lifecycles. | Document and implement deliberate data export/deletion controls; do not describe temporary media cleanup as total erasure. |

R01/R02 are source-level exposure findings whose practical severity depends on who can access the service. The default launcher binds to loopback. Remote/proxy deployment was not exercised. No claim is made that a public deployment is secure.

## Verification performed

- Parsed every first-party application, route and maintenance-script Python source with `ast.parse`.
- Flask test-client smoke checks: `/health`, `/`, `/studio`, `/audio`, `/video`, `/image`, `/agent` and `/api/agent/tools` returned 200; empty and invalid-type chat inputs returned 400.
- Confirmed 31 live registered copilot tools and rejection of the known Flask-secret placeholder.
- Exercised URL locality, redirect rejection, proxy bypass and activity logging opt-in/opt-out with synthetic in-memory inputs.
- Rendered all six Mermaid sources to SVG and parsed the exports as XML; checked for accidental local filesystem paths in the exports. Visually reviewed the component diagram.
- Checked generated architecture inventory freshness and local Markdown file links.
- Checked Git ignore behavior for local environment variants, media and private outputs; scanned tracked files and all locally reachable history with the bounded hygiene rules.
- Verified runtime media, projects, logs and memory directories contain no personal files (empty `.gitkeep` markers excluded).

The initial runtime environment lacked flake8. During publication preparation, flake8 was installed in an isolated temporary tools directory and the fatal checks passed after fixing a pre-existing undefined logger in the image-upscale fallback. Downloaded models and private runtime directories are excluded from lint. Optional neural inference, real-media rendering, stress/concurrency tests, external database behavior, credential revocation and remote-provider erasure were not executed. No new media test fixtures were added to the repository.

## Maintainable next steps

Run `python scripts/update_architecture.py` after changing modules, routes, tools, built-in skills, controllers or the public environment template. CI fails if the generated inventory is stale. Edit diagrams in `docs/diagrams/*.mmd`, render their SVGs and review their arrows against call sites.

Before publishing, review the diff, run repository-hygiene checks, verify licenses for enabled model packs and decide how to publish the locally rewritten history. The privacy check recognizes selected formats only; it cannot certify arbitrary credentials or personal text are absent.

## Unused Python cleanup

Traced all first-party Python files from the application, optional model installer and maintenance CLI entry points, including relative imports and constant lazy/dynamic imports. Removed `deepfilter_processor.py`: no application, route, launcher or installer referenced it, and the active DeepFilterNet path already exists in `ai_processor.py` under the managed model lifecycle. Other processor modules remain reachable, including optional restoration, matting and interpolation paths.

The source-map generator now checks reachability during maintenance and CI. Legitimate standalone tools must be registered as entry points. Computed plugin imports and external consumers still require human review; the check does not automatically delete files. There are no remaining unreachable first-party Python modules under the current entry points.

## Publication preparation

Before publication, fatal Python lint, Flask smoke checks, local documentation links, architecture freshness and repository-history hygiene checks passed. A synthetic failed neural-upscale check confirmed that the fixed logger allows the existing fallback path to run. Git ignore rules cover uppercase media extensions, local environment variants, credential files, runtime stores and model weights. Only the intended product assets, diagram SVGs and public environment template are excepted. `.gitattributes` standardizes source line endings while retaining Windows batch-file endings.

The initial review's statement that nothing had been pushed describes the state before the separately authorized publication step. Publishing rewritten history uses an explicit expected remote commit lease; remote cache/fork erasure remains outside Git push verification.
