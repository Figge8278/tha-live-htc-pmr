# V3 Foundation Cleanup Plan

**Baseline:** `snapshot/v2-current-stable` at commit `85109f95e1b8716d4a99aa98ec19dd7104af118b`

**Working branch:** `feature/v3-foundation-cleanup`

## V3.1 — Separate Intake / Field Prep context from HTC findings

### Problem confirmed
`buildIntakeFollowUpRows()` currently turns populated mapped Intake and Field Prep values into synthetic HTC rows. `App()` then appends those synthetic rows to the normal HTC sections. A Field Prep note can therefore create a large, artificial walkthrough workload and can affect HTC progress, PMR gating, and user attention.

### Required result
- Intake = homeowner-provided history, records, concerns, preferences, and questions.
- Field Prep = internal THA preparation / follow-up context.
- HTC = THA-observed walkthrough rows only.
- Intake or Field Prep text must never create a checklist row, condition, repair finding, PMR count, required HTC review item, PMCP selection, green/purple rail, or homeowner-facing repair output.
- Intake and Field Prep may later provide non-actionable context/evidence badges in PMCP Builder, but they do not populate HTC.

### Implementation boundaries
1. Keep `buildIntakeFollowUpRows()` or replace it with a context-only helper, but do not append its output to `sections`, `rooms`, `checklistItems`, or `rows`.
2. Keep normal static and dynamic room templates as the only HTC row source.
3. Remove the current PMR readiness dependency on synthetic Intake Follow-Up rows. Final PMR readiness remains driven by required project setup fields and actual HTC/PMR data.
4. Update the Intake workflow cue so context does not appear as an HTC warning or required review queue.
5. IntakeView may show a small internal-only summary such as “Context captured for walkthrough reference,” but must not send the user to a synthetic walkthrough section.
6. Preserve old saved-session data. Existing `answers` keyed as `intake-follow-up-*` may remain inert for backward compatibility; do not let them render or affect active outputs.
7. Do not change the existing visual layout of normal HTC rooms, Room Overview, PMCP Builder, or PMR beyond removing the artificial Intake Follow-Up workflow.

### Acceptance checks
- Entering Field Prep text in Electrical creates no additional HTC section or checklist row.
- Entering homeowner Intake text creates no additional HTC section or checklist row.
- HTC starts with the actual room templates only.
- HTC progress counts actual checklist rows only.
- PMR stays available as Draft PMR Preview before setup is complete and finalizes after client name, address, and walkthrough date are complete; it does not require synthetic Intake Follow-Up completion.
- Existing V2 behavior for normal room notes, Add to PMCP Builder, THA Action-Item, and rails remains unchanged.
- Old saved sessions open without errors and do not surface synthetic intake rows.

## V3.2 — Isolate Room Overview state

### Required result
Each room’s Room Overview must retain its own status, note, photos, PMCP placement, THA Action-Item state, and added room items. Exterior data must never appear in Kitchen or any other room.

### Acceptance checks
- Add a distinct note/photo in Exterior and Kitchen.
- Switch rooms repeatedly and reopen saved session.
- Each room shows only its own data.

## V3.3 — Template and category consistency audit

- Add plain Paint lines to Kitchen, Bedrooms, and Bathrooms where appropriate.
- Separate bathroom Tile / grout / sealant / finish condition from Plumbing / supply / drain / fixture operation.
- Place mechanical exhaust fan under HVAC / ventilation.
- Audit trade-domain icons separately from default service level.
- Preserve `Roofing / gutters` exactly as the suggested resource for gutter/downspout care.

## V3.4 — Scope, escalation, and report refinement

- Add structured, non-diagnostic escalation language.
- Keep routine handyman work distinct from licensed/specialist referrals.
- Keep baseline care, supported home-specific care, selected PMCP, repair findings, and THA Action-Items separate in PMR.
- Use the actual app icon set before producing a final printable visual key.
