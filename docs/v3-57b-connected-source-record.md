# V3.57B — Connected Snapshot Source Record

## Purpose

V3.57B strengthens `Restore This THA Snapshot.json` from a reload envelope into the connected working record for THA Snapshot.

The operating rule remains:

> THA Snapshot creates the PMR and PMCP. Client reports do not recreate the working Snapshot.

This revision does not replace the visible PMR renderer or Drive package yet. It establishes the source relationships those later outputs must consume.

## Schema

- File type: `tha-snapshot`
- Schema version: `2`
- App version: `3.57.1`
- File name: `Restore This THA Snapshot.json`

Schema 2 accepts and migrates:

- Schema 1 V3.57 Snapshot files
- V3.56 walkthrough/Drive JSON
- legacy row-based exports

## Permanent source areas

| Area | Purpose |
| --- | --- |
| `client` and `property` | Homeowner, property, and visit identity |
| `intake` | Homeowner-reported context, kept distinct from THA-observed findings |
| `rooms` | Dynamic room definitions and room-level capture |
| `htc.findings` | Stable finding records keyed back to the app template item ID |
| `continuedCare.items` | PMCP decisions and HTC continued-care candidates |
| `workflow.actions` | Internal follow-up actions linked back to their exact source record |
| `administration` | Lifecycle, report, delivery, and future external-system references |
| `media.assets` | Photos with explicit owner type, owner ID, room ID, scope, and visibility |
| `reporting` | Deterministic PMR/PMCP inclusion indexes and privacy rules |
| `connections` | Compact cross-system record index for app/report/workflow use |

## Connectivity rules

### PMR

- The PMR reads from `data.htc.findings`.
- Every finding receives `reporting.pmrDecision` of `included`, `excluded`, or `review`.
- Intake follow-up prompts are excluded until field review creates a confirmed finding.
- Internal workflow notes remain outside client reporting.

### PMCP

- The PMCP reads from `data.continuedCare.items`.
- PMCP selection stays separate from PMR defect counts.
- HTC findings can point to a continued-care candidate without becoming a duplicate repair finding.
- PASS review decisions are preserved through export and restore.

### Workflow

- Existing `thaActionItem`, `thaActionType`, `followUpStatus`, and `internalNote` fields create workflow projections.
- Every workflow action identifies its source entity and the exact fields that remain authoritative.
- The projection is an index, not a competing copy of the finding or care record.
- Native future administrative actions can be added without requiring them to appear in the PMR.

### Photos

- Photos are removed from anonymous nested arrays and indexed as media assets.
- Each asset identifies one scope:
  - `finding-evidence`
  - `room-overview`
  - future `client-submitted`
  - future `internal-reference`
- Each finding and room stores explicit photo IDs.
- Export/restore reattaches photos to their original app records.

### Administration and privacy

- Administrative status and external references have a permanent home in the Snapshot source.
- Internal notes and workflow areas are explicitly identified as internal-only.
- Client visibility is a record-level decision, not an assumption made by the HTML/PDF renderer.
- Sidecar preservation protects future administrative extensions while the current React state is still being migrated to the new native structure.

## Ease-of-use changes

The source-file panel now shows a compact connection summary:

- recorded findings
- PMR candidates
- PMCP selected or ready for review
- workflow actions
- photos

An expandable explanation shows how each area connects without requiring the user to read JSON.

## Validation completed

Local Node tests cover:

1. Current app state to schema 2 Snapshot
2. Finding and room photo extraction
3. Workflow projection creation
4. PMR and PMCP indexes
5. Snapshot restore to current app state
6. Export → restore → export preservation
7. Schema 1 migration
8. V3.56 row-based migration

## Remaining work after preview validation

1. Replace the Drive backup payload with this Snapshot schema.
2. Build the PMR report model directly from schema 2 records.
3. Build PMCP output directly from `continuedCare.items`.
4. Move workflow/admin editing into native React state and retire the temporary sidecar bridge.
5. Retire report/Drive helper scripts only after parity checks pass.
