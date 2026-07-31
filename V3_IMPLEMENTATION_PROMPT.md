# Codex Implementation Prompt — V3.1 Intake / Field Prep Boundary

Work only on branch `feature/v3-foundation-cleanup`. Do not merge, deploy production, push to `main`, switch branches, delete files, or open a PR.

## Baseline
- V2 snapshot branch: `snapshot/v2-current-stable`
- V3 foundation plan: `V3_FOUNDATION_CLEANUP_PLAN.md`
- Main source file: `src/main.jsx`
- Preserve current native React interface and legacy scripts. Do not introduce MutationObserver or DOM overlay workarounds.

## Confirmed defect
`buildIntakeFollowUpRows()` converts populated Intake / Field Prep values into synthetic rows. `App()` currently appends those rows to `sections`, which means one Internal Field Prep note can create artificial HTC work, affect HTC progress, gate PMR output, and look like an observation/finding.

## Required implementation
1. Keep normal static and dynamic room templates as the sole source of HTC `sections`, `rooms`, `checklistItems`, and `rows`.
2. Do not append `intakeFollowUpRows` to HTC sections.
3. Intake and Field Prep data must remain available as internal context, but must not become:
   - HTC checklist rows
   - a walkthrough section
   - a condition status
   - PMR counts/findings
   - a PMCP selection
   - green/purple rails
   - a homeowner-facing repair output
4. Replace any workflow cue that treats intake context as an HTC warning or required review queue. The cue can say context is captured, but it must not route the user into a generated HTC review section.
5. Remove PMR finalization gating that depends on generated Intake Follow-Up rows. Preserve the existing requirement for Client Name, Project Address, and Walkthrough Date / Visit Label before final output. Keep the existing Draft PMR Preview behavior before those fields are complete.
6. Preserve old saved-session compatibility. Existing `answers` keys beginning with `intake-follow-up-` may remain inert. Do not destroy old data; simply do not render or count it.
7. Keep Intake homeowner-facing and Field Prep internal. Do not redesign the layout in this task.

## Specific code areas to inspect
- `buildIntakeFollowUpRows()`
- `isIntakeFollowUp()`
- `includePMRRow()`
- `App()` declarations of `intakeFollowUpRows`, `sections`, `rows`, `intakeReviewRows`, `unreviewedIntakeRows`, `readyForHTC`, `pmrNeedsReview`, `homeownerOutputReady`, and `workflowCues`
- `IntakeView` props / callback currently named `onReviewIntakeFollowUp`
- The HTC navigation and item card rendering branches that conditionally display `isIntakeFollowUp`

## Acceptance checks
- Add a note in Field Prep > Electrical: no new HTC row or section appears.
- Add a homeowner Intake note: no new HTC row or section appears.
- Actual HTC rooms and their standard templates still display normally.
- HTC progress counts only true walkthrough rows.
- Room overview and detailed HTC rails retain their current behavior.
- Add to PMCP Builder and THA Action-Item retain their current behavior.
- PMR preview and finalization do not depend on synthetic intake-review rows.
- Existing saved sessions open without errors.

## Verification required before committing
- Run `npm run build`.
- Run `git diff --check`.
- Report files changed, exact behavior changed, and any known untested browser behavior.
- Commit only the intentional source/style/test changes. Do not stage `package-lock.json` metadata churn or an empty untracked `README.md`.
