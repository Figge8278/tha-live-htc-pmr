# V3.56 Plateau — THA Snapshot / PMR Delivery Cleanup

This branch is a marker before starting the next architecture pass.

## Plateau branch

`snapshot/v3-56-drive-report-cleanup-plateau`

## App/product concept at this point

The working product is shifting from an HTC/PMR-only tool into **THA Snapshot**:

- **THA Snapshot** is the whole working app/process.
- **Intake** captures homeowner context and important home references.
- **HTC** captures the field walkthrough, room-by-room line items, findings, and photos.
- **PASS / PMCP** captures routine continued-care planning.
- **PMR** is one client-facing output generated from Snapshot data.
- **Drive** stores client deliverables, working files, photos, and restore data.
- **Airtable** is intended to become the ongoing CRM/project/reminder layer later.

## Current PMR direction

- Room-by-Room is the primary homeowner report view.
- Trade-by-Trade is a secondary sorting view, useful for resource/trade handoff.
- PMCP / PASS remains separate from repair findings and PMR counts.
- Photos should follow the specific finding they were attached to.
- Room overview photos remain room-context photos and should not automatically attach to every finding in the room.
- Important Need-to-Know Home References appear near the top of the PMR.
- Client PMR output should be binder-friendly and printable.

## Current Drive package direction

Preferred future structure:

```text
Client / Walkthrough Package
  01 - Client PMR Report
    01 - Client PMR — Interactive Report.html
    02 - Client PMR — Printable Binder Copy.pdf

  02 - THA Snapshot Working Files
    Restore This THA Snapshot.json
    Intake Summary
    HTC Checklist
    Photo Index
    Photos / evidence files
    Internal working outputs, where applicable

  99 - Backup & Emergency Restore
    Emergency restore JSON and backup-only copies
```

Important rule:

> THA Snapshot data creates the PMR. The PMR should not be the source file that recreates THA Snapshot.

The true reload/restore layer should be a structured JSON working file, likely named:

`Restore This THA Snapshot.json`

or

`THA Snapshot Working File.json`

## What is still not done

This plateau still contains runtime helper layers. The recent V3.47–V3.56 improvements are useful for field testing, but they are not yet a clean source-level architecture.

The next pass should consolidate the logic into source-level React/CSS and Drive export functions instead of continuing to stack helper scripts.

## Recommended next stage

`V3.57 — Snapshot Source-of-Truth Cleanup`

Primary goals:

1. Establish THA Snapshot as the product/app model.
2. Make one structured Snapshot JSON file the restore/source-of-truth file.
3. Clean Drive output rules and folder naming.
4. Keep client PMR, internal files, photos, and backup/restore logically separated.
5. Prepare Airtable-ready data layers without making Airtable the PMR source.
6. Begin moving helper-layer behavior into `src/main.jsx`, `src/style.css`, and native Drive export logic.

## Caution

Do not merge or ship deeper architecture changes without checking the latest preview against the existing V3.56 plateau behavior first.
