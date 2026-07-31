from pathlib import Path
import re

# Compact, centered HTC category separators. Checklist cards keep their own
# icon, title, and orange/blue status rail.
style_path = Path('src/style.css')
style = style_path.read_text()
old_htc = """.htcCategoryHeader{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:18px 0 8px;padding:10px 13px;border:1px solid #d8e4e8;border-left:6px solid var(--gold);border-radius:15px;background:#f4f8fa;color:var(--navy);box-shadow:0 5px 14px rgba(11,54,88,.05)}
.htcCategoryTitle{display:flex;align-items:center;gap:9px;min-width:0}
.htcCategoryTitle h2{margin:0;font-size:17px;line-height:1.2;color:var(--navy)}
.htcCategoryHeader>span{color:var(--muted);font-size:11px;font-weight:900;white-space:nowrap}
.htcCategoryHeader+.checklistItemCard{margin-top:0!important}
@media(max-width:900px){.htcPage{padding:0 12px}.htcGrid{padding-top:14px}.htcTitleBar{align-items:flex-start}.htcCategoryHeader{align-items:flex-start;flex-direction:column}.htcCategoryHeader>span{white-space:normal}}"""
new_htc = """.htcCategoryHeader{display:flex;align-items:center;justify-content:center;gap:7px;width:max-content;max-width:calc(100% - 20px);margin:15px auto 5px;padding:5px 10px;border:1px solid #cfdce2;border-radius:999px;background:#edf3f6;color:var(--navy);box-shadow:none;text-align:center}
.htcCategoryTitle{display:flex;align-items:center;justify-content:center;gap:6px;min-width:0}
.htcCategoryTitle .passCategoryIcon{width:24px!important;height:24px!important;min-width:24px!important;border-radius:8px!important}
.htcCategoryTitle .passCategoryIcon svg{width:13px!important;height:13px!important}
.htcCategoryTitle h2{margin:0;font-size:12px;line-height:1.15;color:var(--navy);letter-spacing:.01em}
.htcCategoryHeader>span{color:var(--muted);font-size:9px;font-weight:900;white-space:nowrap;padding-left:7px;border-left:1px solid #cbd8de}
.htcCategoryHeader+.checklistItemCard{margin-top:0!important}
@media(max-width:900px){.htcPage{padding:0 12px}.htcGrid{padding-top:14px}.htcTitleBar{align-items:flex-start}.htcCategoryHeader{max-width:calc(100% - 8px);flex-wrap:wrap}.htcCategoryHeader>span{white-space:normal}}"""
assert old_htc in style, 'Expected HTC category CSS block was not found'
style_path.write_text(style.replace(old_htc, new_htc, 1))

# Only unresolved must-answer references receive an orange alert while their
# section is collapsed. Sections without required references receive no badge.
intake_path = Path('public/tha-quick-intake-accordion.js')
intake = intake_path.read_text()
old_badge_css = """      .tha-prep-completion{margin-left:auto;border-radius:999px;padding:5px 8px;font-size:11px;font-weight:900;white-space:nowrap}
      .tha-prep-completion.needsContext{background:#fff1e5;color:#a75113;border:1px solid #f0c79e}
      .tha-prep-completion.contextComplete{background:#eaf7e9;color:#2f6a2b;border:1px solid #b8dfb4}"""
new_badge_css = """      .tha-prep-completion{display:none;margin-left:auto;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:950;white-space:nowrap}
      .cleanFieldPrep .intakeSubsection.cleanCollapsed .tha-prep-completion.needsRequired{display:inline-flex;align-items:center;background:#fff1dc;color:#8a4812;border:1px solid #d06b19;box-shadow:0 0 0 2px rgba(208,107,25,.1)}
      .tha-field-prep-required-alert{display:none;margin-left:auto;border-radius:999px;padding:5px 8px;background:#fff1dc;color:#8a4812;border:1px solid #d06b19;font-size:10px;font-weight:950;white-space:nowrap;box-shadow:0 0 0 2px rgba(208,107,25,.1)}
      .cleanFieldPrep:not([open])>summary .tha-field-prep-required-alert{display:inline-flex;align-items:center}"""
assert old_badge_css in intake, 'Expected field-prep badge CSS was not found'
intake = intake.replace(old_badge_css, new_badge_css, 1)

