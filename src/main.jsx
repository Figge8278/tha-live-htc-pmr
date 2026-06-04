import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ClipboardCheck, FileText, Camera, Clock3, Download, Printer, Home, AlertTriangle, CheckCircle2, Wrench, CalendarDays, FolderOpen, Search, ShieldCheck, HardHat, Plug, Droplets, Fan, Paintbrush, Hammer, TreePine, Bug, Flame, Mountain, Wind, DoorOpen, Palette, Leaf, Settings, ClipboardList, Upload, Image, X } from 'lucide-react';
import './style.css';

const ICONS = {
  Handyman: '🧰', Electrical: '🔌', Plumbing: '🚿', HVAC: '🌡️', Roof: '🏠', Drainage: '🌧️', Windows: '🪟', Paint: '🎨', Pest: '🐜', Safety: '🔥', Appliance: '⚙️', Chimney: '🧱', Exterior: '🏡'
};
const TRADE_ICON = {
  Handyman: Wrench, Electrical: Plug, Plumbing: Droplets, HVAC: Fan, Roof: Home, Drainage: Wind, Windows: DoorOpen, Paint: Paintbrush, Pest: Bug, Safety: ShieldCheck, Appliance: Settings, Chimney: Flame, Exterior: TreePine, Carpentry: Hammer, 'General Contractor': HardHat, Design: Palette, Flooring: Home, Landscape: Leaf
};
function TradeIcon({trade, big=false}) {
  const Icon = TRADE_ICON[trade] || Search;
  return <span className={big ? 'tradeBadge big' : 'tradeBadge'}><Icon size={big ? 26 : 18}/></span>;
}
function CertaintyDot({label}) {
  const key = label || 'Likely Path';
  const cls = key === 'Clear Path' ? 'green' : key === 'Needs Discovery' ? 'red' : 'yellow';
  return <span className={`certaintyDot ${cls}`} aria-label={key}></span>;
}
function THALogo({variant='full', className=''}) {
  const src = variant === 'icon' ? '/tha-logo-icon-black.png' : '/tha-logo-full-black.png';
  return <img className={`thaLogo ${variant} ${className}`} src={src} alt="The Homeowner Advocate" />;
}

function displayTradeLabel(trade) {
  return trade === 'Handyman' ? 'Handy Services' : trade;
}


const CATEGORY_META = {
  Electrical: { label: 'Electrical', slug: 'electrical', Icon: Plug },
  Plumbing: { label: 'Plumbing', slug: 'plumbing', Icon: Droplets },
  HVAC: { label: 'HVAC', slug: 'hvac', Icon: Fan },
  Roofing: { label: 'Roofing', slug: 'roofing', Icon: Home },
  Drainage: { label: 'Drainage', slug: 'drainage', Icon: Wind },
  Openings: { label: 'Openings', slug: 'openings', Icon: DoorOpen },
  Exterior: { label: 'Exterior', slug: 'exterior', Icon: TreePine },
  Pest: { label: 'Pest', slug: 'pest', Icon: Bug },
  Safety: { label: 'Safety', slug: 'safety', Icon: ShieldCheck },
  Surfaces: { label: 'Surfaces', slug: 'surfaces', Icon: Paintbrush },
  Appliances: { label: 'Appliances', slug: 'appliances', Icon: Settings },
  'Handy / Carpentry': { label: 'Handy / Carpentry', slug: 'handy-carpentry', Icon: Hammer },
  'General / Misc': { label: 'General / Misc', slug: 'general-misc', Icon: ClipboardList }
};

function categoryInfo(category = 'General / Misc') {
  return CATEGORY_META[category] || CATEGORY_META['General / Misc'];
}

function categoryForChecklistItem(item = {}) {
  if (item.category) return item.category;
  const zone = item.zone || '';
  const trade = item.trade || '';
  const text = `${zone} ${trade} ${item.item || ''}`.toLowerCase();
  if (item.catchAll || text.includes('misc') || text.includes('sorting')) return 'General / Misc';
  if (text.includes('electrical') || text.includes('gfci') || text.includes('outlet') || text.includes('switch')) return 'Electrical';
  if (text.includes('plumbing') || text.includes('sink') || text.includes('drain') || text.includes('washer hose') || text.includes('water heater')) return 'Plumbing';
  if (text.includes('hvac') || text.includes('furnace') || text.includes('a/c') || text.includes('exhaust fan')) return 'HVAC';
  if (text.includes('roof') || text.includes('chimney') || text.includes('fireplace')) return 'Roofing';
  if (text.includes('drainage') || text.includes('grading') || text.includes('gutter') || text.includes('downspout') || text.includes('pooling')) return 'Drainage';
  if (text.includes('window') || text.includes('door') || text.includes('locks') || text.includes('screens') || text.includes('seals')) return 'Openings';
  if (text.includes('exterior') || text.includes('finish') || text.includes('paint') || text.includes('stain')) return 'Exterior';
  if (text.includes('pest') || text.includes('bug')) return 'Pest';
  if (text.includes('safety') || text.includes('smoke') || text.includes('co detector') || text.includes('fire extinguisher') || text.includes('lint')) return 'Safety';
  if (text.includes('surface') || text.includes('wall') || text.includes('ceiling') || text.includes('floor') || text.includes('caulk') || text.includes('grout') || text.includes('trim')) return 'Surfaces';
  if (text.includes('appliance') || text.includes('range hood') || text.includes('dryer')) return 'Appliances';
  if (text.includes('cabinet') || text.includes('carpentry') || text.includes('hinge') || text.includes('drawer') || text.includes('latch')) return 'Handy / Carpentry';
  return 'General / Misc';
}

function CategoryBadge({category}) {
  const meta = categoryInfo(category);
  const Icon = meta.Icon;
  return <span className={`categoryBadge category-${meta.slug}`} aria-label={`${meta.label} category`}><Icon aria-hidden="true" />{meta.label}</span>;
}

function CategoryLabel({category, children}) {
  const meta = categoryInfo(category);
  return <label className={`categoryQuestion category-${meta.slug}`}>{children}<CategoryBadge category={meta.label}/></label>;
}

const STATUS = ['Good','Monitor','Needs Attention','Immediate Concern','Unknown'];
const EFFORT = ['Unknown','15 min','30 min','45–60 min','1–2 hrs','Half day','Full day','Multi-day / trade scope'];
const ACTION_CERTAINTY = ['Clear Path','Likely Path','Needs Discovery'];
const PREFS = ['Do now','Plan soon','Budget for later','Watchlist only'];
const PASS_CADENCE = ['Monthly','Quarterly','Seasonal','Annual','As Needed'];
const PASS_RESOURCES = ['Handy Services','HVAC','Plumbing','Roofing','Gutters/Drainage','Pest','Safety','Other'];
const PHOTO_LABELS = ['Context','Close-up','Detail'];
const ROOM_PHOTO_LABELS = ['Overview'];
const ROOM_STATUS_OPTIONS = ['Looking Good','Watch Item / Worth Watching','Handy Services','Trade Attention','Routine Care / PASS','Homeowner Goal'];
const ROOM_ITEM_BUCKETS = [
  { value: 'watch_item', label: 'Watch Item / Worth Watching' },
  { value: 'handy_services', label: 'Handy Services' },
  { value: 'trade_attention', label: 'Trade Attention' },
  { value: 'routine_care_pass', label: 'Routine Care / PASS' },
  { value: 'homeowner_goal', label: 'Homeowner Goal' },
  { value: 'internal_note', label: 'Internal Note' }
];
const EMPTY_ROOM_ITEM_DRAFT = { title: '', bucket: 'watch_item', isDiscovery: false, notes: '' };
const SMART_ROOM_PROMPTS = [
  { group: 'Handy / Carpentry', prompt: 'Scan doors, trim, hinges, latches, and small hardware for adjustments or minor repair needs.' },
  { group: 'Plumbing', prompt: 'Check fixtures, shutoffs, drains, and under-sink areas for leaks, slow flow, moisture, or corrosion.' },
  { group: 'Electrical', prompt: 'Test key switches/outlets and note loose devices, flicker, missing covers, or safety concerns.' },
  { group: 'Appliances', prompt: 'Operate accessible appliances and fans; note unusual noise, poor performance, or overdue maintenance signs.' },
  { group: 'Surfaces', prompt: 'Look at walls, ceilings, floors, and caulk lines for stains, cracking, wear, or movement.' },
  { group: 'General / Safety', prompt: 'Capture life-safety, access, and unusual conditions that need homeowner awareness or follow-up.' }
];
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_QUEUE_KEY = 'tha-drive-pending-queue';
const DRIVE_META_KEY = 'tha-drive-meta';
const DRIVE_CLIENT_ID_KEY = 'tha-google-drive-client-id';
const DRIVE_CLIENT_ID_OVERRIDE_KEY = 'tha-google-drive-client-id-override';
const LEGACY_GOOGLE_CLIENT_ID_KEY = 'tha-google-client-id';
const APP_GOOGLE_OAUTH_CLIENT_ID = (import.meta.env?.VITE_GOOGLE_OAUTH_CLIENT_ID || '').trim();
const GOOGLE_DRIVE_SETUP_STEPS = [
  'Create/select Google Cloud project',
  'Enable Google Drive API',
  'Configure OAuth consent screen',
  'Create OAuth Client ID for Web application',
  'Add this deployed app origin as an authorized JavaScript origin',
  'Set VITE_GOOGLE_OAUTH_CLIENT_ID for the deployed app, or paste a fallback Client ID in troubleshooting'
];
const SECTION_ORDER_KEY = 'tha-section-order';
const ITEM_ORDER_KEY = 'tha-item-order';
const PINNED_ITEMS_KEY = 'tha-pinned-items';
const LEGACY_CLIENT_KEY = 'tha-client';
const LEGACY_ANSWERS_KEY = 'tha-answers';
const LEGACY_INTAKE_KEY = 'tha-intake';
const ROOM_CAPTURE_KEY = 'tha-room-capture';
const WALKTHROUGH_SESSIONS_KEY = 'tha-walkthrough-sessions';
const CURRENT_WALKTHROUGH_ID_KEY = 'tha-current-walkthrough-id';
const PHOTO_MAX_DIMENSION = 1600;
const PHOTO_QUALITY = 0.76;
const PHOTO_THUMBNAIL_MAX_DIMENSION = 360;
const PHOTO_THUMBNAIL_QUALITY = 0.62;
const PHOTO_UPLOAD_STATUS = { LOCAL: 'local', PENDING: 'pending', UPLOADED: 'uploaded', FAILED: 'failed' };
const PHOTO_BATCH_WARNING_COUNT = 5;
const PHOTO_AUTOSAVE_FAILURE_MESSAGE = 'Photo added, but autosave failed — download backup or remove photos.';
const TRADE_OPTIONS = [...Object.keys(ICONS), 'Carpentry', 'General Contractor', 'Design', 'Flooring', 'Landscape', 'Review / Assign Later'];

const INTAKE_DEFAULTS = {
  priorities: ['Safety','Function'], pace: 'Plan soon', budgetStyle: 'Balanced', decisionStyle: 'Wants options',
  notes: 'Homeowners want a clear plan, staged priorities, and no pressure to do everything at once.',
  electricalPanel: 'Garage wall - verify access and labeling during walkthrough.', electricalUpdates: 'Unknown / ask about recent panel or fixture work.',
  waterShutoff: 'Mechanical room - verify and photo label.', plumbingHistory: 'Slow kitchen drain reported; no known active leak.', waterHeater: 'Last flush unknown.', sewerIrrigation: 'Unknown sewer scope; irrigation service likely seasonal.',
  hvacFilter: 'Filter replacement date unknown.', hvacService: 'Furnace service likely overdue.', hvacAcService: 'A/C service history unknown.', comfort: 'No major comfort complaints noted yet.',
  roofAge: 'Approx. age unknown.', roofHistory: 'No known active leak reported.', solar: 'N/A or verify if present.',
  drainagePooling: 'Water noted near foundation after heavy rain/snowmelt.', drainageHistory: 'No known basement intrusion reported.', gutters: 'Downspout discharge to verify.',
  windowsDoors: 'One bedroom window reported sticky.', fogging: 'Unknown.', paintStain: 'Exterior finish timing unknown.', productsColors: 'Ask for any leftover labels/photos.',
  pests: 'No known active pest issue reported.', fireExtinguishers: 'One present, age unknown.', smokeCO: 'Detector age unknown; verify hardwired/battery and photo date stamps.',
  chimney: 'Last service unknown.', additionalConcerns: 'Homeowner wants practical staging: quick wins, recurring care, and larger items only when justified.'
};
const INTAKE_PRIORITIES = ['Safety','Function','Efficiency','Aesthetics','Resale','Aging in place / ADA','Budget control','Peace of mind'];
const INTAKE_PACE = ['Do now','Plan soon','Budget over time','Watchlist only'];
const INTAKE_BUDGET = ['Minimal fixes','Balanced','Invest where it matters'];
const INTAKE_DECISION = ['Direct / decisive','Wants options','Needs guidance'];
const INTAKE_FOLLOW_UP_SOURCE = 'Intake Follow-Up';
const INTAKE_REVIEW_STATUSES = [
  'Not Reviewed',
  'Reviewed — No Concern Found',
  'Reviewed — Added PMR Finding',
  'Unable to Inspect',
  'Deferred / Needs Homeowner Follow-Up',
  'Not Applicable'
];
const INTAKE_PMR_REVIEW_STATUS = 'Reviewed — Added PMR Finding';
const INTAKE_FOLLOW_UP_SECTION_KEY = 'intake-follow-up';
const INTAKE_FOLLOW_UP_MAPPINGS = [
  { keys: ['electricalPanel','electricalUpdates'], category: 'Electrical', target: 'Electrical / Service Areas', title: 'Electrical intake follow-up', trade: 'Electrical', prompt: 'Verify the homeowner-provided electrical context during the walkthrough, including access, labeling, visible condition, and any reported updates.', why: 'Intake notes can identify electrical questions that need eyes-on confirmation before any recommendation is made.', action: 'Document observations and only elevate to a PMR finding if field review confirms a safety, function, or maintenance concern.' },
  { keys: ['waterShutoff','plumbingHistory','waterHeater'], category: 'Plumbing', target: 'Plumbing / Mechanical', title: 'Plumbing intake follow-up', trade: 'Plumbing', prompt: 'Confirm shutoff location, water heater context, and any homeowner-reported plumbing symptoms or history.', why: 'Reported plumbing history should be verified so routine notes do not become assumed findings.', action: 'Capture practical next steps if the walkthrough confirms leaks, slow drains, maintenance gaps, or access issues.' },
  { keys: ['sewerIrrigation','drainagePooling','drainageHistory','gutters'], category: 'Drainage', target: 'Exterior / Drainage', title: 'Drainage intake follow-up', trade: 'Handyman', prompt: 'Look for grading, downspout discharge, pooling patterns, gutter concerns, irrigation context, and signs of water intrusion.', why: 'Drainage comments from intake need field context before deciding whether they are watch items, maintenance notes, or PMR findings.', action: 'Record the observed drainage condition and stage a practical maintenance or specialist review only if supported by the walkthrough.' },
  { keys: ['hvacFilter','hvacService','hvacAcService','comfort'], category: 'HVAC', target: 'HVAC / Mechanical', title: 'HVAC intake follow-up', trade: 'HVAC', prompt: 'Verify filter condition, furnace service/age context, A/C service/age context, thermostat/comfort concerns, and visible equipment condition.', why: 'HVAC history and comfort comments help focus the review without automatically implying a defect.', action: 'Recommend service, monitoring, or further evaluation only if the walkthrough confirms the need.' },
  { keys: ['roofAge','roofHistory','chimney'], category: 'Roofing', target: 'Roof / Chimney', title: 'Roofing / chimney intake follow-up', trade: 'Roof', prompt: 'Review homeowner roof/chimney history, visible roof-adjacent clues, fireplace/chimney context, and service timing if accessible.', why: 'Age and service history are useful context, but PMR findings should come from confirmed review conditions.', action: 'Note the history and add a PMR finding only when the walkthrough supports roof, flashing, leak, or chimney follow-up.' },
  { keys: ['solar'], category: 'Electrical', target: 'Electrical / Solar', title: 'Electrical / solar context follow-up', trade: 'Electrical', prompt: 'Confirm whether solar equipment is present and note visible access, labels, or homeowner context.', why: 'Solar information affects electrical context but still requires review before action is recommended.', action: 'Capture context and refer for electrical or solar-specialist review only if a confirmed concern is observed.' },
  { keys: ['windowsDoors','fogging'], category: 'Openings', target: 'Windows / Doors', title: 'Openings intake follow-up', trade: 'Handyman', prompt: 'Operate reported windows/doors where accessible and look for drafts, sticking, failed seals, locks, or hardware issues.', why: 'Homeowner-reported window and door issues often need a simple function check before prioritizing work.', action: 'Document adjustment, weatherstripping, monitoring, or trade follow-up only when the condition is confirmed.' },
  { keys: ['paintStain','productsColors'], category: 'Exterior', target: 'Exterior / Surfaces', title: 'Exterior / surfaces intake follow-up', trade: 'Handyman', prompt: 'Review exterior finish timing, visible wear, caulk/surface condition, and any product or color label information.', why: 'Finish history is helpful for staging maintenance, but it is not automatically a PMR finding.', action: 'Use confirmed wear or missing product context to shape maintenance notes or a PMR recommendation.' },
  { keys: ['pests'], category: 'Pest', target: 'Exterior / Interior', title: 'Pest intake follow-up', trade: 'Pest', prompt: 'Look for accessible signs related to the homeowner-reported pest history or concern.', why: 'Pest history should be separated from active evidence until field review confirms what is present.', action: 'Add a PMR finding or specialist recommendation only if active evidence or meaningful risk is observed.' },
  { keys: ['fireExtinguishers','smokeCO'], category: 'Safety', target: 'Safety Devices', title: 'Safety intake follow-up', trade: 'Safety', prompt: 'Verify extinguisher location/age and smoke/CO detector age, placement, and visible test/date information where accessible.', why: 'Safety devices are important, but intake notes should trigger review rather than automatic checklist status changes.', action: 'Recommend replacement, testing, labeling, or follow-up only when review confirms a concern or incomplete information.' },
  { keys: ['additionalConcerns'], category: 'General / Misc', target: 'General Walkthrough', title: 'General / miscellaneous intake follow-up', trade: 'Handyman', prompt: 'Use the homeowner’s additional concern as a targeted prompt during the walkthrough and capture what is actually observed.', why: 'General concerns preserve homeowner context without turning intake alone into a PMR finding.', action: 'Convert to a PMR finding only if field review confirms a specific concern that belongs in the Priority Action Plan.' }
];
function intakeSummary(intake) {
  const priorities = Array.isArray(intake.priorities) ? intake.priorities.join(', ') : intake.priorities || 'Not selected';
  return { priorities, pace: intake.pace || 'Not selected', budget: intake.budgetStyle || 'Not selected', decision: intake.decisionStyle || 'Not selected', notes: intake.notes || 'No additional homeowner notes recorded yet.' };
}
function intakeInfluence(item, intake) {
  const pace = intake?.pace || 'Plan soon';
  const budget = intake?.budgetStyle || 'Balanced';
  if (pace === 'Do now') return 'Homeowner prefers timely action, so this item can be staged sooner if aligned with scope and budget.';
  if (pace === 'Budget over time') return 'Homeowner prefers staged planning, so this can be grouped into a future phase unless risk increases.';
  if (pace === 'Watchlist only') return 'Homeowner prefers monitoring, so this should remain on the watchlist unless symptoms worsen.';
  if (budget === 'Minimal fixes') return 'Keep the first step practical and limited unless further discovery changes the scope.';
  if (budget === 'Invest where it matters') return 'Recommend the solution that best protects long-term value, not only the cheapest short-term fix.';
  return 'Balanced approach: address the practical first step and stage larger decisions as needed.';
}
function intakeFieldLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase());
}
function meaningfulIntakeValue(value) {
  if (Array.isArray(value)) return value.length ? value.join(', ') : '';
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^(n\/?a|none|no|unknown)$/i.test(text)) return '';
  return text;
}
function buildIntakeFollowUpRows(intake = {}) {
  return INTAKE_FOLLOW_UP_MAPPINGS.flatMap(mapping => mapping.keys.map(key => ({ mapping, key, value: meaningfulIntakeValue(intake[key]) })))
    .filter(({ value }) => value)
    .map(({ mapping, key, value }) => ({
      id: `intake-follow-up-${key}`,
      source: INTAKE_FOLLOW_UP_SOURCE,
      intakeField: key,
      intakeFieldLabel: intakeFieldLabel(key),
      intakeValue: value,
      room: mapping.target,
      roomType: INTAKE_FOLLOW_UP_SOURCE,
      roomName: mapping.target,
      sectionKey: INTAKE_FOLLOW_UP_SECTION_KEY,
      zone: mapping.category,
      category: mapping.category,
      item: mapping.title,
      trade: mapping.trade,
      effort: 'Unknown',
      prompt: mapping.prompt,
      why: mapping.why,
      action: mapping.action,
      intakeOnly: true,
      pmrGroup: INTAKE_FOLLOW_UP_SOURCE
    }));
}
function isIntakeFollowUp(row = {}) {
  return row.source === INTAKE_FOLLOW_UP_SOURCE || row.intakeOnly;
}
function includePMRRow(row) {
  if (isIntakeFollowUp(row)) return includePMR(row.answer) && row.answer.reviewStatus === INTAKE_PMR_REVIEW_STATUS;
  return includePMR(row.answer);
}
function passCadenceFor(item = {}) {
  const frequency = (item.frequency || '').toLowerCase();
  if (frequency.includes('month') || frequency.includes('1–3')) return 'Monthly';
  if (frequency.includes('quarter')) return 'Quarterly';
  if (frequency.includes('spring') || frequency.includes('fall') || frequency.includes('season')) return 'Seasonal';
  if (frequency.includes('annual') || frequency.includes('year')) return 'Annual';
  return 'As Needed';
}
function passResourceFor(item = {}) {
  const category = categoryForChecklistItem(item);
  const trade = item.trade || '';
  if (category === 'HVAC' || trade === 'HVAC') return 'HVAC';
  if (category === 'Plumbing' || trade === 'Plumbing') return 'Plumbing';
  if (category === 'Roofing' || trade === 'Roof' || trade === 'Chimney') return 'Roofing';
  if (category === 'Drainage') return 'Gutters/Drainage';
  if (category === 'Pest' || trade === 'Pest') return 'Pest';
  if (category === 'Safety' || trade === 'Safety') return 'Safety';
  if (trade === 'Handyman') return 'Handy Services';
  return 'Other';
}

