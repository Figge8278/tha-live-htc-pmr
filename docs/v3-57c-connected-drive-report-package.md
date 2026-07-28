# V3.57C — Connected Drive and Client Report Package

This revision moves the Drive package and generated client PMR/PMCP onto the connected THA Snapshot source model.

## Source contract

The Snapshot schema is now version 3 (`appVersion: 3.57.2`).

Each finding preserves both:

- editable field values (`fields`)
- stable report context (`context`) such as room, checklist title, trade default, rationale, recommended action, timing, and intake-follow-up status

Continued-care records preserve PMCP decisions, timing, resource, reason, source evidence, and workflow relationships. Photos remain linked by stable media IDs and owner IDs.

Schema 1, Schema 2, and V3.56 legacy walkthrough exports remain migratable.

## Drive package

The active Drive export bridge replaces the V3.56 package/report helper and routes the existing native upload transaction into:

```text
01 - Client PMR Report/
  01 - Client PMR — Interactive Report.html
  02 - Client PMR — Printable Binder Copy.pdf

02 - THA Snapshot Working Files/
  Restore This THA Snapshot.json
  Intake Summary
  HTC Checklist
  Photo Index
  Photos/
    01 - Room Overview/
    02 - Finding Evidence/
    03 - Client Submitted/
    04 - Internal THA Reference/

99 - Backup & Emergency Restore/
  Emergency Restore — <timestamp>.json
```

The existing V3.56 emergency PMR HTML compatibility copy may remain in the backup folder during this transition. The canonical restore file is the timestamped Schema 3 JSON.

## Export sequence

1. Existing photo uploads are routed into explicit room-overview or finding-evidence folders.
2. Successful Drive photo IDs and links are added to the legacy payload before canonicalization.
3. The full legacy payload is converted into one Schema 3 THA Snapshot.
4. The same Snapshot JSON is uploaded as the working restore file and timestamped emergency restore file.
5. One pure report model is built from that Snapshot.
6. Interactive HTML and printable PDF are rendered from the same report model.
7. PMCP selected care remains separate from PMR finding counts.

## Client privacy

The report model reads only client-visible findings, client-visible photos, and selected PMCP care. Workflow actions and administrative/internal notes stay in the Snapshot source file and are not rendered in the client PMR.

## Current transition boundary

This revision replaces the Drive report-generation helper with a source-driven module. The in-app React PMR view still uses the existing UI implementation until the next native React integration pass. Drive-delivered HTML/PDF and restore JSON now share the connected Snapshot source.
