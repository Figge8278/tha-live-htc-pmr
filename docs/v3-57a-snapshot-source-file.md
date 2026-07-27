# V3.57A — THA Snapshot Source File

This revision establishes the first V3.57 source-of-truth boundary without changing PMR rendering or Drive package generation yet.

## Canonical source file

The app reload file is now named:

`Restore This THA Snapshot.json`

It uses a versioned envelope:

- `fileType: tha-snapshot`
- `schemaVersion: 1`
- `appVersion: 3.57`
- stable Snapshot metadata
- source data grouped into `client`, `intake`, `htc`, and `pass`

Generated PMR rows, PMR counts, report HTML/PDF, Drive tokens, and interface expansion state are not source-of-truth fields.

## Compatibility

The restore path accepts:

- the new V3.57 THA Snapshot file
- V3.56 Drive/full-walkthrough JSON exports
- older saved-session wrappers containing `data.client`

Legacy files are normalized into the V3.57 Snapshot contract before loading.

## Interface change

The old V3.38 restore helper is removed from `index.html` and replaced with the source module under `src/snapshot/`.

The new panel makes the rule explicit:

> THA Snapshot data creates the PMR. The PMR does not recreate THA Snapshot.

## Deliberately deferred

This revision does not yet:

- replace Drive package export interception
- rebuild the PMR React view
- change Room-by-Room / Trade-by-Trade rendering
- remove the remaining report and Drive helper stack

Those changes should follow only after the new Snapshot download/restore path is preview-tested against the V3.56 plateau.