const library = [
  {room:'Kitchen', zone:'Electrical', item:'GFCI outlet near sink', trade:'Electrical', effort:'30 min', prompt:'Test trip/reset. Note if missing, failed, loose, or visibly unsafe.', why:'GFCI protection matters where water and electricity are close together.', action:'Replace/repair GFCI protection or have electrician evaluate if wiring issue is suspected.', timing:{Monitor:'3–6 months','Needs Attention':'0–30 days','Immediate Concern':'Immediate'}},
  {room:'Kitchen', zone:'Plumbing', item:'Sink / disposal / drain behavior', trade:'Plumbing', effort:'45–60 min', prompt:'Run water. Listen for disposal noise. Check under-sink shutoffs and trap for leaks.', why:'Small leaks, slow drains, and noisy disposals often become larger repair issues.', action:'Clear/inspect drain, check disposal, and escalate to plumber if issue is beyond handyman-level.'},
  {room:'Kitchen', zone:'Cabinetry', item:'Cabinet hinges, drawers, pulls', trade:'Handyman', effort:'30 min', prompt:'Open/close doors and drawers. Note loose hardware, rubbing, misalignment, or damaged boxes.', why:'Loose hardware creates wear and makes daily use feel rough.', action:'Tighten, adjust, and document damaged components for repair or replacement.'},
  {room:'Kitchen', zone:'Ventilation', item:'Range hood / filter', trade:'Appliance', effort:'30 min', prompt:'Test fan/light, inspect filter, note venting or recirculating configuration.', why:'Kitchen ventilation supports air quality, odor control, and moisture management.', action:'Clean filter, test operation, and service/replace if needed.', pass:true, frequency:'Annual'},
  {room:'Laundry', zone:'Ventilation', item:'Dryer vent and exterior flap', trade:'Handyman', effort:'45–60 min', prompt:'Look for lint buildup, crushed duct, long run, weak airflow, or exterior flap stuck closed.', why:'Lint buildup reduces dryer efficiency and can become a fire risk.', action:'Clean dryer vent path and confirm exterior termination opens properly.', pass:true, frequency:'Annual / Fall'},
  {room:'Laundry', zone:'Plumbing', item:'Washer hoses and shutoffs', trade:'Handyman', effort:'30 min', prompt:'Check hose material/age, corrosion, access to shutoffs, and signs of leaks.', why:'Washer hoses are common leak points and can cause expensive water damage.', action:'Replace aging hoses with braided lines and confirm shutoffs are accessible.', pass:true, frequency:'Annual check'},
  {room:'Laundry', zone:'Electrical', item:'Laundry GFCI outlet', trade:'Electrical', effort:'30 min', prompt:'Test GFCI protection and note if outlet is missing, dead, loose, or not resetting.', why:'Laundry rooms combine water, appliances, and electrical load.', action:'Correct outlet protection; electrician if wiring concern exists.'},
  {room:'Bedroom', zone:'Windows', item:'Window operation, locks, seals', trade:'Windows', effort:'30 min', prompt:'Open/close. Check locks, failed seals/fogging, damaged screens, and egress concerns.', why:'Bedroom windows affect comfort, ventilation, and emergency egress.', action:'Adjust/repair hardware; refer to window specialist for failed seals or replacement.'},
  {room:'Bedroom', zone:'Doors', item:'Door hinges, knobs, latch alignment', trade:'Handyman', effort:'30 min', prompt:'Open/close door, test latch, check loose hinges and rubbing.', why:'Small door adjustments prevent wear and daily frustration.', action:'Tighten/adjust hinges, knobs, strikes, and rubbing points.'},
  {room:'Bathroom', zone:'Wet Areas', item:'Caulk / grout at tub, shower, sink', trade:'Handyman', effort:'1–2 hrs', prompt:'Look for cracks, gaps, mold staining, failed caulk, loose grout, or soft surfaces.', why:'Failed caulk and grout invite water behind finishes.', action:'Remove failing caulk/grout and re-seal cleanly; escalate if water damage is suspected.'},
  {room:'Bathroom', zone:'Ventilation', item:'Bath exhaust fan', trade:'Handyman', effort:'30 min', prompt:'Turn fan on. Listen for noise. Confirm airflow at grille and note possible venting concern.', why:'Bath fans reduce humidity and help prevent mildew and finish damage.', action:'Clean/test fan; replace fan or evaluate venting if weak/noisy.'},
  {room:'Mechanical', zone:'HVAC', item:'Furnace filter condition and size', trade:'Handyman', effort:'15 min', prompt:'Photograph filter size, date, orientation, and condition.', why:'Clean filters protect equipment and airflow.', action:'Replace filter and add to recurring care schedule.', pass:true, frequency:'Every 1–3 months'},
  {room:'Mechanical', zone:'HVAC', item:'Furnace / AC service history', trade:'HVAC', effort:'Trade scope', prompt:'Look for service sticker, system age, visible wear, condensate, noise, or comfort complaints.', why:'Scheduled service helps catch issues before peak heating/cooling seasons.', action:'Schedule HVAC service if overdue or symptoms are present.', pass:true, frequency:'Annual'},
  {room:'Exterior', zone:'Drainage', item:'Gutters, downspouts, water discharge', trade:'Handyman', effort:'1–2 hrs', prompt:'Check overflow, loose sections, downspout extensions, and water discharge near foundation.', why:'Water management protects siding, roof edges, foundation, and basements.', action:'Clean/repair gutters and extend downspouts away from foundation.', pass:true, frequency:'Spring / Fall'},
  {room:'Exterior', zone:'Drainage', item:'Grading / pooling near foundation', trade:'Drainage', effort:'Trade scope', prompt:'Note low spots, negative slope, soil contact, pooling areas, and relation to downspouts.', why:'Poor grading and pooling water can create long-term foundation and basement risk.', action:'Plan drainage correction, regrading, extensions, or landscape drainage solution.'},
  {room:'Exterior', zone:'Finish', item:'Exterior paint / stain / caulk wear', trade:'Paint', effort:'Trade scope', prompt:'Look for exposed wood, peeling paint, failed caulk, checks, rot, or sun-exposed wear.', why:'Exterior finish is a protective shield, not just color.', action:'Plan touch-ups, caulking, carpentry repair, or repaint/stain scope.', pass:true, frequency:'Annual review'},
  {room:'Safety', zone:'Whole Home', item:'Smoke / CO detectors', trade:'Safety', effort:'30 min', prompt:'Photograph date stamp when possible. Note hardwired vs battery and missing/expired units.', why:'Smoke and CO detection is basic life safety.', action:'Replace expired/missing units and consider hardwired upgrade where needed.', pass:true, frequency:'Annual test'},
  {room:'Safety', zone:'Whole Home', item:'Fire extinguishers', trade:'Safety', effort:'15 min', prompt:'Check quantity, location, accessibility, and gauge/date if visible.', why:'Accessible extinguishers provide first-response safety.', action:'Add/replace extinguishers and place in kitchen, garage, and mechanical areas.', pass:true, frequency:'Annual check'},
  {room:'Exterior', zone:'Roof / Chimney', item:'Chimney inspection / cleaning history', trade:'Chimney', effort:'Trade scope', prompt:'Ask last cleaning date. Photograph visible crown/cap/firebox if accessible/safe.', why:'Chimney service supports fire safety and proper system function.', action:'Schedule chimney inspection/cleaning if overdue or unknown.', pass:true, frequency:'Annual / Fall'}
];

const livingFamilyTemplate = [
  {room:'Living / Family Rooms', zone:'Interior Finish', item:'Walls, ceilings, trim, and visible staining', trade:'Handyman', effort:'30 min', prompt:'Scan walls, ceilings, trim, flooring edges, and corners for stains, cracks, swelling, or movement.', why:'Finish changes can point to moisture, settlement, daily wear, or prior repairs that deserve monitoring.', action:'Document locations, touch up minor finish issues, and investigate active moisture or movement.'},
  {room:'Living / Family Rooms', zone:'Windows / Doors', item:'Windows, doors, locks, screens, and seals', trade:'Windows', effort:'30 min', prompt:'Operate accessible windows and doors, test locks, and note fogged glass, torn screens, drafts, or difficult movement.', why:'Living-space openings affect comfort, security, energy use, and water resistance.', action:'Adjust hardware, repair screens, and refer failed seals or damaged units to a window specialist.'},
  {room:'Living / Family Rooms', zone:'Electrical', item:'Outlets, switches, lighting, and ceiling fans', trade:'Electrical', effort:'30 min', prompt:'Look for loose outlets, missing covers, flickering lights, damaged switches, fan wobble, or unusual heat/discoloration.', why:'Small electrical defects can create safety concerns or indicate aging components.', action:'Tighten or replace covers and fixtures where appropriate; use an electrician for wiring symptoms.'},
  {room:'Living / Family Rooms', zone:'Fireplace', item:'Fireplace, hearth, damper, and visible masonry', trade:'Chimney', effort:'Trade scope', prompt:'Check visible firebox, hearth cracks, damper movement, odor, staining, and last service history.', why:'Fireplaces and chimneys need regular review for fire safety, drafting, and masonry condition.', action:'Schedule chimney inspection or cleaning if service history is unknown, overdue, or symptoms are present.', pass:true, frequency:'Annual / Fall'}
];

const DYNAMIC_ROOM_TYPES = {
  Bedrooms: { roomType: 'Bedrooms', templateRoom: 'Bedroom', addLabel: '+ Add Room', example: 'Primary Bedroom' },
  Bathrooms: { roomType: 'Bathrooms', templateRoom: 'Bathroom', addLabel: '+ Add Room', example: 'Hall Bath' },
  'Living / Family Rooms': { roomType: 'Living / Family Rooms', templateRoom: 'Living / Family Rooms', addLabel: '+ Add Room', example: 'Family Room' }
};
const DYNAMIC_TEMPLATE_ROOMS = ['Bedroom', 'Bathroom'];
const DYNAMIC_ROOMS_KEY = 'tha-dynamic-rooms';
const DUPLICATE_LEGACY_WALKTHROUGH_KEYS = [
  LEGACY_CLIENT_KEY,
  LEGACY_ANSWERS_KEY,
  LEGACY_INTAKE_KEY,
  DYNAMIC_ROOMS_KEY,
  SECTION_ORDER_KEY,
  ITEM_ORDER_KEY,
  PINNED_ITEMS_KEY,
  ROOM_CAPTURE_KEY
];
const DEFAULT_DYNAMIC_ROOMS = [
  { id: 'default-living-room-1', roomName: 'Family Room', roomType: 'Living / Family Rooms' },
  { id: 'default-bedroom-1', roomName: 'Bedroom 1', roomType: 'Bedrooms' },
  { id: 'default-bathroom-1', roomName: 'Bathroom 1', roomType: 'Bathrooms' }
];
const sectionOrder = [...new Set(library.map(x => x.room))];
const checklistLibrary = sectionOrder.flatMap(room => [
  ...library.filter(item => item.room === room),
  {
    room,
    zone: 'Needs Sorting / General Notes',
    item: 'General / Misc Observations',
    trade: 'Review / Assign Later',
    effort: 'Unknown',
    prompt: 'Use this catch-all when the observation matters but does not clearly belong to a checklist item yet.',
    why: 'Miscellaneous observations are preserved for review instead of being lost during the walkthrough.',
    action: 'Review the note, assign it to a specific section-item when possible, or keep it grouped under general notes.',
    catchAll: true,
    pmrGroup: 'Needs Sorting / General Notes'
  }
]);

function catchAllItem({ room, roomType = room, roomName = room, sectionKey = room, id }) {
  return {
    room,
    roomType,
    roomName,
    sectionKey,
    id,
    zone: 'Needs Sorting / General Notes',
    item: 'General / Misc Observations',
    trade: 'Review / Assign Later',
    effort: 'Unknown',
    prompt: 'Use this catch-all when the observation matters but does not clearly belong to a checklist item yet.',
    why: 'Miscellaneous observations are preserved for review instead of being lost during the walkthrough.',
    action: 'Review the note, assign it to a specific section-item when possible, or keep it grouped under general notes.',
    catchAll: true,
    pmrGroup: 'Needs Sorting / General Notes'
  };
}
function templateItemsForRoomType(roomType) {
  const config = Object.values(DYNAMIC_ROOM_TYPES).find(x => x.roomType === roomType);
  if (!config) return [];
  if (config.templateRoom === 'Living / Family Rooms') return livingFamilyTemplate;
  return library.filter(item => item.room === config.templateRoom);
}
function buildStaticSectionRows(room) {
  const rows = library
    .map((item, originalIndex) => ({ item, originalIndex }))
    .filter(({ item }) => item.room === room)
    .map(({ item, originalIndex }) => ({ ...item, id: String(originalIndex), sectionKey: room, roomType: room, roomName: room }));
  return [...rows, catchAllItem({ room, sectionKey: room, id: `catchall-${room}` })];
}
function buildDynamicRoomRows(roomConfig) {
  const template = templateItemsForRoomType(roomConfig.roomType);
  const base = template.map((item, index) => ({
    ...item,
    id: `${roomConfig.id}-${index}`,
    room: roomConfig.roomName,
    roomType: roomConfig.roomType,
    roomName: roomConfig.roomName,
    sectionKey: roomConfig.id
  }));
  return [...base, catchAllItem({ room: roomConfig.roomName, roomType: roomConfig.roomType, roomName: roomConfig.roomName, sectionKey: roomConfig.id, id: `${roomConfig.id}-catchall` })];
}
function mergeOrder(savedOrder = [], currentKeys = []) {
  const saved = Array.isArray(savedOrder) ? savedOrder.filter(key => currentKeys.includes(key)) : [];
  return [...saved, ...currentKeys.filter(key => !saved.includes(key))];
}
function orderedSectionList(sections, savedOrder) {
  const order = mergeOrder(savedOrder, sections.map(section => section.key));
  return order.map(key => sections.find(section => section.key === key)).filter(Boolean);
}
function orderSectionRows(rows, savedItemOrder = [], pinnedIds = []) {
  const catchAll = rows.find(row => row.catchAll);
  const movable = rows.filter(row => !row.catchAll);
  const order = mergeOrder(savedItemOrder, movable.map(row => row.id));
  const byId = Object.fromEntries(movable.map(row => [row.id, row]));
  const pinned = order.filter(id => pinnedIds.includes(id)).map(id => byId[id]).filter(Boolean);
  const regular = order.filter(id => !pinnedIds.includes(id)).map(id => byId[id]).filter(Boolean);
  return [...pinned, ...regular, ...(catchAll ? [catchAll] : [])];
}
function moveWithinGroup(order, id, direction, pinnedIds = []) {
  const pinned = pinnedIds.includes(id);
  const group = order.filter(itemId => pinnedIds.includes(itemId) === pinned);
  const index = group.indexOf(id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= group.length) return order;
  const nextGroup = [...group];
  [nextGroup[index], nextGroup[nextIndex]] = [nextGroup[nextIndex], nextGroup[index]];
  let groupIndex = 0;
  return order.map(itemId => pinnedIds.includes(itemId) === pinned ? nextGroup[groupIndex++] : itemId);
}

