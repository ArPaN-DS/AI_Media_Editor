# Local projects and temporary media

Saving a Pro Studio project creates a local `.aviproject` file in the app's
`projects` folder and downloads a copy. The project stores the edit state and
references to its media; it does not embed the original media files.
Generated image layers are embedded as PNG data in the project so their raster
content survives reloads. Imported media still uses local file references.

Keep the app's `projects`, `uploads`, and `processed` folders together when
backing up or moving a project. A downloaded project file alone is not a
complete media backup.

The app checks temporary storage at most once every five minutes when opening
the landing hub, Copilot, or Pro Studio. Unreferenced uploads, rendered stems,
and thumbnails become eligible for removal after one hour. Recent files remain
available. Media and thumbnails referenced by saved projects remain available
regardless of age. The cleanup is limited to temporary media storage; it is not a privacy reset for
projects, memory, personal skills, activity logs or browser storage.

Project saves replace the previous file only after the new state has been
written successfully. Cleanup and saves coordinate so cleanup cannot inspect a
partially written project. If a saved project cannot be read, cleanup defers
deletion to protect media that the project might reference.

For a complete data inventory and deletion boundaries, see [repository privacy](REPOSITORY_PRIVACY.md) and [system architecture](SYSTEM_ARCHITECTURE_OVERVIEW.md).