match = re.search(r"  function countContextFields\(section\) \{.*?\n  function addFieldPrepControls\(lane\) \{", intake, re.S)
assert match, 'Expected field-prep completion functions were not found'
new_functions = r"""  function requiredReferenceFields(root) {
    const labels = Array.from(root.querySelectorAll('label.thaRequiredField,label.thaV3587MustAnswer,label.thaV3584MustAnswer'));
    const seen = new Set();
    return labels.map(label => label.querySelector('input,textarea,select')).filter(field => {
      if (!field || seen.has(field)) return false;
      seen.add(field);
      return true;
    });
  }

  function unansweredRequiredFields(root) {
    return requiredReferenceFields(root).filter(field => !String(field.value || '').trim());
  }

  function refreshFieldPrepLaneAlert(lane) {
    const summary = lane?.querySelector(':scope > summary');
    if (!summary) return;
    const missing = unansweredRequiredFields(lane);
    let badge = summary.querySelector(':scope > .tha-field-prep-required-alert');
    if (!missing.length) {
      badge?.remove();
      return;
    }
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'tha-field-prep-required-alert';
      summary.append(badge);
    }
    badge.textContent = `Must answer · ${missing.length} remaining`;
    badge.title = 'Required home-reference answers remain unresolved inside THA Internal Intake / Field Prep.';
  }

  function refreshFieldPrepCompletion(section) {
    const heading = section.querySelector(':scope > h3');
    const toggle = heading?.querySelector('.tha-clean-prep-toggle');
    if (!heading || !toggle) return;
    const required = requiredReferenceFields(section);
    const missing = required.filter(field => !String(field.value || '').trim());
    let badge = heading.querySelector('.tha-prep-completion');
    if (!required.length || !missing.length) {
      badge?.remove();
      refreshFieldPrepLaneAlert(section.closest('details.intakeLane'));
      return;
    }
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'tha-prep-completion';
      toggle.before(badge);
    }
    badge.className = 'tha-prep-completion needsRequired';
    badge.textContent = `Must answer · ${missing.length} needed`;
    badge.title = 'Open this section to complete the required PMR home-reference field.';
    refreshFieldPrepLaneAlert(section.closest('details.intakeLane'));
  }

  function addFieldPrepControls(lane) {"""
intake = intake[:match.start()] + new_functions + intake[match.end():]
old_tail = """    lane.querySelectorAll('.intakeSubsection').forEach(refreshFieldPrepCompletion);
  }"""
new_tail = """    lane.querySelectorAll('.intakeSubsection').forEach(refreshFieldPrepCompletion);
    refreshFieldPrepLaneAlert(lane);
  }"""
assert old_tail in intake, 'Expected addFieldPrepControls tail was not found'
intake = intake.replace(old_tail, new_tail, 1)
old_listener = """      const section = event.target.closest('.cleanFieldPrep .intakeSubsection');
      if (section) refreshFieldPrepCompletion(section);"""
new_listener = """      const section = event.target.closest('.cleanFieldPrep .intakeSubsection');
      if (section) {
        refreshFieldPrepCompletion(section);
        refreshFieldPrepLaneAlert(section.closest('details.intakeLane'));
      }"""
assert intake.count(old_listener) == 2, f'Expected two live listeners, found {intake.count(old_listener)}'
intake = intake.replace(old_listener, new_listener)
intake_path.write_text(intake)