const sampleAnswers = Object.fromEntries(checklistLibrary.map((x, i) => [i, {
  status: x.catchAll ? 'Good' : (['Monitor','Immediate Concern','Needs Attention','Good','Needs Attention','Needs Attention','Good','Monitor','Needs Attention','Needs Attention','Monitor','Needs Attention','Monitor','Needs Attention','Monitor','Needs Attention','Immediate Concern','Monitor','Monitor'][i] || 'Good'),
  trade: x.trade,
  effort: x.effort,
  actionCertainty: x.catchAll ? 'Needs Discovery' : (i % 3 === 0 ? 'Likely Path' : 'Clear Path'),
  pref: i % 4 === 0 ? 'Plan soon' : i % 4 === 1 ? 'Do now' : i % 4 === 2 ? 'Budget for later' : 'Watchlist only',
  notes: [
    'Runs loud, no active leak seen.', 'Failed trip/reset test near sink.', 'Slow drain; disposal sounds rough.', '',
    'Lint visible at exterior flap; airflow weak.', 'Older rubber hoses; shutoffs accessible.', '', 'One window sticky; no fogging.',
    'Closet door rubs and latch misses strike.', 'Back corner caulk failing.', 'Noisy fan; airflow seems weak.', 'Dirty filter, size 16x25x1.',
    'Unknown last service date.', 'Downspout discharges at foundation.', 'Low spot along north side.', 'South trim weathered and caulk cracking.',
    'Two units appear over 10 years old.', 'One present, gauge/date unknown.', 'Unknown last cleaning.'
  ][i] || '',
  photos: { context: i%2===0, close: i%3!==0, detail: i%4===0 },
  photoRef: i%2===0 ? `Photo ${String(i+1).padStart(2,'0')}` : ''
}]));

