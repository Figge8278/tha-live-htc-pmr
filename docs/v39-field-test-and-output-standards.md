# V3.9 Field Test & Output Standards

This document captures the current THA HTC / PMR app direction so future edits do not lose the working logic agreed during field-testing conversations.

## Current stable working branch

- Branch: `feature/v3-4-consolidate-field-test-layers`
- PR: #71, draft, not merged
- Do not merge to production/main without explicit approval.

## Workflow order

The app workflow should follow the real THA process:

1. Walkthrough Setup
2. Work Session
3. Homeowner Intake
4. Business Records & Drive

The product/reporting sequence remains:

1. Intake
2. HTC
3. PASS / PMCP Builder
4. PMR
5. Metrics

The PMR is the culmination of Intake + HTC + PASS/PMCP. It should not feel like raw app data dumped into a packet.

## Client-facing PMR output order

The homeowner-facing PMR should be organized by the house, not by the app's internal capture sections.

Recommended PMR order:

1. Cover / visit summary
2. Home Reference Snapshot
3. Stoplight Summary
4. Exterior / outside findings
5. Interior findings
6. Room-by-room action list
7. Trade-by-trade action list
8. Preventive Maintenance Care Plan
9. Scope / visibility note

### Home Reference Snapshot

Client-facing top snapshot should stay high-utility and practical. Include:

- Electrical panel / breaker panel location
- Main water shutoff location
- Gas shutoff location if known/applicable
- Fire extinguisher locations
- Smoke / CO detector notes
- Furnace filter location / size if known
- Irrigation shutoff / controller location

Do **not** crowd this section with sewer cleanout location by default. Sewer cleanout can stay internal unless tied to a specific sewer/drainage issue, recent scope, access problem, or homeowner-requested context.

## Client-facing vs internal information

The app needs a clear visibility model:

- Client PMR: polished homeowner-facing report language
- Internal THA: raw intake context, THA tasking, vendor coordination, reminder dates, Airtable follow-up triggers
- Both: information intentionally promoted after review

Working rule:

> Intake informs the walkthrough. HTC confirms the finding. PMR reports the confirmed finding.

Homeowner goals and raw intake context should not automatically appear in the client-facing PMR. They should stay internal unless confirmed and promoted into a finding or useful home reference item.

## PASS / PMCP standard

PASS is the THA service pathway. PMCP is the actual Preventive Maintenance Care Plan.

The PASS page should function as a PMCP builder/checklist, not as a PMR download/print page. PMR preview, print, and download belong on the PMR page or Drive output flow.

The PMCP section belongs lower in the PMR, after exterior/interior findings and action-list views.

Client-facing PMCP should show:

- Care item
- Recommended cadence
- Last completed date or baseline status
- Next suggested service window
- Resource / trade

Internal THA/Airtable should hold:

- THA follow-up date
- Automation/email template
- Client response status
- Calendar/task trigger
- Internal notes

Example:

Client-facing:

- Furnace / A/C service
- Last serviced: May 2026
- Recommended cadence: Annual
- Next suggested service window: May 2027

Internal:

- THA follow-up date: April 2027
- Email template: HVAC annual service reminder
- Client status: pending / confirmed / deferred / declined

## PMR finding card standard

Labels and answers must be visually distinct.

Labels should be smaller, uppercase, bold, and muted/gold/navy. Answers should be larger, darker, and plain English.

Standard finding fields:

- Location
- Area / line item
- Source: HTC Checklist Item, Room Overview, or Intake Follow-Up
- Observation
- Why it matters
- Who handles it
- Suggested timing
- Recommended next step
- Photos / evidence

Room overview notes should not become their own PMR section. They should attach back to the room where they came from, with a small source label.

## Photo placement standard

Photos must help the report, not clutter it.

Use two lanes:

1. Room Overview Photos
   - broad room context
   - layout
   - general condition
   - where an issue sits in the room

2. Finding Detail Photos
   - specific PMR evidence
   - close-up/detail photos
   - tied directly to a checklist item or finding

Client-facing PMR should place finding photos under the related finding card as Photos / Evidence. Room overview photos may appear as context or in a photo summary, but should not pretend to be a specific finding.

## Drive output standard

Drive package should support two-way work:

1. Field device saves package to Drive.
2. Another device can restore from the Drive backup JSON.
3. The restored session auto-populates as a saved work session.
4. THA can continue editing.
5. A new updated Drive package is uploaded with a newer date/package folder.
6. Reviewed final files can later move from incoming/staging into the real client folder.

Drive package intent:

- `01 - Homeowner PMR — Client Facing`: polished report first
- PDF print copy: print-friendly backup, not the main editable source
- Secondary Editable Copies: intake/HTC/photo index support records
- Backup Data: recovery JSON for restore and cross-device continuation
- Photos: evidence files with readable names and links

Raw HTML should not look like gobbledygook to the user. The homeowner-facing Drive report should open as a readable document first.

## Field test checklist

When testing the current build, use a tiny sample:

- one room overview photo
- one checklist/finding photo
- one PMR finding
- one PMCP selected item
- one Drive save
- one restore from backup JSON on a different device/browser if possible

Check:

- PMR client-facing report opens cleanly in Drive
- Finding photo appears under the correct finding
- Room overview photo stays contextual
- PMCP does not crowd the top of the PMR
- Home Reference Snapshot does not include sewer cleanout by default
- Restore adds the walkthrough to saved sessions and opens cleanly

## Next safe work items

These can continue without waiting on field photo feedback:

1. Improve the internal THA Office Copy / Airtable-ready output model.
2. Tighten report wording and PMR finding-card hierarchy.
3. Continue separating client-facing PMR from internal THA records.
4. Strengthen restore language and cross-device workflow.
5. Prepare future Airtable fields for reminders, follow-up dates, and email templates.

## Notes

The app should stay practical for field use. Avoid adding new noisy panels, diagnostics, or duplicate visible controls. Advanced troubleshooting belongs under Advanced, not in the main field workflow.
