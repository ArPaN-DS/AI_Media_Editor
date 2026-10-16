# Deployment constraints

The current application is a trusted, single-user media workspace. Its default `python app.py` launcher binds to loopback. It has no built-in user accounts, per-user file/project ownership or comprehensive CSRF boundary. A public reverse proxy alone does not add those controls.

## Supported operational shape

Use one application process on a host controlled by the user. Background-job dictionaries, scheduler admission and managed-model locks are process-local. Multiple independent WSGI processes can lose track of each other's jobs and admit work without a common memory budget. Jobs are not durable across restarts.

For a longer-running setup, use an appropriate WSGI server with a single application process and adequate request concurrency; keep it behind a trusted access boundary. Disable the development debugger and automatic reloader outside local development. Choose capacity based on the actual media, optional models and available CPU/RAM/VRAM rather than the old minimal web-server estimates.

## Before allowing other clients

Implement or establish authenticated access and deliberate per-user storage ownership. Validate request-origin/CSRF behavior, upload and download access, quotas and job cancellation under the intended topology. Enforce aggregate upload limits: the current 500 MiB per-request limit does not cap a multi-request chunk upload. See the [review](CODEBASE_REVIEW.md) for current blockers.

A shared deployment needs durable jobs, bounded worker/submission queues, shared state, coordinated resource reservations, cleanup policies and backups. These are future changes, not features supplied by the existing in-memory scheduler.

## Configuration and data

Use a private `.env` or process environment, a random persistent `FLASK_SECRET_KEY`, and `FLASK_DEBUG=false`. Reasoning/embedding services must be loopback. Model-service memory is independent of the application's managed model mutex.

Keep `MEDIA_ACTIVITY_LOGGING=off` unless activity records are required. Enabling it collects filenames and client metadata; PostgreSQL failure falls back to local CSV. Protect persistent memory, personal workflows, media, projects and browser state separately. Follow [repository privacy](REPOSITORY_PRIVACY.md) and [storage lifecycle](STORAGE.md).

Optional model acquisition may require internet access. Verify cached assets and their licenses before offline deployment or redistribution. Dependency/model installation, public internet hosting and multiprocess deployment were not validated by the current review.