function timingFor(item, status) {
  if (item.timing?.[status]) return item.timing[status];
  if (status === 'Immediate Concern') return 'Immediate / 0–30 days';
  if (status === 'Needs Attention') return '1–3 months';
  if (status === 'Monitor') return '6–12 months';
  return '';
}
function priority(status) {
  if (status === 'Immediate Concern') return 'High';
  if (status === 'Needs Attention') return 'Medium';
  if (status === 'Monitor') return 'Low';
  return '';
}
function includePMR(a) { return ['Monitor','Needs Attention','Immediate Concern'].includes(a.status); }
function actionCertaintyFor(answer) {
  return answer.actionCertainty || (answer.confidence === 'High' ? 'Clear Path' : answer.confidence === 'Low / needs review' ? 'Needs Discovery' : 'Likely Path');
}
function actionCertaintyCopy(row) {
  const cert = actionCertaintyFor(row.answer);
  const trade = row.answer.trade || row.trade || 'appropriate resource';
  const noteLead = row.answer.notes ? `Based on the field note ("${row.answer.notes}"), ` : '';
  if (cert === 'Clear Path') {
    return {
      label: 'Clear Path',
      title: 'Recommended Action',
      body: `${noteLead}${row.action}`,
      next: `This appears ready to proceed through ${trade}.`
    };
  }
  if (cert === 'Needs Discovery') {
    return {
      label: 'Needs Discovery',
      title: 'Further Evaluation Recommended',
      body: `${noteLead}use this observation as the starting point, but confirm the source and scope before committing to a fix.`,
      next: `Coordinate a closer review with ${trade} before pricing or scheduling repair work.`
    };
  }
  return {
    label: 'Likely Path',
    title: 'Recommended Starting Point',
    body: `${noteLead}${row.action}`,
    next: 'Start here, then reassess if symptoms continue or hidden conditions are found.'
  };
}
function drivePath(client, date, room, item, roomName = room) {
  const clean = s => (s || '').replace(/[\\/:*?"<>|]/g,'-').slice(0,40);
  return `THA Clients / _HTC PMR Incoming / ${clean(date || 'Walkthrough Date / Visit Label')} - ${clean(client || 'Client Name')} / Photos / ${clean(roomName || room)} - ${clean(item || 'Overview')}`;
}
function cleanDriveName(value) {
  return (value || 'Untitled').replace(/[\\/:*?"<>|]/g, '-').trim().slice(0, 90) || 'Untitled';
}
function htmlEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function htmlText(value, fallback = 'Not recorded') {
  const text = String(value ?? '').trim();
  return htmlEscape(text || fallback).replace(/\n/g, '<br/>');
}
function stripFileExtension(name = '') {
  return String(name || '').replace(/\.[^.\/]+$/, '');
}
function drivePackageFolderName(client = {}) {
  return cleanDriveName(`${client.date || 'Walkthrough Date / Visit Label'} - ${client.name || 'Client Name'} - ${client.address || 'Project Address'}`);
}
function driveFolderUrl(folderId) {
  return folderId ? `https://drive.google.com/drive/folders/${folderId}` : '';
}
function flatPhotoDriveName({ room = 'Room', item = 'Overview', label = 'Photo', originalName = 'photo' } = {}) {
  const base = [room, item || 'Overview', label || 'Photo', stripFileExtension(originalName) || 'photo'].map(cleanDriveName).join(' - ');
  return `${base}.jpg`;
}
function normalizePhotoRecord(photo = {}) {
  const hasDriveReference = Boolean(photo.driveFileId || photo.driveViewLink || photo.webViewLink);
  return {
    ...photo,
    uploadStatus: photo.uploadStatus || (hasDriveReference ? PHOTO_UPLOAD_STATUS.UPLOADED : PHOTO_UPLOAD_STATUS.LOCAL),
    driveFileId: photo.driveFileId || '',
    driveFileName: photo.driveFileName || '',
    driveViewLink: photo.driveViewLink || photo.webViewLink || '',
    webViewLink: photo.webViewLink || photo.driveViewLink || '',
    uploadedAt: photo.uploadedAt || '',
    thumbnailDataUrl: photo.thumbnailDataUrl || ''
  };
}
function photoList(answer) {
  if (Array.isArray(answer?.photos)) return answer.photos.map(normalizePhotoRecord);
  return Object.entries(answer?.photos || {}).filter(([, val]) => val).map(([key]) => normalizePhotoRecord({
    id: key,
    label: key === 'close' ? 'Close-up' : key === 'detail' ? 'Detail' : 'Context',
    name: answer?.photoRef || key,
    dataUrl: ''
  }));
}
function photoDisplaySrc(photo = {}) {
  return photo.dataUrl || photo.thumbnailDataUrl || '';
}
function photoStatusLabel(photo = {}) {
  const status = photo.uploadStatus || PHOTO_UPLOAD_STATUS.LOCAL;
  if (status === PHOTO_UPLOAD_STATUS.PENDING) return 'Pending Drive';
  if (status === PHOTO_UPLOAD_STATUS.UPLOADED) return 'Uploaded to Drive';
  if (status === PHOTO_UPLOAD_STATUS.FAILED) return 'Upload failed';
  return 'Local';
}
function photoStatusMessage(photo = {}, driveConnected = false) {
  const status = photo.uploadStatus || PHOTO_UPLOAD_STATUS.LOCAL;
  if (status === PHOTO_UPLOAD_STATUS.UPLOADED) return photo.driveFileName ? `Drive: ${photo.driveFileName}` : 'Drive reference saved';
  if (status === PHOTO_UPLOAD_STATUS.PENDING) return driveConnected ? 'Uploading to Google Drive…' : 'Pending Drive upload';
  if (status === PHOTO_UPLOAD_STATUS.FAILED) return 'Drive upload failed — sync pending photos to retry';
  return driveConnected ? 'Local photo — pending Drive upload' : 'Local photo — connect Drive to upload';
}
function pendingPhotoUploadCount(answers = {}, roomCapture = {}) {
  const needsUpload = photo => [PHOTO_UPLOAD_STATUS.LOCAL, PHOTO_UPLOAD_STATUS.PENDING, PHOTO_UPLOAD_STATUS.FAILED].includes(photo?.uploadStatus || PHOTO_UPLOAD_STATUS.LOCAL) && Boolean(photo?.dataUrl);
  const answerCount = Object.values(answers || {}).reduce((count, answer) => count + photoList(answer).filter(needsUpload).length, 0);
  const roomCount = Object.values(roomCapture || {}).reduce((count, capture) => count + photoList(capture).filter(needsUpload).length, 0);
  return answerCount + roomCount;
}
function normalizeAnswer(answer, item) {
  return {
    status: answer?.status || (isIntakeFollowUp(item) ? 'Unknown' : 'Good'),
    trade: answer?.trade || item.trade,
    effort: answer?.effort || item.effort,
    actionCertainty: actionCertaintyFor(answer || {}),
    pref: answer?.pref || 'Plan soon',
    notes: answer?.notes || '',
    photos: photoList(answer),
    photoRef: answer?.photoRef || '',
    reassignTo: answer?.reassignTo || '',
    isDiscovery: typeof answer?.isDiscovery === 'boolean' ? answer.isDiscovery : false,
    reviewStatus: answer?.reviewStatus || (isIntakeFollowUp(item) ? 'Not Reviewed' : ''),
    passCandidate: typeof answer?.passCandidate === 'boolean' ? answer.passCandidate : Boolean(item.pass && !isIntakeFollowUp(item)),
    passCadence: answer?.passCadence || passCadenceFor(item),
    passResource: answer?.passResource || passResourceFor(item),
    passNote: answer?.passNote || ''
  };
}
function photoSummary(photos, { emptyText = 'No item photos attached yet', labels = PHOTO_LABELS } = {}) {
  const list = Array.isArray(photos) ? photos : photoList({ photos });
  if (!list.length) return emptyText;
  const labelSummary = labels.map(label => {
    const count = list.filter(photo => photo.label === label).length;
    return count ? `${count} ${label.toLowerCase()}` : '';
  }).filter(Boolean);
  return `${list.length} photo${list.length === 1 ? '' : 's'} attached${labelSummary.length ? `: ${labelSummary.join(', ')}` : ''}`;
}
function dataUrlToBlob(dataUrl) {
  const [meta, body] = dataUrl.split(',');
  const mime = meta.match(/data:(.*?);base64/)?.[1] || 'application/octet-stream';
  const bytes = atob(body || '');
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) buffer[i] = bytes.charCodeAt(i);
  return new Blob([buffer], { type: mime });
}
function queueDrivePayload(payload, onFailure) {
  const queue = safeJsonParse(localStorage.getItem(DRIVE_QUEUE_KEY), []);
  const next = [...queue, { id: Date.now(), createdAt: new Date().toISOString(), payload }];
  safeLocalStorageSet(DRIVE_QUEUE_KEY, JSON.stringify(next), onFailure);
  return next.length;
}
function serializeErrorDetails(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  const detail = {
    name: error.name || '',
    message: error.message || '',
    code: error.code || error.error || '',
    description: error.description || error.error_description || '',
    status: error.status || '',
    url: error.url || '',
    body: error.body || '',
    stack: error.stack || ''
  };
  return JSON.stringify(Object.fromEntries(Object.entries(detail).filter(([, value]) => value)), null, 2);
}
function driveErrorMessage(error, fallback = 'Unable to connect Google Drive') {
  const rawText = [error?.message, error?.code, error?.error, error?.description, error?.error_description, error?.body].filter(Boolean).join(' ').toLowerCase();
  if (error?.status === 401 || rawText.includes('invalid_token') || rawText.includes('unauthorized')) return 'Drive session expired — reconnect';
  if (error?.code === 'missing_client_id' || rawText.includes('client id is required')) return 'Missing Client ID — paste a Google OAuth Client ID for a Web application. This is not a Drive folder URL.';
  if (error?.code === 'gis_load_failed') return 'Google Identity Services failed to load. Check internet access, browser/script blocking, then try again.';
  if (rawText.includes('access_denied') || rawText.includes('user canceled') || rawText.includes('cancelled') || rawText.includes('popup_closed')) return 'Access denied / user canceled — approve the Google consent prompt to connect Drive.';
  if (rawText.includes('popup') && (rawText.includes('blocked') || rawText.includes('failed') || rawText.includes('closed'))) return 'Popup blocked — allow popups for this app and try Connect Google Drive again.';
  if (rawText.includes('invalid_client')) return 'Invalid client — confirm you pasted the OAuth Web application Client ID, not a secret or folder URL.';
  if (rawText.includes('origin') && (rawText.includes('not allowed') || rawText.includes('not a valid') || rawText.includes('mismatch') || rawText.includes('unauthorized'))) return 'Origin not allowed — add this app origin to the OAuth Client ID authorized JavaScript origins in Google Cloud.';
  if (error?.code === 'drive_api_failed' || rawText.includes('googleapis.com/drive') || rawText.includes('drive api')) return 'Drive API request failed — confirm the Google Drive API is enabled and this account granted Drive access.';
  return fallback;
}
function buildDriveErrorState(error, fallback) {
  return {
    lastStatus: '',
    lastStatusTone: '',
    lastError: driveErrorMessage(error, fallback),
    lastErrorDetails: serializeErrorDetails(error)
  };
}
function driveStatusState(message, tone = 'info') {
  return { lastStatus: message, lastStatusTone: tone, lastError: '', lastErrorDetails: '' };
}
function driveSavedTime() {
  return new Date().toLocaleString();
}
function isDriveSessionExpired(error) {
  const rawText = [error?.message, error?.code, error?.error, error?.description, error?.error_description, error?.body].filter(Boolean).join(' ').toLowerCase();
  return error?.status === 401 || rawText.includes('invalid_token') || rawText.includes('unauthorized');
}
function setupChecklistText(origin) {
  return [
    'Google Drive setup checklist:',
    ...GOOGLE_DRIVE_SETUP_STEPS.map((step, index) => `${index + 1}. ${step}${step.includes('authorized JavaScript origin') ? `: ${origin || 'window.location.origin'}` : ''}`)
  ].join('\n');
}
async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
}
function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    const fail = () => reject(Object.assign(new Error('Google Identity Services failed to load.'), { code: 'gis_load_failed' }));
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', fail, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = fail;
    document.head.appendChild(script);
  });
}
function requestDriveToken(clientId, { forceConsent = false } = {}) {
  return new Promise((resolve, reject) => {
    if (!clientId?.trim()) {
      reject(Object.assign(new Error('Google OAuth Client ID is required.'), { code: 'missing_client_id' }));
      return;
    }
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: DRIVE_SCOPE,
        callback: response => {
          if (response.error) reject(Object.assign(new Error(response.error_description || response.error), response));
          else resolve(response.access_token);
        }
      });
      tokenClient.requestAccessToken({ prompt: forceConsent ? 'consent' : '' });
    } catch (error) {
      reject(error);
    }
  });
}
async function driveFetch(accessToken, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken}`, ...(options.headers || {}) }
  });
  if (!response.ok) {
    const body = await response.text();
    throw Object.assign(new Error(body || `Drive API request failed with status ${response.status}`), { code: 'drive_api_failed', status: response.status, url, body });
  }
  return response.json();
}
function driveQueryEscape(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
async function findOrCreateDriveFolder(accessToken, name, parentId) {
  const parentClause = parentId ? ` and '${parentId}' in parents` : '';
  const q = `mimeType='application/vnd.google-apps.folder' and name='${driveQueryEscape(name)}'${parentClause} and trashed=false`;
  const result = await driveFetch(accessToken, `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`);
  if (result.files?.[0]) return result.files[0].id;
  const metadata = { name, mimeType: 'application/vnd.google-apps.folder', ...(parentId ? { parents: [parentId] } : {}) };
  const created = await driveFetch(accessToken, 'https://www.googleapis.com/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata)
  });
  return created.id;
}
async function uploadDriveBlob(accessToken, folderId, name, blob, mimeType) {
  const boundary = `tha_${Date.now()}`;
  const metadata = { name, parents: [folderId] };
  const body = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
    blob,
    `\r\n--${boundary}--`
  ], { type: `multipart/related; boundary=${boundary}` });
  return driveFetch(accessToken, 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body
  });
}
function uploadDriveJson(accessToken, folderId, name, data) {
  return uploadDriveBlob(accessToken, folderId, name, new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'application/json');
}
function uploadDriveHtml(accessToken, folderId, name, html) {
  return uploadDriveBlob(accessToken, folderId, name, new Blob([html], { type: 'text/html' }), 'text/html');
}
async function getDriveFileInfo(accessToken, fileId) {
  return driveFetch(accessToken, `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink`);
}
function driveSectionFlow(sections = []) {
  return sections.map((section, index) => ({
    order: index + 1,
    key: section.key,
    label: section.label,
    roomType: section.roomType || section.label,
    roomName: section.roomName || section.label
  }));
}
async function findOrCreateDrivePhotoFolder(accessToken, { client }) {
  const rootId = await findOrCreateDriveFolder(accessToken, 'THA Clients');
  const incomingId = await findOrCreateDriveFolder(accessToken, '_HTC PMR Incoming', rootId);
  const packageId = await findOrCreateDriveFolder(accessToken, drivePackageFolderName(client), incomingId);
  return findOrCreateDriveFolder(accessToken, 'Photos', packageId);
}
async function uploadDrivePhoto(accessToken, folderId, photo, fallbackName) {
  const blob = dataUrlToBlob(photo.dataUrl);
  const extension = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const baseName = cleanDriveName(fallbackName || photo.name || 'photo');
  const fileName = `${baseName}.${extension}`;
  const uploaded = await uploadDriveBlob(accessToken, folderId, fileName, blob, blob.type);
  return {
    uploadStatus: PHOTO_UPLOAD_STATUS.UPLOADED,
    driveFileId: uploaded.id || '',
    driveFileName: uploaded.name || fileName,
    driveViewLink: uploaded.webViewLink || '',
    webViewLink: uploaded.webViewLink || '',
    uploadedAt: new Date().toISOString(),
    dataUrl: ''
  };
}
function buildDrivePayload({ walkthroughName = '', client, intake, rows, pmr, dynamicRooms = [], sections = [], sectionOrderState = [], itemOrderState = {}, pinnedItems = {}, roomCapture = {} }) {
  return { walkthroughName, client, intake, dynamicRooms, roomCapture, sectionFlow: driveSectionFlow(sections), sectionOrder: sectionOrderState, itemOrder: itemOrderState, pinnedItems, rows, pmr, exportedAt: new Date().toISOString() };
}

const INTAKE_EXPORT_FIELDS = [
  ['Priorities', intake => (intake.priorities || []).join(', ')],
  ['Preferred Pace', 'pace'], ['Budget Mindset', 'budgetStyle'], ['Decision Style', 'decisionStyle'], ['Homeowner Goals / Priorities', 'notes'],
  ['Electrical Panel Location', 'electricalPanel'], ['Known Electrical Issues or Updates', 'electricalUpdates'],
  ['Main Water Shut-off Location', 'waterShutoff'], ['Known Leaks, Slow Drains, or Plumbing History', 'plumbingHistory'], ['Water Heater Flush / Age', 'waterHeater'], ['Sewer / Irrigation History', 'sewerIrrigation'],
  ['Furnace Filter Replacement', 'hvacFilter'], ['Furnace Service History / Age', 'hvacService'], ['A/C Service History / Age', 'hvacAcService'], ['Comfort Notes', 'comfort'],
  ['Roof Age', 'roofAge'], ['Roof History', 'roofHistory'], ['Solar Context', 'solar'], ['Drainage / Pooling', 'drainagePooling'], ['Drainage History', 'drainageHistory'], ['Gutters / Downspouts', 'gutters'],
  ['Windows / Doors', 'windowsDoors'], ['Fogging / Failed Seals', 'fogging'], ['Paint / Stain Timing', 'paintStain'], ['Products / Colors', 'productsColors'],
  ['Pests', 'pests'], ['Fire Extinguishers', 'fireExtinguishers'], ['Smoke / CO Detectors', 'smokeCO'], ['Chimney / Fireplace', 'chimney'], ['Additional Concerns', 'additionalConcerns']
];

function reportShell(title, client, body) {
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${htmlEscape(title)}</title><style>
    :root{--navy:#0b3658;--gold:#bf8420;--cream:#f6efe3;--ink:#203040;--muted:#65727d;--line:#d9cbb4;--soft:#edf3f6;--green:#dfeedd;--red:#f5d7d3;--yellow:#fff1c6}
    body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,Segoe UI,Arial,sans-serif;line-height:1.45} main{max-width:1120px;margin:0 auto;padding:22px}
    header{background:#fff;border-bottom:6px solid var(--gold);padding:24px;border-radius:0 0 24px 24px} h1{color:var(--navy);font-size:34px;margin:0 0 8px} h2{color:var(--navy);border-bottom:1px solid var(--line);padding-bottom:7px} h3{color:var(--navy);margin-bottom:4px}
    .meta{color:var(--muted);font-weight:700}.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px;margin:16px 0;box-shadow:0 8px 22px rgba(13,44,73,.08)}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.stat{background:var(--soft);border-radius:14px;padding:14px;text-align:center}.stat strong{font-size:30px;color:var(--navy);display:block}.pill{display:inline-block;border-radius:999px;background:var(--soft);padding:4px 9px;font-weight:800}.high{background:var(--red)}.medium{background:var(--yellow)}.low{background:var(--green)}
    table{width:100%;border-collapse:collapse;background:#fff} th,td{border:1px solid var(--line);padding:8px;text-align:left;vertical-align:top} th{background:var(--navy);color:#fff} tr:nth-child(even) td{background:#fbf7ef} a{color:#0b5cad;font-weight:700} .small{font-size:12px;color:var(--muted)} ul{padding-left:20px}
    @media(max-width:720px){main{padding:12px}header{border-radius:0}table{font-size:13px}th,td{padding:6px}}
  </style></head><body><header><h1>${htmlEscape(title)}</h1><div class="meta">${htmlText(client.name, 'Client name not recorded')} · ${htmlText(client.address, 'Project address not recorded')} · ${htmlText(client.date, 'Walkthrough date / visit label not recorded')}</div></header><main>${body}</main></body></html>`;
}
function tableRows(items, columns) {
  return items.map(item => `<tr>${columns.map(col => `<td>${typeof col.value === 'function' ? col.value(item) : htmlText(item[col.value])}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${columns.length}">Nothing recorded.</td></tr>`;
}
function photoEntriesForPayload(payload, uploadedLookup = {}) {
  const sectionLookup = Object.fromEntries((payload.sectionFlow || []).map(section => [section.key, section]));
  const entries = [];
  Object.entries(payload.roomCapture || {}).forEach(([sectionKey, capture]) => {
    const section = sectionLookup[sectionKey] || {};
    photoList(capture).forEach((photo, index) => {
      const uploaded = uploadedLookup[`room:${sectionKey}:${photo.id}`] || {};
      const room = section.roomName || section.label || sectionKey || 'Room';
      entries.push({ key: `room:${sectionKey}:${photo.id}`, room, item: 'Room Overview', label: photo.label || 'Overview', originalName: photo.name || `overview-${index + 1}`, driveFileName: uploaded.driveFileName || photo.driveFileName || '', driveViewLink: uploaded.driveViewLink || photo.driveViewLink || photo.webViewLink || '', countLabel: photo.label || 'Overview' });
    });
  });
  (payload.rows || []).forEach(row => {
    photoList(row.answer).forEach((photo, index) => {
      const uploaded = uploadedLookup[`item:${row.id}:${photo.id}`] || {};
      entries.push({ key: `item:${row.id}:${photo.id}`, room: row.roomName || row.room || 'Room', item: row.item || 'Checklist Item', label: photo.label || 'Photo', originalName: photo.name || `photo-${index + 1}`, driveFileName: uploaded.driveFileName || photo.driveFileName || '', driveViewLink: uploaded.driveViewLink || photo.driveViewLink || photo.webViewLink || '', relatedStatus: row.answer?.status || '' });
    });
  });
  return entries;
}
function buildPmrReportHtml(payload, photoEntries = []) {
  const counts = { high: payload.pmr.filter(r=>priority(r.answer.status)==='High').length, med: payload.pmr.filter(r=>priority(r.answer.status)==='Medium').length, low: payload.pmr.filter(r=>priority(r.answer.status)==='Low').length };
  const quickHits = payload.pmr.filter(r => ['Handyman','Safety'].includes(r.answer.trade) && ['15 min','30 min','45–60 min','1–2 hrs'].includes(r.answer.effort));
  const pass = (payload.rows || []).filter(r => r.answer?.passCandidate);
  const reviewedIntakeNotes = (payload.rows || []).filter(r => isIntakeFollowUp(r) && r.answer.reviewStatus && r.answer.reviewStatus !== 'Not Reviewed' && r.answer.reviewStatus !== INTAKE_PMR_REVIEW_STATUS);
  const photoCountFor = row => photoEntries.filter(entry => entry.item === row.item && entry.room === (row.roomName || row.room)).length;
  const body = `<section class="card"><h2>Home Health Snapshot / Summary</h2><div class="grid"><div class="stat high"><strong>${counts.high}</strong>Immediate</div><div class="stat medium"><strong>${counts.med}</strong>Near-Term</div><div class="stat low"><strong>${counts.low}</strong>Monitor</div><div class="stat"><strong>${payload.pmr.length}</strong>PMR Findings</div></div><p>${htmlText(payload.intake?.notes, 'No homeowner summary notes recorded.')}</p></section>
    <section class="card"><h2>Handy Next Steps</h2><ul>${quickHits.map(r=>`<li><strong>${htmlEscape(r.roomName || r.room)} — ${htmlEscape(r.item)}</strong>: ${htmlEscape(displayTradeLabel(r.answer.trade))} · ${htmlEscape(r.answer.effort)} · ${htmlEscape(actionCertaintyFor(r.answer))}</li>`).join('') || '<li>No quick-hit Handy Next Steps recorded.</li>'}</ul></section>
    <section class="card"><h2>Priority Action Plan</h2>${payload.pmr.map(r=>{ const certainty = actionCertaintyCopy(r); return `<article><h3>${htmlEscape(r.roomName || r.room)} — ${htmlEscape(r.item)}</h3><p><span class="pill ${priority(r.answer.status).toLowerCase()}">${htmlEscape(priority(r.answer.status))}</span> ${htmlEscape(r.answer.status)} · ${htmlEscape(displayTradeLabel(r.answer.trade))} · ${htmlEscape(certainty.label)}</p><ul><li><strong>What we saw:</strong> ${htmlText(r.answer.notes, 'No additional notes recorded yet.')}</li><li><strong>Why it matters:</strong> ${htmlText(r.why)}</li><li><strong>${htmlEscape(certainty.title)}:</strong> ${htmlText(certainty.body)}</li><li><strong>Next step language:</strong> ${htmlText(certainty.next)}</li><li><strong>Timing / pace:</strong> ${htmlEscape(timingFor(r, r.answer.status))} · ${htmlEscape(r.answer.pref)}</li><li><strong>Approx. time:</strong> ${htmlEscape(r.answer.effort)}</li><li><strong>Photos:</strong> ${photoCountFor(r)} linked in Photo Index</li></ul></article>`}).join('') || '<p>No PMR findings recorded.</p>'}</section>
    <section class="card"><h2>PASS — Continued Home Care</h2><ul>${pass.map(r=>`<li><strong>${htmlEscape(r.item)}</strong>: ${htmlEscape(r.answer.passCadence || r.frequency || 'As Needed')} · ${htmlEscape(r.answer.passResource || displayTradeLabel(r.answer.trade))}${r.answer.passNote ? ` · ${htmlEscape(r.answer.passNote)}` : ''}</li>`).join('') || '<li>No PASS candidates recorded.</li>'}</ul></section>
    <section class="card"><h2>Intake Follow-Up Review Notes / Appendix</h2><ul>${reviewedIntakeNotes.map(r=>`<li><strong>${htmlEscape(r.roomName || r.room)} — ${htmlEscape(r.item)}</strong>: ${htmlEscape(r.answer.reviewStatus)} · ${htmlEscape(r.intakeFieldLabel)}: ${htmlText(r.intakeValue)}</li>`).join('') || '<li>No reviewed intake follow-up appendix notes recorded.</li>'}</ul></section>`;
  return reportShell('01 - PMR Report', payload.client, body);
}
function buildHtcChecklistHtml(payload, photoEntries = []) {
  const rows = (payload.rows || []).map(row => ({ ...row, photoEntries: photoEntries.filter(entry => entry.item === row.item && entry.room === (row.roomName || row.room)) }));
  const columns = [
    { value: r => htmlText(r.roomName || r.room) }, { value: r => htmlText(r.item) }, { value: r => htmlText(r.answer.status) }, { value: r => htmlText(r.answer.notes, '') },
    { value: r => htmlText(displayTradeLabel(r.answer.trade)) }, { value: r => htmlText(r.answer.pref) }, { value: r => htmlText(actionCertaintyFor(r.answer)) }, { value: r => htmlText(r.answer.effort) },
    { value: r => r.answer.passCandidate ? 'Yes' : 'No' }, { value: r => r.photoEntries.length ? `${r.photoEntries.length}: ${r.photoEntries.map(p=>htmlEscape(p.driveFileName || p.originalName)).join('<br/>')}` : '0' }
  ];
  const body = `<section class="card"><h2>HTC Checklist</h2><table><thead><tr><th>Room / Section</th><th>Checklist Item</th><th>Status</th><th>Notes</th><th>Suggested Trade / Resource</th><th>Homeowner Pace</th><th>Action Certainty</th><th>Approx. Time</th><th>PASS Candidate</th><th>Photos</th></tr></thead><tbody>${tableRows(rows, columns)}</tbody></table></section>`;
  return reportShell('02 - HTC Checklist', payload.client, body);
}
function buildIntakeSummaryHtml(payload) {
  const rows = INTAKE_EXPORT_FIELDS.map(([label, key]) => ({ label, value: typeof key === 'function' ? key(payload.intake || {}) : (payload.intake || {})[key] }));
  const body = `<section class="card"><h2>Homeowner Context From Intake</h2><table><thead><tr><th>Topic</th><th>Homeowner Context</th></tr></thead><tbody>${tableRows(rows, [{value:r=>htmlText(r.label)}, {value:r=>htmlText(r.value, '')}])}</tbody></table></section>`;
  return reportShell('03 - Intake Summary', payload.client, body);
}
function buildPhotoIndexHtml(payload, photoEntries = []) {
  const grouped = photoEntries.reduce((acc, entry) => { const room = entry.room || 'Room'; acc[room] = [...(acc[room] || []), entry]; return acc; }, {});
  const sections = Object.entries(grouped).map(([room, entries]) => `<section class="card"><h2>${htmlEscape(room)}</h2><table><thead><tr><th>Photo Label</th><th>Related Checklist Item / Overview</th><th>Drive File Name</th><th>Drive Link</th></tr></thead><tbody>${tableRows(entries, [{value:e=>htmlText(e.label)}, {value:e=>htmlText(e.item)}, {value:e=>htmlText(e.driveFileName || flatPhotoDriveName({room:e.room,item:e.item,label:e.label,originalName:e.originalName}))}, {value:e=>e.driveViewLink ? `<a href="${htmlEscape(e.driveViewLink)}">Open photo</a>` : 'Link not available'}])}</tbody></table></section>`).join('') || '<section class="card"><p>No photos recorded.</p></section>';
  return reportShell('04 - Photo Index', payload.client, sections);
}
async function uploadDriveBundle(accessToken, payload) {
  const rootId = await findOrCreateDriveFolder(accessToken, 'THA Clients');
  const incomingId = await findOrCreateDriveFolder(accessToken, '_HTC PMR Incoming', rootId);
  const packageFolderName = drivePackageFolderName(payload.client);
  const packageId = await findOrCreateDriveFolder(accessToken, packageFolderName, incomingId);
  const photosId = await findOrCreateDriveFolder(accessToken, 'Photos', packageId);
  const backupId = await findOrCreateDriveFolder(accessToken, 'Backup Data', packageId);
  const uploadedLookup = {};
  const sectionLookup = Object.fromEntries((payload.sectionFlow || []).map(section => [section.key, section]));

  for (const [sectionKey, capture] of Object.entries(payload.roomCapture || {})) {
    const section = sectionLookup[sectionKey] || {};
    const room = section.roomName || section.label || sectionKey || 'Room';
    const photos = photoList(capture).filter(photo => photo.dataUrl);
    for (const photo of photos) {
      const fileName = flatPhotoDriveName({ room, item: 'Overview', label: photo.label || 'Overview', originalName: photo.name });
      const blob = dataUrlToBlob(photo.dataUrl);
      const uploaded = await uploadDriveBlob(accessToken, photosId, fileName, blob, blob.type || 'image/jpeg');
      uploadedLookup[`room:${sectionKey}:${photo.id}`] = { driveFileName: uploaded.name || fileName, driveViewLink: uploaded.webViewLink || '' };
    }
  }
  for (const row of payload.rows) {
    const room = row.roomName || row.room || 'Room';
    const photos = photoList(row.answer).filter(photo => photo.dataUrl);
    for (const photo of photos) {
      const fileName = flatPhotoDriveName({ room, item: row.item || 'Checklist Item', label: photo.label || 'Photo', originalName: photo.name });
      const blob = dataUrlToBlob(photo.dataUrl);
      const uploaded = await uploadDriveBlob(accessToken, photosId, fileName, blob, blob.type || 'image/jpeg');
      uploadedLookup[`item:${row.id}:${photo.id}`] = { driveFileName: uploaded.name || fileName, driveViewLink: uploaded.webViewLink || '' };
    }
  }

  const photoEntries = photoEntriesForPayload(payload, uploadedLookup);
  await uploadDriveHtml(accessToken, packageId, '01 - PMR Report.html', buildPmrReportHtml(payload, photoEntries));
  await uploadDriveHtml(accessToken, packageId, '02 - HTC Checklist.html', buildHtcChecklistHtml(payload, photoEntries));
  await uploadDriveHtml(accessToken, packageId, '03 - Intake Summary.html', buildIntakeSummaryHtml(payload));
  await uploadDriveHtml(accessToken, packageId, '04 - Photo Index.html', buildPhotoIndexHtml(payload, photoEntries));
  await uploadDriveJson(accessToken, backupId, 'intake.json', { client: payload.client, intake: payload.intake });
  await uploadDriveJson(accessToken, backupId, 'htc-walkthrough.json', { client: payload.client, roomCapture: payload.roomCapture || {}, rows: payload.rows });
  await uploadDriveJson(accessToken, backupId, 'pmr-data.json', { client: payload.client, intake: payload.intake, pmr: payload.pmr });
  await uploadDriveJson(accessToken, backupId, 'full-walkthrough-export.json', payload);
  const folderInfo = await getDriveFileInfo(accessToken, packageId).catch(() => ({ id: packageId, name: packageFolderName, webViewLink: driveFolderUrl(packageId) }));
  return { folderId: packageId, folderName: folderInfo.name || packageFolderName, folderLink: folderInfo.webViewLink || driveFolderUrl(packageId) };
}
function safeJsonParse(value, fallback) {
  try {
    const parsed = JSON.parse(value || 'null');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function isQuotaExceededError(error) {
  return error?.name === 'QuotaExceededError' || error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error?.code === 22 || error?.code === 1014;
}
function safeLocalStorageSet(key, value, onFailure) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    const message = isQuotaExceededError(error)
      ? PHOTO_AUTOSAVE_FAILURE_MESSAGE
      : 'This browser blocked saving. Download a backup before leaving the walkthrough.';
    onFailure?.(message, error);
    return false;
  }
}
function safeLocalStorageRemove(key, onFailure) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    onFailure?.('This browser blocked saving changes to local storage.', error);
    return false;
  }
}
function canvasToBlob(canvas, type, quality) {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Unable to read compressed photo.'));
    reader.readAsDataURL(blob);
  });
}
function loadImageFromFile(file) {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Photo could not be opened.'));
    };
    img.src = url;
  });
}
async function compressPhotoFile(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Only image files can be added.');
  const image = await loadImageFromFile(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) throw new Error('Photo dimensions could not be read.');
  const scale = Math.min(1, PHOTO_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Photo processing is unavailable in this browser.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const preferredType = file.type === 'image/png' ? 'image/jpeg' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, preferredType, PHOTO_QUALITY);
  if (!blob) throw new Error('Photo compression failed.');
  const thumbnailScale = Math.min(1, PHOTO_THUMBNAIL_MAX_DIMENSION / Math.max(canvas.width, canvas.height));
  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = Math.max(1, Math.round(canvas.width * thumbnailScale));
  thumbCanvas.height = Math.max(1, Math.round(canvas.height * thumbnailScale));
  const thumbContext = thumbCanvas.getContext('2d');
  if (!thumbContext) throw new Error('Photo thumbnail processing is unavailable in this browser.');
  thumbContext.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
  const thumbnailBlob = await canvasToBlob(thumbCanvas, preferredType, PHOTO_THUMBNAIL_QUALITY);
  const dataUrl = await blobToDataUrl(blob);
  const thumbnailDataUrl = thumbnailBlob ? await blobToDataUrl(thumbnailBlob) : dataUrl;
  return {
    dataUrl,
    thumbnailDataUrl,
    type: blob.type || preferredType,
    compressed: scale < 1 || blob.size < file.size,
    originalSize: file.size,
    compressedSize: blob.size
  };
}
async function buildCompressedPhoto(file, { label, idPrefix }) {
  const processed = await compressPhotoFile(file);
  return {
    photo: {
      id: `${idPrefix}-${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      type: processed.type,
      label,
      dataUrl: processed.dataUrl,
      thumbnailDataUrl: processed.thumbnailDataUrl,
      uploadStatus: PHOTO_UPLOAD_STATUS.LOCAL,
      driveFileId: '',
      driveFileName: '',
      driveViewLink: '',
      webViewLink: '',
      uploadedAt: ''
    },
    compressed: processed.compressed
  };
}
function hasPhotoDataUrlsInAnswers(answers = {}) {
  return Object.values(answers || {}).some(answer => Array.isArray(answer?.photos) && answer.photos.some(photo => photo?.dataUrl));
}
function hasPhotoDataUrlsInRoomCapture(roomCapture = {}) {
  return Object.values(roomCapture || {}).some(capture => Array.isArray(capture?.photos) && capture.photos.some(photo => photo?.dataUrl));
}
function hasVisiblePhotoDataUrls(answers = {}, roomCapture = {}) {
  return hasPhotoDataUrlsInAnswers(answers) || hasPhotoDataUrlsInRoomCapture(roomCapture);
}
function pruneDuplicateLegacyWalkthroughKeys() {
  DUPLICATE_LEGACY_WALKTHROUGH_KEYS.forEach(key => safeLocalStorageRemove(key));
}
function saveStatusText(saveStatus, hasUnsavedVisiblePhotos = false) {
  if (saveStatus.state === 'saving') return 'Autosaving…';
  if (saveStatus.state === 'saved') return saveStatus.time && saveStatus.time !== 'loaded' ? `Autosaved at ${saveStatus.time}` : 'Autosaved just now';
  if (saveStatus.state === 'failed') return hasUnsavedVisiblePhotos ? PHOTO_AUTOSAVE_FAILURE_MESSAGE : 'Autosave failed — download backup';
  if (hasUnsavedVisiblePhotos) return 'Photo visible — autosave pending';
  return 'Unsaved changes';
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}
function blankIntakeTemplate() {
  return Object.fromEntries(Object.entries(INTAKE_DEFAULTS).map(([key, value]) => [key, Array.isArray(value) ? [] : '']));
}
function cleanWalkthroughData() {
  return {
    client: { name: '', address: '', date: '' },
    answers: {},
    intake: blankIntakeTemplate(),
    dynamicRooms: cloneData(DEFAULT_DYNAMIC_ROOMS),
    sectionOrder: [],
    itemOrder: {},
    pinnedItems: {},
    roomCapture: {}
  };
}
function legacyWalkthroughData() {
  const dynamicRooms = safeJsonParse(localStorage.getItem(DYNAMIC_ROOMS_KEY), null);
  return {
    client: safeJsonParse(localStorage.getItem(LEGACY_CLIENT_KEY), { name: 'Christine & Matt', address: 'Sample Home', date: '2026-04 Walkthrough' }),
    answers: safeJsonParse(localStorage.getItem(LEGACY_ANSWERS_KEY), null) || sampleAnswers,
    intake: safeJsonParse(localStorage.getItem(LEGACY_INTAKE_KEY), null) || INTAKE_DEFAULTS,
    dynamicRooms: Array.isArray(dynamicRooms) ? dynamicRooms : DEFAULT_DYNAMIC_ROOMS,
    sectionOrder: safeJsonParse(localStorage.getItem(SECTION_ORDER_KEY), []),
    itemOrder: safeJsonParse(localStorage.getItem(ITEM_ORDER_KEY), {}),
    pinnedItems: safeJsonParse(localStorage.getItem(PINNED_ITEMS_KEY), {}),
    roomCapture: safeJsonParse(localStorage.getItem(ROOM_CAPTURE_KEY), {})
  };
}
function readWalkthroughSessions() {
  const saved = safeJsonParse(localStorage.getItem(WALKTHROUGH_SESSIONS_KEY), {});
  return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
}
function initialWalkthroughState() {
  const sessions = readWalkthroughSessions();
  const activeId = localStorage.getItem(CURRENT_WALKTHROUGH_ID_KEY) || '';
  const activeSession = activeId ? sessions[activeId] : null;
  if (activeSession?.data) {
    return {
      data: { ...cleanWalkthroughData(), ...activeSession.data },
      sessions,
      activeId,
      selectedId: activeId,
      name: activeSession.name || 'Untitled Walkthrough'
    };
  }
  return {
    data: legacyWalkthroughData(),
    sessions,
    activeId: '',
    selectedId: '',
    name: 'Current Walkthrough'
  };
}

function App() {
  const [initialState] = useState(() => initialWalkthroughState());
  const [savedSessions, setSavedSessions] = useState(initialState.sessions);
  const [activeWalkthroughId, setActiveWalkthroughId] = useState(initialState.activeId);
  const [selectedWalkthroughId, setSelectedWalkthroughId] = useState(initialState.selectedId);
  const [walkthroughName, setWalkthroughName] = useState(initialState.name);
  const [client, setClient] = useState(initialState.data.client);
  const [answers, setAnswers] = useState(initialState.data.answers);
  const [intake, setIntake] = useState(initialState.data.intake);
  const [dynamicRooms, setDynamicRooms] = useState(initialState.data.dynamicRooms);
  const [activeRoom, setActiveRoom] = useState(sectionOrder[0] || 'Kitchen');
  const [view, setView] = useState('intake');
  const [driveToken, setDriveToken] = useState('');
  const [driveClientId, setDriveClientId] = useState(() => localStorage.getItem(DRIVE_CLIENT_ID_KEY) || localStorage.getItem(LEGACY_GOOGLE_CLIENT_ID_KEY) || '');
  const [useDriveClientIdOverride, setUseDriveClientIdOverride] = useState(() => localStorage.getItem(DRIVE_CLIENT_ID_OVERRIDE_KEY) === 'true');
  const [driveMeta, setDriveMeta] = useState(() => ({ lastSaved: '', lastStatus: '', lastStatusTone: '', lastError: '', lastErrorDetails: '', lastFolderName: '', lastFolderLink: '', hasConnected: false, ...(safeJsonParse(localStorage.getItem(DRIVE_META_KEY), null) || {}) }));
  const [pendingCount, setPendingCount] = useState(() => safeJsonParse(localStorage.getItem(DRIVE_QUEUE_KEY), []).length);
  const [driveBusy, setDriveBusy] = useState(false);
  const [sectionOrderState, setSectionOrderState] = useState(initialState.data.sectionOrder);
  const [itemOrderState, setItemOrderState] = useState(initialState.data.itemOrder);
  const [pinnedItems, setPinnedItems] = useState(initialState.data.pinnedItems);
  const [roomCapture, setRoomCapture] = useState(initialState.data.roomCapture);
  const [roomItemFormOpen, setRoomItemFormOpen] = useState(false);
  const [roomItemDraft, setRoomItemDraft] = useState(EMPTY_ROOM_ITEM_DRAFT);
  const [dragSectionKey, setDragSectionKey] = useState('');
  const [photoFeedback, setPhotoFeedback] = useState({ state: '', message: '' });
  const [copyFeedback, setCopyFeedback] = useState('');
  const [storageWarning, setStorageWarning] = useState('');
  const [saveStatus, setSaveStatus] = useState({ state: 'saved', time: initialState.activeId ? 'loaded' : '' });
  const autosaveReadyRef = useRef(false);
  const forceDriveConsentRef = useRef(false);
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const applyStorageFailure = (message) => {
    setStorageWarning(hasVisiblePhotoDataUrls(answers, roomCapture) ? PHOTO_AUTOSAVE_FAILURE_MESSAGE : message);
    setSaveStatus({ state: 'failed', time: '' });
  };
  useEffect(()=>{
    const trimmedClientId = driveClientId.trim();
    if (trimmedClientId) {
      safeLocalStorageSet(DRIVE_CLIENT_ID_KEY, trimmedClientId, applyStorageFailure);
      safeLocalStorageRemove(LEGACY_GOOGLE_CLIENT_ID_KEY, applyStorageFailure);
    } else {
      safeLocalStorageRemove(DRIVE_CLIENT_ID_KEY, applyStorageFailure);
      safeLocalStorageRemove(LEGACY_GOOGLE_CLIENT_ID_KEY, applyStorageFailure);
    }
  }, [driveClientId]);
  useEffect(()=>{ safeLocalStorageSet(DRIVE_META_KEY, JSON.stringify(driveMeta), applyStorageFailure); }, [driveMeta]);
  useEffect(()=>{
    if (useDriveClientIdOverride) safeLocalStorageSet(DRIVE_CLIENT_ID_OVERRIDE_KEY, 'true', applyStorageFailure);
    else safeLocalStorageRemove(DRIVE_CLIENT_ID_OVERRIDE_KEY, applyStorageFailure);
  }, [useDriveClientIdOverride]);
  useEffect(()=>{
    if (activeWalkthroughId) safeLocalStorageSet(CURRENT_WALKTHROUGH_ID_KEY, activeWalkthroughId, applyStorageFailure);
    else safeLocalStorageRemove(CURRENT_WALKTHROUGH_ID_KEY, applyStorageFailure);
  }, [activeWalkthroughId]);
  const baseSections = useMemo(() => {
    const list = [];
    sectionOrder.forEach(room => {
      if (room === 'Kitchen') {
        list.push({ key: room, label: room, rows: buildStaticSectionRows(room) });
        dynamicRooms.filter(x => x.roomType === 'Living / Family Rooms').forEach(roomConfig => list.push({ key: roomConfig.id, label: roomConfig.roomName, roomType: roomConfig.roomType, roomName: roomConfig.roomName, rows: buildDynamicRoomRows(roomConfig) }));
        return;
      }
      if (room === 'Bedroom') {
        dynamicRooms.filter(x => x.roomType === 'Bedrooms').forEach(roomConfig => list.push({ key: roomConfig.id, label: roomConfig.roomName, roomType: roomConfig.roomType, roomName: roomConfig.roomName, rows: buildDynamicRoomRows(roomConfig) }));
        return;
      }
      if (room === 'Bathroom') {
        dynamicRooms.filter(x => x.roomType === 'Bathrooms').forEach(roomConfig => list.push({ key: roomConfig.id, label: roomConfig.roomName, roomType: roomConfig.roomType, roomName: roomConfig.roomName, rows: buildDynamicRoomRows(roomConfig) }));
        return;
      }
      if (!DYNAMIC_TEMPLATE_ROOMS.includes(room)) list.push({ key: room, label: room, rows: buildStaticSectionRows(room) });
    });
    return list;
  }, [dynamicRooms]);
  const intakeFollowUpRows = useMemo(() => buildIntakeFollowUpRows(intake), [intake]);
  const sections = useMemo(() => {
    const allSections = intakeFollowUpRows.length ? [...baseSections, { key: INTAKE_FOLLOW_UP_SECTION_KEY, label: INTAKE_FOLLOW_UP_SOURCE, rows: intakeFollowUpRows }] : baseSections;
    return orderedSectionList(allSections.map(section => ({
      ...section,
      rows: section.key === INTAKE_FOLLOW_UP_SECTION_KEY ? section.rows : orderSectionRows(section.rows, itemOrderState[section.key], pinnedItems[section.key] || [])
    })), sectionOrderState);
  }, [baseSections, intakeFollowUpRows, sectionOrderState, itemOrderState, pinnedItems]);
  const rooms = sections;
  const checklistItems = useMemo(() => sections.flatMap(section => section.rows), [sections]);
  const itemById = useMemo(() => Object.fromEntries(checklistItems.map(item => [item.id, item])), [checklistItems]);
  const rows = checklistItems.map(item => ({...item, answer: normalizeAnswer(answers[item.id], item)}));
  useEffect(() => {
    if (!sections.some(section => section.key === activeRoom)) setActiveRoom(sections[0]?.key || '');
  }, [sections, activeRoom]);
  const pmr = rows.filter(includePMRRow);
  const intakeReviewRows = rows.filter(isIntakeFollowUp);
  const unreviewedIntakeRows = intakeReviewRows.filter(r => r.answer.reviewStatus === 'Not Reviewed');
  const reviewedIntakeNotes = intakeReviewRows.filter(r => r.answer.reviewStatus && r.answer.reviewStatus !== 'Not Reviewed' && r.answer.reviewStatus !== INTAKE_PMR_REVIEW_STATUS);
  const counts = { high: pmr.filter(r=>priority(r.answer.status)==='High').length, med: pmr.filter(r=>priority(r.answer.status)==='Medium').length, low: pmr.filter(r=>priority(r.answer.status)==='Low').length };
  const quickHits = pmr.filter(r => ['Handyman','Safety'].includes(r.answer.trade) && ['15 min','30 min','45–60 min','1–2 hrs'].includes(r.answer.effort));
  const pass = rows.filter(r => r.answer.passCandidate);
  const pendingPhotoCount = pendingPhotoUploadCount(answers, roomCapture);
  const hasAppDriveClientId = Boolean(APP_GOOGLE_OAUTH_CLIENT_ID);
  const manualDriveClientId = driveClientId.trim();
  const usingManualDriveOverride = hasAppDriveClientId && useDriveClientIdOverride && Boolean(manualDriveClientId);
  const effectiveDriveClientId = usingManualDriveOverride ? manualDriveClientId : (APP_GOOGLE_OAUTH_CLIENT_ID || manualDriveClientId);
  const driveConfigured = Boolean(effectiveDriveClientId);
  const driveSessionExpired = Boolean(driveMeta.lastError && driveErrorMessage({ message: driveMeta.lastError }).includes('session expired'));
  const driveConfiguredMessage = hasAppDriveClientId && !usingManualDriveOverride
    ? 'Drive configured for this app.'
    : 'Drive is configured on this browser. Connect before exporting.';
  const driveStatusMessage = driveSessionExpired
    ? 'Drive session expired — reconnect to export.'
    : driveMeta.lastSaved
      ? `Readable Drive package saved at ${driveMeta.lastSaved}.`
      : driveToken
        ? 'Drive connected — ready to export.'
        : driveConfigured
          ? driveConfiguredMessage
          : 'Drive is not configured. Add the OAuth Client ID in Drive Setup Help or use Download Emergency Backup.';
  const driveWarningText = driveMeta.lastSaved
    ? 'Drive export is active. Download Emergency Backup is still recommended as a safety copy.'
    : driveToken
      ? 'Drive connected — ready to export.'
      : hasAppDriveClientId && !usingManualDriveOverride
        ? 'Drive is configured for this app. Connect Google Drive before exporting.'
        : driveConfigured
          ? 'Drive is configured. Connect Google Drive before exporting.'
          : 'Drive is not configured. Add the OAuth Client ID in Drive Setup Help or use Download Emergency Backup.';
  const driveClientIdSourceLabel = usingManualDriveOverride ? 'Manual override on this browser' : (hasAppDriveClientId ? 'App configuration' : 'Manual browser setup');
  const updateDriveClientId = (value) => {
    setDriveClientId(value);
    if (value.trim()) {
      setDriveMeta(meta => meta.lastError === 'Missing Client ID — paste a Google OAuth Client ID before connecting Drive.' ? {...meta, lastError: '', lastErrorDetails: ''} : meta);
    } else {
      setDriveToken('');
    }
  };
  const resetDriveSetup = () => {
    setDriveClientId('');
    setDriveToken('');
    setPendingCount(0);
    forceDriveConsentRef.current = true;
    safeLocalStorageRemove(DRIVE_CLIENT_ID_KEY, applyStorageFailure);
    safeLocalStorageRemove(DRIVE_CLIENT_ID_OVERRIDE_KEY, applyStorageFailure);
    safeLocalStorageRemove(LEGACY_GOOGLE_CLIENT_ID_KEY, applyStorageFailure);
    safeLocalStorageRemove(DRIVE_META_KEY, applyStorageFailure);
    safeLocalStorageSet(DRIVE_QUEUE_KEY, '[]', applyStorageFailure);
    setUseDriveClientIdOverride(false);
    setDriveMeta({ lastSaved: '', lastStatus: '', lastStatusTone: '', lastError: '', lastErrorDetails: '', lastFolderName: '', lastFolderLink: '', hasConnected: false });
    setCopyFeedback('Drive setup reset on this browser');
    window.setTimeout(() => setCopyFeedback(''), 2500);
  };
  const roomCaptureFor = (sectionKey) => ({
    status: roomCapture?.[sectionKey]?.status || ROOM_STATUS_OPTIONS[0],
    note: roomCapture?.[sectionKey]?.note || '',
    photos: photoList(roomCapture?.[sectionKey]).map(photo => ({ ...photo, label: photo.label || 'Overview' })),
    items: Array.isArray(roomCapture?.[sectionKey]?.items) ? roomCapture[sectionKey].items.map(item => ({
      id: item.id || `room-item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: item.title || '',
      bucket: item.bucket || 'watch_item',
      isDiscovery: Boolean(item.isDiscovery),
      notes: item.notes || '',
      createdAt: item.createdAt || ''
    })) : []
  });
  const updateRoomCapture = (sectionKey, patch) => setRoomCapture(prev => ({ ...prev, [sectionKey]: { ...roomCaptureFor(sectionKey), ...patch } }));
  const roomItemBucketLabel = (bucket) => ROOM_ITEM_BUCKETS.find(option => option.value === bucket)?.label || bucket;
  const updateRoomItemDraft = (patch) => setRoomItemDraft(prev => ({ ...prev, ...patch }));
  const openRoomItemForm = () => {
    setRoomItemDraft(EMPTY_ROOM_ITEM_DRAFT);
    setRoomItemFormOpen(true);
  };
  const cancelRoomItemForm = () => {
    setRoomItemDraft(EMPTY_ROOM_ITEM_DRAFT);
    setRoomItemFormOpen(false);
  };
  const saveRoomItem = () => {
    const title = roomItemDraft.title.trim();
    if (!title) return;
    const current = roomCaptureFor(activeRoom);
    updateRoomCapture(activeRoom, {
      items: [
        ...current.items,
        {
          id: `room-item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          title,
          bucket: roomItemDraft.bucket,
          isDiscovery: roomItemDraft.isDiscovery,
          notes: roomItemDraft.notes.trim(),
          createdAt: new Date().toISOString()
        }
      ]
    });
    cancelRoomItemForm();
  };
  const removeRoomItem = (sectionKey, itemId) => {
    const current = roomCaptureFor(sectionKey);
    updateRoomCapture(sectionKey, { items: current.items.filter(item => item.id !== itemId) });
  };
  const update = (id, patch) => setAnswers(prev => ({...prev, [id]: {...normalizeAnswer(prev[id], itemById[id]), ...patch}}));
  const updateIntake = (patch) => setIntake(prev => ({...prev, ...patch}));
  const addPhotos = async (id, files) => {
    const fileList = Array.from(files || []);
    if (!fileList.length) return;
    if (fileList.length > PHOTO_BATCH_WARNING_COUNT) {
      setPhotoFeedback({ state: 'warning', message: `Processing ${fileList.length} photos one at a time to protect tablet memory.` });
    }
    for (const file of fileList) {
      setPhotoFeedback({ state: 'processing', message: 'Processing photo…' });
      try {
        const { photo, compressed } = await buildCompressedPhoto(file, { label: 'Context', idPrefix: 'item' });
        const nextPhoto = { ...photo, uploadStatus: driveToken ? PHOTO_UPLOAD_STATUS.PENDING : PHOTO_UPLOAD_STATUS.LOCAL };
        setAnswers(prev => {
          const current = normalizeAnswer(prev[id], itemById[id]);
          return {...prev, [id]: {...current, photos: [...current.photos, nextPhoto]}};
        });
        setPhotoFeedback({ state: compressed ? 'warning' : 'success', message: driveToken ? 'Photo added — uploading to Drive…' : (compressed ? 'Photo too large — compressed; local until Drive is connected' : 'Photo added locally') });
        if (driveToken) uploadItemPhotoToDrive(id, nextPhoto);
      } catch (error) {
        setPhotoFeedback({ state: 'error', message: 'Photo could not be added' });
      }
    }
  };
  const updatePhoto = (id, photoId, patch) => update(id, {photos: normalizeAnswer(answers[id], itemById[id]).photos.map(photo => photo.id === photoId ? {...photo, ...patch} : photo)});
  const removePhoto = (id, photoId) => update(id, {photos: normalizeAnswer(answers[id], itemById[id]).photos.filter(photo => photo.id !== photoId)});
  const addRoomPhotos = async (sectionKey, files) => {
    const fileList = Array.from(files || []);
    if (!fileList.length) return;
    if (fileList.length > PHOTO_BATCH_WARNING_COUNT) {
      setPhotoFeedback({ state: 'warning', message: `Processing ${fileList.length} photos one at a time to protect tablet memory.` });
    }
    for (const file of fileList) {
      setPhotoFeedback({ state: 'processing', message: 'Processing photo…' });
      try {
        const { photo, compressed } = await buildCompressedPhoto(file, { label: 'Overview', idPrefix: 'room' });
        const nextPhoto = { ...photo, uploadStatus: driveToken ? PHOTO_UPLOAD_STATUS.PENDING : PHOTO_UPLOAD_STATUS.LOCAL };
        setRoomCapture(prev => {
          const current = {
            status: prev?.[sectionKey]?.status || ROOM_STATUS_OPTIONS[0],
            note: prev?.[sectionKey]?.note || '',
            photos: photoList(prev?.[sectionKey]).map(existing => ({ ...existing, label: existing.label || 'Overview' })),
            items: Array.isArray(prev?.[sectionKey]?.items) ? prev[sectionKey].items : []
          };
          return {
            ...prev,
            [sectionKey]: {
              ...current,
              photos: [...current.photos, nextPhoto]
            }
          };
        });
        setPhotoFeedback({ state: compressed ? 'warning' : 'success', message: driveToken ? 'Room photo added — uploading to Drive…' : (compressed ? 'Photo too large — compressed; local until Drive is connected' : 'Room photo added locally') });
        if (driveToken) uploadRoomPhotoToDrive(sectionKey, nextPhoto);
      } catch (error) {
        setPhotoFeedback({ state: 'error', message: 'Photo could not be added' });
      }
    }
  };
  const removeRoomPhoto = (sectionKey, photoId) => {
    const current = roomCaptureFor(sectionKey);
    updateRoomCapture(sectionKey, { photos: current.photos.filter(photo => photo.id !== photoId) });
  };
  const markItemPhoto = (id, photoId, patch) => {
    setAnswers(prev => {
      const current = normalizeAnswer(prev[id], itemById[id]);
      return {
        ...prev,
        [id]: {
          ...current,
          photos: current.photos.map(photo => photo.id === photoId ? { ...photo, ...patch } : photo)
        }
      };
    });
  };
  const markRoomPhoto = (sectionKey, photoId, patch) => {
    setRoomCapture(prev => {
      const current = {
        status: prev?.[sectionKey]?.status || ROOM_STATUS_OPTIONS[0],
        note: prev?.[sectionKey]?.note || '',
        photos: photoList(prev?.[sectionKey]).map(existing => ({ ...existing, label: existing.label || 'Overview' })),
        items: Array.isArray(prev?.[sectionKey]?.items) ? prev[sectionKey].items : []
      };
      return {
        ...prev,
        [sectionKey]: {
          ...current,
          photos: current.photos.map(existing => existing.id === photoId ? { ...existing, ...patch } : existing)
        }
      };
    });
  };
  const uploadItemPhotoToDrive = async (id, photo) => {
    if (!driveToken || !photo?.dataUrl) return false;
    markItemPhoto(id, photo.id, { uploadStatus: PHOTO_UPLOAD_STATUS.PENDING });
    try {
      const row = rows.find(candidate => candidate.id === id) || itemById[id];
      const folderId = await findOrCreateDrivePhotoFolder(driveToken, { client });
      const uploaded = await uploadDrivePhoto(driveToken, folderId, photo, stripFileExtension(flatPhotoDriveName({ room: row?.roomName || row?.room || 'Room', item: row?.item || 'Checklist Item', label: photo.label || 'Photo', originalName: photo.name })));
      markItemPhoto(id, photo.id, uploaded);
      setPhotoFeedback({ state: 'success', message: 'Photo uploaded to Drive' });
      return true;
    } catch (error) {
      markItemPhoto(id, photo.id, { uploadStatus: PHOTO_UPLOAD_STATUS.FAILED });
      setDriveMeta(meta => ({...meta, ...buildDriveErrorState(error, 'Drive API request failed — photo upload could not finish.')}));
      setPhotoFeedback({ state: 'error', message: `${driveErrorMessage(error, 'Photo upload failed')} — use Sync pending photos to Drive` });
      return false;
    }
  };
  const uploadRoomPhotoToDrive = async (sectionKey, photo) => {
    if (!driveToken || !photo?.dataUrl) return false;
    markRoomPhoto(sectionKey, photo.id, { uploadStatus: PHOTO_UPLOAD_STATUS.PENDING });
    try {
      const section = driveSectionFlow(sections).find(candidate => candidate.key === sectionKey) || {};
      const folderId = await findOrCreateDrivePhotoFolder(driveToken, { client });
      const uploaded = await uploadDrivePhoto(driveToken, folderId, photo, stripFileExtension(flatPhotoDriveName({ room: section.roomName || section.label || sectionKey || 'Room', item: 'Overview', label: photo.label || 'Overview', originalName: photo.name })));
      markRoomPhoto(sectionKey, photo.id, uploaded);
      setPhotoFeedback({ state: 'success', message: 'Room photo uploaded to Drive' });
      return true;
    } catch (error) {
      markRoomPhoto(sectionKey, photo.id, { uploadStatus: PHOTO_UPLOAD_STATUS.FAILED });
      setDriveMeta(meta => ({...meta, ...buildDriveErrorState(error, 'Drive API request failed — room photo upload could not finish.')}));
      setPhotoFeedback({ state: 'error', message: `${driveErrorMessage(error, 'Room photo upload failed')} — use Sync pending photos to Drive` });
      return false;
    }
  };
  const syncPendingPhotosToDrive = async () => {
    if (!driveToken) {
      setPhotoFeedback({ state: 'warning', message: 'Connect Google Drive before syncing pending photos.' });
      return;
    }
    setDriveBusy(true);
    setPhotoFeedback({ state: 'processing', message: 'Syncing pending photos to Drive…' });
    try {
      const answerEntries = Object.entries(answers || {}).flatMap(([id, answer]) => photoList(answer)
        .filter(photo => photo.dataUrl && photo.uploadStatus !== PHOTO_UPLOAD_STATUS.UPLOADED)
        .map(photo => ({ id, photo })));
      const roomEntries = Object.entries(roomCapture || {}).flatMap(([sectionKey, capture]) => photoList(capture)
        .filter(photo => photo.dataUrl && photo.uploadStatus !== PHOTO_UPLOAD_STATUS.UPLOADED)
        .map(photo => ({ sectionKey, photo })));
      let uploadedCount = 0;
      for (const entry of roomEntries) {
        if (await uploadRoomPhotoToDrive(entry.sectionKey, entry.photo)) uploadedCount += 1;
      }
      for (const entry of answerEntries) {
        if (await uploadItemPhotoToDrive(entry.id, entry.photo)) uploadedCount += 1;
      }
      setPhotoFeedback({ state: uploadedCount ? 'success' : 'warning', message: uploadedCount ? `Uploaded ${uploadedCount} pending photo${uploadedCount === 1 ? '' : 's'} to Drive` : 'No pending local photos with saved data were found.' });
    } finally {
      setDriveBusy(false);
    }
  };
  const addDynamicRoom = (roomType) => {
    const config = Object.values(DYNAMIC_ROOM_TYPES).find(x => x.roomType === roomType);
    const roomName = window.prompt('Room Name', config?.example || '');
    if (!roomName?.trim()) return;
    const selectedType = window.prompt('Room Type', roomType);
    if (!selectedType?.trim()) return;
    const id = `room-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const allowedType = Object.values(DYNAMIC_ROOM_TYPES).some(x => x.roomType === selectedType.trim()) ? selectedType.trim() : roomType;
    const nextRoom = { id, roomName: roomName.trim(), roomType: allowedType };
    setDynamicRooms(prev => [...prev, nextRoom]);
    setActiveRoom(id);
  };
  const moveSection = (sourceKey, targetKey) => {
    if (!sourceKey || !targetKey || sourceKey === targetKey) return;
    setSectionOrderState(prev => {
      const current = mergeOrder(prev, sections.map(section => section.key));
      const next = current.filter(key => key !== sourceKey);
      const targetIndex = next.indexOf(targetKey);
      next.splice(targetIndex, 0, sourceKey);
      return next;
    });
  };
  const itemIdsForSection = (sectionKey) => (sections.find(section => section.key === sectionKey)?.rows || []).filter(row => !row.catchAll && !isIntakeFollowUp(row)).map(row => row.id);
  const moveItem = (sectionKey, itemId, direction) => {
    const pinned = pinnedItems[sectionKey] || [];
    setItemOrderState(prev => {
      const current = mergeOrder(prev[sectionKey], itemIdsForSection(sectionKey));
      return {...prev, [sectionKey]: moveWithinGroup(current, itemId, direction, pinned)};
    });
  };
  const togglePinItem = (sectionKey, itemId) => {
    setPinnedItems(prev => {
      const current = prev[sectionKey] || [];
      const next = current.includes(itemId) ? current.filter(id => id !== itemId) : [...current, itemId];
      return {...prev, [sectionKey]: next};
    });
    setItemOrderState(prev => ({...prev, [sectionKey]: mergeOrder(prev[sectionKey], itemIdsForSection(sectionKey))}));
  };
  const currentWalkthroughData = () => ({
    client,
    answers,
    intake,
    dynamicRooms,
    sectionOrder: sectionOrderState,
    itemOrder: itemOrderState,
    pinnedItems,
    roomCapture
  });
  const persistCurrentWalkthroughSession = () => {
    const id = activeWalkthroughId || `walkthrough-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const name = walkthroughName.trim() || client.name || client.address || 'Untitled Walkthrough';
    const session = {
      id,
      name,
      updatedAt: new Date().toISOString(),
      data: currentWalkthroughData()
    };
    const nextSessions = { ...savedSessions, [id]: session };
    if (!safeLocalStorageSet(WALKTHROUGH_SESSIONS_KEY, JSON.stringify(nextSessions), applyStorageFailure)) return false;
    if (!safeLocalStorageSet(CURRENT_WALKTHROUGH_ID_KEY, id, applyStorageFailure)) return false;
    setSavedSessions(nextSessions);
    setActiveWalkthroughId(id);
    setSelectedWalkthroughId(id);
    setWalkthroughName(name);
    pruneDuplicateLegacyWalkthroughKeys();
    setStorageWarning('');
    setSaveStatus({ state: 'saved', time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) });
    return true;
  };
  useEffect(() => {
    if (!autosaveReadyRef.current) {
      autosaveReadyRef.current = true;
      return undefined;
    }
    setSaveStatus(status => status.state === 'failed' ? status : { state: 'unsaved', time: status.time || '' });
    const timeout = window.setTimeout(() => {
      setSaveStatus({ state: 'saving', time: '' });
      persistCurrentWalkthroughSession();
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [client, answers, intake, dynamicRooms, sectionOrderState, itemOrderState, pinnedItems, roomCapture, walkthroughName]);
  const applyWalkthroughData = (data) => {
    const clean = cleanWalkthroughData();
    setClient(data?.client || clean.client);
    setAnswers(data?.answers || clean.answers);
    setIntake(data?.intake || clean.intake);
    setDynamicRooms(Array.isArray(data?.dynamicRooms) ? data.dynamicRooms : clean.dynamicRooms);
    setSectionOrderState(Array.isArray(data?.sectionOrder) ? data.sectionOrder : clean.sectionOrder);
    setItemOrderState(data?.itemOrder || clean.itemOrder);
    setPinnedItems(data?.pinnedItems || clean.pinnedItems);
    setRoomCapture(data?.roomCapture || clean.roomCapture);
    setRoomItemFormOpen(false);
    setRoomItemDraft(EMPTY_ROOM_ITEM_DRAFT);
    setView('intake');
  };
  const startNewWalkthrough = () => {
    const nextId = `walkthrough-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const nextName = `New Walkthrough ${new Date().toLocaleDateString()}`;
    applyWalkthroughData(cleanWalkthroughData());
    setWalkthroughName(nextName);
    setActiveWalkthroughId(nextId);
    setSelectedWalkthroughId('');
  };
  const saveWalkthrough = () => {
    setSaveStatus({ state: 'saving', time: '' });
    persistCurrentWalkthroughSession();
  };
  const openSavedWalkthrough = (id) => {
    setSelectedWalkthroughId(id);
    if (!id) return;
    const session = savedSessions[id];
    if (!session?.data) return;
    applyWalkthroughData(session.data);
    setActiveWalkthroughId(id);
    setWalkthroughName(session.name || 'Untitled Walkthrough');
  };
  const deleteSavedWalkthrough = () => {
    const id = selectedWalkthroughId;
    if (!id || !savedSessions[id]) return;
    if (!window.confirm(`Delete saved walkthrough "${savedSessions[id].name || 'Untitled Walkthrough'}"?`)) return;
    setSavedSessions(prev => {
      const next = { ...prev };
      delete next[id];
      safeLocalStorageSet(WALKTHROUGH_SESSIONS_KEY, JSON.stringify(next), applyStorageFailure);
      return next;
    });
    setSelectedWalkthroughId('');
    if (activeWalkthroughId === id) {
      setActiveWalkthroughId('');
    }
  };

  const reassignCatchAll = (sourceId) => {
    const source = rows.find(r => r.id === sourceId);
    const targetId = source?.answer.reassignTo;
    if (!source || !targetId) return;
    setAnswers(prev => {
      const sourceAnswer = normalizeAnswer(prev[sourceId], itemById[sourceId]);
      const targetAnswer = normalizeAnswer(prev[targetId], itemById[targetId]);
      return {
        ...prev,
        [targetId]: {
          ...targetAnswer,
          notes: [targetAnswer.notes, sourceAnswer.notes].filter(Boolean).join('\n\n'),
          photos: [...targetAnswer.photos, ...sourceAnswer.photos.map(photo => ({...photo, id:`reassigned-${Date.now()}-${photo.id}`}))]
        },
        [sourceId]: {...sourceAnswer, notes:'', photos:[], reassignTo:''}
      };
    });
  };
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(buildDrivePayload({walkthroughName, client, intake, rows, pmr, dynamicRooms, sections, sectionOrderState, itemOrderState, pinnedItems, roomCapture}), null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `THA-HTC-PMR-${client.name || 'client'}.json`; a.click(); URL.revokeObjectURL(url);
  };
  const copyDriveText = async (text, label) => {
    try {
      await copyTextToClipboard(text);
      setCopyFeedback(`${label} copied`);
      window.setTimeout(() => setCopyFeedback(''), 2500);
    } catch (error) {
      setCopyFeedback(`Could not copy ${label.toLowerCase()}`);
    }
  };
  const connectDrive = async () => {
    setDriveBusy(true);
    setDriveMeta(meta => ({...meta, ...driveStatusState('Connecting to Google Drive…', 'info')}));
    try {
      await loadGoogleIdentityScript();
      const forceConsent = forceDriveConsentRef.current || !driveMeta.hasConnected;
      const token = await requestDriveToken(effectiveDriveClientId, { forceConsent });
      forceDriveConsentRef.current = false;
      setDriveToken(token);
      setDriveMeta(meta => ({...meta, hasConnected: true, ...driveStatusState('Drive connected — ready to export.', 'success')}));
    } catch (error) {
      setDriveToken('');
      setDriveMeta(meta => ({...meta, ...buildDriveErrorState(error, 'Unable to connect Google Drive')}));
    } finally {
      setDriveBusy(false);
    }
  };
  const printFinalPMR = () => {
    if (unreviewedIntakeRows.length) {
      window.alert(`Final PMR is blocked until ${unreviewedIntakeRows.length} Intake Follow-Up row${unreviewedIntakeRows.length === 1 ? '' : 's'} are reviewed.`);
      setView('form');
      setActiveRoom(INTAKE_FOLLOW_UP_SECTION_KEY);
      return;
    }
    setView('pmr');
    window.setTimeout(() => window.print(), 0);
  };
  const savedSessionList = Object.values(savedSessions).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const hasUnsavedVisiblePhotos = saveStatus.state !== 'saved' && hasVisiblePhotoDataUrls(answers, roomCapture);
  const syncDrive = async ({includeDownload=false, retryQueue=false} = {}) => {
    if (includeDownload) downloadJSON();
    const payload = buildDrivePayload({walkthroughName, client, intake, rows, pmr, dynamicRooms, sections, sectionOrderState, itemOrderState, pinnedItems, roomCapture});
    if (!driveToken) {
      setDriveMeta(meta => ({...meta, lastStatus: '', lastStatusTone: '', lastError: driveConfigured ? 'Drive session expired — reconnect to export.' : 'Drive is not configured. Add the OAuth Client ID in Drive Setup Help or use Download Emergency Backup.', lastErrorDetails: ''}));
      return;
    }
    if (!navigator.onLine) {
      const count = queueDrivePayload(payload, applyStorageFailure);
      setPendingCount(count);
      setDriveMeta(meta => ({...meta, lastStatus: '', lastStatusTone: '', lastError: 'Pending Drive Sync — browser is offline; reconnect to the internet and save again.', lastErrorDetails: ''}));
      return;
    }
    setDriveBusy(true);
    setDriveMeta(meta => ({...meta, ...driveStatusState('Saving walkthrough to Drive…', 'info')}));
    try {
      if (retryQueue) {
        const queue = safeJsonParse(localStorage.getItem(DRIVE_QUEUE_KEY), []);
        for (const item of queue) await uploadDriveBundle(driveToken, item.payload);
        safeLocalStorageSet(DRIVE_QUEUE_KEY, '[]', applyStorageFailure);
        setPendingCount(0);
      }
      const drivePackage = await uploadDriveBundle(driveToken, payload);
      const savedAt = driveSavedTime();
      setPendingCount(0);
      setDriveMeta(meta => ({
        ...meta,
        hasConnected: true,
        lastSaved: savedAt,
        lastFolderName: drivePackage.folderName || '',
        lastFolderLink: drivePackage.folderLink || '',
        ...driveStatusState(`Readable Drive package saved at ${savedAt}.`, 'success')
      }));
    } catch (error) {
      if (isDriveSessionExpired(error)) setDriveToken('');
      const count = isDriveSessionExpired(error) ? pendingCount : queueDrivePayload(payload, applyStorageFailure);
      setPendingCount(count);
      setDriveMeta(meta => ({...meta, ...buildDriveErrorState(error, 'Drive save failed — walkthrough queued for retry.')}));
    } finally {
      setDriveBusy(false);
    }
  };
  return <div className="app">
    <header className="topbar">
      <div className="brand"><THALogo variant="full"/><div><span>Intake → HTC → PMR → PASS</span></div></div>
      <nav><button onClick={()=>setView('intake')} className={view==='intake'?'on':''}><Home size={18}/> Intake</button><button onClick={()=>setView('form')} className={view==='form'?'on':''}><ClipboardCheck size={18}/> HTC</button><button onClick={()=>setView('pmr')} className={view==='pmr'?'on':''}><FileText size={18}/> PMR</button><button onClick={()=>setView('metrics')} className={view==='metrics'?'on':''}><Clock3 size={18}/> Metrics</button></nav>
    </header>
    <section className="sessionCard noPrint" aria-label="Walkthrough save controls">
      <label>Working Session Name<input value={walkthroughName} onChange={e=>setWalkthroughName(e.target.value)} placeholder="Name this working session"/></label>
      <div className="walkthroughActions" aria-label="Walkthrough save and backup actions">
        <button type="button" onClick={startNewWalkthrough}>Start New Blank Walkthrough</button>
        <div className="manualSaveGroup"><button type="button" onClick={saveWalkthrough}>Save Working Walkthrough</button><span className={`saveStatus ${saveStatus.state}`} role="status" aria-live="polite"><span className="saveStatusDot" aria-hidden="true"></span>{saveStatusText(saveStatus, hasUnsavedVisiblePhotos)}</span></div>
        <button type="button" onClick={()=>syncDrive({includeDownload:true})}><Download size={16}/> Download Emergency Backup</button>
      </div>
      <label>Open Saved Walkthrough<select value={selectedWalkthroughId} onChange={e=>openSavedWalkthrough(e.target.value)}><option value="">Choose saved walkthrough</option>{savedSessionList.map(session=><option key={session.id} value={session.id}>{session.name || 'Untitled Walkthrough'}{session.updatedAt ? ` · ${new Date(session.updatedAt).toLocaleString()}` : ''}</option>)}</select></label>
      <button type="button" onClick={deleteSavedWalkthrough} disabled={!selectedWalkthroughId || !savedSessions[selectedWalkthroughId]}>Delete Selected Walkthrough</button>
    </section>
    {(storageWarning || photoFeedback.message) && <section className="appWarning noPrint" role="alert" aria-live="assertive"><AlertTriangle size={18}/><div>{storageWarning && <strong>{storageWarning}</strong>}{photoFeedback.message && <span className={`photoFeedback ${photoFeedback.state}`}>{photoFeedback.message}</span>}</div></section>}
    <section className="clientCard noPrint">
      <label>Client Name<input value={client.name} onChange={e=>setClient({...client,name:e.target.value})}/></label>
      <label>Project Address<input value={client.address} onChange={e=>setClient({...client,address:e.target.value})}/></label>
      <label>Walkthrough Date / Visit Label<input value={client.date} onChange={e=>setClient({...client,date:e.target.value})}/></label>
      <div className="pmrPrintActions" aria-label="PMR print actions"><button onClick={()=>window.print()}><Printer size={16}/> Print / Save Draft PMR</button><button className="finalPrintButton" onClick={printFinalPMR}><Printer size={16}/> Print Final PMR</button></div>
    </section>
    <section className="driveStatus driveSetupPanel noPrint" aria-label="Google Drive connection setup">
      <div className="driveSetupHeader">
        <div>
          <h2>Google Drive connection</h2>
          <p>The OAuth Client ID is app configuration. Field users should not need to paste it on each device.</p>
          <p className="driveActionHelp">Google Drive authorization still applies to the current browser session, so users may need to reconnect on another device or after the session expires.</p>
        </div>
        <span className={driveToken ? 'drivePill connected' : 'drivePill'}>{driveToken ? 'Connected' : (driveConfigured ? 'Configured' : 'Not configured')}</span>
      </div>
      <div className="driveSetupGrid drivePrimaryGrid">
        <div className="driveBrowserStatus" role="status" aria-live="polite">
          <strong>{driveStatusMessage}</strong>
          <span>{hasAppDriveClientId && !usingManualDriveOverride ? 'Drive configured for this app.' : `Client ID source: ${driveClientIdSourceLabel}.`}</span>
          <span>Connect Google Drive authorizes this browser session. Save Readable Package to Drive uploads the report package.</span>
        </div>
        <div className="originCard">
          <span>Drive field workflow</span>
          <p>The OAuth Client ID is app configuration. Field users should not need to paste it on each device.</p>
          <p>Reconnect is usually enough on this browser; full setup is only needed after reset, a new browser/device, or browser storage being cleared.</p>
        </div>
      </div>
      <div className="driveSetupActions">
        <button onClick={connectDrive} disabled={driveBusy || !driveConfigured}><FolderOpen size={16}/> Connect Google Drive</button>
        <button onClick={()=>syncDrive({retryQueue:true})} disabled={driveBusy || !driveToken}><Upload size={16}/> Save Readable Package to Drive</button>
        {driveMeta.lastFolderLink ? <a className="driveFolderLink driveActionLink" href={driveMeta.lastFolderLink} target="_blank" rel="noreferrer"><FolderOpen size={14}/> Open Last Drive Folder</a> : <button type="button" disabled><FolderOpen size={16}/> Open Last Drive Folder</button>}
        <button onClick={syncPendingPhotosToDrive} disabled={driveBusy || !driveToken || !pendingPhotoCount}><Upload size={16}/> Sync Pending Photos</button>
        {copyFeedback && <span className="copyFeedback" role="status">{copyFeedback}</span>}
      </div>
      {!driveConfigured && <div className="driveErrorBox" role="status"><AlertTriangle size={16}/><span>Drive is not configured. Add the OAuth Client ID in Drive Setup Help or use Download Emergency Backup.</span></div>}
      {driveMeta.lastStatus && <div className={`driveStatusBox ${driveMeta.lastStatusTone || 'info'}`} role="status" aria-live="polite"><CheckCircle2 size={16}/><strong>{driveMeta.lastStatus}</strong></div>}
      {driveMeta.lastError && <div className="driveErrorBox" role="alert"><AlertTriangle size={16}/><div><strong>{driveMeta.lastError}</strong>{driveMeta.lastErrorDetails && <details open><summary>Technical details</summary><pre>{driveMeta.lastErrorDetails}</pre></details>}</div></div>}
      <div className="driveMetaRow">
        <span>Last saved to Drive: {driveMeta.lastSaved || 'Never'}{driveMeta.lastFolderName ? ` · ${driveMeta.lastFolderName}` : ''}</span>
        {driveMeta.lastFolderLink && <a className="driveFolderLink" href={driveMeta.lastFolderLink} target="_blank" rel="noreferrer"><FolderOpen size={14}/> Open Drive Folder</a>}
        <span className={pendingCount ? 'pendingSync on' : 'pendingSync'}>{pendingCount ? `Pending Drive Sync: ${pendingCount}` : 'Pending sync count: 0'}</span>
        <span className={pendingPhotoCount ? 'pendingSync on' : 'pendingSync'}>{pendingPhotoCount ? `Pending photos: ${pendingPhotoCount}` : 'Pending photos: 0'}</span>
      </div>
      <details className="driveTroubleshooting">
        <summary>Drive Setup Help / Troubleshooting</summary>
        <div className="driveSetupGrid">
          <div className="originCard">
            <span>Current app origin for Google Cloud</span>
            <code>{appOrigin}</code>
            <p>Authorized JavaScript origin in Google Cloud must include the deployed app origin.</p>
            <button type="button" onClick={()=>copyDriveText(appOrigin, 'Current app origin')}><ClipboardCheck size={16}/> Copy current app origin</button>
          </div>
          <div className="originCard">
            <span>Manual OAuth Client ID fallback</span>
            {hasAppDriveClientId && <label className="driveOverrideToggle"><input type="checkbox" checked={useDriveClientIdOverride} onChange={e=>setUseDriveClientIdOverride(e.target.checked)}/><span>Use manual Client ID override on this browser</span></label>}
            <label>Google OAuth Client ID<span className="fieldHelp">Paste a Web application Client ID only when app-level configuration is missing or you intentionally need a browser override. Do not paste a Client Secret or Drive folder link.</span><input value={driveClientId} onChange={e=>updateDriveClientId(e.target.value)} disabled={hasAppDriveClientId && !useDriveClientIdOverride} placeholder="Paste OAuth Web Client ID for Drive upload"/></label>
          </div>
          <div className="originCard">
            <span>Production setup</span>
            <p>Add <code>VITE_GOOGLE_OAUTH_CLIENT_ID</code> in Vercel environment variables and redeploy.</p>
            <p>Authorized JavaScript origin in Google Cloud must include the deployed app origin.</p>
            <button type="button" onClick={()=>copyDriveText(setupChecklistText(appOrigin), 'Setup checklist')}><ClipboardCheck size={16}/> Copy setup checklist</button>
          </div>
        </div>
        <div className="driveSetupChecklist">
          <h3>Setup checklist</h3>
          <ol>{GOOGLE_DRIVE_SETUP_STEPS.map(step => <li key={step}><CheckCircle2 size={15}/><span>{step}{step.includes('authorized JavaScript origin') && <>: <code>{appOrigin}</code></>}</span></li>)}</ol>
          <p className="driveTechnicalNote"><strong>Technical setup notes:</strong> Store only the OAuth Web Client ID in this app. Do not paste or store a Client Secret. Enable the Google Drive API and use a Web application OAuth Client ID with this browser origin authorized.</p>
          <button type="button" className="driveResetButton" onClick={resetDriveSetup}>Reset Drive setup on this browser</button>
        </div>
      </details>
      <small className="driveSetupNote">{driveWarningText}</small>
    </section>
    {view === 'intake' && <IntakeView intake={intake} updateIntake={updateIntake} />}
    {view === 'form' && <main className="grid">
      <aside className="roomNav noPrint"><h3>Walkthrough Sections</h3><div className="addRoomTools">{Object.values(DYNAMIC_ROOM_TYPES).map(type => <button key={type.roomType} onClick={()=>addDynamicRoom(type.roomType)}>{type.addLabel} {type.roomType}</button>)}</div>{rooms.map(r => <div key={r.key} className="sectionNavRow" draggable onDragStart={()=>setDragSectionKey(r.key)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); moveSection(dragSectionKey, r.key); setDragSectionKey('');}} onDragEnd={()=>setDragSectionKey('')}><span className="sectionDragHandle" title="Drag to reorder walkthrough flow">⋮⋮</span><button className={`sectionSelect ${activeRoom===r.key?'active':''}`} onClick={()=>setActiveRoom(r.key)}>{r.label}</button></div>)}<div className="hint"><Camera size={18}/> Prompt: Capture context, close-up, and detail photos. Store by room/item folder path.</div></aside>
      <section className="formPanel">
        <h1>{rooms.find(r=>r.key===activeRoom)?.label || activeRoom} HTC</h1><div className="roomCaptureShell"><div className="roomCaptureTop"><label>Overall Room Status<select value={roomCaptureFor(activeRoom).status} onChange={e=>updateRoomCapture(activeRoom,{status:e.target.value})}>{ROOM_STATUS_OPTIONS.map(x=><option key={x}>{x}</option>)}</select></label><button type="button" onClick={openRoomItemForm}>Add Item</button></div><span className="roomCaptureHelp">Add anything that needs tracking beyond ‘looks good.’</span>{roomItemFormOpen && <div className="roomItemForm"><div className="inputs roomItemInputs"><label>Item title<input value={roomItemDraft.title} onChange={e=>updateRoomItemDraft({title:e.target.value})} placeholder="e.g., Loose towel bar" autoFocus/></label><label>Item bucket/type<select value={roomItemDraft.bucket} onChange={e=>updateRoomItemDraft({bucket:e.target.value})}>{ROOM_ITEM_BUCKETS.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div><label className="discoveryCheck"><input type="checkbox" checked={roomItemDraft.isDiscovery} onChange={e=>updateRoomItemDraft({isDiscovery:e.target.checked})}/><span><strong>Discovery</strong><small>Unexpected, hidden, unusual, or out of the ordinary.</small></span></label><label className="notes">Notes<textarea value={roomItemDraft.notes} onChange={e=>updateRoomItemDraft({notes:e.target.value})} placeholder="Add room-level context, next step, or follow-up note."/></label><div className="roomItemActions"><button type="button" onClick={saveRoomItem} disabled={!roomItemDraft.title.trim()}>Save</button><button type="button" onClick={cancelRoomItemForm}>Cancel</button></div></div>}<label className="notes">Room Note / Voice Transcript<textarea value={roomCaptureFor(activeRoom).note} onChange={e=>updateRoomCapture(activeRoom,{note:e.target.value})} placeholder="Capture room-level context, voice transcript, or summary notes for this space."/></label><div className="roomPhotoBox"><div className="photoBox"><Camera size={18}/><strong>Room Overview Photos:</strong><label className="uploadInline"><Upload size={16}/> Add Room Overview Photo<input type="file" accept="image/*" multiple onChange={e=>{addRoomPhotos(activeRoom, e.target.files); e.target.value='';}}/></label><span>{photoSummary(roomCaptureFor(activeRoom).photos, { emptyText: 'No room overview photos attached yet', labels: ROOM_PHOTO_LABELS })}</span></div>{roomCaptureFor(activeRoom).photos.length > 0 && <div className="thumbGrid roomThumbGrid">{roomCaptureFor(activeRoom).photos.map(photo => { const displaySrc = photoDisplaySrc(photo); return <div className="thumbCard" key={photo.id}><div className="thumb">{displaySrc ? <img src={displaySrc} alt={`Overview for ${rooms.find(room=>room.key===activeRoom)?.label || activeRoom}`}/> : <Image size={24}/>}</div><span>Overview</span><span title={photo.name}>{photo.name}</span><span className={`photoStatusBadge ${photo.uploadStatus || PHOTO_UPLOAD_STATUS.LOCAL}`}>{photoStatusLabel(photo)}</span><span className="photoStatusText">{photoStatusMessage(photo, Boolean(driveToken))}</span><button onClick={()=>removeRoomPhoto(activeRoom, photo.id)} aria-label="Remove room overview photo"><X size={14}/></button></div>; })}</div>}</div><div className="smartRoomPrompt"><h3>Smart Room Prompt</h3><div className="smartRoomGrid">{SMART_ROOM_PROMPTS.map(group => <p key={group.group}><strong>{group.group}:</strong> {group.prompt}</p>)}</div></div><div className="roomItemsPlaceholder"><h3>Items list for this room</h3>{roomCaptureFor(activeRoom).items.length > 0 ? <ul className="roomItemList">{roomCaptureFor(activeRoom).items.map(item=><li key={item.id} className="roomItemRow"><div><strong>{item.title}</strong><span>{roomItemBucketLabel(item.bucket)}{item.isDiscovery ? ' · Discovery' : ''}</span>{item.notes && <p>{item.notes}</p>}</div><button type="button" onClick={()=>removeRoomItem(activeRoom, item.id)} aria-label={`Remove ${item.title}`}><X size={14}/> Remove</button></li>)}</ul> : <p>No room-level items added yet.</p>}{rows.filter(r=>r.sectionKey===activeRoom && includePMRRow(r)).length > 0 && <><h4>Checklist items currently flagged</h4><ul>{rows.filter(r=>r.sectionKey===activeRoom && includePMRRow(r)).slice(0,5).map(r=><li key={`placeholder-${r.id}`}>{r.item} · {r.answer.status}</li>)}</ul></>}</div></div><p className="lede">Fuller data capture: status, action certainty, suggested trade, time, notes, and photo references.</p>
        {rows.filter(r=>r.sectionKey===activeRoom).map(r => {
          const category = categoryForChecklistItem(r);
          const meta = categoryInfo(category);
          return <div className={`itemCard categoryCard category-${meta.slug}`} key={r.id}>
          <div className="itemHead"><span className="tradeIcon">{ICONS[r.answer.trade] || ICONS[r.trade] || '🔎'}</span><div><div className="itemTitleLine"><h2>{r.item}</h2><CategoryBadge category={category}/>{isIntakeFollowUp(r) && <span className="sourceBadge">Intake Follow-Up</span>}</div><p>{r.zone} · Suggested: {displayTradeLabel(r.trade)}</p></div>{!r.catchAll && !isIntakeFollowUp(r) && <div className="itemOrderTools"><button onClick={()=>moveItem(r.sectionKey, r.id, -1)} title="Move item up">↑</button><button onClick={()=>moveItem(r.sectionKey, r.id, 1)} title="Move item down">↓</button><button onClick={()=>togglePinItem(r.sectionKey, r.id)} title="Pin to top">{(pinnedItems[r.sectionKey] || []).includes(r.id) ? 'Pinned' : 'Pin'}</button></div>}<span className={`pill ${priority(r.answer.status).toLowerCase()}`}>{priority(r.answer.status) || 'No PMR'}</span></div>
          <div className="prompt"><Search size={16}/><strong>Prompt:</strong> {r.prompt}</div>
          {isIntakeFollowUp(r) && <div className="intakeReviewNotes"><strong>{r.intakeFieldLabel}:</strong> {r.intakeValue}<br/><span>Target: {r.roomName || r.room} · Source: {r.source}</span></div>}
          <div className="inputs">
            <label>Status<select value={r.answer.status} onChange={e=>update(r.id,{status:e.target.value})}>{STATUS.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Action Certainty<select value={actionCertaintyFor(r.answer)} onChange={e=>update(r.id,{actionCertainty:e.target.value})}>{ACTION_CERTAINTY.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Suggested Trade / Resource<select value={r.answer.trade} onChange={e=>update(r.id,{trade:e.target.value})}>{TRADE_OPTIONS.map(x=><option key={x} value={x}>{displayTradeLabel(x)}</option>)}</select></label>
            <label>Approx. Time<select value={r.answer.effort} onChange={e=>update(r.id,{effort:e.target.value})}>{EFFORT.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Homeowner Pace<select value={r.answer.pref} onChange={e=>update(r.id,{pref:e.target.value})}>{PREFS.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Photo Ref<input value={r.answer.photoRef} onChange={e=>update(r.id,{photoRef:e.target.value})} placeholder="Photo 01 / filename"/></label>
            {isIntakeFollowUp(r) && <label className="intakeFollowUpReview">Review Status<select value={r.answer.reviewStatus} onChange={e=>update(r.id,{reviewStatus:e.target.value})}>{INTAKE_REVIEW_STATUSES.map(x=><option key={x}>{x}</option>)}</select></label>}
          </div>
          <label className="passCandidateToggle"><input type="checkbox" checked={r.answer.passCandidate} onChange={e=>update(r.id,{passCandidate:e.target.checked})}/><span><strong>PASS Candidate</strong><small>Ongoing care after PMR — not urgency or a finding.</small></span></label>
          {r.answer.passCandidate && <div className="passMetaGrid"><label>PASS Cadence<select value={r.answer.passCadence} onChange={e=>update(r.id,{passCadence:e.target.value})}>{PASS_CADENCE.map(x=><option key={x}>{x}</option>)}</select></label><label>PASS Resource<select value={r.answer.passResource} onChange={e=>update(r.id,{passResource:e.target.value})}>{PASS_RESOURCES.map(x=><option key={x}>{x}</option>)}</select></label><label>PASS Note<input value={r.answer.passNote} onChange={e=>update(r.id,{passNote:e.target.value})} placeholder="Optional recurring care note"/></label></div>}
          <label className="notes">Notes for PMR detail<textarea value={r.answer.notes} onChange={e=>update(r.id,{notes:e.target.value})} placeholder="What do I see? What would I suggest? What needs confirmation? These notes sharpen the PMR language."/></label>
          <div className="photoBox"><Camera size={18}/><strong>Photo Capture:</strong><label className="uploadInline"><Upload size={16}/> Upload<input type="file" accept="image/*" multiple onChange={e=>{addPhotos(r.id, e.target.files); e.target.value='';}}/></label><span>{photoSummary(r.answer.photos)}</span></div>
          {r.answer.photos.length > 0 && <div className="thumbGrid">{r.answer.photos.map(photo => { const displaySrc = photoDisplaySrc(photo); return <div className="thumbCard" key={photo.id}><div className="thumb">{displaySrc ? <img src={displaySrc} alt={`${photo.label} for ${r.item}`}/> : <Image size={24}/>}</div><select value={photo.label} onChange={e=>updatePhoto(r.id, photo.id, {label:e.target.value})}>{PHOTO_LABELS.map(label=><option key={label}>{label}</option>)}</select><span title={photo.name}>{photo.name}</span><span className={`photoStatusBadge ${photo.uploadStatus || PHOTO_UPLOAD_STATUS.LOCAL}`}>{photoStatusLabel(photo)}</span><span className="photoStatusText">{photoStatusMessage(photo, Boolean(driveToken))}</span><button onClick={()=>removePhoto(r.id, photo.id)} aria-label="Remove photo"><X size={14}/></button></div>; })}</div>}
          {r.catchAll && <div className="reassignBox"><label>Reassign Catch-All Notes<select value={r.answer.reassignTo} onChange={e=>update(r.id,{reassignTo:e.target.value})}><option value="">Choose Section-Item</option>{rows.filter(target=>target.sectionKey===r.sectionKey && !target.catchAll).map(target=><option key={target.id} value={target.id}>{target.item}</option>)}</select></label><button onClick={()=>reassignCatchAll(r.id)} disabled={!r.answer.reassignTo}>Reassign</button></div>}
          <div className="drivePath"><FolderOpen size={16}/> {drivePath(client.name, client.date, r.roomType || r.room, r.item, r.roomName || r.room)}</div>
        </div>})}
      </section>
    </main>}
    {view === 'pmr' && <PMR client={client} intake={intake} pmr={pmr} counts={counts} quickHits={quickHits} pass={pass} unreviewedIntakeRows={unreviewedIntakeRows} reviewedIntakeNotes={reviewedIntakeNotes} />}
    {view === 'metrics' && <Metrics rows={rows} pmr={pmr} quickHits={quickHits} pass={pass}/>} 
  </div>
}


function IntakeView({intake, updateIntake}) {
  const togglePriority = (value) => {
    const current = Array.isArray(intake.priorities) ? intake.priorities : [];
    updateIntake({priorities: current.includes(value) ? current.filter(x => x !== value) : [...current, value]});
  };
  return <main className="intakePage">
    <div className="pmrHeader"><div><p className="eyebrow">Intake → HTC → PMR → PASS</p><h1>Homeowner Context & Preferences</h1><p>Intake captures homeowner context before HTC verifies and triages it during the walkthrough.</p></div><div className="compass">◈</div></div>
    <section className="pmrBlock"><h2><Home size={20}/> Priorities & Decision Style</h2><p className="lede">Use this section to make the PMR feel personal instead of generic. It adjusts the tone, timing, and staging of recommendations.</p>
      <div className="chips">{INTAKE_PRIORITIES.map(p => <button key={p} className={(intake.priorities||[]).includes(p)?'active chip':'chip'} onClick={()=>togglePriority(p)}>{p}</button>)}</div>
      <div className="inputs intakeInputs">
        <label>Preferred Pace<select value={intake.pace || ''} onChange={e=>updateIntake({pace:e.target.value})}>{INTAKE_PACE.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Budget Mindset<select value={intake.budgetStyle || ''} onChange={e=>updateIntake({budgetStyle:e.target.value})}>{INTAKE_BUDGET.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Decision Style<select value={intake.decisionStyle || ''} onChange={e=>updateIntake({decisionStyle:e.target.value})}>{INTAKE_DECISION.map(x=><option key={x}>{x}</option>)}</select></label>
      </div>
      <label className="notes">Homeowner goals / anything they want us to prioritize<textarea value={intake.notes || ''} onChange={e=>updateIntake({notes:e.target.value})} placeholder="What matters most to the homeowner? Safety, function, budget, aesthetics, peace of mind, aging in place, resale, etc." /></label>
    </section>
    <section className="pmrBlock"><h2>🔌 Electrical / 🚿 Plumbing / 🌡️ HVAC</h2><div className="intakeGrid">
      <CategoryLabel category="Electrical">Electrical panel location<input value={intake.electricalPanel || ''} onChange={e=>updateIntake({electricalPanel:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Electrical">Known electrical issues or updates<input value={intake.electricalUpdates || ''} onChange={e=>updateIntake({electricalUpdates:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Plumbing">Main water shut-off location<input value={intake.waterShutoff || ''} onChange={e=>updateIntake({waterShutoff:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Plumbing">Known leaks, slow drains, or past plumbing issues<input value={intake.plumbingHistory || ''} onChange={e=>updateIntake({plumbingHistory:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Plumbing">Water heater flush / age<input value={intake.waterHeater || ''} onChange={e=>updateIntake({waterHeater:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Drainage">Sewer / irrigation history<input value={intake.sewerIrrigation || ''} onChange={e=>updateIntake({sewerIrrigation:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="HVAC">Furnace filter replacement<input value={intake.hvacFilter || ''} onChange={e=>updateIntake({hvacFilter:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="HVAC">Furnace service history / age<input value={intake.hvacService || ''} onChange={e=>updateIntake({hvacService:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="HVAC">A/C service history / age<input value={intake.hvacAcService || ''} onChange={e=>updateIntake({hvacAcService:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="HVAC">Comfort issues<input value={intake.comfort || ''} onChange={e=>updateIntake({comfort:e.target.value})}/></CategoryLabel>
    </div></section>
    <section className="pmrBlock"><h2>🏠 Roof / 🌧️ Drainage / 🪟 Openings / 🎨 Exterior</h2><div className="intakeGrid">
      <CategoryLabel category="Roofing">Roof age / last replacement<input value={intake.roofAge || ''} onChange={e=>updateIntake({roofAge:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Roofing">Known roof leaks / repairs<input value={intake.roofHistory || ''} onChange={e=>updateIntake({roofHistory:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Electrical">Solar panel status, if present<input value={intake.solar || ''} onChange={e=>updateIntake({solar:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Drainage">Water pooling areas<input value={intake.drainagePooling || ''} onChange={e=>updateIntake({drainagePooling:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Drainage">Drainage / water intrusion history<input value={intake.drainageHistory || ''} onChange={e=>updateIntake({drainageHistory:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Drainage">Gutter / downspout concerns<input value={intake.gutters || ''} onChange={e=>updateIntake({gutters:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Openings">Drafty or hard-to-operate windows / doors<input value={intake.windowsDoors || ''} onChange={e=>updateIntake({windowsDoors:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Openings">Fogging / failed seals<input value={intake.fogging || ''} onChange={e=>updateIntake({fogging:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Exterior">Last exterior paint / stain<input value={intake.paintStain || ''} onChange={e=>updateIntake({paintStain:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Surfaces">Product / color labels to consolidate<input value={intake.productsColors || ''} onChange={e=>updateIntake({productsColors:e.target.value})}/></CategoryLabel>
    </div></section>
    <section className="pmrBlock"><h2>🐜 Pest / 🔥 Safety / 🧰 Misc.</h2><div className="intakeGrid">
      <CategoryLabel category="Pest">Pest activity or history<input value={intake.pests || ''} onChange={e=>updateIntake({pests:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Safety">Fire extinguishers: quantity, age, location<input value={intake.fireExtinguishers || ''} onChange={e=>updateIntake({fireExtinguishers:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Safety">Smoke / CO detector age or replacement<input value={intake.smokeCO || ''} onChange={e=>updateIntake({smokeCO:e.target.value})}/></CategoryLabel>
      <CategoryLabel category="Roofing">Chimney inspection / cleaning<input value={intake.chimney || ''} onChange={e=>updateIntake({chimney:e.target.value})}/></CategoryLabel>
    </div><label className="notes">Other known concerns / items to pay attention to<textarea value={intake.additionalConcerns || ''} onChange={e=>updateIntake({additionalConcerns:e.target.value})}/></label></section>
  </main>
}

function PMR({client, intake, pmr, counts, quickHits, pass, unreviewedIntakeRows = [], reviewedIntakeNotes = []}) {
  const summary = intakeSummary(intake);
  return <main className="pmr">
    <div className="pmrHeader"><div><THALogo variant="full"/><p className="eyebrow">PMR — Findings & Next Steps</p><h1>{client.address}</h1><p>{client.name} · {client.date} · Intake → HTC → PMR → PASS</p></div><div className="compassCard"><Mountain size={48}/><span>You Navigate, We Drive</span></div></div>
    {unreviewedIntakeRows.length > 0 && <div className="pmrWarning"><AlertTriangle size={18}/><span>Draft warning: {unreviewedIntakeRows.length} Intake Follow-Up row{unreviewedIntakeRows.length === 1 ? '' : 's'} remain Not Reviewed. Use Print Final PMR only after every follow-up is reviewed.</span></div>}
    <section className="pmrBlock intakeSummary"><h2><Home size={20}/> Homeowner Goals & Preferences</h2><div className="findGrid"><p><strong>Primary priorities:</strong><br/>{summary.priorities}</p><p><strong>Preferred pace:</strong><br/>{summary.pace}</p><p><strong>Budget mindset:</strong><br/>{summary.budget}</p><p><strong>Decision style:</strong><br/>{summary.decision}</p><p><strong>Homeowner notes:</strong><br/>{summary.notes}</p><p><strong>Workflow:</strong><br/>Intake captures context. HTC verifies and triages. PMR documents findings and next steps. PASS tracks ongoing care after findings.</p></div></section>
    <section className="pmrBlock intakeSummary"><h2>Context From Intake</h2><div className="findGrid"><p><strong>Systems history:</strong><br/>Panel: {intake.electricalPanel || 'Unknown'}<br/>Water shut-off: {intake.waterShutoff || 'Unknown'}<br/>Furnace: {intake.hvacService || 'Unknown'}<br/>A/C: {intake.hvacAcService || 'Unknown'}</p><p><strong>Known issues:</strong><br/>{intake.plumbingHistory || 'No plumbing history recorded.'}<br/>{intake.comfort || ''}</p><p><strong>Exterior history:</strong><br/>Roof: {intake.roofAge || 'Unknown'}<br/>Drainage: {intake.drainagePooling || 'Unknown'}<br/>Paint/Stain: {intake.paintStain || 'Unknown'}</p><p><strong>Safety history:</strong><br/>Smoke/CO: {intake.smokeCO || 'Unknown'}<br/>Fire extinguishers: {intake.fireExtinguishers || 'Unknown'}</p><p><strong>Misc. history:</strong><br/>Pest: {intake.pests || 'Unknown'}<br/>Chimney: {intake.chimney || 'Unknown'}</p><p><strong>Additional concerns:</strong><br/>{intake.additionalConcerns || 'No additional concerns recorded.'}</p></div></section>
    <section className="snapshot"><h2><Home size={20}/> Home Health Snapshot</h2><div className="stat high"><strong>{counts.high}</strong><span><CertaintyDot label="Needs Discovery"/> Immediate</span></div><div className="stat med"><strong>{counts.med}</strong><span><CertaintyDot label="Likely Path"/> Near‑Term</span></div><div className="stat low"><strong>{counts.low}</strong><span><CertaintyDot label="Clear Path"/> Monitor</span></div></section><section className="guideGrid"><div className="guideCard"><h2><ClipboardList size={20}/> Action Certainty Guide</h2><p><CertaintyDot label="Needs Discovery"/> <strong>Needs Discovery</strong><br/><span>Gather more information before committing.</span></p><p><CertaintyDot label="Likely Path"/> <strong>Likely Path</strong><br/><span>Probable solution; start here and verify.</span></p><p><CertaintyDot label="Clear Path"/> <strong>Clear Path</strong><br/><span>Straightforward solution.</span></p></div><div className="guideCard"><h2><Clock3 size={20}/> Investment Guide (Time)</h2><p><CertaintyDot label="Clear Path"/> <strong>Quick</strong> — 0–2 hrs</p><p><CertaintyDot label="Likely Path"/> <strong>Short</strong> — 2–6 hrs</p><p><CertaintyDot label="Needs Discovery"/> <strong>Long / Trade Scope</strong> — verify first</p></div></section><section className="pmrBlock"><h2><Wrench/> Handy‑Next‑Steps</h2><p className="lede">Quick, practical items that may fit a grouped Handy Services visit, subject to confirmation.</p><ul className="checkList">{quickHits.map(r=><li key={r.id}><TradeIcon trade={r.answer.trade}/> <span><strong>{r.room}: {r.item}</strong><br/><small>{displayTradeLabel(r.answer.trade)} · {r.answer.effort}</small></span><CertaintyDot label={actionCertaintyFor(r.answer)}/></li>)}</ul></section>
    <section className="pmrBlock"><h2><AlertTriangle/> Priority Action Plan</h2>{pmr.map(r => {
      const certainty = actionCertaintyCopy(r);
      return <article className="finding" key={r.id}>
        <div className="findTop"><TradeIcon trade={r.answer.trade} big/><div><h3>{r.roomName || r.room} — {r.item}</h3><p>{r.zone} · {r.answer.status} · {displayTradeLabel(r.answer.trade)} · {certainty.label}</p></div><span className="certaintyLabel"><CertaintyDot label={certainty.label}/>{certainty.label}</span><span className={`pill ${priority(r.answer.status).toLowerCase()}`}>{priority(r.answer.status)}</span></div>
        <div className="findGrid"><p><strong>What we saw:</strong><br/>{r.answer.notes || 'No additional notes recorded yet.'}</p><p><strong>Why it matters:</strong><br/>{r.why}</p><p><strong>{certainty.title}:</strong><br/>{certainty.body}</p><p><strong>Next step language:</strong><br/>{certainty.next}</p><p><strong>Suggested timing:</strong><br/>{timingFor(r, r.answer.status)} · Homeowner pace: {r.answer.pref}</p><p><strong>Approx. time:</strong><br/>{r.answer.effort} · {displayTradeLabel(r.answer.trade)} · Action certainty: {certainty.label}</p><p><strong>How homeowner intake affects this:</strong><br/>{intakeInfluence(r, intake)}</p><p><strong>Photos / reference:</strong><br/>{photoSummary(r.answer.photos)}</p></div>
      </article>
    })}</section>
    {reviewedIntakeNotes.length > 0 && <section className="pmrBlock"><h2>Intake Follow-Up Review Notes / Appendix</h2><ul className="checkList">{reviewedIntakeNotes.map(r=><li key={`note-${r.id}`}><span className="sourceBadge">Intake Follow-Up</span><span><strong>{r.roomName || r.room} — {r.item}</strong><br/><small>{r.answer.reviewStatus} · {r.intakeFieldLabel}: {r.intakeValue}</small></span></li>)}</ul></section>}
    <section className="pmrBlock"><h2><CalendarDays/> PASS — Continued Home Care</h2><p className="lede">PASS is the final continued-care layer after PMR findings. PASS Candidates are recurring care reminders only — not urgency items and not PMR findings unless separately listed above.</p><ul className="checkList">{pass.map(r=><li key={r.id}><TradeIcon trade={r.answer.trade}/> <span><strong>{r.item}</strong><br/><small>{r.answer.passCadence || r.frequency || 'As Needed'} · {r.answer.passResource || displayTradeLabel(r.answer.trade)}{r.answer.passNote ? ` · ${r.answer.passNote}` : ''}</small></span></li>)}</ul></section>
    <footer className="promise"><ShieldCheck/> You don’t hire trades — you hire The Homeowner Advocate. One point of contact. Every step. Every task.</footer>
  </main>
}

function Metrics({rows, pmr, quickHits, pass}) {
  const byTrade = Object.entries(pmr.reduce((acc,r)=>{acc[r.answer.trade]=(acc[r.answer.trade]||0)+1; return acc;},{}));
  const byCertainty = Object.entries(pmr.reduce((acc,r)=>{const key=actionCertaintyFor(r.answer); acc[key]=(acc[key]||0)+1; return acc;},{}));
  return <main className="metrics"><h1>Internal Metrics / Future PMR Intelligence</h1><div className="metricGrid"><div><strong>{pmr.length}</strong><span>PMR findings</span></div><div><strong>{quickHits.length}</strong><span>Quick-hit tasks</span></div><div><strong>{pass.length}</strong><span>PASS candidates</span></div><div><strong>{rows.filter(r=>r.answer.effort !== 'Unknown').length}</strong><span>Items with time data</span></div></div><section className="pmrBlock"><h2>Findings by Trade / Resource</h2>{byTrade.map(([k,v])=><p key={k} className="tradeLine"><span><TradeIcon trade={k}/> {displayTradeLabel(k)}</span><strong>{v}</strong></p>)}</section><section className="pmrBlock"><h2>Action Certainty Breakdown</h2>{byCertainty.map(([k,v])=><p key={k} className="tradeLine"><span>{k}</span><strong>{v}</strong></p>)}</section><section className="pmrBlock"><h2>Time Tracking Note</h2><p>This app captures the field estimate now. Next build should add “Actual Time Spent” after work completion, so THA can compare estimated vs. actual and improve future PMRs, pricing, scheduling, and batching. Nerdy? Yes. Useful? Very.</p></section></main>
}

createRoot(document.getElementById('root')).render(<App/>);