# Make the PMR home-reference drawer prominent and initially open. Orange means
# unresolved and blue means recorded, matching the Intake reference fields.
pmr_path = Path('public/tha-v53-pmr-reference-and-expandable-items.js')
pmr = pmr_path.read_text()
replacements = {
"""        border:1px solid #d8e4ea!important;
        border-left:1px solid #d8e4ea!important;
        border-radius:18px!important;
        background:#fbfdfe!important;
        margin:14px 0 18px!important;
        overflow:hidden!important;
        box-shadow:0 6px 16px rgba(13,44,73,.045)!important;""": """        border:1px solid #e4b35c!important;
        border-left:7px solid #d49a1f!important;
        border-radius:18px!important;
        background:#fff8df!important;
        margin:14px 0 18px!important;
        overflow:hidden!important;
        box-shadow:0 8px 20px rgba(212,154,31,.12)!important;""",
"""        padding:12px 14px!important;
        display:flex!important;""": """        padding:13px 14px!important;
        background:#fff3c7!important;
        display:flex!important;""",
".tha-v53-need-title strong{display:block!important;color:#0b3658!important;font-size:16px!important;line-height:1.25!important}": ".tha-v53-need-title strong{display:block!important;color:#62440f!important;font-size:17px!important;line-height:1.25!important}",
".tha-v53-need-chip{display:inline-flex!important;align-items:center!important;border:1px solid #d8e4ea!important;background:#fff!important;color:#40505f!important;border-radius:999px!important;padding:4px 8px!important;font-size:10px!important;font-weight:950!important;white-space:nowrap!important}": ".tha-v53-need-chip{display:inline-flex!important;align-items:center!important;border:1px solid #d06b19!important;background:#fff1dc!important;color:#8a4812!important;border-radius:999px!important;padding:4px 8px!important;font-size:10px!important;font-weight:950!important;white-space:nowrap!important}",
".tha-v53-need-chip.recorded{border-color:#b9dfb4!important;background:#f6fcf4!important;color:#285c30!important}": ".tha-v53-need-chip.recorded{border-color:#5087b3!important;background:#edf6fc!important;color:#245f8a!important}",
".tha-v53-need-body{border-top:1px solid #e2e8ed!important;background:#fff!important;padding:12px 14px!important}": ".tha-v53-need-body{border-top:1px solid #e4b35c!important;background:#fffdf5!important;padding:12px 14px!important}",
".tha-v53-reference-field{border:1px solid #e2e8ed!important;border-radius:13px!important;background:#fbfdfe!important;padding:9px 10px!important}": ".tha-v53-reference-field{border:1px solid #d06b19!important;border-left:5px solid #d06b19!important;border-radius:13px!important;background:#fff1dc!important;padding:9px 10px!important}",
".tha-v53-reference-field.empty strong{color:#8a6b2b!important;font-style:italic!important}": ".tha-v53-reference-field.recorded{border-color:#5087b3!important;border-left-color:#287bb7!important;background:#edf6fc!important}.tha-v53-reference-field.empty strong{color:#8a4812!important;font-style:italic!important}"
}
for old, new in replacements.items():
    assert old in pmr, f'Expected PMR CSS snippet not found: {old[:55]}'
    pmr = pmr.replace(old, new, 1)
assert "    const wasOpen = Boolean(drawer?.open);" in pmr
pmr = pmr.replace("    const wasOpen = Boolean(drawer?.open);", "    const wasOpen = drawer ? Boolean(drawer.open) : true;", 1)
old_values = """    const panelValue = items[0]?.value || 'Not recorded';
    const waterValue = items[1]?.value || 'Not recorded';"""
new_values = """    const panelValue = items[0]?.value || 'Not recorded';
    const waterValue = items[1]?.value || 'Not recorded';
    const gasValue = items[2]?.value || 'Not recorded';"""
assert old_values in pmr
pmr = pmr.replace(old_values, new_values, 1)
old_summary = """        <div class=\"tha-v53-need-title\"><strong>Important Need-to-Know Home References</strong><small>Quick homeowner reference items before the room-by-room findings.</small></div>
        <div class=\"tha-v53-need-chips\"><span class=\"tha-v53-need-chip ${items[0]?.value ? 'recorded' : ''}\">Fuse box: ${escapeHtml(panelValue)}</span><span class=\"tha-v53-need-chip ${items[1]?.value ? 'recorded' : ''}\">Water shutoff: ${escapeHtml(waterValue)}</span><span class=\"tha-v53-need-chip ${recordedCount ? 'recorded' : ''}\">${recordedCount}/${items.length} recorded</span></div>"""
new_summary = """        <div class=\"tha-v53-need-title\"><strong>Important Need-to-Know Home References</strong><small>Fast-access locations for urgent homeowner or service needs.</small></div>
        <div class=\"tha-v53-need-chips\"><span class=\"tha-v53-need-chip ${items[0]?.value ? 'recorded' : ''}\">Fuse box: ${escapeHtml(panelValue)}</span><span class=\"tha-v53-need-chip ${items[1]?.value ? 'recorded' : ''}\">Water shutoff: ${escapeHtml(waterValue)}</span><span class=\"tha-v53-need-chip ${items[2]?.value ? 'recorded' : ''}\">Gas: ${escapeHtml(gasValue)}</span><span class=\"tha-v53-need-chip ${recordedCount === items.length ? 'recorded' : ''}\">${recordedCount}/${items.length} recorded</span></div>"""
assert old_summary in pmr
pmr_path.write_text(pmr.replace(old_summary, new_summary, 1))
