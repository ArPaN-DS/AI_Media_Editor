# Repository privacy and publication

## Keep source separate from private state

Version source, public documentation, built-in skills, product branding and diagram sources/exports. Keep `.env`, uploaded/processed media, project saves, transcripts, memory databases, personal skills, logs and downloaded weights private. `.gitignore` reduces accidental additions; it does not prevent `git add -f`, remove already tracked files or erase history.

```powershell
python scripts/check_repository_hygiene.py
python scripts/check_repository_hygiene.py --history
```

The checker reads tracked working files and, with `--history`, blobs reachable from all local refs. It rejects prohibited artifact paths and recognizes selected private-key, token and credential-URL patterns. It prints rule names and file/object identifiers, never matched values. It is a bounded heuristic scan, not proof that no credentials, personal text, EXIF data or proprietary material exist. It does not inspect ignored `.env` values or contact any account provider.

Architecture checks and hygiene checks run in CI. Public pull requests can bring private data into the hosting provider before CI rejects it, so inspect the staged diff before pushing. The repository excludes historical personal test scripts and fixtures; use generated, nonpersonal inputs for validation.

## Environment management

`.env.example` is the public template. `.env` and `.env.*` local variants are ignored, with only `.env.example` excepted. Credentials belong in private process environment or local configuration, never browser JavaScript, screenshots, issue bodies, project exports or example files.

Use a cryptographic Flask session key generated with `python -c "import secrets; print(secrets.token_hex(32))"`. The application rejects the known template placeholder and generates an ephemeral key when configuration is missing or uses a recognized placeholder. A stable configured key is needed for stable sessions across restarts.

The optional reasoning and embedding service must use loopback. The HTTP helper rejects remote endpoints, remote redirects and credentials in URLs, and bypasses environment proxies. Installing dependencies and acquiring model weights remain network operations. Optional PostgreSQL logging can target a configured external database.

Upload activity collection is **off by default**. Setting `MEDIA_ACTIVITY_LOGGING=on` enables collection of filenames, IP addresses and user agents, using PostgreSQL when configured or local CSV as fallback. Blank database credentials alone do not disable an enabled logger's CSV fallback. Conversation memory is separate: `COPILOT_MEMORY=off` disables it.

## Local cleanup is not global erasure

Server runtime files can be recreated by running the application. Stop the application before deleting its private data. Review paths and their contents, including configured external memory/skill directories, before deletion. Keep model weights if you want offline inference without downloading them again.

Server cleanup does not delete browser localStorage, downloaded files, operating-system backups, external PostgreSQL records, cloud-synced copies or other clones. Saved projects may contain embedded image layers, and memory can contain chat text even when original media is gone. Age-based temporary cleanup intentionally preserves saved-project references; it is not a privacy reset.

## History cleanup status for this review

The 17 October 2026 review found two prohibited artifacts still reachable in local history after the earlier cleanup: `test.png` and a profile README. Both paths were removed using an isolated mirror and `git-filter-repo`. Rewritten commit objects were imported, affected local refs were updated, reflogs expired and unreachable objects pruned. Ref-tip trees, the index and working changes were preserved. The ignored personal profile directories were removed from disk.

The subsequent local scan checked **418 reachable historical blobs with zero findings under the implemented rules**, and `git fsck --no-reflogs --unreachable` reported no unreachable objects. These counts describe this review snapshot, before future commits add objects. No remote push, provider-cache purge or credential-provider rotation was performed.

## If private information reached a remote

1. Revoke and replace an exposed credential at its issuer. Removing a file or changing a URL does not revoke an API key. A history rewrite does not invalidate an issued credential.
2. Remove the sensitive path/content from every affected branch and tag, including other remotes and copies under your control. Rescan the resulting history.
3. Review the local changes, commit the intended public source and documentation, then publish rewritten history with an explicit lease matching the remote commit you reviewed. A blind force push can overwrite another contributor's work.
4. Coordinate fresh clones or cleanup with collaborators. Follow the hosting provider's sensitive-data-removal process for cached views, pull-request refs and retained objects when applicable.
5. Check issue attachments, CI logs/artifacts, releases, forks, browser downloads and backups separately.

The current cleanup changed local commit identifiers. A normal push may be rejected until the remote history is deliberately replaced. This review did not publish the working-tree changes or assert that GitHub has erased existing copies.
