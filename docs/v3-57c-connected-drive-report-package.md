# V3.57C — Connected Drive and Client Report Package

This revision moves the Drive package and generated client PMR/PMCP onto the connected THA Snapshot source model.

## Source contract

The Snapshot schema is version 3 (`appVersion: 3.57.2`).

Each finding preserves both editable field values and stable report context. Continued-care records preserve PMCP decisions, timing, resource, reason, source evidence, and workflow relationships. Photos remain linked by stable media and owner IDs.

Schema 1, Schema 2, and V3.56 legacy walkthrough exports remain migratable.

## Drive package

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

## Export sequence

1. Existing photo uploads are routed into explicit room-overview or finding-evidence folders.
2. Successful Drive photo IDs and links are added before canonicalization.
3. The full walkthrough becomes one Schema 3 THA Snapshot.
4. The same Snapshot is uploaded as the working restore file and timestamped emergency restore file.
5. One report model builds both the interactive HTML and printable PDF.
6. PMCP selected care remains separate from PMR finding counts.

## Client privacy

The report model reads only client-visible findings, client-visible photos, and selected PMCP care. Workflow actions and administrative/internal notes stay in the Snapshot source and are not rendered in the client PMR.

## Tablet round-trip validation

The automatic demo launcher was removed after it proved unreliable on tablet refresh. The preview now provides an explicit **Download Demo Snapshot JSON** control beside **Restore Snapshot JSON**.

The file served at `/demo/THA-Snapshot-Demo-PMR-PMCP.json` is a prepared Schema 3 source record with:

- four PMR findings
- two selected PMCP items
- one pending continued-care candidate
- room capture and intake context
- internal workflow actions and notes

The validation sequence is download → restore → edit → add a photo → download PMR/Snapshot → start blank → restore the new Snapshot again.

The prepared file intentionally contains no embedded photos. A field photo is added after restore so the second export proves newly captured media stays attached through the round trip.

## Current transition boundary

Drive-delivered HTML/PDF and restore JSON now share the connected Snapshot source. The in-app React PMR view still uses the existing interface implementation until the next native React integration pass.
