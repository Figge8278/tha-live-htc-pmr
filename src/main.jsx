import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ClipboardCheck, FileText, Camera, Clock3, Download, Printer, Home, AlertTriangle, CheckCircle2, Wrench, CalendarDays, FolderOpen, Search, ShieldCheck, HardHat, Plug, Droplets, Fan, Paintbrush, Hammer, TreePine, Bug, Flame, Mountain, Wind, DoorOpen, Palette, Leaf, Settings, ClipboardList, Upload, Image, X, Trash2 } from 'lucide-react';
import './style.css';

const ICONS = {
  Handyman: '🧰', Electrical: '🔌', Plumbing: '🚿', HVAC: '🌡️', Roof: '🏠', Drainage: '🌧️', Windows: '🪟', Paint: '🎨', Pest: '🐜', Safety: '🔥', Appliance: '⚙️', Chimney: '🧱', Exterior: '🏡'
};
const APP_RELEASE_NOTE = {
  label: 'PMR + PASS milestone',
  summary: 'Internal release: supports PMR findings, PASS Continued Care Outlook, native PMCP selection, demo scenarios, and homeowner-safe export cleanup.',
  items: [
    'PMR findings',
    'PASS Continued Care Outlook',
    'PMCP selection review',
    'Demo scenarios',
    'Homeowner-safe export cleanup'
  ]
};

const TRADE_ICON = {
  Handyman: Wrench, Electrical: Plug, Plumbing: Droplets, HVAC: Fan, Roof: Home, Drainage: Wind, Windows: DoorOpen, Paint: Paintbrush, Pest: Bug, Safety: ShieldCheck, Appliance: Settings, Chimney: Flame, Exterior: TreePine, Carpentry: Hammer, 'General Contractor': HardHat, Design: Palette, Flooring: Home, Landscape: Leaf
};
function TradeIcon({trade, big=false}) {
  const Icon = TRADE_ICON[trade] || Search;
  return <span className={big ? 'tradeBadge big' : 'tradeBadge'}><Icon size={big ? 26 : 18}/></span>;
}
function actionCertaintyClass(label) {
  if (label === 'Clear Path') return 'clearPath';
  if (label === 'Needs Discovery') return 'needsDiscovery';
  return 'likelyPath';
}
function CertaintyDot({label}) {
  const key = label || 'Likely Path';
  return <span className={`certaintyDot ${actionCertaintyClass(key)}`} aria-label={key}></span>;
}
function HealthDot({level}) {
  const cls = level === 'high' ? 'red' : level === 'medium' ? 'orange' : 'gold';
  return <span className={`healthDot ${cls}`} aria-label={level}></span>;
}
function THALogo({variant='full', className=''}) {
  const src = variant === 'icon' ? '/tha-logo-icon-black.png' : '/tha-logo-full-black.png';
  return <img className={`thaLogo ${variant} ${className}`} src={src} alt="The Homeowner Advocate" />;
}

function displayTradeLabel(trade) {
  return trade === 'Handyman' ? 'Handy Services' : trade;
}


const CATEGORY_ORDER = [
  'Handy Services',
  'Appliances',
  'Electrical',
  'Plumbing',
  'HVAC / Mechanical',
  'General Contractor / Remodel',
  'Carpentry / Decks / Fences',
  'Painting / Staining / Protective Coatings',
  'Exterior & Site / Grounds',
  'Safety / Life Safety',
  'Pest',
  'Specialty / Other'
];

const CATEGORY_META = {
  'Handy Services': { label: 'Handy Services', slug: 'handy-services', Icon: Wrench },
  Appliances: { label: 'Appliances', slug: 'appliances', Icon: Settings },
  Electrical: { label: 'Electrical', slug: 'electrical', Icon: Plug },
  Plumbing: { label: 'Plumbing', slug: 'plumbing', Icon: Droplets },
  'HVAC / Mechanical': { label: 'HVAC / Mechanical', slug: 'hvac-mechanical', Icon: Fan },
  'General Contractor / Remodel': { label: 'General Contractor / Remodel', slug: 'general-contractor-remodel', Icon: HardHat },
  'Carpentry / Decks / Fences': { label: 'Carpentry / Decks / Fences', slug: 'carpentry-decks-fences', Icon: Hammer },
  'Painting / Staining / Protective Coatings': { label: 'Painting / Staining / Protective Coatings', slug: 'painting-staining-coatings', Icon: Paintbrush },
  'Exterior & Site / Grounds': { label: 'Exterior & Site / Grounds', slug: 'exterior-site-grounds', Icon: TreePine },
  'Safety / Life Safety': { label: 'Safety / Life Safety', slug: 'safety-life-safety', Icon: ShieldCheck },
  Pest: { label: 'Pest', slug: 'pest', Icon: Bug },
  'Specialty / Other': { label: 'Specialty / Other', slug: 'specialty-other', Icon: Search }
};

const LEGACY_CATEGORY_MAP = {
  Handyman: 'Handy Services',
  Electrical: 'Electrical',
  Plumbing: 'Plumbing',
  HVAC: 'HVAC / Mechanical',
  Roofing: 'Exterior & Site / Grounds',
  Drainage: 'Exterior & Site / Grounds',
  Openings: 'Exterior & Site / Grounds',
  Exterior: 'Exterior & Site / Grounds',
  Pest: 'Pest',
  Safety: 'Safety / Life Safety',
  Appliances: 'Appliances',
  'Handy / Carpentry': 'Carpentry / Decks / Fences',
  'General / Misc': 'Specialty / Other',
  'General Contractor': 'General Contractor / Remodel',
  Carpentry: 'Carpentry / Decks / Fences',
  Design: 'Specialty / Other',
  Flooring: 'Specialty / Other',
  Landscape: 'Exterior & Site / Grounds'
};

function categoryText(item = {}) {
  return [
    item.category,
    item.zone,
    item.trade,
    item.answer?.trade,
    item.item,
    item.prompt,
    item.answer?.notes
  ].filter(Boolean).join(' ').toLowerCase();
}

function canonicalCategory(category = '', item = {}) {
  const raw = String(category || '').trim();
  const text = categoryText({ ...item, category: raw });
  const trade = item.trade || item.answer?.trade || '';

  if (/(dryer vent|dryer duct|vent cleaning|vent hose)/.test(text)) return 'Handy Services';
  if (CATEGORY_META[raw]) return raw;

  if (raw === 'Drainage' && trade === 'Handyman' && /(downspout extension|gutter extension|extension attachment|splash block)/.test(text)) {
    return 'Handy Services';
  }

  if (raw === 'Surfaces') {
    if (/(paint|stain|coating|finish)/.test(text)) return 'Painting / Staining / Protective Coatings';
    if (/(trim|cabinet|carpentry|deck|fence|hinge|drawer|latch)/.test(text)) return 'Carpentry / Decks / Fences';
    return 'Specialty / Other';
  }

  if (raw === 'Exterior' && /(paint|stain|coating|finish)/.test(text)) {
    return 'Painting / Staining / Protective Coatings';
  }

  if (raw === 'Handy / Carpentry' && /(adjust|hardware|minor|handyman|handy service)/.test(text)) {
    return 'Handy Services';
  }

  return LEGACY_CATEGORY_MAP[raw] || 'Specialty / Other';
}

function categoryInfo(category = 'Specialty / Other', item = {}) {
  const canonical = canonicalCategory(category, item);
  return CATEGORY_META[canonical] || CATEGORY_META['Specialty / Other'];
}

function categoryRank(category = '', item = {}) {
  const canonical = canonicalCategory(category, item);
  const rank = CATEGORY_ORDER.indexOf(canonical);
  return rank === -1 ? CATEGORY_ORDER.length : rank;
}

function categoryForChecklistItem(item = {}) {
  if (item.category) return canonicalCategory(item.category, item);

  const text = categoryText(item);
  const trade = item.trade || item.answer?.trade || '';

  if (item.catchAll || text.includes('misc') || text.includes('sorting')) return 'Specialty / Other';
  if (trade === 'General Contractor' || /(remodel|renovation|structural|foundation|permit|whole-home)/.test(text)) return 'General Contractor / Remodel';
  if (/(dryer vent|dryer duct|vent cleaning|vent hose)/.test(text)) return 'Handy Services';
  if (text.includes('appliance') || /(range hood|dryer|washer|refrigerator|dishwasher|garbage disposal)/.test(text)) return 'Appliances';
  if (text.includes('electrical') || /(gfci|outlet|switch|panel|breaker|solar)/.test(text)) return 'Electrical';
  if (text.includes('plumbing') || /(sink|drain|washer hose|water heater|shutoff|toilet|faucet)/.test(text)) return 'Plumbing';
  if (text.includes('hvac') || /(furnace|a\/c|air conditioner|thermostat|exhaust fan)/.test(text)) return 'HVAC / Mechanical';
  if (text.includes('safety') || /(smoke|co detector|fire extinguisher|life safety|lint)/.test(text)) return 'Safety / Life Safety';
  if (text.includes('pest') || /(bug|rodent|termite|ant)/.test(text)) return 'Pest';
  if (/(paint|stain|coating|exterior finish)/.test(text)) return 'Painting / Staining / Protective Coatings';
  if (/(roof|chimney|fireplace|gutter|downspout|drainage|grading|pooling|window|door|screen|seal|landscape|irrigation|masonry|hardscape)/.test(text)) return 'Exterior & Site / Grounds';
  if (trade === 'Handyman' || /(handyman|handy service|minor repair|adjustment)/.test(text)) return 'Handy Services';
  if (/(cabinet|carpentry|hinge|drawer|latch|trim|deck|fence)/.test(text)) return 'Carpentry / Decks / Fences';

  return 'Specialty / Other';
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

const CONDITION_STATUS_ORDER = ['Immediate Concern','Needs Attention','Monitor','Good','Unknown'];

const CONDITION_STATUS_META = {
  'Immediate Concern': { visual: 'red', label: 'Immediate concern', rank: 0 },
  'Needs Attention': { visual: 'orange', label: 'Needs action', rank: 1 },
  'Monitor': { visual: 'gold', label: 'Watch / plan ahead', rank: 2 },
  'Good': { visual: 'green', label: 'Verified / good standing', rank: 3 },
  'Unknown': { visual: 'gray', label: 'Unknown / needs review', rank: 6 }
};

function conditionStatusMeta(status = 'Unknown') {
  return CONDITION_STATUS_META[status] || CONDITION_STATUS_META.Unknown;
}

function conditionStatusRank(status = 'Unknown') {
  return conditionStatusMeta(status).rank;
}

const WORKFLOW_VISUAL_ORDER = ['red','orange','gold','green','violet','blue','gray'];

const WORKFLOW_STATUS_META = {
  red: { label: 'Immediate action', rank: 0 },
  orange: { label: 'Needs input / review', rank: 1 },
  gold: { label: 'Watch / plan ahead', rank: 2 },
  green: { label: 'Verified / complete', rank: 3 },
  violet: { label: 'Planned / scheduled / deferred', rank: 4 },
  blue: { label: 'Not applicable', rank: 5 },
  gray: { label: 'Reference / inactive', rank: 6 }
};

const PASS_FOLLOW_UP_VISUALS = {
  'Not Scheduled': 'orange',
  'Verify / Establish Baseline': 'orange',
  'Planned': 'violet',
  'Scheduled': 'violet',
  'Completed': 'green',
  'Deferred': 'violet'
};

function passWorkflowMeta(status = '') {
  const visual = PASS_FOLLOW_UP_VISUALS[status] || 'gray';
  return { visual, ...WORKFLOW_STATUS_META[visual] };
}

const STATUS = CONDITION_STATUS_ORDER;
const EFFORT = ['Unknown','15 min','30 min','45–60 min','1–2 hrs','Half day','Full day','Multi-day / trade scope'];
const ACTION_CERTAINTY = ['Clear Path','Likely Path','Needs Discovery'];
const ACTION_CERTAINTY_GUIDE = [
  { label: 'Clear Path', body: 'scope and next step are clear' },
  { label: 'Likely Path', body: 'likely next step, minor confirmation may be needed' },
  { label: 'Needs Discovery', body: 'more information, pricing, or specialist input needed before committing' }
];
const PREFS = ['Do now','Plan soon','Budget for later','Watchlist only'];
const PASS_CADENCE = ['Monthly','Quarterly','Seasonal','Semiannual','Annual','Condition-Based','As Needed'];
const PASS_DATE_SOURCES = ['unknown','homeowner-reported','THA observed'];
const PASS_FOLLOW_UP_STATUSES = ['Not Scheduled','Verify / Establish Baseline','Planned','Scheduled','Completed','Deferred'];
const PASS_RESOURCES = ['Handy Services','HVAC','Plumbing','Roofing','Roofing / gutters','Gutters/Drainage','Pest','Safety','Appliance','Chimney','Other'];
const THA_ACTION_TYPES = ['Research','Trade consultation','Estimate needed','Schedule service','Client-approved work','Follow-up observation'];
const PHOTO_LABELS = ['Context','Close-up','Detail'];
const ROOM_PHOTO_LABELS = ['Overview'];
const ROOM_STATUS_OPTIONS = ['Unknown','Looking Good','Watch Item / Worth Watching','Handy Services','Trade Attention','Routine Care / PASS','Homeowner Goal'];
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
const WALKTHROUGH_CONTROLS_COLLAPSED_KEY = 'tha-walkthrough-controls-collapsed';
const PHOTO_MAX_DIMENSION = 1600;
const PHOTO_QUALITY = 0.76;
const PHOTO_THUMBNAIL_MAX_DIMENSION = 360;
const PHOTO_THUMBNAIL_QUALITY = 0.62;
const PHOTO_UPLOAD_STATUS = { LOCAL: 'local', PENDING: 'pending', UPLOADED: 'uploaded', FAILED: 'failed' };
const PHOTO_BATCH_WARNING_COUNT = 5;
const PHOTO_AUTOSAVE_FAILURE_MESSAGE = 'Photo added, but autosave failed — download backup or remove photos.';
const TRADE_OPTIONS = [...Object.keys(ICONS), 'Carpentry', 'General Contractor', 'Design', 'Flooring', 'Landscape', 'Review / Assign Later'];

const PMR_TIME_INVESTMENT_GUIDE = [
  { key: 'quick', icon: '⏱', label: 'Quick', display: 'Quick — half day to one day' },
  { key: 'short', icon: '🕒', label: 'Short', display: 'Short — one to two days' },
  { key: 'future', icon: '📅', label: 'Larger / Future Project', display: 'Larger / Future Project — plan, estimate, or schedule' }
];


const PASS_CONDITIONAL_CARE_IDS = new Set(['chimney-fireplace-inspection-cleaning', 'sump-pump-test', 'hvac-duct-cleaning-review']);
function passCareGroup(item = {}) {
  const ruleId = String(item.rule?.id || item.id || '').replace(/^generated-pass-/, '');
  return PASS_CONDITIONAL_CARE_IDS.has(ruleId) ? 'Applicable / Conditional Care' : 'Core Recurring Care';
}
function passCalendarState(item = {}) {
  return item.lastCompletedDate && item.nextSuggestedWindow && !String(item.lastCompletedDisplay || '').toLowerCase().includes('unknown') ? 'ready' : 'baseline';
}
function passCalendarIntroCopy(pmrCount = 0) {
  const zeroFindingLead = pmrCount === 0 ? 'This home currently has no repair findings, and the PASS Maintenance Calendar is still included as a proactive planning tool. ' : '';
  return `${zeroFindingLead}The PASS Maintenance Calendar is for proactive continued home care. These items are not PMR defects and do not affect red, yellow, or green PMR counts. The calendar helps schedule routine upkeep even when the house is in good condition. Known last-service dates generate next suggested windows; unknown dates create “Verify / Establish Baseline” planning items, not urgent concerns.`;
}


const GENERIC_PROJECT_IDENTITY_VALUES = new Set([
  'client name',
  'client',
  'project address',
  'address',
  'walkthrough date / visit label',
  'walkthrough date',
  'visit label',
  'new blank walkthrough',
  'untitled walkthrough',
  'your walkthrough'
]);
function isMissingProjectIdentityValue(value = '') {
  const normalized = String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return !normalized || GENERIC_PROJECT_IDENTITY_VALUES.has(normalized);
}

const PASS_CARE_RULES = [
  { id: 'furnace-filter-check', careItem: 'Furnace filter check / replacement', resource: 'HVAC', trade: 'HVAC', category: 'HVAC / Mechanical', cadence: 'Every 1–3 months during heating/cooling use', cadenceMonths: 3, suggestedWindow: 'check at the next seasonal visit, then every 1–3 months during regular system use', intakeKeys: ['hvacFilter', 'furnaceService', 'hvacService'], rowKeywords: ['furnace', 'filter', 'hvac filter'], reason: 'Routine airflow care helps the HVAC system operate efficiently and keeps the service plan current.', groupingNote: 'Could be grouped with the next seasonal PASS visit.' },
  { id: 'furnace-service', careItem: 'Furnace service', resource: 'HVAC', trade: 'HVAC', category: 'HVAC / Mechanical', cadence: 'Annual', cadenceMonths: 12, suggestedWindow: 'fall, before heating season', intakeKeys: ['furnaceService', 'hvacService'], rowKeywords: ['furnace service', 'heating service', 'hvac service'], reason: 'Annual heating-system service supports reliability before peak heating demand.' },
  { id: 'ac-heat-pump-service', careItem: 'A/C or heat-pump service', resource: 'HVAC', trade: 'HVAC', category: 'HVAC / Mechanical', cadence: 'Annual', cadenceMonths: 12, suggestedWindow: 'spring, before cooling season', intakeKeys: ['acHeatPumpService', 'hvacAcService', 'comfort'], rowKeywords: ['a/c', 'ac service', 'heat pump', 'cooling'], reason: 'Cooling equipment should be reviewed before seasonal use so minor issues can be planned, not treated as defects.' },
  { id: 'water-heater-flush-service-review', careItem: 'Water heater flush / service review', resource: 'Plumbing', trade: 'Plumbing', category: 'Plumbing', cadence: 'Annual; six-month preferred cadence where appropriate', cadenceMonths: 12, suggestedWindow: 'annual care planning or the next plumbing visit', intakeKeys: ['waterHeaterService', 'waterHeater', 'plumbingHistory'], rowKeywords: ['water heater', 'tankless', 'flush'], reason: 'Water-heater service history belongs in routine care planning unless active symptoms are observed.', groupingNote: 'Can be grouped with other plumbing or seasonal PASS work.' },
  { id: 'dryer-vent-cleaning', careItem: 'Dryer vent cleaning', resource: 'Handy Services', trade: 'Handyman', category: 'Handy Services', cadence: 'Annual', cadenceMonths: 12, suggestedWindow: 'fall or the next laundry / exterior vent visit', intakeKeys: ['otherMaintenanceHistory'], rowKeywords: ['dryer vent', 'lint', 'exterior flap'], reason: 'Routine dryer vent cleaning supports dryer performance and fire-safety housekeeping.' },
  { id: 'dishwasher-filter-cleaning', careItem: 'Dishwasher filter cleaning', resource: 'Appliance', trade: 'Appliance', category: 'Appliances', cadence: 'Monthly to quarterly', cadenceMonths: 3, suggestedWindow: 'next kitchen care visit, then monthly to quarterly depending on use', intakeKeys: ['otherMaintenanceHistory'], rowKeywords: ['dishwasher', 'filter'], reason: 'Dishwasher filters are routine homeowner / appliance care and should not become PMR defects unless performance issues are observed.', groupingNote: 'Could be grouped with the next kitchen handyman or appliance visit.' },
  { id: 'range-hood-filter-cleaning', careItem: 'Range hood filter cleaning', resource: 'Appliance', trade: 'Appliance', category: 'Appliances', cadence: 'Quarterly', cadenceMonths: 3, suggestedWindow: 'next kitchen care visit, then quarterly or as cooking use requires', intakeKeys: ['otherMaintenanceHistory'], rowKeywords: ['range hood', 'hood filter', 'ventilation'], reason: 'Range hood filter cleaning is routine kitchen ventilation care.' },
  { id: 'smoke-co-detector-check', careItem: 'Smoke/CO detector check', resource: 'Safety', trade: 'Safety', category: 'Safety / Life Safety', cadence: 'Annual test/review; replace devices per manufacturer date', cadenceMonths: 12, suggestedWindow: 'annual safety review or next PASS visit', intakeKeys: ['smokeCO'], rowKeywords: ['smoke', 'co detector', 'carbon monoxide'], reason: 'Safety devices need routine date, battery, placement, and function checks separate from PMR finding counts.' },
  { id: 'fire-extinguisher-check', careItem: 'Fire extinguisher check', resource: 'Safety', trade: 'Safety', category: 'Safety / Life Safety', cadence: 'Annual', cadenceMonths: 12, suggestedWindow: 'annual safety review or next PASS visit', intakeKeys: ['fireExtinguishers'], rowKeywords: ['fire extinguisher', 'extinguisher'], reason: 'Extinguisher gauge, placement, and service-date checks are recurring safety care.' },
  { id: 'gutter-downspout-review', careItem: 'Gutter/downspout review', resource: 'Gutters/Drainage', trade: 'Handyman', category: 'Exterior & Site / Grounds', cadence: 'Seasonal', cadenceMonths: 6, suggestedWindow: 'spring and fall, especially after leaf drop or snowmelt', intakeKeys: ['gutters', 'drainagePooling', 'drainageHistory', 'drainageGrading'], rowKeywords: ['gutter', 'downspout'], reason: 'Water-management reviews help catch routine debris, discharge, or splashback concerns before they become larger issues.' },
  { id: 'drainage-grading-water-path-review', careItem: 'Drainage / grading / water path review', resource: 'Gutters/Drainage', trade: 'Handyman', category: 'Exterior & Site / Grounds', cadence: 'Seasonal / after major storms', cadenceMonths: 6, suggestedWindow: 'next wet-season or seasonal exterior visit', intakeKeys: ['drainagePooling', 'drainageHistory', 'drainageGrading'], rowKeywords: ['drainage', 'grading', 'pooling', 'water path'], reason: 'Surface water patterns are best watched over time and should remain separate from PMR defects unless active damage is observed.' },
  { id: 'exterior-caulk-paint-stain-review', careItem: 'Exterior caulk / paint / stain review', resource: 'Handy Services', trade: 'Paint', category: 'Painting / Staining / Protective Coatings', cadence: 'Annual review', cadenceMonths: 12, suggestedWindow: 'dry/warm exterior season', intakeKeys: ['exteriorPaintStain', 'paintStain', 'productsColors'], rowKeywords: ['paint', 'stain', 'caulk', 'exterior finish'], reason: 'Exterior finish review is routine preservation planning and can be batched with handyman touch-ups.', groupingNote: 'Could be grouped with the next exterior handyman visit.' },
  { id: 'pest-prevention-watch', careItem: 'Pest prevention watch', resource: 'Pest', trade: 'Pest', category: 'Pest', cadence: 'Seasonal / As Needed', cadenceMonths: 6, suggestedWindow: 'spring/fall or as needed based on activity', intakeKeys: ['pestActivity', 'pests'], rowKeywords: ['pest', 'insect', 'rodent', 'bug'], reason: 'Pest history and prevention should be tracked as a watch item unless active evidence creates a separate PMR finding.' },
  { id: 'chimney-fireplace-inspection-cleaning', careItem: 'Chimney / fireplace inspection or cleaning, if applicable', resource: 'Chimney', trade: 'Chimney', category: 'Exterior & Site / Grounds', cadence: 'Annual when used / as applicable', cadenceMonths: 12, suggestedWindow: 'fall, before fireplace use', intakeKeys: ['chimneyFireplaceService', 'chimney'], rowKeywords: ['chimney', 'fireplace', 'hearth', 'damper'], reason: 'If the home has a fireplace or chimney, service timing should be planned before seasonal use.', groupingNote: 'Verify applicability before scheduling.' },
  { id: 'sump-pump-test', careItem: 'Sump pump test, if applicable', resource: 'Plumbing', trade: 'Plumbing', category: 'Plumbing', cadence: 'Seasonal / before wet season', cadenceMonths: 6, suggestedWindow: 'before wet season or next basement/mechanical visit', intakeKeys: ['plumbingHistory', 'drainageHistory', 'otherMaintenanceHistory'], rowKeywords: ['sump pump', 'sump', 'pump test'], reason: 'If present, sump pumps should be tested routinely before wet weather rather than treated as an urgent defect without symptoms.', groupingNote: 'Verify applicability before scheduling.' },
  { id: 'hvac-duct-cleaning-review', careItem: 'HVAC duct cleaning review', resource: 'HVAC', trade: 'HVAC', category: 'HVAC / Mechanical', cadence: 'Condition-Based only — not automatic annual cleaning', cadenceMonths: null, suggestedWindow: 'review only as-needed based on dust, renovation history, airflow concerns, pests, moisture, or occupant needs', intakeKeys: ['airDuctsCleaned', 'hvacService', 'comfort'], rowKeywords: ['duct', 'air ducts', 'airflow'], reason: 'Duct cleaning should be considered only when conditions justify it, not as an automatic annual service.', groupingNote: 'Could be discussed during the next HVAC service visit.' }
];

const BASELINE_CARE_TOPICS = [
  { id: 'baseline-hvac-filter', group: 'HVAC / Mechanical', title: 'Furnace or HVAC filter review/replacement', guidance: 'Review filter condition and replacement timing so routine airflow care stays on track.', intakeKeys: ['hvacFilter', 'furnaceService', 'hvacService'], rowKeywords: ['furnace', 'hvac', 'filter'], linkedRuleIds: ['furnace-filter-check'] },
  { id: 'baseline-hvac-seasonal-service', group: 'HVAC / Mechanical', title: 'Seasonal furnace, A/C, or heat-pump service review', guidance: 'Confirm normal seasonal service windows before heating/cooling demand peaks.', intakeKeys: ['furnaceService', 'acHeatPumpService', 'hvacService', 'hvacAcService'], rowKeywords: ['furnace service', 'ac service', 'a/c', 'heat pump', 'cooling', 'heating'], linkedRuleIds: ['furnace-service', 'ac-heat-pump-service'] },
  { id: 'baseline-dryer-vent', group: 'HVAC / Mechanical', title: 'Dryer vent and exterior flap cleaning/review', guidance: 'Keep laundry exhaust pathways clear as a routine performance and safety check.', intakeKeys: ['otherMaintenanceHistory'], rowKeywords: ['dryer vent', 'lint', 'exterior flap', 'dryer duct'], linkedRuleIds: ['dryer-vent-cleaning'] },
  { id: 'baseline-smoke-alarm', group: 'Safety', title: 'Smoke alarm testing and replacement-life review', guidance: 'Confirm test routine, age, and replacement timing for smoke alarms.', intakeKeys: ['smokeCO'], rowKeywords: ['smoke alarm', 'smoke detector'], linkedRuleIds: ['smoke-co-detector-check'] },
  { id: 'baseline-co-alarm', group: 'Safety', title: 'Carbon-monoxide alarm testing and replacement-life review', guidance: 'Confirm test routine, age, and replacement timing for CO alarms.', intakeKeys: ['smokeCO'], rowKeywords: ['co detector', 'carbon monoxide'], linkedRuleIds: ['smoke-co-detector-check'] },
  { id: 'baseline-fire-extinguisher', group: 'Safety', title: 'Fire extinguisher charge, access, and age review', guidance: 'Verify gauge, access, and age so extinguishers remain ready for household emergencies.', intakeKeys: ['fireExtinguishers'], rowKeywords: ['fire extinguisher', 'extinguisher'], linkedRuleIds: ['fire-extinguisher-check'] },
  { id: 'baseline-visible-plumbing', group: 'Water / Plumbing', title: 'Inspect visible supply lines, shutoffs, and under-sink areas', guidance: 'Do periodic visual checks for leaks, corrosion, and accessibility at common plumbing points.', intakeKeys: ['waterShutoff', 'plumbingHistory'], rowKeywords: ['supply line', 'shutoff', 'under-sink', 'plumbing'] },
  { id: 'baseline-dishwasher-filter', group: 'Water / Plumbing', title: 'Dishwasher filter and spray-arm cleaning/review', guidance: 'Routine dishwasher cleaning supports normal performance and helps reduce avoidable service calls.', intakeKeys: ['otherMaintenanceHistory'], rowKeywords: ['dishwasher', 'spray arm', 'dishwasher filter'], linkedRuleIds: ['dishwasher-filter-cleaning'] },
  { id: 'baseline-water-heater', group: 'Water / Plumbing', title: 'Water-heater maintenance/review where applicable', guidance: 'Review service timing and basic maintenance history for tank or tankless systems where applicable.', intakeKeys: ['waterHeater', 'waterHeaterService', 'plumbingHistory'], rowKeywords: ['water heater', 'tankless'], linkedRuleIds: ['water-heater-flush-service-review'] },
  { id: 'baseline-gutters', group: 'Exterior / Drainage', title: 'Gutter and downspout review', guidance: 'Confirm seasonal debris and discharge checks to support predictable water flow.', intakeKeys: ['gutters', 'drainageHistory'], rowKeywords: ['gutter', 'downspout'], linkedRuleIds: ['gutter-downspout-review'] },
  { id: 'baseline-drainage', group: 'Exterior / Drainage', title: 'Drainage and pooling-near-foundation review', guidance: 'Track grading and drainage patterns over time, especially around wet-season transitions.', intakeKeys: ['drainagePooling', 'drainageHistory', 'drainageGrading'], rowKeywords: ['drainage', 'pooling', 'grading', 'foundation'], linkedRuleIds: ['drainage-grading-water-path-review'] },
  { id: 'baseline-exterior-finish', group: 'Exterior / Drainage', title: 'Exterior caulk, paint, stain, flashing, and exposed trim review', guidance: 'Use recurring exterior finish checks to plan maintenance before wear accelerates.', intakeKeys: ['paintStain', 'exteriorPaintStain', 'productsColors'], rowKeywords: ['caulk', 'paint', 'stain', 'flashing', 'trim', 'exterior finish'], linkedRuleIds: ['exterior-caulk-paint-stain-review'] },
  { id: 'baseline-door-weatherstrip', group: 'Exterior / Drainage', title: 'Door/weatherstripping and exterior penetration review', guidance: 'Check weatherstripping and common penetrations to support seasonal comfort and moisture control.', intakeKeys: ['windowsDoors'], rowKeywords: ['weatherstripping', 'door seal', 'window seal', 'penetration', 'draft'] },
  { id: 'baseline-fireplace', group: 'Fireplace / Other', title: 'Chimney/fireplace review where applicable', guidance: 'Where a chimney or fireplace exists, keep inspection/cleaning timing in normal seasonal planning.', intakeKeys: ['chimney', 'chimneyFireplaceService'], rowKeywords: ['chimney', 'fireplace', 'hearth', 'damper'], linkedRuleIds: ['chimney-fireplace-inspection-cleaning'] }
];

const INTAKE_DEFAULTS = {
  priorities: [], pace: '', budgetStyle: '', decisionStyle: '',
  notes: '', priorityAreas: '', knownIssues: '', recentRepairs: '', helpfulRecords: '', accessNotes: '', doNotOverlook: '',
  electricalPanel: '', electricalUpdates: '',
  waterShutoff: '', plumbingHistory: '', waterHeater: '', sewerIrrigation: '',
  hvacFilter: '', hvacService: '', hvacAcService: '', comfort: '',
  roofAge: '', roofHistory: '', solar: '',
  drainagePooling: '', drainageHistory: '', gutters: '',
  windowsDoors: '', fogging: '', paintStain: '', productsColors: '',
  pests: '', fireExtinguishers: '', smokeCO: '',
  chimney: '', additionalConcerns: ''
};


const STRUCTURED_HOMEOWNER_QUICK_INTAKE_GROUPS = [
  {
    key: 'knownIssues',
    question: '3. Are there any known recurring issues or symptoms we should know about?',
    help: 'Please note anything that has happened more than once, comes and goes, or may not be visible during the walkthrough.',
    fields: [
      { key: 'leaksMoisture', label: 'Leaks or moisture' },
      { key: 'slowDrainsPlumbing', label: 'Slow drains or plumbing concerns' },
      { key: 'electricalConcerns', label: 'Tripped breakers, flickering lights, or electrical concerns' },
      { key: 'comfortIssues', label: 'Heating, cooling, airflow, or comfort issues' },
      { key: 'stickyOpeningsDrafts', label: 'Sticky windows, doors, locks, or drafts' },
      { key: 'pestActivity', label: 'Pest activity' },
      { key: 'drainageGrading', label: 'Drainage, pooling water, ice, or grading concerns' },
      { key: 'odorsNoisesAppliances', label: 'Odors, noises, or appliance concerns' },
      { key: 'otherRecurringSymptoms', label: 'Other recurring symptoms' }
    ]
  },
  {
    key: 'recentRepairs',
    question: '4. For any of the following, do you know the approximate last service, cleaning, repair, or replacement date?',
    help: 'Please fill in anything you know. Unknown is completely fine.',
    fields: [
      { key: 'furnaceService', label: 'Furnace service' },
      { key: 'acHeatPumpService', label: 'A/C or heat-pump service' },
      { key: 'airDuctsCleaned', label: 'Air ducts cleaned' },
      { key: 'chimneyFireplaceService', label: 'Chimney / fireplace cleaned or serviced' },
      { key: 'waterHeaterService', label: 'Water heater tank or tankless / on-demand water heater serviced' },
      { key: 'roofRepairedReplaced', label: 'Roof repaired or replaced' },
      { key: 'exteriorPaintStain', label: 'Exterior paint or stain completed' },
      { key: 'windowsDoorsRepairedReplaced', label: 'Windows or doors repaired/replaced' },
      { key: 'otherMaintenanceHistory', label: 'Other maintenance or service history we should know' }
    ]
  },
  {
    key: 'helpfulRecords',
    question: '5. Are there any helpful home records you can have available during the walkthrough, if they are easy to access?',
    help: 'No need to search for everything. This is only for records that may help clarify known concerns, maintenance timing, or future planning.',
    fields: [
      { key: 'recentInspectionReport', label: 'Recent inspection report' },
      { key: 'roofPaperwork', label: 'Roof replacement or roof repair paperwork' },
      { key: 'sewerPlumbingRecords', label: 'Sewer scope or plumbing records' },
      { key: 'solarDocuments', label: 'Solar documents, if relevant' },
      { key: 'paintColorRecords', label: 'Paint cans or color records' },
      { key: 'otherHelpfulRecords', label: 'Other helpful records tied to a concern or maintenance item' }
    ]
  },
  {
    key: 'accessNotes',
    question: '6. Are there any access notes we should know before the walkthrough?',
    fields: [
      { key: 'pets', label: 'Pets' },
      { key: 'gatesKeysLockedAreas', label: 'Gates, keys, or locked areas' },
      { key: 'atticCrawlBasementMechanical', label: 'Attic, crawlspace, basement, or mechanical room access' },
      { key: 'detachedGarageShedOutbuildings', label: 'Detached garage, shed, or outbuildings' },
      { key: 'areasBlockedByStorage', label: 'Areas blocked by storage' },
      { key: 'fragileSensitiveOffLimits', label: 'Anything fragile, sensitive, or off-limits' }
    ]
  }
];
const STRUCTURED_HOMEOWNER_QUICK_INTAKE_LOOKUP = Object.fromEntries(STRUCTURED_HOMEOWNER_QUICK_INTAKE_GROUPS.map(group => [group.key, group]));

const HOMEOWNER_QUICK_INTAKE_FIELDS = [
  'notes',
  'priorityAreas',
  'knownIssues',
  'recentRepairs',
  'helpfulRecords',
  'accessNotes',
  'doNotOverlook'
];
const HOMEOWNER_QUICK_INTAKE_TEXT_FIELDS = [
  { key: 'notes', label: '1. What are your top goals or concerns for this walkthrough?' },
  { key: 'priorityAreas', label: '2. Are there specific rooms, areas, or exterior spaces you want us to prioritize?' },
  { key: 'doNotOverlook', label: '7. Is there anything you specifically do not want overlooked?' }
];
const INTAKE_UNKNOWN_ANSWER_PATTERN = /^(unknown|not sure|unsure|n\/?a|na|none|no answer|blank|skip|not applicable)$/i;
const IMPORTED_INTAKE_STATUS = 'Imported / Entered';
const THA_FIELD_PREP_FIELDS = [
  'electricalPanel','electricalUpdates','waterShutoff','plumbingHistory','waterHeater','sewerIrrigation','hvacFilter','hvacService','hvacAcService','comfort','roofAge','roofHistory','solar','drainagePooling','drainageHistory','gutters','windowsDoors','fogging','paintStain','productsColors','pests','fireExtinguishers','smokeCO','chimney','additionalConcerns'
];
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
  { keys: ['paintStain','productsColors'], category: 'Painting / Staining / Protective Coatings', target: 'Exterior / Surfaces', title: 'Exterior / surfaces intake follow-up', trade: 'Handyman', prompt: 'Review exterior finish timing, visible wear, caulk/surface condition, and any product or color label information.', why: 'Finish history is helpful for staging maintenance, but it is not automatically a PMR finding.', action: 'Use confirmed wear or missing product context to shape maintenance notes or a PMR recommendation.' },
  { keys: ['pests'], category: 'Pest', target: 'Exterior / Interior', title: 'Pest intake follow-up', trade: 'Pest', prompt: 'Look for accessible signs related to the homeowner-reported pest history or concern.', why: 'Pest history should be separated from active evidence until field review confirms what is present.', action: 'Add a PMR finding or specialist recommendation only if active evidence or meaningful risk is observed.' },
  { keys: ['fireExtinguishers','smokeCO'], category: 'Safety', target: 'Safety Devices', title: 'Safety intake follow-up', trade: 'Safety', prompt: 'Verify extinguisher location/age and smoke/CO detector age, placement, and visible test/date information where accessible.', why: 'Safety devices are important, but intake notes should trigger review rather than automatic checklist status changes.', action: 'Recommend replacement, testing, labeling, or follow-up only when review confirms a concern or incomplete information.' },
  { keys: ['additionalConcerns'], category: 'General / Misc', target: 'General Walkthrough', title: 'General / miscellaneous intake follow-up', trade: 'Handyman', prompt: 'Use the homeowner’s additional concern as a targeted prompt during the walkthrough and capture what is actually observed.', why: 'General concerns preserve homeowner context without turning intake alone into a PMR finding.', action: 'Convert to a PMR finding only if field review confirms a specific concern that belongs in the Priority Action Plan.' }
];
function intakeSummary(intake) {
  const priorities = Array.isArray(intake.priorities) ? intake.priorities.join(', ') : intake.priorities || 'Not selected';
  return { priorities, pace: intake.pace || 'Not selected', budget: intake.budgetStyle || 'Not selected', decision: intake.decisionStyle || 'Not selected', notes: intake.notes || 'No additional homeowner notes recorded yet.' };
}
function intakeInfluence(item, intake) {
  const pace = intake?.pace || '';
  const budget = intake?.budgetStyle || '';
  if (pace === 'Do now') return 'Homeowner prefers timely action, so this item can be staged sooner if aligned with scope and budget.';
  if (pace === 'Budget over time') return 'Homeowner prefers staged planning, so this can be grouped into a future phase unless risk increases.';
  if (pace === 'Watchlist only') return 'Homeowner prefers monitoring, so this should remain on the watchlist unless symptoms worsen.';
  if (budget === 'Minimal fixes') return 'Keep the first step practical and limited unless further discovery changes the scope.';
  if (budget === 'Invest where it matters') return 'Recommend the solution that best protects long-term value, not only the cheapest short-term fix.';
  return 'No homeowner pace or budget preference has been recorded yet; use field observations to define the practical first step.';
}
function intakeFieldLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase());
}

function normalizeStructuredIntakeGroupValue(value, group) {
  const empty = Object.fromEntries((group?.fields || []).map(field => [field.key, '']));
  if (!group) return {};
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...empty, ...Object.fromEntries(Object.entries(value).map(([key, item]) => [key, String(item || '')])) };
  }
  const text = String(value || '').trim();
  if (!text) return empty;
  const lines = text.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const next = { ...empty };
  const unmatched = [];
  lines.forEach(line => {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) {
      unmatched.push(line);
      return;
    }
    const label = match[1].trim().toLowerCase();
    const field = group.fields.find(option => option.label.toLowerCase() === label);
    if (field) next[field.key] = match[2].trim();
    else unmatched.push(line);
  });
  if (!lines.length) unmatched.push(text);
  const fallback = group.fields[group.fields.length - 1]?.key;
  if (fallback && unmatched.length) next[fallback] = [next[fallback], unmatched.join('\n')].filter(Boolean).join('\n');
  return next;
}
function structuredIntakeGroupValue(intake = {}, groupKey) {
  return normalizeStructuredIntakeGroupValue(intake?.[groupKey], STRUCTURED_HOMEOWNER_QUICK_INTAKE_LOOKUP[groupKey]);
}
function structuredIntakeAnswerValue(intake = {}, groupKey, fieldKey) {
  return structuredIntakeGroupValue(intake, groupKey)[fieldKey] || '';
}
function normalizeIntakeData(intake = {}) {
  const base = { ...blankIntakeTemplate(), ...(intake || {}) };
  STRUCTURED_HOMEOWNER_QUICK_INTAKE_GROUPS.forEach(group => {
    base[group.key] = normalizeStructuredIntakeGroupValue(base[group.key], group);
  });
  base.intakeId = String(base.intakeId || '').trim();
  base.intakeStatus = String(base.intakeStatus || '').trim();
  base.importedRawResponse = String(base.importedRawResponse || '');
  base.importedUnmappedNotes = String(base.importedUnmappedNotes || '');
  return base;
}
function meaningfulIntakeValue(value) {
  if (Array.isArray(value)) return value.length ? value.join(', ') : '';
  if (value && typeof value === 'object') return meaningfulIntakeValue(Object.values(value).filter(item => String(item || '').trim()).join('\n'));
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^(n\/?a|none|no|unknown)$/i.test(text)) return '';
  return text;
}
function completedIntakeFieldCount(intake = {}, fields = []) {
  return fields.filter(key => meaningfulIntakeValue(intake[key])).length;
}
function generateIntakeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `THA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  return `THA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
function isUnknownIntakeAnswer(value) {
  const text = String(value || '').trim();
  return !text || INTAKE_UNKNOWN_ANSWER_PATTERN.test(text);
}
function normalizeImportLabel(value = '') {
  return String(value).toLowerCase().replace(/[—–-]/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
}
function normalizeLoose(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function extractLabeledValue(text, labels = []) {
  const lines = String(text || '').split(/\r?\n/);
  const normalizedLabels = labels.map(normalizeImportLabel);
  for (const line of lines) {
    const match = line.match(/^\s*([^:]+):\s*(.*)\s*$/);
    if (!match) continue;
    if (normalizedLabels.includes(normalizeImportLabel(match[1]))) return match[2].trim();
  }
  return '';
}
function parseIntakeResponseText(rawText = '') {
  const text = String(rawText || '');
  const detected = {
    intakeId: extractLabeledValue(text, ['Intake ID']) || (text.match(/\bTHA-[A-Z0-9-]{4,}\b/i)?.[0] || '').toUpperCase(),
    clientName: extractLabeledValue(text, ['Client Name']),
    projectAddress: extractLabeledValue(text, ['Project Address', 'Address']),
    walkthroughDate: extractLabeledValue(text, ['Walkthrough Date / Visit Label', 'Walkthrough Date', 'Visit Label'])
  };
  const labelMap = new Map();
  HOMEOWNER_QUICK_INTAKE_TEXT_FIELDS.forEach(field => labelMap.set(normalizeImportLabel(field.label), { type: 'plain', key: field.key, label: field.label }));
  STRUCTURED_HOMEOWNER_QUICK_INTAKE_GROUPS.forEach(group => {
    labelMap.set(normalizeImportLabel(group.question), { type: 'group', key: group.key, label: group.question });
    group.fields.forEach(field => labelMap.set(normalizeImportLabel(field.label), { type: 'structured', groupKey: group.key, fieldKey: field.key, label: field.label }));
  });
  const mapped = {};
  const consumed = new Set();
  const lines = text.split(/\r?\n/);
  const metadataLabels = ['intake id', 'client name', 'project address', 'address', 'walkthrough date visit label', 'walkthrough date', 'visit label'];
  const targetForLine = (line) => {
    const match = line.match(/^\s*(?:[-*]\s*)?([^:]+):\s*(.*)\s*$/);
    if (!match) return null;
    const normalized = normalizeImportLabel(match[1]);
    const exact = labelMap.get(normalized);
    if (exact?.type === 'plain' || exact?.type === 'structured') return { target: exact, value: match[2] };
    const looseMatch = [...labelMap.entries()].find(([label, target]) => (target.type === 'plain' || target.type === 'structured') && (label.includes(normalized) || normalized.includes(label)) && Math.min(label.length, normalized.length) > 12);
    return looseMatch ? { target: looseMatch[1], value: match[2] } : null;
  };
  const continuationValue = (startIndex) => {
    const values = [];
    for (let i = startIndex + 1; i < lines.length; i += 1) {
      const trimmed = lines[i].trim();
      if (!trimmed) {
        if (values.length) break;
        continue;
      }
      const label = trimmed.match(/^\s*([^:]+):/)?.[1] || '';
      if (targetForLine(lines[i]) || metadataLabels.includes(normalizeImportLabel(label)) || labelMap.has(normalizeImportLabel(trimmed))) break;
      values.push(trimmed);
      consumed.add(i);
    }
    return values.join('\n');
  };
  const setMappedValue = (target, value) => {
    const clean = String(value || '').trim();
    if (isUnknownIntakeAnswer(clean)) return;
    if (target.type === 'plain') mapped[target.key] = clean;
    if (target.type === 'structured') mapped[target.groupKey] = { ...(mapped[target.groupKey] || {}), [target.fieldKey]: clean };
  };
  lines.forEach((line, index) => {
    const parsedLine = targetForLine(line);
    if (!parsedLine) return;
    setMappedValue(parsedLine.target, parsedLine.value || continuationValue(index));
    consumed.add(index);
  });
  const unmapped = lines.filter((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (consumed.has(index)) return false;
    const label = trimmed.match(/^\s*([^:]+):/)?.[1] || '';
    if (metadataLabels.includes(normalizeImportLabel(label))) return false;
    if (/^(subject|hello|hi|thank you|thanks|homeowner quick intake|please reply)/i.test(trimmed)) return false;
    return true;
  }).join('\n').trim();
  return { detected, mapped, unmapped, rawText: text };
}
function buildPreWalkthroughIntakeEmail({ client = {}, intakeId = '' }) {
  const lines = [
    `Subject: Homeowner Quick Intake for ${client.address || 'your walkthrough'}`,
    '',
    'Hello,',
    '',
    'Before the walkthrough, please reply to this email with any context you want THA to know. Unknown answers are completely okay — please leave anything blank or write “Unknown” if you are not sure.',
    '',
    'Your answers are homeowner-provided context. HTC verifies conditions during the walkthrough, and PMR findings are created only after THA review.',
    '',
    `Client Name: ${client.name || ''}`,
    `Project Address: ${client.address || ''}`,
    `Walkthrough Date / Visit Label: ${client.date || ''}`,
    `Intake ID: ${intakeId || ''}`,
    '',
    'Homeowner Quick Intake',
    '',
    `${HOMEOWNER_QUICK_INTAKE_TEXT_FIELDS[0].label}:`,
    '',
    `${HOMEOWNER_QUICK_INTAKE_TEXT_FIELDS[1].label}:`,
    ''
  ];
  STRUCTURED_HOMEOWNER_QUICK_INTAKE_GROUPS.forEach(group => {
    lines.push(group.question);
    if (group.help) lines.push(`Note: ${group.help}`);
    group.fields.forEach(field => lines.push(`${field.label}:`));
    lines.push('');
  });
  lines.push(`${HOMEOWNER_QUICK_INTAKE_TEXT_FIELDS[2].label}:`, '', 'Thank you,', 'The Homeowner Advocate');
  return lines.join('\n');
}
function flattenedImportUpdates(mapped = {}) {
  const rows = [];
  HOMEOWNER_QUICK_INTAKE_TEXT_FIELDS.forEach(field => {
    if (!isUnknownIntakeAnswer(mapped[field.key])) rows.push({ key: field.key, label: field.label, value: mapped[field.key] });
  });
  STRUCTURED_HOMEOWNER_QUICK_INTAKE_GROUPS.forEach(group => {
    const groupValues = mapped[group.key] || {};
    group.fields.forEach(field => {
      const value = groupValues[field.key];
      if (!isUnknownIntakeAnswer(value)) rows.push({ key: group.key, fieldKey: field.key, label: `${group.question} — ${field.label}`, value });
    });
  });
  return rows;
}
function addressAppearsToMatch(detectedAddress = '', currentAddress = '') {
  if (!detectedAddress.trim() || !currentAddress.trim()) return true;
  const detected = normalizeLoose(detectedAddress);
  const current = normalizeLoose(currentAddress);
  return detected.includes(current) || current.includes(detected);
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
      prompt: `Homeowner-reported context — verify during HTC: ${mapping.prompt}`,
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
  const rawCategory = String(item.category || '');
  const trade = item.trade || item.answer?.trade || '';
  const text = categoryText(item);

  if (category === 'HVAC / Mechanical' || trade === 'HVAC') return 'HVAC';
  if (category === 'Plumbing' || trade === 'Plumbing') return 'Plumbing';
  if (rawCategory === 'Roofing' || trade === 'Roof' || trade === 'Chimney' || /(roof|chimney|fireplace)/.test(text)) return 'Roofing';
  if ((category === 'Handy Services' || trade === 'Handyman') && /(downspout extension|gutter extension|extension attachment|splash block)/.test(text)) return 'Handy Services';
  if (/(gutter|downspout)/.test(text)) return 'Roofing / gutters';
  if (rawCategory === 'Drainage' || /(drainage|grading|pooling)/.test(text)) return 'Gutters/Drainage';
  if (category === 'Pest' || trade === 'Pest') return 'Pest';
  if (category === 'Safety / Life Safety' || trade === 'Safety') return 'Safety';
  if (category === 'Appliances' || trade === 'Appliance') return 'Appliance';
  if (category === 'Handy Services' || trade === 'Handyman') return 'Handy Services';

  return 'Other';
}

function passTextMatchesRule(text = '', rule = {}) {
  const normalized = String(text || '').toLowerCase();
  return (rule.rowKeywords || []).some(keyword => normalized.includes(keyword));
}
function passCareTopicForRow(row = {}) {
  const text = `${row.roomName || row.room || ''} ${row.zone || row.section || ''} ${row.item || ''} ${row.prompt || ''} ${row.answer?.notes || ''}`;
  const match = PASS_CARE_RULES.find(rule => passTextMatchesRule(text, rule));
  if (match) {
    return { careTopicId: `generated-pass-${match.id}`, careTopic: match.careItem };
  }
  return { careTopicId: `manual-pass-topic-${row.id}`, careTopic: row.item || 'Manual PMCP topic' };
}
function passIntakeValueByKey(intake = {}, key = '') {
  const direct = meaningfulIntakeValue(intake[key]);
  if (direct) return direct;
  for (const group of STRUCTURED_HOMEOWNER_QUICK_INTAKE_GROUPS) {
    if (!group.fields.some(field => field.key === key)) continue;
    const structured = meaningfulIntakeValue(structuredIntakeAnswerValue(intake, group.key, key));
    if (structured) return structured;
  }
  return '';
}
function passIntakeValueForRule(intake = {}, rule = {}) {
  const values = (rule.intakeKeys || []).map(key => ({ key, value: passIntakeValueByKey(intake, key) })).filter(item => item.value);
  return values[0] || null;
}
function passIntakeEvidence(intake = {}, rule = {}) {
  const item = passIntakeValueForRule(intake, rule);
  if (!item) return null;
  return { source: 'Intake', label: intakeFieldLabel(item.key), value: item.value };
}
function passIntakeBasis(intake = {}, rule = {}) {
  const item = passIntakeEvidence(intake, rule);
  if (!item) return '';
  const unknownish = /unknown|not sure|unsure|last .*unknown|history unknown|date unknown|age unknown|verify|ask/i.test(item.value);
  if (unknownish) return `Unknown service history: ${item.label} — ${item.value}`;
  return `Homeowner-reported service history: ${item.label} — ${item.value}`;
}
function passHtcEvidenceRows(rows = [], rule = {}) {
  return rows.filter(row => {
    const text = `${row.roomName || row.room || ''} ${row.zone || ''} ${row.item || ''} ${row.prompt || ''} ${row.answer?.notes || ''}`;
    return passTextMatchesRule(text, rule) && row.answer?.addToPmcpBuilder;
  });
}
function passRoutineObservationBasis(rows = [], rule = {}) {
  const matches = passHtcEvidenceRows(rows, rule).slice(0, 2);
  if (!matches.length) return '';
  return `HTC PMCP item: ${matches.map(row => `${row.roomName || row.room || 'HTC'} / ${row.zone || row.section || 'Checklist'} / ${row.item}`).join('; ')}`;
}
function passSourceLabel({ intakeEvidence, htcRows = [], source } = {}) {
  if (source === 'manual') return 'HTC';
  if (intakeEvidence && htcRows.length) return 'Intake + HTC';
  if (intakeEvidence) return 'Intake';
  if (htcRows.length) return 'HTC';
  return 'Catalog only';
}
function buildPassCatalogItem(rule = {}, intake = {}, rows = [], passReview = {}, passCareOutlook = []) {
  const intakeEvidence = passIntakeEvidence(intake, rule);
  const htcRows = passHtcEvidenceRows(rows, rule);
  const itemId = `generated-pass-${rule.id}`;
  const matchedSelection = passCareOutlook.find(item => item.id === itemId || item.careTopicId === rule.id || item.rule?.id === rule.id);
  const review = passReview[itemId] || passReview[rule.id] || passReview[matchedSelection?.id || ''] || {};
  const pmcpDecision = pmcpDecisionForReview(review);
  const sourceLabel = passSourceLabel({ intakeEvidence, htcRows });
  const item = {
    id: itemId,
    source: 'catalog',
    careItem: rule.careItem,
    category: rule.category,
    careTopic: rule.category,
    careTopicId: rule.id,
    reason: rule.reason,
    targetWindow: rule.suggestedWindow,
    suggestedWindow: `Suggested window: ${rule.suggestedWindow}`,
    cadence: rule.cadence,
    cadenceMonths: rule.cadenceMonths,
    resource: rule.resource,
    followUpStatus: PASS_FOLLOW_UP_STATUSES[0],
    internalNote: '',
    groupingNote: rule.groupingNote || '',
    basis: [passIntakeBasis(intake, rule), passRoutineObservationBasis(rows, rule), `Common care cadence: ${rule.cadence}`].filter(Boolean).join(' · '),
    sourceEvidence: { label: sourceLabel, intakeEvidence, htcRows },
    rule,
    pmcpDecision,
    selected: pmcpDecision === 'selected'
  };
  const calendarFields = buildPassCalendarFields({ rule, intake, rows, item, review });
  return { ...item, ...calendarFields, selected: pmcpDecision === 'selected' };
}
function pmcpDecisionForReview(review = {}) {
  return ['pending', 'selected', 'declined'].includes(review.pmcpDecision) ? review.pmcpDecision : 'pending';
}
function normalizePassReviewData(passReview = {}) {
  return Object.fromEntries(Object.entries(passReview || {}).map(([id, review = {}]) => {
    const { included, ...rest } = review || {};
    return [id, { ...rest, pmcpDecision: pmcpDecisionForReview(rest) }];
  }));
}
function passManualBasis(row = {}) {
  return ['HTC PMCP item', row.roomName || row.room, row.zone || row.section, row.item].filter(Boolean).join(' · ');
}
function passDateSourceText(source = 'unknown') {
  const normalized = String(source || '').trim();
  return PASS_DATE_SOURCES.includes(normalized) ? normalized : 'unknown';
}
function passCalendarToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
function passIsoDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function passDisplayDate(value = '') {
  const parsed = parsePassServiceDate(value);
  if (!parsed) return String(value || '').trim();
  return parsed.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}
function addPassMonths(date, months = 0) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime()) || !Number.isFinite(months)) return null;
  const next = new Date(date);
  const day = next.getDate();
  next.setMonth(next.getMonth() + months);
  if (next.getDate() < day) next.setDate(0);
  return next;
}
function parsePassServiceDate(value = '', today = passCalendarToday()) {
  const text = String(value || '').trim();
  if (!text) return null;
  const iso = text.match(/\b(20\d{2}|19\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const slash = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  if (slash) {
    const year = Number(slash[3].length === 2 ? `20${slash[3]}` : slash[3]);
    return new Date(year, Number(slash[1]) - 1, Number(slash[2]));
  }
  const monthName = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
  const monthMatch = text.match(new RegExp(`\\b${monthName}\\s+(\\d{1,2},?\\s+)?(20\\d{2}|19\\d{2})\\b`, 'i'));
  if (monthMatch) {
    const monthIndex = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].findIndex(m => monthMatch[1].toLowerCase().startsWith(m));
    const day = monthMatch[2] ? Number(monthMatch[2].replace(/\D/g, '')) || 1 : 1;
    return new Date(Number(monthMatch[3]), monthIndex, day);
  }
  const monthsAgo = text.match(/\b(\d+)\s+months?\s+ago\b/i);
  if (monthsAgo) return addPassMonths(today, -Number(monthsAgo[1]));
  if (/\blast\s+month\b/i.test(text) || /\bone\s+month\s+ago\b/i.test(text)) return addPassMonths(today, -1);
  const yearsAgo = text.match(/\b(\d+)\s+years?\s+ago\b/i);
  if (yearsAgo) return addPassMonths(today, -Number(yearsAgo[1]) * 12);
  return null;
}
function passLastCompletedFromIntake(intake = {}, rule = {}) {
  for (const key of rule.intakeKeys || []) {
    const value = passIntakeValueByKey(intake, key);
    const date = parsePassServiceDate(value);
    if (date) return { date, value, source: 'homeowner-reported', label: intakeFieldLabel(key) };
  }
  return null;
}
function passLastCompletedFromRows(rows = [], rule = {}) {
  for (const row of rows || []) {
    const text = `${row.roomName || row.room || ''} ${row.zone || ''} ${row.item || ''} ${row.prompt || ''} ${row.answer?.notes || ''}`;
    if (!passTextMatchesRule(text, rule)) continue;
    const date = parsePassServiceDate(row.answer?.notes || '');
    if (date) return { date, value: row.answer.notes, source: 'THA observed', label: row.item };
  }
  return null;
}
function buildPassCalendarFields({ rule = {}, intake = {}, rows = [], review = {}, item = {} } = {}) {
  const reviewedDate = review.lastCompletedDate || review.completedDate;
  const reviewedSource = review.dateSource;
  const parsedReviewed = parsePassServiceDate(reviewedDate);
  const intakeDate = passLastCompletedFromIntake(intake, rule);
  const observedDate = passLastCompletedFromRows(rows, rule);
  const itemDate = parsePassServiceDate(item.lastCompletedDate);
  const selected = parsedReviewed
    ? { date: parsedReviewed, value: reviewedDate, source: passDateSourceText(reviewedSource || 'homeowner-reported'), label: 'THA review override' }
    : (intakeDate || observedDate || (itemDate ? { date: itemDate, value: item.lastCompletedDate, source: passDateSourceText(item.dateSource), label: 'stored PASS calendar date' } : null));
  const cadenceMonths = Number.isFinite(Number(review.cadenceMonths)) ? Number(review.cadenceMonths) : (Number.isFinite(Number(item.cadenceMonths)) ? Number(item.cadenceMonths) : rule.cadenceMonths);
  const lastCompletedDate = selected?.date ? passIsoDate(selected.date) : '';
  const dateSource = selected?.source || passDateSourceText(reviewedSource || item.dateSource);
  const nextDate = selected?.date && Number.isFinite(cadenceMonths) ? addPassMonths(selected.date, Number(cadenceMonths)) : null;
  const cadence = review.cadence ?? item.cadence ?? rule.cadence ?? 'As Needed';
  const nextSuggestedWindow = selected?.date && nextDate
    ? `About ${passDisplayDate(passIsoDate(nextDate))}`
    : (review.nextSuggestedWindow || review.targetWindow || item.targetWindow || `Establish baseline at next seasonal visit; then use ${cadence} cadence.`);
  const followUpStatus = passPlanningStatusText(review.followUpStatus ?? item.followUpStatus ?? (selected?.date ? 'Not Scheduled' : 'Verify / Establish Baseline'));
  return {
    lastCompletedDate,
    lastCompletedDisplay: selected?.date ? passDisplayDate(passIsoDate(selected.date)) : 'Unknown — Verify / Establish Baseline',
    dateSource,
    nextSuggestedWindow,
    followUpStatus,
    groupingNote: review.groupingNote ?? item.groupingNote ?? rule.groupingNote ?? '',
    dateBasis: selected ? `${selected.source}: ${selected.label || 'service history'}${selected.value ? ` — ${selected.value}` : ''}` : 'Unknown service history'
  };
}
function passUpcomingBucket(item = {}) {
  const text = String(item.nextSuggestedWindow || item.targetWindow || '').toLowerCase();
  if (text.includes('baseline')) return 'Verify / Establish Baseline';
  if (text.includes('spring')) return 'Spring window';
  if (text.includes('fall')) return 'Fall window';
  if (text.includes('season')) return 'Next seasonal visit';
  if (text.includes('about')) return 'Date-based follow-up';
  if (text.includes('condition')) return 'Condition-based / as needed';
  return 'Next practical window';
}
function groupPassCalendar(items = [], keyFn = item => item.resource || 'Other') {
  return items.reduce((acc, item) => {
    const key = keyFn(item) || 'Other';
    acc[key] = [...(acc[key] || []), item];
    return acc;
  }, {});
}
function passPlanningStatusText(status = '') {
  return PASS_FOLLOW_UP_STATUSES.includes(status) ? status : PASS_FOLLOW_UP_STATUSES[0];
}
function passHomeownerFollowUpLanguage(item = {}) {
  const windowText = passSuggestedWindowText(item.targetWindow || item.suggestedWindow || 'next normal care window') || 'next normal care window';
  const cadence = item.cadence || 'as appropriate';
  const resource = item.resource || 'THA review';
  const status = passPlanningStatusText(item.followUpStatus);
  return `Continued-care status: ${status}. Best reviewed during ${windowText}, then kept on a ${cadence} cadence with ${resource}. This is planning guidance for routine care, not an urgent repair item.`;
}
function passManualCareRow(row = {}, review = {}) {
  const topic = passCareTopicForRow(row);
  const item = {
    id: `manual-pass-${row.id}`,
    source: 'manual',
    careItem: row.item || 'Manual PMCP topic',
    careTopic: topic.careTopic,
    careTopicId: topic.careTopicId,
    reason: 'A continued-care item was noted during the walkthrough for future seasonal or routine planning.',
    targetWindow: row.answer?.passTargetWindow || 'Next normal care window',
    suggestedWindow: row.answer?.passTargetWindow ? `Suggested window: ${row.answer.passTargetWindow}` : 'Suggested window: Next normal care window',
    cadence: row.answer?.passCadence || passCadenceFor(row),
    resource: row.answer?.passResource || passResourceFor(row),
    followUpStatus: passPlanningStatusText(row.answer?.passFollowUpStatus),
    internalNote: row.answer?.passNote || '',
    groupingNote: row.answer?.passGroupingNote || '',
    basis: passManualBasis(row),
    sourceEvidence: { label: 'HTC', htcRows: [row] },
    row
  };
  return {
    ...item,
    ...buildPassCalendarFields({ rule: {}, rows: [row], item, review: { followUpStatus: item.followUpStatus, ...review } })
  };
}
function passRoomOverviewCareRow(section = {}, capture = {}, review = {}) {
  const careTopicId = roomOverviewCareTopicId(section.key);
  const careTopic = roomOverviewCareTopic(section);
  const targetWindow = 'Next normal care window';
  const item = {
    id: careTopicId,
    source: 'room-overview',
    careItem: careTopic,
    careTopic,
    careTopicId,
    reason: `Room overview planning item created from ${section.label || section.key} to support PMCP follow-up.`,
    targetWindow,
    suggestedWindow: `Suggested window: ${targetWindow}`,
    cadence: 'As Needed',
    resource: 'Other',
    followUpStatus: PASS_FOLLOW_UP_STATUSES[0],
    internalNote: capture.note || '',
    groupingNote: '',
    basis: `${section.label || section.key} room overview`,
    sourceEvidence: { label: 'Room Overview', htcRows: [] },
    row: {
      id: careTopicId,
      roomName: section.label || section.roomName || section.key || 'Room',
      room: section.label || section.roomName || section.key || 'Room',
      zone: 'Room Overview',
      item: careTopic,
      answer: {
        trade: 'Handyman',
        status: capture.status || 'Unknown',
        notes: capture.note || '',
        pref: 'Plan soon',
        effort: 'Unknown',
        actionCertainty: 'Likely Path',
        photos: photoList(capture),
        photoRef: ''
      }
    }
  };
  return {
    ...item,
    ...buildPassCalendarFields({ rule: {}, rows: [], item, review: { followUpStatus: item.followUpStatus, ...review } })
  };
}
function buildPassCareOutlook({ intake = {}, rows = [], passReview = {}, roomCapture = {}, sections = [] } = {}) {
  const normalizedRows = Array.isArray(rows) ? rows : [];
  const manualRows = normalizedRows.filter(row => row.answer?.addToPmcpBuilder).map(row => {
    const manualId = `manual-pass-${row.id}`;
    return passManualCareRow(row, passReview?.[manualId] || {});
  });
  const roomOverviewRows = (Array.isArray(sections) ? sections : []).map(section => {
    const capture = roomCapture?.[section.key] || {};
    if (!capture?.addToPmcpBuilder) return null;
    const topicId = roomOverviewCareTopicId(section.key);
    return passRoomOverviewCareRow(section, capture, passReview?.[topicId] || {});
  }).filter(Boolean);
  const generatedRows = PASS_CARE_RULES.map(rule => {
    const intakeEvidence = passIntakeEvidence(intake, rule);
    const htcRows = passHtcEvidenceRows(normalizedRows, rule);
    if (!intakeEvidence && !htcRows.length) return null;
    const basis = [passIntakeBasis(intake, rule), passRoutineObservationBasis(normalizedRows, rule), `Common care cadence: ${rule.cadence}`].filter(Boolean).join(' · ');
    const careTopic = rule.careItem;
    const base = {
      id: `generated-pass-${rule.id}`,
      source: 'generated',
      careItem: rule.careItem,
      careTopic,
      careTopicId: rule.id,
      reason: rule.reason,
      targetWindow: rule.suggestedWindow,
      suggestedWindow: `Suggested window: ${rule.suggestedWindow}`,
      cadence: rule.cadence,
      cadenceMonths: rule.cadenceMonths,
      resource: rule.resource,
      followUpStatus: PASS_FOLLOW_UP_STATUSES[0],
      internalNote: '',
      groupingNote: rule.groupingNote || '',
      basis,
      sourceEvidence: { label: passSourceLabel({ intakeEvidence, htcRows }), intakeEvidence, htcRows },
      rule
    };
    const calendarFields = buildPassCalendarFields({ rule, intake, rows: normalizedRows, item: base, review: passReview?.[base.id] || {} });
    return { ...base, ...calendarFields, suggestedWindow: `Suggested window: ${calendarFields.nextSuggestedWindow}` };
  }).filter(Boolean);
  const generatedMatchedRows = new Set(generatedRows.flatMap(item => item.sourceEvidence?.htcRows || []).map(row => row.id));
  return [...manualRows.filter(item => !generatedMatchedRows.has(item.row?.id)), ...roomOverviewRows, ...generatedRows];
}
function passSuggestedWindowText(value = '') {
  return String(value || '').replace(/^Suggested window:\s*/i, '').trim();
}
function applyPassReview(passItems = [], passReview = {}, { includeHidden = false } = {}) {
  return passItems
    .map(item => {
      const review = passReview?.[item.id] || {};
      const reviewedTargetWindow = review.targetWindow ?? (review.suggestedWindow ? passSuggestedWindowText(review.suggestedWindow) : undefined);
      const targetWindow = reviewedTargetWindow ?? item.targetWindow ?? passSuggestedWindowText(item.suggestedWindow);
      return {
        ...item,
        pmcpDecision: pmcpDecisionForReview(review),
        reason: review.reason ?? item.reason,
        targetWindow,
        suggestedWindow: targetWindow ? `Suggested window: ${targetWindow}` : (review.suggestedWindow ?? item.suggestedWindow),
        cadence: review.cadence ?? item.cadence,
        resource: review.resource ?? item.resource,
        followUpStatus: passPlanningStatusText(review.followUpStatus ?? item.followUpStatus),
        internalNote: review.internalNote ?? item.internalNote ?? ''
      };
    })
    .filter(item => includeHidden || item.pmcpDecision === 'selected');
}

function normalizeCareTopicToken(value = '') {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function baselineTopicEvidence(topic = {}, intake = {}, rows = []) {
  const intakeEvidence = (topic.intakeKeys || [])
    .map(key => ({ label: intakeFieldLabel(key), value: meaningfulIntakeValue(passIntakeValueByKey(intake, key)) }))
    .filter(item => item.value)
    .slice(0, 2);
  const keywords = (topic.rowKeywords || []).map(keyword => String(keyword || '').toLowerCase());
  const rowEvidence = (rows || [])
    .filter(row => {
      const text = `${row.roomName || row.room || ''} ${row.zone || row.section || ''} ${row.item || ''} ${row.prompt || ''}`.toLowerCase();
      return keywords.some(keyword => text.includes(keyword));
    })
    .map(row => `${row.roomName || row.room || 'HTC'} / ${row.zone || row.section || 'Checklist'} / ${row.item || 'Item'}`)
    .slice(0, 2);
  const evidence = [];
  if (intakeEvidence.length) evidence.push(`Intake: ${intakeEvidence.map(item => `${item.label} — ${item.value}`).join('; ')}`);
  if (rowEvidence.length) evidence.push(`HTC: ${rowEvidence.join('; ')}`);
  return evidence;
}

function buildBaselineCareModel({ intake = {}, rows = [], passCareCandidates = [], passCareOutlook = [] } = {}) {
  const selectedIds = new Set((passCareOutlook || []).map(item => item.id));
  const supportedItems = (passCareCandidates || []).map(item => ({
    id: item.id,
    careItem: item.careItem,
    careTopicId: String(item.careTopicId || '').replace(/^generated-pass-/, ''),
    selectedForPmcp: selectedIds.has(item.id),
    reason: item.reason || '',
    sourceLabel: item.sourceEvidence?.label || passSourceLabel({ source: item.source, intakeEvidence: item.sourceEvidence?.intakeEvidence, htcRows: item.sourceEvidence?.htcRows || [] })
  }));

  const supportedTokens = new Set(
    supportedItems.flatMap(item => [normalizeCareTopicToken(item.careItem), normalizeCareTopicToken(item.careTopicId)]).filter(Boolean)
  );
  const supportedRuleIds = new Set(supportedItems.map(item => item.careTopicId).filter(Boolean));

  const baselineItems = BASELINE_CARE_TOPICS.filter(topic => {
    if ((topic.linkedRuleIds || []).some(ruleId => supportedRuleIds.has(ruleId))) return false;
    const topicMatchesSupported = (topic.rowKeywords || []).some(keyword => supportedTokens.has(normalizeCareTopicToken(keyword)))
      || supportedTokens.has(normalizeCareTopicToken(topic.title));
    return !topicMatchesSupported;
  }).map(topic => ({ ...topic, evidence: baselineTopicEvidence(topic, intake, rows) }));

  const homeSpecificCare = supportedItems.filter(item => !item.selectedForPmcp);
  return { baselineItems, homeSpecificCare };
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

const DEFAULT_SECTION_ORDER = ['Exterior','Kitchen','Living / Family Rooms','Bedrooms','Bathrooms','Mechanical','Laundry','Safety'];
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
const sectionOrder = [...DEFAULT_SECTION_ORDER];
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
function pmrReportLabel(answer = {}) {
  return includePMR(answer) ? 'Repair report: Included' : 'Repair report: None';
}
function pmrReportPillClass(answer = {}) {
  return includePMR(answer) ? 'pmr-included' : 'pmr-none';
}
function currentWorkOrderLabel(answer = {}) {
  if (!(answer?.thaActionItem || answer?.workOrderNow)) return '';
  return `THA action-item: ${answer?.thaActionType || 'Research'}`;
}
function roomOverviewCareTopicId(sectionKey = '') {
  return `room-overview-pass-${String(sectionKey || 'room').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}
function roomOverviewCareTopic(section = {}) {
  return `${section?.label || section?.roomName || section?.key || 'Room'} room overview care plan`;
}
function passCareSelectionForRow(row = {}, passCareOutlook = []) {
  const topic = passCareTopicForRow(row);
  const careItem = passCareOutlook.find(item => item.careTopicId === topic.careTopicId || item.id === topic.careTopicId);
  return { careTopicId: topic.careTopicId, careTopic: topic.careTopic, pmcpDecision: careItem ? pmcpDecisionForReview(careItem) : 'pending', careItem };
}
function passCareSelectionForRoom(section = {}, passCareOutlook = []) {
  const careTopicId = roomOverviewCareTopicId(section.key);
  const careItem = passCareOutlook.find(item => item.careTopicId === careTopicId || item.id === careTopicId);
  return { careTopicId, careTopic: roomOverviewCareTopic(section), pmcpDecision: careItem ? pmcpDecisionForReview(careItem) : 'pending', careItem };
}
function railStateFor(answer = {}, { pmcpSelected = false, workOrderNow = false } = {}) {
  const status = answer?.status || 'Unknown';
  const actionActive = Boolean(workOrderNow || answer?.thaActionItem || answer?.workOrderNow);
  const left = status === 'Unknown' ? 'unknown' : 'blue';
  const right = actionActive ? 'work-now' : (pmcpSelected ? 'pass' : 'none');
  return { left, right };
}
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
  const thaActionItem = typeof answer?.thaActionItem === 'boolean' ? answer.thaActionItem : (typeof answer?.workOrderNow === 'boolean' ? answer.workOrderNow : false);
  return {
    status: answer?.status || 'Unknown',
    trade: answer?.trade || item.trade,
    effort: answer?.effort || item.effort,
    actionCertainty: actionCertaintyFor(answer || {}),
    pref: answer?.pref || 'Watchlist only',
    notes: answer?.notes || '',
    photos: photoList(answer),
    photoRef: answer?.photoRef || '',
    reassignTo: answer?.reassignTo || '',
    isDiscovery: typeof answer?.isDiscovery === 'boolean' ? answer.isDiscovery : false,
    reviewStatus: answer?.reviewStatus || (isIntakeFollowUp(item) ? 'Not Reviewed' : ''),
    passCandidate: typeof answer?.passCandidate === 'boolean' ? answer.passCandidate : false,
    addToPmcpBuilder: typeof answer?.addToPmcpBuilder === 'boolean' ? answer.addToPmcpBuilder : false,
    thaActionItem,
    thaActionType: THA_ACTION_TYPES.includes(answer?.thaActionType) ? answer.thaActionType : 'Research',
    workOrderNow: thaActionItem,
    passTargetWindow: answer?.passTargetWindow || '',
    passCadence: answer?.passCadence || passCadenceFor(item),
    passResource: answer?.passResource || passResourceFor(item),
    passFollowUpStatus: passPlanningStatusText(answer?.passFollowUpStatus),
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
async function uploadDriveBlob(accessToken, folderId, name, blob, mimeType, options = {}) {
  const boundary = `tha_${Date.now()}`;
  const metadata = { name, parents: [folderId], ...(options.metadata || {}) };
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
function uploadDriveHtmlAsGoogleDoc(accessToken, folderId, name, html) {
  return uploadDriveBlob(accessToken, folderId, name, new Blob([html], { type: 'text/html' }), 'text/html', {
    metadata: { mimeType: 'application/vnd.google-apps.document' }
  });
}

function uploadDrivePdf(accessToken, folderId, name, pdfBlob) {
  return uploadDriveBlob(accessToken, folderId, name, pdfBlob, 'application/pdf');
}
function waitForFrameLoad(frame) {
  return new Promise(resolve => {
    const done = () => requestAnimationFrame(() => requestAnimationFrame(resolve));
    frame.onload = done;
    setTimeout(done, 250);
  });
}
function imageLoad(src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to render PMR PDF page image.'));
    image.src = src;
  });
}
function dataUriToBinaryString(dataUri) {
  return atob(String(dataUri).split(',')[1] || '');
}
function pdfEscape(value) {
  return String(value ?? '').replace(/[\\()]/g, '\\$&').replace(/\r/g, '').replace(/\n/g, ' ');
}
function buildImagePdf(pages, { title = 'PMR Report', pageWidth = 612, pageHeight = 792 } = {}) {
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let byteLength = 0;
  const addText = text => {
    const bytes = encoder.encode(text);
    chunks.push(bytes);
    byteLength += bytes.length;
  };
  const addBinary = binary => {
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    chunks.push(bytes);
    byteLength += bytes.length;
  };
  const pageCount = pages.length;
  const catalogId = 1;
  const pagesId = 2;
  const firstPageId = 3;
  const imageObjectId = index => firstPageId + pageCount + (index * 2);
  const contentObjectId = index => imageObjectId(index) + 1;
  const writeObjectStart = id => {
    offsets[id] = byteLength;
    addText(`${id} 0 obj\n`);
  };
  addText('%PDF-1.4\n%THA\n');
  writeObjectStart(catalogId);
  addText(`<< /Type /Catalog /Pages ${pagesId} 0 R >>\nendobj\n`);
  writeObjectStart(pagesId);
  addText(`<< /Type /Pages /Kids ${pages.map((_, index) => `${firstPageId + index} 0 R`).join(' ')} /Count ${pageCount} >>\nendobj\n`);
  pages.forEach((page, index) => {
    const pageId = firstPageId + index;
    writeObjectStart(pageId);
    addText(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im${index + 1} ${imageObjectId(index)} 0 R >> >> /Contents ${contentObjectId(index)} 0 R >>\nendobj\n`);
  });
  pages.forEach((page, index) => {
    const binary = dataUriToBinaryString(page.dataUrl);
    writeObjectStart(imageObjectId(index));
    addText(`<< /Type /XObject /Subtype /Image /Width ${page.pixelWidth} /Height ${page.pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${binary.length} >>\nstream\n`);
    addBinary(binary);
    addText('\nendstream\nendobj\n');
    const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im${index + 1} Do\nQ\n`;
    writeObjectStart(contentObjectId(index));
    addText(`<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);
  });
  const infoId = firstPageId + pageCount + (pageCount * 2);
  writeObjectStart(infoId);
  addText(`<< /Title (${pdfEscape(title)}) /Creator (THA PMR Export) /Producer (THA PMR Export) >>\nendobj\n`);
  const xrefStart = byteLength;
  addText(`xref\n0 ${infoId + 1}\n0000000000 65535 f \n`);
  for (let id = 1; id <= infoId; id += 1) addText(`${String(offsets[id] || 0).padStart(10, '0')} 00000 n \n`);
  addText(`trailer\n<< /Size ${infoId + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);
  const pdfBytes = new Uint8Array(byteLength);
  let cursor = 0;
  chunks.forEach(chunk => { pdfBytes.set(chunk, cursor); cursor += chunk.length; });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
async function buildStyledPdfBlob(html, { title = 'PMR Report' } = {}) {
  if (typeof document === 'undefined' || !window?.Image) throw new Error('PDF export requires a browser rendering environment.');
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:960px;height:1242px;border:0;visibility:hidden;';
  document.body.appendChild(frame);
  try {
    frame.srcdoc = html;
    await waitForFrameLoad(frame);
    const doc = frame.contentDocument;
    if (!doc?.body) throw new Error('Unable to prepare PMR PDF document.');
    const serializer = new XMLSerializer();
    const styleText = Array.from(doc.querySelectorAll('style')).map(style => style.textContent || '').join('\n').replace(/]]>/g, ']]]]><![CDATA[>');
    const bodyMarkup = Array.from(doc.body.childNodes).map(node => serializer.serializeToString(node)).join('');
    const htmlWidth = 960;
    const pageHeightPx = Math.round(htmlWidth * (792 / 612));
    const totalHeight = Math.max(pageHeightPx, doc.documentElement.scrollHeight, doc.body.scrollHeight);
    const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const pages = [];
    for (let y = 0; y < totalHeight; y += pageHeightPx) {
      const visibleHeight = Math.min(pageHeightPx, totalHeight - y);
      const xhtml = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${htmlWidth}px;min-height:${totalHeight}px;background:#fff;"><style><![CDATA[${styleText}]]></style><div style="transform:translateY(-${y}px);transform-origin:top left;width:${htmlWidth}px;">${bodyMarkup}</div></div>`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${htmlWidth}" height="${pageHeightPx}" viewBox="0 0 ${htmlWidth} ${pageHeightPx}"><rect width="100%" height="100%" fill="#ffffff"/><foreignObject x="0" y="0" width="${htmlWidth}" height="${Math.max(totalHeight, visibleHeight)}">${xhtml}</foreignObject></svg>`;
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
      const image = await imageLoad(url);
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(htmlWidth * scale);
      canvas.height = Math.round(pageHeightPx * scale);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas PDF rendering is unavailable in this browser.');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      pages.push({ dataUrl: canvas.toDataURL('image/jpeg', 0.92), pixelWidth: canvas.width, pixelHeight: canvas.height });
    }
    return buildImagePdf(pages, { title });
  } finally {
    frame.remove();
  }
}

function validatePdfBlob(pdfBlob) {
  if (!pdfBlob || pdfBlob.type !== 'application/pdf' || pdfBlob.size < 100) {
    throw new Error('PMR PDF generation failed — browser did not produce a usable PDF file.');
  }
  return pdfBlob;
}
async function tryBuildPmrPdf(html, { title = 'PMR Report' } = {}) {
  try {
    return { pdfBlob: validatePdfBlob(await buildStyledPdfBlob(html, { title })), error: null };
  } catch (error) {
    return { pdfBlob: null, error };
  }
}
async function uploadCoreDriveDoc(accessToken, folderId, name, html) {
  try {
    return await uploadDriveHtmlAsGoogleDoc(accessToken, folderId, name, html);
  } catch (error) {
    throw Object.assign(new Error(`${name} upload failed: ${driveErrorMessage(error, 'Drive upload failed')}`), { code: 'core_upload_failed', cause: error });
  }
}
async function uploadEmergencyBackupHtml(accessToken, backupId, name, html) {
  return uploadDriveHtml(accessToken, backupId, `Emergency Backup — HTML - ${name}.html`, html);
}
async function uploadEmergencyBackupJson(accessToken, backupId, name, data) {
  return uploadDriveJson(accessToken, backupId, `Emergency Backup — Data - ${name}.json`, data);
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
function sanitizePassEvidenceForExport(sourceEvidence = {}) {
  const intakeEvidence = sourceEvidence.intakeEvidence ? {
    label: sourceEvidence.intakeEvidence.label,
    value: sourceEvidence.intakeEvidence.value
  } : undefined;
  const htcRows = (sourceEvidence.htcRows || []).map(row => ({
    id: row.id,
    roomName: row.roomName || row.room || '',
    zone: row.zone || row.section || '',
    item: row.item || '',
    prompt: row.prompt || ''
  }));
  return { label: sourceEvidence.label, intakeEvidence, htcRows };
}
function removePassPrivateFields(item = {}) {
  const { internalNote, row, rule, basis, groupingNote, dateBasis, ...publicItem } = item;
  if (item.sourceEvidence) publicItem.sourceEvidence = sanitizePassEvidenceForExport(item.sourceEvidence);
  return publicItem;
}
function sanitizedPassReviewForExport(passReview = {}, exportedPassIds = new Set()) {
  return Object.fromEntries(Object.entries(passReview || {})
    .filter(([id]) => exportedPassIds.has(id))
    .map(([id, review]) => {
      const { internalNote, included, ...publicReview } = review || {};
      return [id, publicReview];
    })
  );
}
function sanitizeRowsForPassExport(rows = [], visiblePassIds = new Set()) {
  return (rows || []).map(row => {
    const {
      passCandidate: _legacyPassCandidate,
      passTargetWindow: _legacyPassTargetWindow,
      passCadence: _legacyPassCadence,
      passResource: _legacyPassResource,
      passFollowUpStatus: _legacyPassFollowUpStatus,
      passNote: _legacyPassNote,
      ...publicAnswer
    } = row.answer || {};
    return { ...row, answer: publicAnswer };
  });
}
function buildDrivePayload({ walkthroughName = '', client, intake, rows, pmr, passCareOutlook, passReview = {}, dynamicRooms = [], sections = [], sectionOrderState = [], itemOrderState = {}, pinnedItems = {}, roomCapture = {} }) {
  const reviewedPassOutlook = passCareOutlook || applyPassReview(buildPassCareOutlook({ intake, rows, passReview, roomCapture, sections }), passReview);
  const allPassCareCandidates = applyPassReview(buildPassCareOutlook({ intake, rows, passReview, roomCapture, sections }), passReview, { includeHidden: true });
  const passCareCandidatesForExport = allPassCareCandidates.map(removePassPrivateFields);
  const passCareOutlookForExport = reviewedPassOutlook.map(removePassPrivateFields);
  const exportedPassIds = new Set(passCareCandidatesForExport.map(item => item.id));
  const rowsForExport = sanitizeRowsForPassExport(rows, exportedPassIds);
  const pmrForExport = sanitizeRowsForPassExport(pmr, exportedPassIds);
  const passReviewForExport = sanitizedPassReviewForExport(passReview, exportedPassIds);
  return { walkthroughName, client, intake, dynamicRooms, roomCapture, sectionFlow: driveSectionFlow(sections), sectionOrder: sectionOrderState, itemOrder: itemOrderState, pinnedItems, rows: rowsForExport, pmr: pmrForExport, passReview: passReviewForExport, passCareCandidates: passCareCandidatesForExport, passCareOutlook: passCareOutlookForExport, exportedAt: new Date().toISOString() };
}

const INTAKE_EXPORT_SECTIONS = [
  { title: 'Homeowner Quick Intake', fields: [
    ['1. What are your top goals or concerns for this walkthrough?', 'notes'],
    ['2. Are there specific rooms, areas, or exterior spaces you want us to prioritize?', 'priorityAreas'],
    ...STRUCTURED_HOMEOWNER_QUICK_INTAKE_GROUPS.flatMap(group => group.fields.map(field => [
      `${group.question} — ${field.label}`,
      intake => structuredIntakeAnswerValue(intake, group.key, field.key)
    ])),
    ['7. Is there anything you specifically do not want overlooked?', 'doNotOverlook']
  ] },
  { title: 'Electrical', fields: [['Electrical Panel Location', 'electricalPanel'], ['Known Electrical Issues or Updates', 'electricalUpdates']] },
  { title: 'Plumbing / Water', fields: [['Main Water Shut-off Location', 'waterShutoff'], ['Known Leaks, Slow Drains, or Plumbing History', 'plumbingHistory'], ['Water Heater Flush / Age', 'waterHeater'], ['Sewer / Irrigation History', 'sewerIrrigation']] },
  { title: 'HVAC / Comfort', fields: [['Furnace Filter Replacement', 'hvacFilter'], ['Furnace Service History / Age', 'hvacService'], ['A/C Service History / Age', 'hvacAcService'], ['Comfort Notes', 'comfort']] },
  { title: 'Roof / Exterior / Drainage', fields: [['Roof Age', 'roofAge'], ['Roof History', 'roofHistory'], ['Solar Context', 'solar'], ['Drainage / Pooling', 'drainagePooling'], ['Drainage History', 'drainageHistory'], ['Gutters / Downspouts', 'gutters']] },
  { title: 'Windows / Doors / Paint', fields: [['Windows / Doors', 'windowsDoors'], ['Fogging / Failed Seals', 'fogging'], ['Paint / Stain Timing', 'paintStain'], ['Products / Colors', 'productsColors']] },
  { title: 'Safety / Pests / Fireplaces', fields: [['Pests', 'pests'], ['Fire Extinguishers', 'fireExtinguishers'], ['Smoke / CO Detectors', 'smokeCO'], ['Chimney / Fireplace', 'chimney']] },
  { title: 'Additional Concerns', fields: [['Additional Concerns', 'additionalConcerns']] },
  { title: 'Imported Homeowner Response Context', fields: [['Intake Status', 'intakeStatus'], ['Imported Notes / Raw Homeowner Response', 'importedRawResponse'], ['Unmapped Imported Notes', 'importedUnmappedNotes']] }
];

function reportValue(value, fallback = 'Not recorded') {
  const printable = value && typeof value === 'object' && !Array.isArray(value) ? Object.values(value).filter(item => String(item || '').trim()).join('\n') : value;
  const text = String(printable ?? '').trim();
  return text ? htmlEscape(text).replace(/\n/g, '<br/>') : `<span class="not-recorded">${htmlEscape(fallback)}</span>`;
}
function fieldValue(intake, key) {
  return typeof key === 'function' ? key(intake || {}) : (intake || {})[key];
}
function reportShell(title, client = {}, body, walkthroughName = '') {
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${htmlEscape(title)}</title><style>
    :root{--navy:#0b3658;--gold:#bf8420;--cream:#f6efe3;--ink:#203040;--muted:#65727d;--line:#d9cbb4;--soft:#edf3f6;--green:#dfeedd;--red:#f5d7d3;--yellow:#fff1c6;--white:#fff;--shadow:rgba(13,44,73,.08)}
    *{box-sizing:border-box} body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,Segoe UI,Arial,sans-serif;line-height:1.5} main{max-width:1120px;margin:0 auto;padding:22px}
    header{background:#fff;border-bottom:6px solid var(--gold);padding:28px 24px;border-radius:0 0 24px 24px;box-shadow:0 8px 26px var(--shadow)} h1{color:var(--navy);font-size:clamp(28px,4vw,42px);margin:0 0 8px;line-height:1.08} h2{color:var(--navy);border-bottom:1px solid var(--line);padding-bottom:8px;margin-top:0} h3{color:var(--navy);margin:0 0 6px}.eyebrow{text-transform:uppercase;letter-spacing:.09em;color:var(--gold);font-weight:900;font-size:12px;margin:0 0 8px}
    .meta-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:16px}.meta-item{background:var(--soft);border:1px solid #d6e2e8;border-radius:14px;padding:10px 12px}.meta-item span,.field-label{display:block;color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.04em;font-weight:800}.meta-item strong{display:block;color:var(--navy);font-size:15px;margin-top:2px}.workflow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:14px}.workflow span{background:var(--navy);color:#fff;border-radius:999px;padding:6px 12px;font-weight:800}.workflow b{color:var(--gold)}
    .time-guide,.action-guide{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.time-guide-item,.action-guide-item{display:flex;align-items:flex-start;gap:10px;border:1px solid #d6e2e8;border-radius:14px;background:#f6f9fb;color:var(--navy);padding:12px}.action-guide-item{flex-direction:column;gap:4px}.action-guide-item span{color:#40505f}.time-guide-item span{font-size:22px}.time-guide-item.future{background:#f5f2fb;border-color:#ddd3ee;color:#4c3a72}.action-guide-item.clearPath{background:#e8f8ff;border-color:#a9def4;color:#155e75}.action-guide-item.likelyPath{background:#eef3ff;border-color:#c6d4f5;color:#405b92}.action-guide-item.needsDiscovery{background:#f3f1f8;border-color:#d7d2e8;color:#5e5a76}
        .card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px;margin:18px 0;box-shadow:0 8px 22px var(--shadow)}.hero-card{border-top:5px solid var(--gold)}.section-card{margin-top:24px}.lede{font-size:16px;color:#40505f;margin-top:0}.section-kicker{margin:0 0 6px;color:var(--gold);font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.summary-note{background:#fffdf8;border-left:4px solid var(--gold);padding:12px 14px;border-radius:10px}.finding-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.finding-card{border-left:4px solid var(--gold)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.stat{background:var(--soft);border-radius:14px;padding:14px;text-align:center}.stat strong{font-size:30px;color:var(--navy);display:block}.pill{display:inline-block;border-radius:999px;background:var(--soft);padding:4px 9px;font-weight:800}.high{background:var(--red)}.medium{background:var(--yellow)}.low{background:var(--green)}.badge-line{display:flex;flex-wrap:wrap;gap:6px;margin:7px 0 10px}.note-card{border:1px solid var(--line);border-radius:14px;padding:14px;margin:12px 0;background:#fffdf8}.detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.detail{background:#fbf7ef;border:1px solid #eadbc2;border-radius:12px;padding:10px}.not-recorded{color:var(--muted);font-style:italic}.small{font-size:12px;color:var(--muted)}.next-step-list{list-style:none;padding:0;margin:10px 0 0;display:grid;gap:10px}.next-step-list li{border:1px solid #eadbc2;background:#fffdf8;border-radius:12px;padding:12px}.next-step-list strong,.next-step-list span{display:block}.next-step-list span{color:#40505f;margin-top:3px}.pass-card{background:#fbfdfe;border-color:#cbdfe9}.pass-intro{background:#f3f9fd;border:1px solid #cfe1ec;border-left:5px solid #5f9fbd;border-radius:14px;padding:12px 14px}.pass-calendar-legend{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 16px}.pass-calendar-legend span{border:1px solid #d6e2e8;background:#fff;border-radius:999px;color:var(--navy);font-weight:900;padding:7px 10px;font-size:12px}.pass-calendar-group{margin:16px 0;border:1px solid #d6e2e8;border-radius:18px;background:#f7fbfd;padding:14px}.pass-calendar-group h3{display:flex;justify-content:space-between;gap:10px;align-items:center}.pass-calendar-group h3 span{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}.pass-calendar-table{border-color:#d6e2e8}.pass-calendar-row.baseline td{background:#f3f9fd!important}.pass-calendar-row.ready td{background:#f4faf2!important}.pass-calendar-row td:first-child{border-left:5px solid #8fb7ca}.pass-calendar-row.ready td:first-child{border-left-color:#6aa56f}.pass-calendar-row strong,.pass-calendar-row small{display:block}.pass-calendar-row small{color:var(--muted);font-weight:700;margin-top:4px}.calendar-window{display:inline-flex;gap:6px;align-items:flex-start;font-weight:900;color:var(--navy)}.pass-status-chip{display:inline-flex;border-radius:999px;border:1px solid #cfe1ec;background:#eef6fb;color:var(--navy);padding:5px 8px;font-size:12px;font-weight:900}.pass-status-chip.ready{background:#edf6ea;border-color:#cfe5c7;color:#2d6433}.care-table th{background:#17496d}.care-table td{line-height:1.45}
    table{width:100%;border-collapse:separate;border-spacing:0;background:#fff;overflow:hidden;border-radius:12px;border:1px solid var(--line)} th,td{border-bottom:1px solid var(--line);padding:9px;text-align:left;vertical-align:top} th{background:var(--navy);color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:.03em} tr:nth-child(even) td{background:#fbf7ef} tr:last-child td{border-bottom:0} a{color:#0b5cad;font-weight:800} ul{padding-left:20px}.room-section{break-inside:avoid}.mobile-list{display:none}.photo-ref{font-size:12px;color:var(--muted)}
    .packet-section{break-inside:auto}.subsection{border:1px solid #d6e2e8;border-radius:18px;background:#fbfdfe;padding:14px;margin:14px 0}.subsection h3{display:flex;justify-content:space-between;gap:10px;margin:0 0 10px}.subsection h3 span{font-size:12px;text-transform:uppercase;color:var(--muted);letter-spacing:.04em}.packet-lines{display:grid;gap:10px}.packet-line{display:grid;grid-template-columns:4px minmax(190px,1.2fr) minmax(190px,.95fr) minmax(240px,1.35fr);gap:10px;align-items:center;border:1px solid #dbe6eb;border-radius:14px;background:#fff;overflow:hidden;padding:10px 12px 10px 0}.line-stripe{align-self:stretch;background:var(--gold);border-radius:0 999px 999px 0}.line-stripe.sample{display:inline-block;width:24px;height:34px;vertical-align:middle;margin-right:8px}.line-title{display:flex;gap:8px;align-items:center}.line-main p,.line-next{margin:4px 0 0;color:var(--muted);font-weight:800;line-height:1.35}.line-next{color:var(--ink);font-weight:700}.line-note-label{display:block;color:var(--muted);font-size:11px;font-weight:900;letter-spacing:.04em;text-transform:uppercase;margin-top:4px}.empty-line{opacity:.72}.line-chips{display:flex;flex-wrap:wrap;gap:6px}.chip{display:inline-flex;align-items:center;border-radius:999px;background:#edf3f6;color:var(--navy);font-size:11px;font-weight:900;padding:5px 8px}.chip.urgent{background:var(--red);color:#842218}.chip.attention{background:var(--yellow);color:#805f00}.chip.monitor{background:var(--green);color:#285c30}.time-chip{background:#f6f4fb;color:#4c3a72}.certainty-chip.clearPath{background:#e8f3e6;color:#285c30}.certainty-chip.likelyPath{background:#fff2d3;color:#805f00}.certainty-chip.needsDiscovery{background:#f4eafa;color:#5a377a}.room-chip{background:#e9f1f6}.status-dot{display:inline-block;width:10px;height:10px;border-radius:50%;box-shadow:0 0 0 2px rgba(11,54,88,.07)}.status-dot.urgent{background:#c74732}.status-dot.attention{background:#d49a1f}.status-dot.monitor{background:#4c9a58}.status-dot.routine{background:#8aa0ad}.legend-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.legend-grid p{border:1px solid #d6e2e8;border-radius:14px;background:#fbfdfe;padding:12px;margin:0}.room-chart{display:grid;gap:10px}.room-bar{display:grid;grid-template-columns:minmax(150px,1fr) 3fr auto;gap:10px;align-items:center;font-weight:900;color:var(--navy)}.room-bar i{height:14px;border-radius:999px;background:#edf3f6;border:1px solid #d6e2e8;overflow:hidden}.room-bar b{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--gold),#e4b35c)}.trade-handy-services .line-stripe,.trade-handyman .line-stripe{background:#bf8420}.trade-electrical .line-stripe{background:#8c5cff}.trade-plumbing .line-stripe{background:#2f80ed}.trade-hvac .line-stripe{background:#00a0a8}.trade-roof .line-stripe,.trade-roofing .line-stripe{background:#6f4b2a}.trade-safety .line-stripe{background:#c74732}.trade-pest .line-stripe{background:#6d8f2e}.trade-exterior .line-stripe{background:#2f8f5b}.trade-drainage .line-stripe,.trade-gutters-drainage .line-stripe{background:#4d8da8}.trade-appliance .line-stripe{background:#6d7782}.trade-intake .line-stripe{background:#0b3658}.trade-photo-index .line-stripe{background:#8aa0ad}.trade-pass .line-stripe{background:#17496d}.pass-line{background:#fbfdfe}.photo-line{background:#fcfdff}.photo-index-intro{margin-top:24px}
    @media(max-width:780px){main{padding:12px}header{border-radius:0;padding:20px 14px}.workflow span{font-size:13px}.table-wrap{overflow-x:auto}.desktop-table{min-width:760px}.mobile-list{display:block}.mobile-hidden{display:none}.note-card{padding:12px}.detail-grid{grid-template-columns:1fr}.packet-line{grid-template-columns:6px 1fr;align-items:start}.line-chips,.line-next{grid-column:2}.line-chips{margin-top:6px}}
    @media print{body{background:#fff;color:#111}header,.card{box-shadow:none;border-color:#bbb}main{max-width:none;padding:0 10px}.card{break-inside:avoid;margin:10px 0}.workflow span{border:1px solid #999;background:#fff;color:#111}a{color:#111;text-decoration:none}.mobile-list{display:none}.mobile-hidden{display:block}.desktop-table{font-size:11px}th{background:#eee!important;color:#111!important}.not-recorded{color:#777}}
  </style></head><body><header><p class="eyebrow">THA Field Package</p><h1>${htmlEscape(title)}</h1><div class="meta-grid"><div class="meta-item"><span>Working Session Name</span><strong>${reportValue(walkthroughName, 'Working session name not recorded')}</strong></div><div class="meta-item"><span>Client Name</span><strong>${reportValue(client.name, 'Client name not recorded')}</strong></div><div class="meta-item"><span>Project Address</span><strong>${reportValue(client.address, 'Project address not recorded')}</strong></div><div class="meta-item"><span>Walkthrough Date / Visit Label</span><strong>${reportValue(client.date, 'Walkthrough date / visit label not recorded')}</strong></div></div><div class="workflow"><span>Intake</span><b>→</b><span>HTC</span><b>→</b><span>PMR</span><b>→</b><span>PASS — Continued Care</span></div></header><main>${body}</main></body></html>`;
}
function tableRows(items, columns) {
  return items.map(item => `<tr>${columns.map(col => `<td>${typeof col.value === 'function' ? col.value(item) : reportValue(item[col.value])}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${columns.length}"><span class="not-recorded">Nothing recorded.</span></td></tr>`;
}
function groupByRoom(items = []) {
  return items.reduce((acc, item) => {
    const room = item.roomName || item.room || 'Room / Section not recorded';
    if (!acc[room]) acc[room] = [];
    acc[room].push(item);
    return acc;
  }, {});
}
function photoEntriesForPayload(payload, uploadedLookup = {}) {
  const sectionLookup = Object.fromEntries((payload.sectionFlow || []).map(section => [section.key, section]));
  const entries = [];
  Object.entries(payload.roomCapture || {}).forEach(([sectionKey, capture]) => {
    const section = sectionLookup[sectionKey] || {};
    photoList(capture).forEach((photo, index) => {
      const uploaded = uploadedLookup[`room:${sectionKey}:${photo.id}`] || {};
      const room = section.roomName || section.label || sectionKey || 'Room';
      entries.push({ key: `room:${sectionKey}:${photo.id}`, room, item: 'Room Overview', label: photo.label || 'Overview', originalName: photo.name || `overview-${index + 1}`, driveFileName: uploaded.driveFileName || photo.driveFileName || '', driveViewLink: uploaded.driveViewLink || photo.driveViewLink || photo.webViewLink || '', countLabel: photo.label || 'Overview', thumbnailDataUrl: photo.thumbnailDataUrl || '' });
    });
  });
  (payload.rows || []).forEach(row => {
    photoList(row.answer).forEach((photo, index) => {
      const uploaded = uploadedLookup[`item:${row.id}:${photo.id}`] || {};
      entries.push({ key: `item:${row.id}:${photo.id}`, room: row.roomName || row.room || 'Room', item: row.item || 'Checklist Item', label: photo.label || 'Photo', originalName: photo.name || `photo-${index + 1}`, driveFileName: uploaded.driveFileName || photo.driveFileName || '', driveViewLink: uploaded.driveViewLink || photo.driveViewLink || photo.webViewLink || '', relatedStatus: row.answer?.status || '', thumbnailDataUrl: photo.thumbnailDataUrl || '' });
    });
  });
  return entries;
}
function statusVisualClass(status = '') {
  if (status === 'Immediate Concern') return 'urgent';
  if (status === 'Needs Attention') return 'attention';
  if (status === 'Monitor') return 'monitor';
  return 'routine';
}
function tradeSlug(trade = 'General') {
  return String(displayTradeLabel(trade) || 'General').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'general';
}
function groupByTrade(items = []) {
  return items.reduce((acc, item) => {
    const trade = displayTradeLabel(item.answer?.trade || item.trade || 'Resource not recorded');
    if (!acc[trade]) acc[trade] = [];
    acc[trade].push(item);
    return acc;
  }, {});
}

function visualTradeClass(trade = 'General') {
  return `trade-${tradeSlug(trade || 'General')}`;
}
function visualLineHtml({ trade = 'General', status = '', title = '', context = '', room = '', time = '', certainty = '', next = '', extraClass = '', showRoomChip = true } = {}) {
  const certaintyClass = certainty ? actionCertaintyClass(certainty) : 'likelyPath';
  const statusClass = statusVisualClass(status);
  const statusLabel = priority(status) || status || 'Routine';
  const chips = [
    showRoomChip && room ? `<span class="chip room-chip">${htmlEscape(room)}</span>` : '',
    statusLabel ? `<span class="chip ${statusClass}">${htmlEscape(statusLabel)}</span>` : '',
    time ? `<span class="chip time-chip">${time}</span>` : '',
    certainty ? `<span class="chip certainty-chip ${certaintyClass}">${htmlEscape(certainty)}</span>` : ''
  ].filter(Boolean).join('');
  return `<article class="packet-line ${visualTradeClass(trade)} ${extraClass}"><div class="line-stripe"></div><div class="line-main"><div class="line-title"><span class="status-dot ${statusClass}"></span><strong>${htmlEscape(title)}</strong></div><p>${context}</p></div><div class="line-chips">${chips}</div><p class="line-next">${next}</p></article>`;
}
function passVisualLineHtml(item = {}) {
  const topic = item.careTopic || item.resource || 'PASS';
  return visualLineHtml({
    trade: item.resource || item.rule?.trade || 'PASS',
    status: 'Monitor',
    title: item.careItem || 'Continued care item',
    context: `${htmlEscape(topic)} · ${htmlEscape(item.resource || 'Resource')} · PASS continued care · separate from PMR counts`,
    room: 'PASS',
    time: htmlEscape(passSuggestedWindowText(item.targetWindow || item.suggestedWindow) || 'Next normal care window'),
    certainty: 'Likely Path',
    next: htmlEscape(passHomeownerFollowUpLanguage(item)),
    extraClass: 'pass-line'
  });
}
function buildPhotoIndexSection(photoEntries = [], { embedded = false } = {}) {
  const grouped = photoEntries.reduce((acc, entry) => { const room = entry.room || 'Room'; acc[room] = [...(acc[room] || []), entry]; return acc; }, {});
  const photoLine = entry => {
    const fileName = entry.driveFileName || flatPhotoDriveName({ room: entry.room, item: entry.item, label: entry.label, originalName: entry.originalName });
    const linkText = entry.driveViewLink ? `<a href="${htmlEscape(entry.driveViewLink)}">Open photo</a>` : '<span class="not-recorded">Link not available</span>';
    return visualLineHtml({
      trade: 'Photo Index',
      status: entry.relatedStatus || 'Monitor',
      title: entry.item || 'Checklist Item / Room Overview',
      context: `${htmlEscape(entry.room || 'Room')} · ${htmlEscape(entry.label || 'Photo')} · ${reportValue(fileName)}`,
      room: entry.room || 'Room',
      time: htmlEscape(entry.label || 'Photo'),
      certainty: entry.driveViewLink ? 'Clear Path' : 'Needs Discovery',
      next: linkText,
      extraClass: 'photo-line'
    });
  };
  const sections = Object.entries(grouped).map(([room, entries]) => `<section class="subsection room-section photo-room"><h3>${htmlEscape(room)} <span>${entries.length} photo${entries.length === 1 ? '' : 's'}</span></h3><div class="packet-lines">${entries.map(photoLine).join('')}</div></section>`).join('') || '<section class="card"><p><span class="not-recorded">No photos recorded.</span></p></section>';
  return `${embedded ? '<section class="card section-card packet-section photo-index-intro"><p class="section-kicker">Section 7 · Last</p>' : '<section class="card">'}<h2>Photo Index</h2><p class="lede">Photos are grouped by room or section and use a quieter line-item system: resource stripe, status dot, photo label, room, and link. The Drive Photos folder remains flattened with readable file names; this index connects each file back to its room overview or checklist item.</p><p class="small">Thumbnails are intentionally omitted here to keep the exported local HTML package lightweight.</p></section>${sections}`;
}

function buildPmrReportHtml(payload, photoEntries = []) {
  const pmr = payload.pmr || [];
  const rows = payload.rows || [];
  const hasRequiredProjectSetup = !isMissingProjectIdentityValue(payload.client?.name) && !isMissingProjectIdentityValue(payload.client?.address) && !isMissingProjectIdentityValue(payload.client?.date);
  const passCareCandidates = payload.passCareCandidates || applyPassReview(buildPassCareOutlook({ intake: payload.intake, rows, passReview: normalizePassReviewData(payload.passReview), roomCapture: payload.roomCapture || {}, sections: payload.sectionFlow || [] }), normalizePassReviewData(payload.passReview), { includeHidden: true });
  const passCareOutlook = payload.passCareOutlook || applyPassReview(buildPassCareOutlook({ intake: payload.intake, rows, passReview: normalizePassReviewData(payload.passReview), roomCapture: payload.roomCapture || {}, sections: payload.sectionFlow || [] }), normalizePassReviewData(payload.passReview));
  const baselineModel = buildBaselineCareModel({ intake: payload.intake, rows, passCareCandidates, passCareOutlook });
  if (!hasRequiredProjectSetup) {
    return reportShell('PMR Report Packet', payload.client, `<section class="card hero-card"><p class="section-kicker">Setup needed</p><h2>Draft PMR Preview</h2><p class="lede">Complete client name, property address, and walkthrough date to finalize this report.</p></section>`, payload.walkthroughName);
  }
  const counts = { high: pmr.filter(r=>priority(r.answer.status)==='High').length, med: pmr.filter(r=>priority(r.answer.status)==='Medium').length, low: pmr.filter(r=>priority(r.answer.status)==='Low').length };
  const reviewedIntakeNotes = rows.filter(r => isIntakeFollowUp(r) && r.intakeField !== 'additionalConcerns' && r.answer.reviewStatus && r.answer.reviewStatus !== 'Not Reviewed' && r.answer.reviewStatus !== INTAKE_PMR_REVIEW_STATUS);
  const immediateItems = pmr.filter(r => r.answer.status === 'Immediate Concern');
  const handyItems = pmr.filter(r => r.answer.trade === 'Handyman');
  const tradeItems = pmr.filter(r => !['Handyman','Safety'].includes(r.answer.trade));
  const roomIssueCounts = Object.entries(groupByRoom(pmr)).map(([room, items]) => [room, items.length]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const maxRoomIssueCount = Math.max(1, ...roomIssueCounts.map(([, count]) => count));
  const roomGroups = groupByRoom(pmr);
  const tradeGroups = groupByTrade(pmr);
  const photoCountFor = row => photoEntries.filter(entry => entry.item === row.item && entry.room === (row.roomName || row.room)).length;
  const overallSummary = pmr.length
    ? `We found ${pmr.length} PMR item${pmr.length === 1 ? '' : 's'} to consider. ${immediateItems.length ? `${immediateItems.length} item${immediateItems.length === 1 ? '' : 's'} should be handled first because they are higher concern. ` : 'No immediate higher-concern PMR items were marked. '}Room and trade views below use the same findings so the homeowner can review by location or hand a focused list to the right resource. PASS continued-care items are routine care only and are not included in PMR defect counts.`
    : 'No immediate PMR findings were identified during this walkthrough. The home appears to be in good working order based on the reviewed areas. This report still includes a proactive PASS Maintenance Calendar to help plan routine upkeep and continued home care.';
  const visualLine = (r, options = {}) => {
    const certainty = actionCertaintyCopy(r);
    return visualLineHtml({
      trade: r.answer.trade,
      status: r.answer.status,
      title: r.item,
      context: `${htmlEscape(options.prefix || (r.roomName || r.room))} · ${htmlEscape(displayTradeLabel(r.answer.trade))}`,
      room: r.roomName || r.room,
      time: reportValue(r.answer.effort),
      certainty: certainty.label,
      next: htmlEscape(certainty.next),
      showRoomChip: options.showRoomChip !== false
    });
  };
  const detailCard = r => {
    const certainty = actionCertaintyCopy(r);
    const level = priority(r.answer.status) || 'PMR';
    return `<article class="note-card finding-card trade-${tradeSlug(r.answer.trade)}"><div class="finding-head"><div><p class="section-kicker">${htmlEscape(r.roomName || r.room)} · ${htmlEscape(displayTradeLabel(r.answer.trade))}</p><h3>${htmlEscape(r.item)}</h3></div><span class="pill ${String(level).toLowerCase()}">${htmlEscape(level)}</span></div><div class="badge-line"><span class="status-dot ${statusVisualClass(r.answer.status)}"></span><span class="pill">${htmlEscape(r.answer.status)}</span><span class="pill">${htmlEscape(certainty.label)}</span><span class="pill">${reportValue(r.answer.effort)}</span></div><div class="detail-grid"><div class="detail"><span class="field-label">What we saw</span>${reportValue(r.answer.notes, 'No additional notes recorded yet.')}</div><div class="detail"><span class="field-label">Why it matters</span>${reportValue(r.why)}</div><div class="detail"><span class="field-label">Recommended next step</span>${reportValue(certainty.next)}</div><div class="detail"><span class="field-label">Action certainty</span>${reportValue(certainty.title)}: ${reportValue(certainty.body)}</div><div class="detail"><span class="field-label">Timing</span>${htmlEscape(timingFor(r, r.answer.status))} · Homeowner pace: ${reportValue(r.answer.pref)}</div><div class="detail"><span class="field-label">Photos</span>${photoCountFor(r)} linked in Photo Index</div></div></article>`;
  };
  const roomSections = Object.entries(roomGroups).map(([room, items]) => `<section class="subsection"><h3>${htmlEscape(room)} <span>${items.length} PMR item${items.length === 1 ? '' : 's'}</span></h3><div class="packet-lines">${items.map(r => visualLine(r, { prefix: room, showRoomChip: false })).join('')}</div></section>`).join('') || '<p><span class="not-recorded">No repair findings recorded by room.</span></p>';
  const tradeSections = Object.entries(tradeGroups).map(([trade, items]) => `<section class="subsection"><h3>${htmlEscape(trade)} <span>${items.length} item${items.length === 1 ? '' : 's'}</span></h3><div class="packet-lines">${items.map(r => visualLine(r)).join('')}</div></section>`).join('') || '<p><span class="not-recorded">No repair findings recorded by trade.</span></p>';
  const intakeList = reviewedIntakeNotes.map(r=>`<li><strong>${htmlEscape(r.roomName || r.room)} — ${htmlEscape(r.item)}</strong><span>${htmlEscape(r.answer.reviewStatus)} · ${htmlEscape(r.intakeFieldLabel)}: ${reportValue(r.intakeValue)}</span></li>`).join('') || '<li><strong>No reviewed intake follow-up notes recorded.</strong><span>Intake context did not add separate follow-up notes for this PMR export.</span></li>';
  const roomChart = roomIssueCounts.length ? `<div class="room-chart">${roomIssueCounts.map(([room, count]) => `<div class="room-bar"><span>${htmlEscape(room)}</span><i><b style="width:${Math.max(8, (count / maxRoomIssueCount) * 100)}%"></b></i><strong>${count}</strong></div>`).join('')}</div>` : '<p><span class="not-recorded">No repair issues recorded by room.</span></p>';
  const passLines = passCareOutlook.length ? `<div class="packet-lines">${passCareOutlook.map(passVisualLineHtml).join('')}</div>` : '<p><span class="not-recorded">No PASS continued-care items selected for this packet.</span></p>';
  const passCalendarGroups = Object.entries(groupPassCalendar(passCareOutlook, passCareGroup));
  const passCalendarTableRows = items => items.map(item => `<tr class="pass-calendar-row ${passCalendarState(item)}"><td><strong>${reportValue(item.careItem)}</strong><small>${reportValue(item.reason, 'Routine care planning item.')}</small></td><td>${reportValue(item.cadence)}</td><td>${reportValue(item.lastCompletedDisplay || 'Unknown — Verify / Establish Baseline')}</td><td><span class="calendar-window">📅 ${reportValue(item.nextSuggestedWindow || passSuggestedWindowText(item.targetWindow || item.suggestedWindow) || 'Establish baseline at next seasonal visit')}</span></td><td>${reportValue(item.resource)}</td><td><span class="pass-status-chip ${passCalendarState(item)}">${reportValue(passPlanningStatusText(item.followUpStatus))}</span></td></tr>`).join('');
  const passCalendarSections = passCalendarGroups.map(([groupName, items]) => `<div class="pass-calendar-group"><h3>${htmlEscape(groupName)} <span>${items.length} item${items.length === 1 ? '' : 's'}</span></h3><table class="care-table pass-calendar-table"><thead><tr><th>Care item</th><th>Recommended cadence</th><th>Last completed</th><th>Next suggested date/window</th><th>Resource/trade</th><th>Follow-up status</th></tr></thead><tbody>${passCalendarTableRows(items)}</tbody></table></div>`).join('') || '<p><span class="not-recorded">No PASS calendar items selected for this packet.</span></p>';
  const passResourceGroups = Object.entries(groupPassCalendar(passCareOutlook, item => item.resource || 'Other')).map(([resource, items]) => `<p><strong>${htmlEscape(resource)}:</strong> ${htmlEscape(items.map(item => item.careItem).join(' · '))}</p>`).join('');
  const passWindowGroups = Object.entries(groupPassCalendar(passCareOutlook, passUpcomingBucket)).map(([windowName, items]) => `<p><strong>${htmlEscape(windowName)}:</strong> ${htmlEscape(items.map(item => item.careItem).join(' · '))}</p>`).join('');
  const baselineSections = Object.entries(groupPassCalendar(baselineModel.baselineItems, item => item.group || 'General')).map(([groupName, items]) => `<section class="subsection"><h3>${htmlEscape(groupName)} <span>${items.length} item${items.length === 1 ? '' : 's'}</span></h3><div class="packet-lines">${items.map(item => visualLineHtml({ trade: item.group || 'Baseline', status: 'Monitor', title: item.title, context: `${htmlEscape(item.group)} · Baseline home care`, room: 'Baseline', time: 'Routine', certainty: 'Likely Path', next: htmlEscape(item.evidence.length ? `${item.guidance} Evidence: ${item.evidence.join(' · ')}` : item.guidance), extraClass: 'pass-line' })).join('')}</div></section>`).join('') || '<p><span class="not-recorded">No baseline care topics generated.</span></p>';
  const homeSpecificSection = baselineModel.homeSpecificCare.length
    ? `<div class="packet-lines">${baselineModel.homeSpecificCare.map(item => visualLineHtml({ trade: 'Supported Care', status: 'Monitor', title: item.careItem || 'Home-specific care topic', context: `${htmlEscape(item.sourceLabel)} · Intake and/or HTC-supported care`, room: 'Supported care', time: 'As applicable', certainty: 'Likely Path', next: htmlEscape(item.reason || 'Supported by intake and/or HTC evidence.'), extraClass: 'pass-line' })).join('')}</div>`
    : '<p><span class="not-recorded">No additional intake/HTC-supported care topics are pending outside PMCP selected items.</span></p>';
  const detailRows = pmr.map(detailCard).join('') || '<p><span class="not-recorded">No repair findings recorded.</span></p>';
  const body = `<section class="card hero-card"><p class="section-kicker">Primary homeowner / business deliverable</p><h2>PMR Report Packet</h2><p class="lede">This is the polished homeowner-facing packet. It uses one PMR finding set in multiple views: summary first, room list, trade list, PASS continued care, detail appendix, and Photo Index last.</p></section>
    <section class="card packet-section"><p class="section-kicker">Section 1</p><h2>Snapshot / Summary</h2><p class="lede">${htmlEscape(overallSummary)}</p><div class="grid"><div class="stat high"><strong>${counts.high}</strong>Immediate</div><div class="stat medium"><strong>${counts.med}</strong>Near-Term</div><div class="stat low"><strong>${counts.low}</strong>Monitor</div><div class="stat"><strong>${pmr.length}</strong>PMR Findings</div><div class="stat"><strong>${handyItems.length}</strong>Handy Services</div><div class="stat"><strong>${tradeItems.length}</strong>Trade Items</div></div><h3>Room issue count</h3>${roomChart}</section>
    <section class="card packet-section"><p class="section-kicker">Section 2</p><h2>Baseline Home Care / Upkeep To-Dos</h2><p class="lede">This section does not imply a repair concern. It lists baseline reminders and practical upkeep opportunities. The list becomes more tailored as Intake, HTC, PMCP Builder, and THA Action-Items are completed.</p>${baselineSections}</section>
    <section class="card packet-section"><p class="section-kicker">Section 3</p><h2>Home-Specific Care Supported by Intake and/or HTC</h2><p class="lede">These care topics are supported by intake and/or walkthrough evidence and remain separate from repair findings and PMR priority counts.</p>${homeSpecificSection}</section>
    <section class="card packet-section"><p class="section-kicker">Section 4</p><h2>Room-by-Room Action List</h2><p class="lede">Same PMR findings grouped by location for homeowner review.</p>${roomSections}</section>
    <section class="card packet-section"><p class="section-kicker">Section 5</p><h2>Trade-by-Trade Action List</h2><p class="lede">Same PMR findings grouped by likely resource for handing to a plumber, electrician, handyman, or specialist.</p>${tradeSections}</section>
    <section class="card packet-section pass-card"><p class="section-kicker">Section 6 · Required · Separate from PMR counts</p><h2>PASS Maintenance Calendar</h2><p class="lede pass-intro">${htmlEscape(passCalendarIntroCopy(pmr.length))}</p><div class="pass-calendar-legend"><span>📅 Suggested upkeep window</span><span>Neutral = Verify / Establish Baseline</span><span>Ready = known date + next window</span><span>PMR count impact: 0</span></div>${passCalendarSections}<div class="detail-grid"><div class="detail"><span class="field-label">Grouped by resource/trade</span>${passResourceGroups || '<span class="not-recorded">No resource grouping available.</span>'}</div><div class="detail"><span class="field-label">Grouped by upcoming window</span>${passWindowGroups || '<span class="not-recorded">No window grouping available.</span>'}</div></div></section>
    <section class="card packet-section pass-card"><p class="section-kicker">Section 7 · Separate from PMR counts</p><h2>PASS Continued Care Plan</h2><p class="lede">PASS is routine continued care only. These items are not PMR defects, priority counts, or urgent repair directives.</p>${passLines}</section>
    <section class="card packet-section"><p class="section-kicker">Section 8</p><h2>Detail Appendix</h2><p class="lede">Expanded notes are here so the top of the packet stays useful without losing what was seen, why it matters, action certainty, timing, and photo references.</p>${detailRows}</section>
    ${reviewedIntakeNotes.length ? `<section class="card packet-section"><h2>Reviewed Intake Follow-Up Context</h2><p class="lede">Included as homeowner context only. Intake alone does not create a PMR finding.</p><ul class="next-step-list">${intakeList}</ul></section>` : ''}
    <section class="card packet-section"><h2>Visual System Guide</h2><div class="legend-grid"><p><span class="line-stripe sample"></span><strong>Left color stripe</strong><br/>Trade / resource grouping</p><p><span class="status-dot urgent"></span><strong>Stoplight dot</strong><br/>Urgency / status</p><p><span class="chip time-chip">Time</span><strong>Time chip</strong><br/>Likely effort or care window</p><p><span class="chip certainty-chip clearPath">Clear Path</span><strong>Certainty chip</strong><br/>Clear Path / Likely Path / Needs Discovery</p></div></section>
    ${buildPhotoIndexSection(photoEntries, { embedded: true })}`;
  return reportShell('PMR Report Packet', payload.client, body, payload.walkthroughName);
}
function buildHtcChecklistHtml(payload, photoEntries = []) {
  const rows = (payload.rows || []).map(row => ({
    ...row,
    categoryLabel: categoryForChecklistItem(row),
    photoEntries: photoEntries.filter(entry => entry.item === row.item && entry.room === (row.roomName || row.room))
  }));
  const grouped = groupByRoom(rows);
  const checklistLine = r => {
    const certainty = actionCertaintyFor(r.answer);
    const photoText = r.photoEntries.length ? `${r.photoEntries.length} photo${r.photoEntries.length === 1 ? '' : 's'} in Photo Index` : 'No linked photos';
    const next = `<span class="line-note-label">Notes</span>${reportValue(r.answer.notes, 'No notes recorded')}<span class="line-note-label">Photos</span>${htmlEscape(photoText)}`;
    return visualLineHtml({
      trade: r.answer.trade,
      status: r.answer.status,
      title: r.item,
      context: `${htmlEscape(r.categoryLabel)} · ${htmlEscape(displayTradeLabel(r.answer.trade || 'Resource not recorded'))}`,
      room: r.roomName || r.room,
      time: reportValue(r.answer.effort),
      certainty,
      next,
      extraClass: r.answer.addToPmcpBuilder ? 'pass-candidate-line' : ''
    });
  };
  const roomSections = Object.entries(grouped).map(([room, items]) => `<section class="subsection room-section"><h3>${htmlEscape(room)} <span>${items.length} checklist item${items.length === 1 ? '' : 's'}</span></h3><div class="packet-lines">${items.map(checklistLine).join('')}</div></section>`).join('');
  const body = `<section class="card"><p class="section-kicker">Secondary editable field record</p><h2>HTC Checklist Field Documentation Record</h2><p class="lede">Room-by-room HTC documentation in walkthrough order. This backup/editable copy uses the same compact line-item system as the PMR Packet so completed observations, notes, resources, pacing, certainty, time, PMCP Builder placement status, and photo references are easy to scan without creating duplicate PMR counts.</p></section>${roomSections || '<section class="card"><p><span class="not-recorded">No checklist items recorded.</span></p></section>'}`;
  return reportShell('Secondary - HTC Checklist Editable Copy', payload.client, body, payload.walkthroughName);
}

function buildIntakeSummaryHtml(payload) {
  const intake = payload.intake || {};
  const intakeLine = (sectionTitle, label, value) => visualLineHtml({
    trade: 'Intake',
    status: meaningfulIntakeValue(value) ? 'Monitor' : '',
    title: label,
    context: `${htmlEscape(sectionTitle)} · Homeowner-provided context`,
    room: sectionTitle,
    time: meaningfulIntakeValue(value) ? 'Recorded' : 'Not recorded',
    certainty: 'Needs Discovery',
    next: reportValue(value, 'Not recorded'),
    extraClass: meaningfulIntakeValue(value) ? 'intake-line' : 'intake-line empty-line'
  });
  const sections = INTAKE_EXPORT_SECTIONS.map(section => {
    const rows = section.fields.map(([label, key]) => intakeLine(section.title, label, fieldValue(intake, key))).join('');
    return `<section class="subsection"><h3>${htmlEscape(section.title)} <span>homeowner context</span></h3><div class="packet-lines">${rows}</div></section>`;
  }).join('');
  const body = `<section class="card"><p class="section-kicker">Secondary editable field-prep record</p><h2>Intake — Homeowner Context & Field Prep</h2><p class="lede">Intake captures homeowner-reported context before the walkthrough. HTC verifies conditions in the field. PMR findings are only created after review. Imported raw responses are included only as homeowner-provided context, not verified findings. Empty fields are shown as “Not recorded” for context without turning missing information into a finding.</p></section>${sections}`;
  return reportShell('Secondary - Intake Summary Editable Copy', payload.client, body, payload.walkthroughName);
}

function buildPhotoIndexHtml(payload, photoEntries = []) {
  return reportShell('Secondary - Photo Index Backup', payload.client, buildPhotoIndexSection(photoEntries), payload.walkthroughName);
}

async function uploadDriveBundle(accessToken, payload) {
  const rootId = await findOrCreateDriveFolder(accessToken, 'THA Clients');
  const incomingId = await findOrCreateDriveFolder(accessToken, '_HTC PMR Incoming', rootId);
  const packageFolderName = drivePackageFolderName(payload.client);
  const packageId = await findOrCreateDriveFolder(accessToken, packageFolderName, incomingId);
  const photosId = await findOrCreateDriveFolder(accessToken, 'Photos', packageId);
  const supportId = await findOrCreateDriveFolder(accessToken, 'Secondary Editable Copies', packageId);
  const backupId = await findOrCreateDriveFolder(accessToken, 'Backup Data', packageId);
  const uploadedLookup = {};
  const uploadWarnings = [];
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
  for (const row of payload.rows || []) {
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
  const pmrReportHtml = buildPmrReportHtml(payload, photoEntries);
  const readableDocs = [
    ['01 - Intake Summary — Secondary Editable Copy', buildIntakeSummaryHtml(payload)],
    ['02 - HTC Checklist — Secondary Editable Copy', buildHtcChecklistHtml(payload, photoEntries)],
    ['99 - Photo Index — Secondary Editable Copy', buildPhotoIndexHtml(payload, photoEntries)]
  ];

  const uploadedCoreFiles = [];
  const uploadedSupportFiles = [];
  for (const [name, html] of readableDocs) {
    const uploaded = await uploadCoreDriveDoc(accessToken, supportId, name, html);
    uploadedSupportFiles.push(uploaded.name || name);
  }

  const backupUploads = [];
  backupUploads.push(await uploadEmergencyBackupHtml(accessToken, backupId, 'PMR Report Packet', pmrReportHtml));
  backupUploads.push(await uploadEmergencyBackupJson(accessToken, backupId, 'Full Walkthrough Export', payload));

  const missingSupportFiles = readableDocs.map(([name]) => name).filter(name => !uploadedSupportFiles.includes(name));
  if (missingSupportFiles.length) {
    throw Object.assign(new Error(`Drive export incomplete — secondary editable copies did not upload: ${missingSupportFiles.join(', ')}.`), { code: 'core_upload_failed' });
  }
  if (backupUploads.length < 2) {
    throw Object.assign(new Error('Drive export incomplete — emergency backup files did not upload, so the package cannot be marked successful.'), { code: 'backup_upload_failed' });
  }
  uploadedCoreFiles.push('Secondary Editable Copies folder: ' + uploadedSupportFiles.join(', '));

  try {
    const styledHtml = await uploadDriveHtml(accessToken, packageId, 'PMR Report Packet.html', pmrReportHtml);
    uploadedCoreFiles.push(styledHtml.name || 'PMR Report Packet.html');
  } catch (error) {
    throw Object.assign(new Error(`Drive export incomplete — PMR Report Packet.html did not upload to the package root. ${driveErrorMessage(error, 'Styled HTML upload failed')}`), { code: 'core_upload_failed', cause: error });
  }

  const pdfResult = await tryBuildPmrPdf(pmrReportHtml, { title: 'PMR Report Packet' });
  if (!pdfResult.pdfBlob) {
    throw Object.assign(new Error(`Drive export incomplete — PMR Report Packet.pdf could not be created. ${pdfResult.error?.message || 'Browser PDF renderer did not return a usable PDF.'}`), { code: 'pdf_generation_failed', cause: pdfResult.error });
  }
  try {
    const uploadedPdf = await uploadDrivePdf(accessToken, packageId, 'PMR Report Packet.pdf', pdfResult.pdfBlob);
    uploadedCoreFiles.push(uploadedPdf.name || 'PMR Report Packet.pdf');
  } catch (error) {
    throw Object.assign(new Error(`Drive export incomplete — PMR Report Packet.pdf did not upload to the package root. ${driveErrorMessage(error, 'PDF upload failed')}`), { code: 'core_upload_failed', cause: error });
  }

  const folderInfo = await getDriveFileInfo(accessToken, packageId).catch(() => ({ id: packageId, name: packageFolderName, webViewLink: driveFolderUrl(packageId) }));
  return {
    folderId: packageId,
    folderName: folderInfo.name || packageFolderName,
    folderLink: folderInfo.webViewLink || driveFolderUrl(packageId),
    uploadedCoreFiles,
    backupFileCount: backupUploads.length,
    warnings: uploadWarnings
  };
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
  return {
    ...Object.fromEntries(Object.entries(INTAKE_DEFAULTS).map(([key, value]) => [key, Array.isArray(value) ? [] : ''])),
    intakeId: '',
    intakeStatus: '',
    importedRawResponse: '',
    importedUnmappedNotes: ''
  };
}

function hasWalkthroughContent(data = {}) {
  const client = data.client || {};
  const intake = normalizeIntakeData(data.intake || {});
  return Boolean(
    client.name?.trim() || client.address?.trim() || client.date?.trim() ||
    meaningfulIntakeValue(intake.notes) || meaningfulIntakeValue(intake.priorityAreas) || meaningfulIntakeValue(intake.doNotOverlook) ||
    Object.keys(data.answers || {}).length || Object.keys(data.roomCapture || {}).length || Object.keys(data.passReview || {}).length
  );
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
    roomCapture: {},
    passReview: {}
  };
}

const demoAnswer = ({ status = 'Good', trade = '', effort = '', notes = '', passCandidate = false, passTargetWindow = '', passCadence = '', passResource = '', passFollowUpStatus = 'Not Scheduled', passNote = '', reviewStatus = '', actionCertainty = 'Clear Path', pref = 'Plan soon' } = {}) => ({
  status,
  trade,
  effort,
  notes,
  passCandidate,
  passTargetWindow,
  passCadence,
  passResource,
  passFollowUpStatus,
  passNote,
  reviewStatus,
  actionCertainty,
  pref,
  photos: [],
  photoRef: ''
});
const demoIntake = (overrides = {}) => normalizeIntakeData({ ...blankIntakeTemplate(), ...overrides });
const DEMO_WALKTHROUGH_SCENARIOS = [
  {
    id: 'demo-clean-home-zero-pmr',
    name: 'Demo 1 — Clean home / zero major findings',
    description: 'Clean-home export check: zero PMR findings while PASS generated care planning remains visible.',
    checks: ['PMR counts should all be 0.', 'PASS should still appear with generated continued-care items.', 'The hidden chimney PASS card should stay out of PMR and Drive export.'],
    data: {
      client: { name: 'Demo Client — Clean Home', address: '100 Clean Home Lane', date: 'Demo Walkthrough — Zero PMR' },
      answers: {
        3: demoAnswer({ trade: 'Appliance', effort: '30 min', passCandidate: true, passCadence: 'Annual spring refresh', passResource: 'Other', passNote: 'Range hood filter is clean today; keep an annual degrease/replacement reminder.' }),
        11: demoAnswer({ trade: 'Handyman', effort: '15 min', passCandidate: true, passCadence: 'Every 1–3 months', passResource: 'HVAC', passNote: 'Filter is clean and correctly installed; continue normal replacement rhythm.' })
      },
      intake: demoIntake({
        notes: 'Demo clean-home walkthrough. No major defects were observed; use this case to confirm PASS remains visible without PMR findings.',
        hvacFilter: 'Filter changed last month; size documented at equipment.',
        hvacService: 'Annual service completed this spring.',
        roofAge: 'Roof reported newer with no active leak history.',
        gutters: 'Gutters cleaned recently as routine care.'
      }),
      dynamicRooms: cloneData(DEFAULT_DYNAMIC_ROOMS),
      sectionOrder: [],
      itemOrder: {},
      pinnedItems: {},
      roomCapture: {
        Kitchen: { status: 'Looking Good', note: 'Clean demo room: no PMR items; range hood kept as PASS routine care.', photos: [], items: [] },
        Mechanical: { status: 'Routine Care / PASS', note: 'No equipment defect. Routine filter/service cadence remains in PASS.', photos: [], items: [] }
      },
      passReview: {
        'generated-pass-chimney-fireplace-service': { pmcpDecision: 'pending' },
        'generated-pass-furnace-filter-rhythm': {
          reason: 'Demo-edited reason: maintain the clean filter habit documented during the walkthrough.',
          suggestedWindow: 'Suggested window: Check again at the next 90-day filter reminder.',
          resource: 'HVAC'
        }
      }
    }
  },
  {
    id: 'demo-older-home-unknown-history',
    name: 'Demo 2 — Older home with unknown service history',
    description: 'Older-home context check: unknown history creates PASS and reviewed intake context without automatically creating PMR defects.',
    checks: ['Unknown service history should appear as PASS care-planning basis, not PMR by itself.', 'Reviewed intake follow-ups should remain separate unless explicitly marked as added PMR findings.', 'Edited PASS wording should carry into PMR and Drive export.'],
    data: {
      client: { name: 'Demo Client — Older Home', address: '42 Heritage Avenue', date: 'Demo Walkthrough — Unknown History' },
      answers: {
        12: demoAnswer({ trade: 'HVAC', effort: 'Trade scope', passCandidate: true, passCadence: 'Next normal HVAC visit', passResource: 'HVAC', passNote: 'Service sticker not found; no active symptom observed during demo.' }),
        18: demoAnswer({ trade: 'Chimney', effort: 'Trade scope', passCandidate: true, passCadence: 'Before fireplace use', passResource: 'Roofing', passNote: 'Fireplace/chimney cleaning date is not documented; treat as care planning until inspected.' }),
        'intake-follow-up-hvacService': demoAnswer({ status: 'Unknown', trade: 'HVAC', effort: 'Trade scope', reviewStatus: 'Reviewed — Context Only', notes: 'Unknown history noted; no confirmed defect for PMR in this demo.' }),
        'intake-follow-up-roofAge': demoAnswer({ status: 'Unknown', trade: 'Roof', effort: 'Unknown', reviewStatus: 'Reviewed — Context Only', notes: 'Older roof context recorded for future planning, not a PMR finding.' }),
        'intake-follow-up-chimney': demoAnswer({ status: 'Unknown', trade: 'Roof', effort: 'Trade scope', reviewStatus: 'Reviewed — Context Only', notes: 'Unknown chimney service date kept as PASS care item.' })
      },
      intake: demoIntake({
        notes: 'Demo older-home walkthrough with limited records. The goal is to keep uncertainty as context/PASS unless the field review confirms a defect.',
        hvacService: 'Not sure — no HVAC service records were available from the prior owner.',
        hvacAcService: 'Not sure — cooling service date was not documented.',
        roofAge: 'Approximate age not confirmed; seller records unavailable.',
        chimney: 'Not sure — last chimney cleaning date is undocumented.',
        waterHeater: 'Age/service label hard to read; verify at next plumbing visit.',
        gutters: 'Seasonal cleaning history not documented.'
      }),
      dynamicRooms: cloneData(DEFAULT_DYNAMIC_ROOMS),
      sectionOrder: [],
      itemOrder: {},
      pinnedItems: {},
      roomCapture: {
        Mechanical: { status: 'Routine Care / PASS', note: 'Unknown service history only; no confirmed PMR defect in this scenario.', photos: [], items: [] },
        Exterior: { status: 'Watch Item / Worth Watching', note: 'Older exterior context retained for planning.', photos: [], items: [] }
      },
      passReview: {
        'generated-pass-water-heater-service': {
          reason: 'Demo-edited reason: age/service label was unclear, so plan a normal plumbing review rather than treating it as a defect.',
          suggestedWindow: 'Suggested window: At the next routine plumbing visit or annual home-care review.',
          resource: 'Plumbing'
        },
        'generated-pass-smoke-co-extinguisher-check': { pmcpDecision: 'pending' }
      }
    }
  },
  {
    id: 'demo-pmr-plus-pass-care',
    name: 'Demo 3 — PMR findings plus PASS care items',
    description: 'Mixed export check: several true PMR findings are counted while PASS care items stay separate, including hidden and edited PASS review states.',
    checks: ['Only true defect/status rows should increase PMR counts.', 'Manual PASS care items with Good status should not be counted as PMR.', 'Hidden PASS items should not appear in PMR/Drive export.', 'Edited PASS reason/window/resource should appear in PMR and Drive export.'],
    data: {
      client: { name: 'Demo Client — PMR + PASS', address: '77 Mixed Findings Court', date: 'Demo Walkthrough — PMR and PASS' },
      answers: {
        0: demoAnswer({ status: 'Immediate Concern', trade: 'Electrical', effort: '30 min', notes: 'Kitchen GFCI did not trip/reset during demo test; true PMR safety finding.', actionCertainty: 'Clear Path', pref: 'Do now' }),
        1: demoAnswer({ status: 'Needs Attention', trade: 'Plumbing', effort: '45–60 min', notes: 'Under-sink trap shows active drip after running water; true PMR plumbing finding.', actionCertainty: 'Clear Path', pref: 'Do now' }),
        4: demoAnswer({ status: 'Needs Attention', trade: 'Handyman', effort: '45–60 min', notes: 'Dryer exterior flap restricted with lint buildup and weak airflow; true PMR plus recurring PASS care.', passCandidate: true, passCadence: 'Annual / Fall', passResource: 'Handy Services', passNote: 'After the current cleaning/repair, keep dryer vent cleaning on an annual PASS rhythm.', actionCertainty: 'Likely Path' }),
        9: demoAnswer({ status: 'Monitor', trade: 'Handyman', effort: '1–2 hrs', notes: 'Tub/shower caulk is starting to split at back corner; monitor/reseal before water intrusion.', actionCertainty: 'Clear Path', pref: 'Plan soon' }),
        11: demoAnswer({ trade: 'Handyman', effort: '15 min', passCandidate: true, passCadence: 'Every 1–3 months', passResource: 'HVAC', passNote: 'Filter looked acceptable today; keep replacement rhythm separate from defect list.' }),
        16: demoAnswer({ trade: 'Safety', effort: '30 min', passCandidate: true, passCadence: 'Annual safety review', passResource: 'Safety', passNote: 'Detector dates verified for demo; keep annual test/replacement review in PASS only.' }),
        'default-living-room-1-3': demoAnswer({ trade: 'Chimney', effort: 'Trade scope', passCandidate: true, passCadence: 'Before fall fireplace use', passResource: 'Roofing', passNote: 'Fireplace looked normal; schedule routine cleaning window only.' })
      },
      intake: demoIntake({
        notes: 'Demo mixed walkthrough. Verify PMR counts include only true findings and that PASS care remains a separate continued-care section.',
        hvacFilter: 'Filter changed recently; continue recurring reminder.',
        hvacService: 'Service completed last fall; next normal seasonal service can be planned.',
        waterHeater: 'No defect observed; normal annual flush/review reminder requested.',
        gutters: 'Gutters are due for seasonal cleaning even though no active overflow was observed.',
        smokeCO: 'Annual detector review requested by homeowner.',
        chimney: 'Routine fireplace cleaning to schedule before fall use.'
      }),
      dynamicRooms: cloneData(DEFAULT_DYNAMIC_ROOMS),
      sectionOrder: ['Kitchen', 'Laundry', 'Bathroom', 'Mechanical', 'Safety', 'default-living-room-1'],
      itemOrder: {},
      pinnedItems: { Kitchen: ['0', '1'], Laundry: ['4'] },
      roomCapture: {
        Kitchen: { status: 'Trade Attention', note: 'Two true PMR findings: failed GFCI and active sink drip.', photos: [], items: [] },
        Laundry: { status: 'Handy Services', note: 'Dryer vent is a current PMR finding; future vent cleaning remains PASS.', photos: [], items: [] },
        Mechanical: { status: 'Routine Care / PASS', note: 'Filter rhythm is PASS only in this demo.', photos: [], items: [] },
        Safety: { status: 'Routine Care / PASS', note: 'Safety device annual review is PASS only.', photos: [], items: [] }
      },
      passReview: {
        'generated-pass-gutters-drainage-review': { pmcpDecision: 'pending' },
        'manual-pass-11': { pmcpDecision: 'pending' },
        'manual-pass-4': {
          reason: 'Demo-edited reason: once the lint restriction is corrected, keep dryer vent cleaning as a recurring fire-safety care item.',
          suggestedWindow: 'Suggested window: Recheck every fall after the current vent cleaning is complete.',
          resource: 'Safety'
        },
        'generated-pass-water-heater-service': {
          reason: 'Demo-edited reason: no water-heater defect was found, but annual flush/service review belongs in continued care.',
          suggestedWindow: 'Suggested window: Add to the next annual plumbing maintenance visit.',
          resource: 'Plumbing'
        }
      }
    }
  }
];
function readWalkthroughSessions() {
  const saved = safeJsonParse(localStorage.getItem(WALKTHROUGH_SESSIONS_KEY), {});
  return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
}
function initialWalkthroughState() {
  const sessions = readWalkthroughSessions();
  return {
    data: cleanWalkthroughData(),
    sessions,
    activeId: '',
    selectedId: '',
    name: 'New Blank Walkthrough'
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
  const [intake, setIntake] = useState(() => normalizeIntakeData(initialState.data.intake));
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
  const [passReview, setPassReview] = useState(() => normalizePassReviewData(initialState.data.passReview || {}));
  const [roomItemFormOpen, setRoomItemFormOpen] = useState(false);
  const [roomItemDraft, setRoomItemDraft] = useState(EMPTY_ROOM_ITEM_DRAFT);
  const [dragSectionKey, setDragSectionKey] = useState('');
  const [photoFeedback, setPhotoFeedback] = useState({ state: '', message: '' });
  const [copyFeedback, setCopyFeedback] = useState('');
  const [storageWarning, setStorageWarning] = useState('');
  const [saveStatus, setSaveStatus] = useState({ state: 'saved', time: initialState.activeId ? 'loaded' : '' });
  const [expandedChecklistItems, setExpandedChecklistItems] = useState({});
  const [roomOverviewExpandedByRoom, setRoomOverviewExpandedByRoom] = useState({});
  const [smartPromptExpandedByRoom, setSmartPromptExpandedByRoom] = useState({});
  const [controlsCollapsed, setControlsCollapsed] = useState(() => {
    const initialClient = initialState.data.client || {};
    const missingBasicInfo = isMissingProjectIdentityValue(initialClient.name) || isMissingProjectIdentityValue(initialClient.address) || isMissingProjectIdentityValue(initialClient.date);
    const savedDriveMeta = safeJsonParse(localStorage.getItem(DRIVE_META_KEY), null);
    const hasDriveError = Boolean(savedDriveMeta?.lastError);
    return Boolean(initialState.activeId && !missingBasicInfo && !hasDriveError && localStorage.getItem(WALKTHROUGH_CONTROLS_COLLAPSED_KEY) === 'true');
  });
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
  useEffect(()=>{
    safeLocalStorageSet(WALKTHROUGH_CONTROLS_COLLAPSED_KEY, controlsCollapsed ? 'true' : 'false', applyStorageFailure);
  }, [controlsCollapsed]);
  useEffect(() => {
    const handler = (event) => {
      if (event.detail === 'pmr' || event.detail === 'pass') setView(event.detail);
    };
    window.addEventListener('tha:set-view', handler);
    return () => window.removeEventListener('tha:set-view', handler);
  }, []);
  const baseSections = useMemo(() => {
    const list = [];
    sectionOrder.forEach(groupKey => {
      if (groupKey === 'Exterior') {
        list.push({ key: 'Exterior', label: 'Exterior', rows: buildStaticSectionRows('Exterior') });
        return;
      }
      if (groupKey === 'Kitchen') {
        list.push({ key: 'Kitchen', label: 'Kitchen', rows: buildStaticSectionRows('Kitchen') });
        return;
      }
      if (groupKey === 'Mechanical') {
        list.push({ key: 'Mechanical', label: 'Mechanical', rows: buildStaticSectionRows('Mechanical') });
        return;
      }
      if (groupKey === 'Laundry') {
        list.push({ key: 'Laundry', label: 'Laundry', rows: buildStaticSectionRows('Laundry') });
        return;
      }
      if (groupKey === 'Safety') {
        list.push({ key: 'Safety', label: 'Safety', rows: buildStaticSectionRows('Safety') });
        return;
      }
      if (groupKey === 'Living / Family Rooms') {
        dynamicRooms.filter(x => x.roomType === 'Living / Family Rooms').forEach(roomConfig => list.push({ key: roomConfig.id, label: roomConfig.roomName, roomType: roomConfig.roomType, roomName: roomConfig.roomName, rows: buildDynamicRoomRows(roomConfig) }));
        return;
      }
      if (groupKey === 'Bedrooms') {
        dynamicRooms.filter(x => x.roomType === 'Bedrooms').forEach(roomConfig => list.push({ key: roomConfig.id, label: roomConfig.roomName, roomType: roomConfig.roomType, roomName: roomConfig.roomName, rows: buildDynamicRoomRows(roomConfig) }));
        return;
      }
      if (groupKey === 'Bathrooms') {
        dynamicRooms.filter(x => x.roomType === 'Bathrooms').forEach(roomConfig => list.push({ key: roomConfig.id, label: roomConfig.roomName, roomType: roomConfig.roomType, roomName: roomConfig.roomName, rows: buildDynamicRoomRows(roomConfig) }));
        return;
      }
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
  const reviewedIntakeNotes = intakeReviewRows.filter(r => r.intakeField !== 'additionalConcerns' && r.answer.reviewStatus && r.answer.reviewStatus !== 'Not Reviewed' && r.answer.reviewStatus !== INTAKE_PMR_REVIEW_STATUS);
  const counts = { high: pmr.filter(r=>priority(r.answer.status)==='High').length, med: pmr.filter(r=>priority(r.answer.status)==='Medium').length, low: pmr.filter(r=>priority(r.answer.status)==='Low').length };
  const quickHits = pmr.filter(r => ['Handyman','Safety'].includes(r.answer.trade) && ['15 min','30 min','45–60 min','1–2 hrs'].includes(r.answer.effort));
  const pass = rows.filter(r => r.answer.addToPmcpBuilder);
  const passCareCandidates = buildPassCareOutlook({ intake, rows, passReview, roomCapture, sections });
  const passCareOutlook = applyPassReview(passCareCandidates, passReview);
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
      ? `Drive editable package saved at ${driveMeta.lastSaved}.`
      : driveToken
        ? 'Drive connected — ready to export.'
        : driveConfigured
          ? driveConfiguredMessage
          : 'Drive is not configured. Add the OAuth Client ID in Drive Setup Help or use Download Local Emergency Backup.';
  const driveWarningText = driveMeta.lastSaved
    ? 'Drive export is active. Download Local Emergency Backup is still recommended as a safety copy.'
    : driveToken
      ? 'Drive connected — ready to export.'
      : hasAppDriveClientId && !usingManualDriveOverride
        ? 'Drive is configured for this app. Connect Google Drive before exporting.'
        : driveConfigured
          ? 'Drive is configured. Connect Google Drive before exporting.'
          : 'Drive is not configured. Add the OAuth Client ID in Drive Setup Help or use Download Local Emergency Backup.';
  const driveClientIdSourceLabel = usingManualDriveOverride ? 'Manual override on this browser' : (hasAppDriveClientId ? 'App configuration' : 'Manual browser setup');
  const requiredProjectIdentityFields = [
    { key: 'clientName', label: 'Client Name', value: client.name, helper: 'Client name needed' },
    { key: 'projectAddress', label: 'Project Address', value: client.address, helper: 'Project address needed' },
    { key: 'walkthroughDate', label: 'Walkthrough Date / Visit Label', value: client.date, helper: 'Required before PMR output' }
  ];
  const missingProjectIdentityFields = requiredProjectIdentityFields.filter(field => isMissingProjectIdentityValue(field.value));
  const missingClientFieldCount = missingProjectIdentityFields.length;
  const homeownerCompletedForCues = completedIntakeFieldCount(intake, HOMEOWNER_QUICK_INTAKE_FIELDS);
  const fieldPrepCompletedForCues = completedIntakeFieldCount(intake, THA_FIELD_PREP_FIELDS);
  const intakeFollowUpCount = intakeFollowUpRows.length;
  const readyForHTC = homeownerCompletedForCues >= 2 || fieldPrepCompletedForCues >= 3 || intakeFollowUpCount > 0;
  const answeredHtcRows = rows.filter(row => row.answer.status !== 'Not Checked' || row.answer.notes.trim() || row.answer.photos.length).length;
  const htcProgressText = rows.length ? `${answeredHtcRows}/${rows.length} items touched` : 'No HTC items loaded';
  const pmrNeedsReview = unreviewedIntakeRows.length > 0;
  const passNeedsReview = passCareCandidates.some(item => {
    const review = passReview[item.id] || {};
    return pmcpDecisionForReview(review) === 'pending' && !((review.reason ?? item.reason) || '').trim();
  });
  const homeownerOutputReady = !missingClientFieldCount && !pmrNeedsReview;
  const driveCueState = driveMeta.lastError ? 'warning' : (driveMeta.lastSaved || driveToken ? 'ready' : 'neutral');
  const driveCueText = driveMeta.lastError ? 'Needs review' : (driveMeta.lastSaved ? 'Package saved' : (driveToken ? 'Connected' : 'Optional Drive upload'));
  const workflowCues = [
    { label: 'Client/project info', state: missingClientFieldCount ? 'setupMissing' : 'ready', text: missingClientFieldCount ? `${missingProjectIdentityFields.map(field => field.label.replace(' / Visit Label', '')).join(', ')} needed` : 'Ready' },
    { label: 'Homeowner intake', state: intakeFollowUpCount ? 'warning' : (readyForHTC ? 'ready' : 'neutral'), text: intakeFollowUpCount ? `${intakeFollowUpCount} follow-up${intakeFollowUpCount === 1 ? '' : 's'} to review` : (readyForHTC ? 'Ready for HTC' : 'Optional / not started') },
    { label: 'HTC walkthrough', state: answeredHtcRows ? 'ready' : 'neutral', text: htcProgressText },
    { label: 'PMR review', state: pmrNeedsReview ? 'warning' : 'ready', text: pmrNeedsReview ? `${unreviewedIntakeRows.length} intake follow-up${unreviewedIntakeRows.length === 1 ? '' : 's'} not reviewed` : 'Ready for output' },
    { label: 'PASS review', state: passNeedsReview ? 'warning' : (passCareCandidates.length ? 'ready' : 'neutral'), text: passNeedsReview ? 'Needs care wording' : (passCareCandidates.length ? `${passCareCandidates.length} candidate${passCareCandidates.length === 1 ? '' : 's'} ready` : 'Optional / none') },
    { label: 'Drive package', state: driveCueState, text: driveCueText },
    { label: 'Homeowner output', state: homeownerOutputReady ? 'ready' : 'setupMissing', text: homeownerOutputReady ? 'View/download ready' : 'Required before PMR output' }
  ];
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
    addToPmcpBuilder: Boolean(roomCapture?.[sectionKey]?.addToPmcpBuilder),
    thaActionItem: Boolean(roomCapture?.[sectionKey]?.thaActionItem),
    thaActionType: THA_ACTION_TYPES.includes(roomCapture?.[sectionKey]?.thaActionType) ? roomCapture[sectionKey].thaActionType : 'Research',
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
  const setPmcpBuilderForRow = (row, enabled) => {
    update(row.id, { addToPmcpBuilder: enabled });
    const topic = passCareTopicForRow(row);
    setPassReview(prev => normalizePassReviewData({
      ...prev,
      [topic.careTopicId]: {
        ...(prev[topic.careTopicId] || {}),
        pmcpDecision: enabled ? 'selected' : 'pending'
      }
    }));
  };
  const setPmcpBuilderForRoom = (section, enabled) => {
    updateRoomCapture(section.key, { addToPmcpBuilder: enabled });
    const topicId = roomOverviewCareTopicId(section.key);
    setPassReview(prev => normalizePassReviewData({
      ...prev,
      [topicId]: {
        ...(prev[topicId] || {}),
        pmcpDecision: enabled ? 'selected' : 'pending'
      }
    }));
  };
  const updateIntake = (patch) => setIntake(prev => normalizeIntakeData({...prev, ...patch}));
  const updatePassReview = (id, patch) => setPassReview(prev => normalizePassReviewData({...prev, [id]: {...(prev[id] || {}), ...patch}}));
  const copyPreWalkthroughIntakeEmail = async () => {
    const intakeId = intake.intakeId || generateIntakeId();
    try {
      if (!intake.intakeId) setIntake(prev => prev.intakeId ? prev : normalizeIntakeData({ ...prev, intakeId }));
      await copyTextToClipboard(buildPreWalkthroughIntakeEmail({ client, intakeId }));
      setCopyFeedback('Pre-walkthrough intake email copied');
      window.setTimeout(() => setCopyFeedback(''), 2500);
    } catch (error) {
      setCopyFeedback('Could not copy intake email');
    }
  };
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
            addToPmcpBuilder: Boolean(prev?.[sectionKey]?.addToPmcpBuilder),
            thaActionItem: Boolean(prev?.[sectionKey]?.thaActionItem),
            thaActionType: THA_ACTION_TYPES.includes(prev?.[sectionKey]?.thaActionType) ? prev[sectionKey].thaActionType : 'Research',
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
        addToPmcpBuilder: Boolean(prev?.[sectionKey]?.addToPmcpBuilder),
        thaActionItem: Boolean(prev?.[sectionKey]?.thaActionItem),
        thaActionType: THA_ACTION_TYPES.includes(prev?.[sectionKey]?.thaActionType) ? prev[sectionKey].thaActionType : 'Research',
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
    intake: normalizeIntakeData(intake),
    dynamicRooms,
    sectionOrder: sectionOrderState,
    itemOrder: itemOrderState,
    pinnedItems,
    roomCapture,
    passReview: normalizePassReviewData(passReview)
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
    if (!activeWalkthroughId && !hasWalkthroughContent(currentWalkthroughData())) {
      setSaveStatus(status => status.state === 'failed' ? status : { state: 'saved', time: '' });
      return undefined;
    }
    setSaveStatus(status => status.state === 'failed' ? status : { state: 'unsaved', time: status.time || '' });
    const timeout = window.setTimeout(() => {
      setSaveStatus({ state: 'saving', time: '' });
      persistCurrentWalkthroughSession();
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [activeWalkthroughId, client, answers, intake, dynamicRooms, sectionOrderState, itemOrderState, pinnedItems, roomCapture, passReview, walkthroughName]);
  const applyWalkthroughData = (data) => {
    const clean = cleanWalkthroughData();
    setClient(data?.client || clean.client);
    setAnswers(data?.answers || clean.answers);
    setIntake(normalizeIntakeData(data?.intake || clean.intake));
    setDynamicRooms(Array.isArray(data?.dynamicRooms) ? data.dynamicRooms : clean.dynamicRooms);
    setSectionOrderState(Array.isArray(data?.sectionOrder) ? data.sectionOrder : clean.sectionOrder);
    setItemOrderState(data?.itemOrder || clean.itemOrder);
    setPinnedItems(data?.pinnedItems || clean.pinnedItems);
    setRoomCapture(data?.roomCapture || clean.roomCapture);
    setPassReview(normalizePassReviewData(data?.passReview || clean.passReview));
    setRoomItemFormOpen(false);
    setRoomItemDraft(EMPTY_ROOM_ITEM_DRAFT);
    setExpandedChecklistItems({});
    setView('intake');
  };
  const startNewWalkthrough = () => {
    applyWalkthroughData(cleanWalkthroughData());
    setWalkthroughName('New Blank Walkthrough');
    setActiveWalkthroughId('');
    setSelectedWalkthroughId('');
    setControlsCollapsed(false);
    setSaveStatus({ state: 'saved', time: '' });
  };
  const loadDemoScenario = (scenario) => {
    const nextId = `demo-${scenario.id}-${Date.now()}`;
    applyWalkthroughData(cloneData(scenario.data));
    setWalkthroughName(scenario.name);
    setActiveWalkthroughId(nextId);
    setSelectedWalkthroughId('');
    setControlsCollapsed(false);
    setView('pmr');
    setCopyFeedback(`${scenario.name} loaded`);
    window.setTimeout(() => setCopyFeedback(''), 2500);
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
    const openedClient = session.data.client || {};
    const openedMissingBasicInfo = isMissingProjectIdentityValue(openedClient.name) || isMissingProjectIdentityValue(openedClient.address) || isMissingProjectIdentityValue(openedClient.date);
    setControlsCollapsed(openedMissingBasicInfo ? false : localStorage.getItem(WALKTHROUGH_CONTROLS_COLLAPSED_KEY) === 'true');
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
  const buildCurrentDrivePayload = () => buildDrivePayload({walkthroughName, client, intake, rows, pmr, passCareOutlook, passReview, dynamicRooms, sections, sectionOrderState, itemOrderState, pinnedItems, roomCapture});
  const buildCurrentStyledPmrHtml = () => {
    const payload = buildCurrentDrivePayload();
    return buildPmrReportHtml(payload, photoEntriesForPayload(payload));
  };
  const styledPmrFileName = () => 'PMR Report Packet.html';
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(buildCurrentDrivePayload(), null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `THA-HTC-PMR-${client.name || 'client'}.json`; a.click(); URL.revokeObjectURL(url);
  };
  const downloadEmergencyBackup = () => {
    downloadJSON();
    setCopyFeedback('Emergency backup downloaded');
    window.setTimeout(() => setCopyFeedback(''), 2500);
  };
  const downloadStyledPMR = () => {
    if (missingClientFieldCount) {
      window.alert('PMR download is blocked until client name, project address, and walkthrough date / visit label are provided.');
      return;
    }
    const html = buildCurrentStyledPmrHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = styledPmrFileName();
    a.click();
    URL.revokeObjectURL(url);
  };
  const viewPMR = () => {
    setView('pmr');
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
  const printPMR = () => {
    if (missingClientFieldCount) {
      window.alert('PMR print is blocked until client name, project address, and walkthrough date / visit label are provided.');
      return;
    }
    if (unreviewedIntakeRows.length) {
      window.alert(`PMR print is blocked until ${unreviewedIntakeRows.length} Intake Follow-Up row${unreviewedIntakeRows.length === 1 ? '' : 's'} are reviewed.`);
      setView('form');
      setActiveRoom(INTAKE_FOLLOW_UP_SECTION_KEY);
      return;
    }
    setView('pmr');
    window.setTimeout(() => window.print(), 0);
  };
  const savedSessionList = Object.values(savedSessions).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const hasUnsavedVisiblePhotos = saveStatus.state !== 'saved' && hasVisiblePhotoDataUrls(answers, roomCapture);
  const controlsMissingFields = missingProjectIdentityFields.map(field => field.label);
  const controlsNeedsAttention = Boolean(controlsMissingFields.length || storageWarning || photoFeedback.message || driveMeta.lastError || saveStatus.state === 'failed' || pendingCount || pendingPhotoCount);
  const controlsAttentionText = controlsMissingFields.length
    ? `Needs ${controlsMissingFields.join(', ')}`
    : storageWarning || photoFeedback.message || driveMeta.lastError || (saveStatus.state === 'failed' ? saveStatusText(saveStatus, hasUnsavedVisiblePhotos) : 'Attention needed');
  const driveSummaryText = driveMeta.lastError
    ? `Drive error: ${driveMeta.lastError}`
    : pendingCount
      ? `Drive sync pending: ${pendingCount}`
      : pendingPhotoCount
        ? `Pending photos: ${pendingPhotoCount}`
        : driveToken
          ? 'Drive connected'
          : driveConfigured
            ? 'Drive configured'
            : 'Drive not configured';
  const setControlsCollapsedPreference = (collapsed) => {
    setControlsCollapsed(collapsed);
    safeLocalStorageSet(WALKTHROUGH_CONTROLS_COLLAPSED_KEY, collapsed ? 'true' : 'false', applyStorageFailure);
  };
  const roomRows = rows.filter(r => r.sectionKey === activeRoom);
  const currentRoomCapture = roomCaptureFor(activeRoom);
  const activeRoomLabel = rooms.find(r => r.key === activeRoom)?.label || activeRoom;
  const isRoomOverviewExpanded = Boolean(roomOverviewExpandedByRoom[activeRoom]);
  const isSmartPromptExpanded = Boolean(smartPromptExpandedByRoom[activeRoom]);
  const toggleRoomOverview = () => setRoomOverviewExpandedByRoom(prev => ({ ...prev, [activeRoom]: !prev[activeRoom] }));
  const toggleSmartPrompt = () => setSmartPromptExpandedByRoom(prev => ({ ...prev, [activeRoom]: !prev[activeRoom] }));
  const setChecklistRowsExpanded = (sectionKey, expanded) => {
    const sectionItemIds = rows.filter(r => r.sectionKey === sectionKey).map(r => r.id);
    setExpandedChecklistItems(prev => {
      const next = { ...prev };
      sectionItemIds.forEach(id => {
        if (expanded) next[id] = true;
        else delete next[id];
      });
      return next;
    });
  };
  const toggleChecklistItem = (id) => setExpandedChecklistItems(prev => ({ ...prev, [id]: !prev[id] }));
  const itemHasPhotoAttention = (answer) => answer.photos.some(photo => [PHOTO_UPLOAD_STATUS.PENDING, PHOTO_UPLOAD_STATUS.FAILED].includes(photo.uploadStatus || PHOTO_UPLOAD_STATUS.LOCAL));
  const checklistSummaryFlags = (r) => {
    const flags = [];
    const photoCount = r.answer.photos.length;
    if (includePMRRow(r)) flags.push({ key: 'pmr', className: 'attention', label: `PMR: ${priority(r.answer.status) || r.answer.status}` });
    else if (includePMR(r.answer)) flags.push({ key: 'attention', className: 'attention', label: `Attention: ${r.answer.status}` });
    if (isIntakeFollowUp(r)) flags.push({ key: 'intake', className: r.answer.reviewStatus === 'Not Reviewed' ? 'attention' : 'info', label: `Intake: ${r.answer.reviewStatus}` });
    if (r.answer.thaActionItem) flags.push({ key: 'workOrder', className: 'workOrder', label: currentWorkOrderLabel(r.answer) || 'THA Action-Item' });
    if (photoCount) flags.push({ key: 'photos', className: itemHasPhotoAttention(r.answer) ? 'attention' : 'info', label: `${photoCount} photo${photoCount === 1 ? '' : 's'}` });
    if (r.answer.notes.trim()) flags.push({ key: 'notes', className: 'info', label: 'Notes' });
    if (r.answer.photoRef.trim()) flags.push({ key: 'photoRef', className: 'info', label: 'Photo ref' });
    if (r.catchAll && r.answer.reassignTo) flags.push({ key: 'reassign', className: 'info', label: 'Reassign ready' });
    return flags;
  };

  const roomSummaryFor = (section) => {
    const sectionRows = rows.filter(row => row.sectionKey === section.key);
    const capture = roomCaptureFor(section.key);
    const roomStatus = capture.status || ROOM_STATUS_OPTIONS[0];
    const roomItems = capture.items || [];
    const hasRoomEvidence = Boolean(capture.note.trim()) || capture.photos.length > 0 || roomItems.length > 0;
    const roomOverviewUnknown = roomStatus === 'Unknown';
    const unknownDetailCount = sectionRows.filter(row => (row.answer.status || 'Unknown') === 'Unknown').length;
    const roomSelection = passCareSelectionForRoom(section, passCareOutlook);
    const roomLevelPmcpPlacement = Boolean(capture.addToPmcpBuilder) || roomSelection.pmcpDecision === 'selected';
    const rowPmcpPlacement = sectionRows.some(row => Boolean(row.answer.addToPmcpBuilder) || passCareSelectionForRow(row, passCareOutlook).pmcpDecision === 'selected');
    const roomPmcpPlacement = roomLevelPmcpPlacement || rowPmcpPlacement;
    const hasActionItem = Boolean(capture.thaActionItem) || sectionRows.some(row => Boolean(row.answer.thaActionItem));
    const railLeft = roomOverviewUnknown && unknownDetailCount > 0 ? 'unknown' : 'blue';
    const railRight = hasActionItem
      ? 'work-now'
      : (roomPmcpPlacement ? 'pass' : 'none');
    const counts = {
      pmr: sectionRows.filter(includePMRRow).length,
      photos: capture.photos.length + sectionRows.reduce((total, row) => total + row.answer.photos.length, 0),
      pass: sectionRows.filter(row => Boolean(row.answer.addToPmcpBuilder) || passCareSelectionForRow(row, passCareOutlook).pmcpDecision === 'selected').length + (roomLevelPmcpPlacement ? 1 : 0),
      intake: sectionRows.filter(isIntakeFollowUp).length,
      trade: roomItems.filter(item => item.bucket === 'trade_attention').length,
      handy: roomItems.filter(item => item.bucket === 'handy_services').length,
      watch: roomItems.filter(item => item.bucket === 'watch_item').length + sectionRows.filter(row => row.answer.status === 'Monitor').length
    };
    const immediateCount = sectionRows.filter(row => row.answer.status === 'Immediate Concern').length;
    const isIntakeSection = section.key === INTAKE_FOLLOW_UP_SECTION_KEY;
    const hasAttention = immediateCount > 0 || counts.pmr > 0 || counts.intake > 0 || counts.trade > 0 || counts.handy > 0 || counts.watch > 0 || (!isIntakeSection && roomStatus !== 'Looking Good');
    const statusTone = immediateCount > 0 || roomStatus === 'Immediate Concern'
      ? 'immediate'
      : roomStatus === 'Looking Good' && !hasAttention
        ? 'good'
        : 'watch';
    const roomStatusLabel = {
      'Looking Good': 'Good',
      'Watch Item / Worth Watching': 'Watch',
      'Handy Services': 'Handy',
      'Trade Attention': 'Trade',
      'Routine Care / PASS': 'PASS',
      'Homeowner Goal': 'Goal'
    }[roomStatus] || roomStatus;
    const badges = isIntakeSection ? [] : [{ key: 'status', label: roomStatusLabel, tone: statusTone }];
    if (counts.intake) badges.push({ key: 'intake', label: `Intake ${counts.intake}`, tone: 'intake' });
    if (counts.pmr) badges.push({ key: 'pmr', label: `PMR ${counts.pmr}`, tone: immediateCount ? 'immediate' : 'attention' });
    if (counts.photos) badges.push({ key: 'photos', label: `Photos ${counts.photos}`, tone: 'info' });
    if (counts.pass) badges.push({ key: 'pass', label: `PMCP ${counts.pass}`, tone: 'pass' });
    if (counts.trade) badges.push({ key: 'trade', label: `Trade ${counts.trade}`, tone: 'attention' });
    if (counts.handy) badges.push({ key: 'handy', label: `Handy ${counts.handy}`, tone: 'handy' });
    if (counts.watch) badges.push({ key: 'watch', label: `Watch ${counts.watch}`, tone: 'watch' });
    return { ...counts, rail: { left: railLeft, right: railRight }, badges, hasAttention, immediateCount };
  };
  const currentRoomSummary = roomSummaryFor(rooms.find(r => r.key === activeRoom) || { key: activeRoom, label: activeRoom });
  const currentRoomRailClasses = `roomRail-${currentRoomSummary.rail.left} ${currentRoomSummary.rail.right === 'work-now' ? 'roomRail-pass roomRail-work-now' : currentRoomSummary.rail.right === 'pass' ? 'roomRail-pass' : ''}`.trim();
  const setupFieldState = (value) => isMissingProjectIdentityValue(value) ? 'setupMissing' : 'setupReady';
  const setupFieldHelp = (value, missingText) => isMissingProjectIdentityValue(value) ? missingText : 'Ready for PMR packet';
  const setupFieldIcon = (value) => isMissingProjectIdentityValue(value) ? '!' : '✓';
  const syncDrive = async ({includeDownload=false, retryQueue=false} = {}) => {
    if (includeDownload) downloadJSON();
    if (missingClientFieldCount) {
      setDriveMeta(meta => ({...meta, lastStatus: '', lastStatusTone: '', lastError: 'Complete client name, property address, and walkthrough date to finalize this report.', lastErrorDetails: ''}));
      return;
    }
    const payload = buildCurrentDrivePayload();
    if (!driveToken) {
      setDriveMeta(meta => ({...meta, lastStatus: '', lastStatusTone: '', lastError: driveConfigured ? 'Drive session expired — reconnect to export.' : 'Drive is not configured. Add the OAuth Client ID in Drive Setup Help or use Download Local Emergency Backup.', lastErrorDetails: ''}));
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
      const warningText = drivePackage.warnings?.length ? ` ${drivePackage.warnings.join(' ')}` : '';
      setDriveMeta(meta => ({
        ...meta,
        hasConnected: true,
        lastSaved: savedAt,
        lastFolderName: drivePackage.folderName || '',
        lastFolderLink: drivePackage.folderLink || '',
        ...driveStatusState(`Drive package saved at ${savedAt}. Main PMR Report Packet HTML/PDF uploaded; editable copies and emergency backup are secondary.${warningText}`, 'success')
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
      <nav><button onClick={()=>setView('intake')} className={view==='intake'?'on':''}><Home size={18}/> Intake</button><button onClick={()=>setView('form')} className={view==='form'?'on':''}><ClipboardCheck size={18}/> HTC</button><button onClick={()=>setView('pmr')} className={view==='pmr'?'on':''}><FileText size={18}/> PMR</button><button onClick={()=>setView('pass')} className={view==='pass'?'on':''}><CalendarDays size={18}/> PASS</button><button onClick={()=>setView('metrics')} className={view==='metrics'?'on':''}><Clock3 size={18}/> Metrics</button></nav>
    </header>
    <section className={`walkthroughControlsPanel noPrint ${controlsCollapsed ? 'collapsed' : 'expanded'} ${controlsNeedsAttention ? 'needsAttention' : ''}`} aria-label="Walkthrough Control Panel">
      <div className="walkthroughControlsHeader">
        <div>
          <h2>Walkthrough Control Panel</h2>
          <p>{controlsCollapsed ? 'Compact walkthrough setup summary.' : 'Name, save, export, and output controls for this walkthrough.'}</p>
        </div>
        {!controlsCollapsed && <button type="button" onClick={()=>setControlsCollapsedPreference(true)}>Close Controls</button>}
      </div>
      <div className="walkthroughControlsSummary" aria-label="Walkthrough control summary">
        <div className="summaryItem"><span>Working Session Name</span><strong title={walkthroughName || 'Untitled Walkthrough'}>{walkthroughName || 'Untitled Walkthrough'}</strong></div>
        <div className={`summaryItem ${setupFieldState(client.name)}`}><span>Client Name</span><strong title={client.name || 'Missing'}>{client.name || 'Missing'}</strong><small>{setupFieldIcon(client.name)} {setupFieldHelp(client.name, 'Client name needed')}</small></div>
        <div className={`summaryItem ${setupFieldState(client.address)}`}><span>Project Address</span><strong title={client.address || 'Missing'}>{client.address || 'Missing'}</strong><small>{setupFieldIcon(client.address)} {setupFieldHelp(client.address, 'Project address needed')}</small></div>
        <div className={`summaryItem ${setupFieldState(client.date)}`}><span>Walkthrough Date / Visit Label</span><strong title={client.date || 'Missing'}>{client.date || 'Missing'}</strong><small>{setupFieldIcon(client.date)} {setupFieldHelp(client.date, 'Required before PMR output')}</small></div>
        <span className={`saveStatus ${saveStatus.state}`} role="status" aria-live="polite"><span className="saveStatusDot" aria-hidden="true"></span>{saveStatusText(saveStatus, hasUnsavedVisiblePhotos)}</span>
        <span className={`driveSummaryPill ${driveMeta.lastError ? 'error' : (driveToken ? 'connected' : '')}`} title={driveSummaryText}>{driveSummaryText}</span>
        {controlsNeedsAttention && <span className={`controlAttentionPill ${controlsMissingFields.length ? 'setupAttention' : ''}`} role="status"><AlertTriangle size={14}/> {controlsAttentionText}</span>}
        {controlsCollapsed && <button type="button" className="openControlsButton" onClick={()=>setControlsCollapsedPreference(false)}>Open Controls</button>}
      </div>
      {!controlsCollapsed && <div className="workflowCueStrip" aria-label="Workflow completion cues">
        {workflowCues.map(cue => <span key={cue.label} className={`workflowCue ${cue.state}`}><strong>{cue.state === 'ready' ? '✓' : (cue.state === 'warning' ? '⚠' : (cue.state === 'missing' || cue.state === 'setupMissing' ? '!' : '•'))} {cue.label}</strong><small>{cue.text}</small></span>)}
      </div>}
      {!controlsCollapsed && <div className="walkthroughControlsBody">
        <section className="controlGroup sessionCard" aria-label="Walkthrough Info">
          <div className="controlGroupTitle"><h3>Walkthrough Info</h3></div>
          <label>Working Session Name<input value={walkthroughName} onChange={e=>setWalkthroughName(e.target.value)} placeholder="Name this working session"/></label>
          <label className={`requiredSetupField ${setupFieldState(client.name)}`}>Client Name<input value={client.name} onChange={e=>setClient({...client,name:e.target.value})} placeholder="Client name"/><small>{setupFieldHelp(client.name, 'Client name needed')}</small></label>
          <label className={`requiredSetupField ${setupFieldState(client.address)}`}>Project Address<input value={client.address} onChange={e=>setClient({...client,address:e.target.value})} placeholder="Project address"/><small>{setupFieldHelp(client.address, 'Project address needed')}</small></label>
          <label className={`requiredSetupField ${setupFieldState(client.date)}`}>Walkthrough Date / Visit Label<input value={client.date} onChange={e=>setClient({...client,date:e.target.value})} placeholder="Walkthrough date / visit label"/><small>{setupFieldHelp(client.date, 'Required before PMR output')}</small></label>
        </section>
        <section className="controlGroup sessionCard localWorkCard" aria-label="Local Work">
          <div className="controlGroupTitle"><h3>1. Local Work / This Device</h3><p>Autosaves and saved sessions stay in this browser on this device unless you download or upload them.</p></div>
          <div className="walkthroughActions" aria-label="Walkthrough save and backup actions">
            <button type="button" onClick={startNewWalkthrough}>New Blank Local Walkthrough</button>
            <div className="manualSaveGroup"><button type="button" className="saveLocalSessionButton" onClick={saveWalkthrough}><CheckCircle2 size={18}/> Save Local Session</button><span className={`saveStatus ${saveStatus.state}`} role="status" aria-live="polite"><span className="saveStatusDot" aria-hidden="true"></span>{saveStatusText(saveStatus, hasUnsavedVisiblePhotos)}</span></div>
          </div>
          <p className="sectionHelperText">This working walkthrough is automatically saved in this browser's local storage. “Save Local Session” updates the saved session list below; it does not create a homeowner report or upload anything to Drive.</p>
          <label>Saved local sessions<select value={selectedWalkthroughId} onChange={e=>openSavedWalkthrough(e.target.value)}><option value="">Choose saved local session</option>{savedSessionList.map(session=><option key={session.id} value={session.id}>{session.name || 'Untitled Walkthrough'}{session.updatedAt ? ` · ${new Date(session.updatedAt).toLocaleString()}` : ''}</option>)}</select></label>
          <button type="button" className="deleteLocalSessionButton" onClick={deleteSavedWalkthrough} disabled={!selectedWalkthroughId || !savedSessions[selectedWalkthroughId]}><Trash2 size={16}/> Delete Selected Local Session</button>
          <div className="localBackupRestore"><p><strong>Local backup download</strong><br/><span>Downloads a JSON recovery file to this device only. It is not homeowner-facing and does not upload to Drive.</span></p><button type="button" onClick={downloadEmergencyBackup}><Download size={16}/> Download Local Emergency Backup</button></div>
        </section>
        <section className="controlGroup clientCard homeownerOutputCard" aria-label="Homeowner Output">
          <div className="controlGroupTitle"><h3>2. Homeowner Output</h3><p>View, download, or print the polished PMR Report Packet for the homeowner.</p></div>
          <p className="driveActionHelp">Use the in-app PMR view, download the styled PMR packet, or print after required review is complete.</p>
          <div className="pmrPrintActions" aria-label="PMR homeowner deliverable actions"><button type="button" onClick={viewPMR}><FileText size={16}/> View PMR</button><button type="button" className="finalPrintButton" onClick={downloadStyledPMR} disabled={!homeownerOutputReady}><Download size={16}/> Download PMR</button><button type="button" onClick={printPMR} disabled={!homeownerOutputReady}><Printer size={16}/> Print PMR</button></div>
        </section>
        <section className="controlGroup driveStatus driveSetupPanel businessRecordsCard" aria-label="Drive / Business Records">
          <div className="driveSetupHeader">
            <div>
              <h3>3. Drive / Business Records</h3>
              <p>Save internal business records, editable copies, photos, and backup data to Google Drive.</p>
              <p className="driveActionHelp">Connect Google Drive authorizes uploads from this browser. Save Drive Package uploads a business/internal package to Drive; it is separate from the homeowner download above.</p>
            </div>
            <span className={driveToken ? 'drivePill connected' : 'drivePill'}>{driveToken ? 'Connected' : (driveConfigured ? 'Configured' : 'Not configured')}</span>
          </div>
          <div className="driveSetupGrid drivePrimaryGrid">
            <div className="driveBrowserStatus" role="status" aria-live="polite">
              <strong>{driveStatusMessage}</strong>
              <span>{hasAppDriveClientId && !usingManualDriveOverride ? 'Drive configured for this app.' : `Client ID source: ${driveClientIdSourceLabel}.`}</span>
              <span>Save Drive Package uploads to Drive: PMR Report Packet HTML/PDF in the package root, editable business copies in Secondary Editable Copies, photos, and recovery backup data in Backup Data.</span>
            </div>
            <div className="originCard">
              <span>Drive upload workflow</span>
              <p>Use Connect Google Drive first, then Save Drive Package to upload business records and editable/recovery copies.</p>
              <p>The local emergency backup remains a device download; Drive package upload is the business record copy.</p>
            </div>
          </div>
          <div className="driveSetupActions">
            <button onClick={connectDrive} disabled={driveBusy || !driveConfigured}><FolderOpen size={16}/> Connect Google Drive</button>
            <button onClick={()=>syncDrive({retryQueue:true})} disabled={driveBusy || !driveToken || Boolean(missingClientFieldCount)}><Upload size={16}/> Save Drive Package to Drive</button>
            {driveMeta.lastFolderLink ? <a className="driveFolderLink driveActionLink" href={driveMeta.lastFolderLink} target="_blank" rel="noreferrer"><FolderOpen size={14}/> Open Last Drive Folder</a> : <button type="button" disabled><FolderOpen size={16}/> Open Last Drive Folder</button>}
            <button onClick={syncPendingPhotosToDrive} disabled={driveBusy || !driveToken || !pendingPhotoCount}><Upload size={16}/> Sync Pending Photos</button>
            {copyFeedback && <span className="copyFeedback" role="status">{copyFeedback}</span>}
          </div>
          {!driveConfigured && <div className="driveErrorBox" role="status"><AlertTriangle size={16}/><span>Drive is not configured. Add the OAuth Client ID in Drive Setup Help or use Download Local Emergency Backup.</span></div>}
          {driveMeta.lastStatus && <div className={`driveStatusBox ${driveMeta.lastStatusTone || 'info'}`} role="status" aria-live="polite"><CheckCircle2 size={16}/><strong>{driveMeta.lastStatus}</strong></div>}
          {driveMeta.lastError && <div className="driveErrorBox" role="alert"><AlertTriangle size={16}/><div><strong>{driveMeta.lastError}</strong>{driveMeta.lastErrorDetails && <details open><summary>Technical details</summary><pre>{driveMeta.lastErrorDetails}</pre></details>}</div></div>}
          <div className="driveMetaRow">
            <span>Last saved to Drive: {driveMeta.lastSaved || 'Never'}{driveMeta.lastFolderName ? ` · ${driveMeta.lastFolderName}` : ''}</span>
            {driveMeta.lastFolderLink && <a className="driveFolderLink" href={driveMeta.lastFolderLink} target="_blank" rel="noreferrer"><FolderOpen size={14}/> Open Drive Folder</a>}
            <span className={pendingCount ? 'pendingSync on' : 'pendingSync'}>{pendingCount ? `Pending Drive Sync: ${pendingCount}` : 'Pending sync count: 0'}</span>
            <span className={pendingPhotoCount ? 'pendingSync on' : 'pendingSync'}>{pendingPhotoCount ? `Pending photos: ${pendingPhotoCount}` : 'Pending photos: 0'}</span>
          </div>
        </section>
        <details className="controlGroup advancedPanel" aria-label="Advanced">
          <summary className="demoScenarioSummary"><span>Advanced</span><small>Drive troubleshooting, demo scenarios, and internal QA notes.</small></summary>
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
          <div className="demoScenarioCard">
          <div className="demoScenarioIntro"><h3>Demo Scenarios</h3><p>Load these only when testing PMR/PASS export behavior. Start real homeowner walkthroughs from Local Work using a blank walkthrough.</p></div>
          <div className="demoScenarioGrid">{DEMO_WALKTHROUGH_SCENARIOS.map(scenario => <article className="demoScenario" key={scenario.id}><div><h4>{scenario.name}</h4><p>{scenario.description}</p><ul>{scenario.checks.map(check => <li key={check}>{check}</li>)}</ul></div><button type="button" onClick={()=>loadDemoScenario(scenario)}>Load Demo</button></article>)}</div>
          <div className="releaseNoteInline"><h3>Release Note — {APP_RELEASE_NOTE.label}</h3><p>{APP_RELEASE_NOTE.summary}</p><ul>{APP_RELEASE_NOTE.items.map(item => <li key={item}>{item}</li>)}</ul></div>
          </div>
        </details>
      </div>}
    </section>
    {(storageWarning || photoFeedback.message) && <section className="appWarning noPrint" role="alert" aria-live="assertive"><AlertTriangle size={18}/><div>{storageWarning && <strong>{storageWarning}</strong>}{photoFeedback.message && <span className={`photoFeedback ${photoFeedback.state}`}>{photoFeedback.message}</span>}</div></section>}
    {view === 'intake' && <IntakeView client={client} intake={intake} updateIntake={updateIntake} copyFeedback={copyFeedback} onCopyPreWalkthroughEmail={copyPreWalkthroughIntakeEmail} intakeFollowUpCount={intakeFollowUpRows.length} onReviewIntakeFollowUp={()=>{ setView('form'); setActiveRoom(INTAKE_FOLLOW_UP_SECTION_KEY); }} />}
    {view === 'form' && <main className="grid">
      <aside className="roomNav noPrint"><h3>Walkthrough Sections</h3>{rooms.map((r, index) => {
        const groupType = r.roomType;
        const showGroupAddButton = groupType === 'Living / Family Rooms' || groupType === 'Bedrooms' || groupType === 'Bathrooms';
        const isLastInGroup = !showGroupAddButton || index === rooms.length - 1 || rooms[index + 1]?.roomType !== groupType;
        const roomSummary = roomSummaryFor(r);
        const roomRailClasses = `roomRail-${roomSummary.rail.left} ${roomSummary.rail.right === 'work-now' ? 'roomRail-pass roomRail-work-now' : roomSummary.rail.right === 'pass' ? 'roomRail-pass' : ''}`.trim();
        return <React.Fragment key={r.key}><div className="sectionNavRow" draggable onDragStart={()=>setDragSectionKey(r.key)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); moveSection(dragSectionKey, r.key); setDragSectionKey('');}} onDragEnd={()=>setDragSectionKey('')}><span className="sectionDragHandle" title="Drag to reorder walkthrough flow">⋮⋮</span><button className={`sectionSelect ${activeRoom===r.key?'active':''} ${roomRailClasses} ${roomSummary.hasAttention ? 'hasRoomAttention' : ''}`} onClick={()=>setActiveRoom(r.key)}><span className="sectionName">{r.label}</span><span className="roomSummaryBadges" aria-label={`${r.label} room summary`}>{roomSummary.badges.map(badge => <span key={badge.key} className={`roomSummaryBadge ${badge.tone}`}>{badge.label}</span>)}</span></button></div>{showGroupAddButton && isLastInGroup && <button type="button" className="sectionGroupAddButton" onClick={()=>addDynamicRoom(groupType)}>{groupType === 'Living / Family Rooms' ? '+ Add Living / Family Room' : groupType === 'Bedrooms' ? '+ Add Bedroom' : '+ Add Bathroom'}</button>}</React.Fragment>;
      })}<div className="hint"><Camera size={18}/> Prompt: Capture context, close-up, and detail photos. Store by room/item folder path.</div></aside>
      <section className="formPanel">
        <h1>{activeRoomLabel} HTC</h1>
        <div className="roomCaptureShell">
          <div className={`roomOverviewCard ${currentRoomRailClasses}`}>
            <button type="button" className={`roomOverviewCardHeader ${isRoomOverviewExpanded ? 'expanded' : 'collapsed'}`} onClick={toggleRoomOverview} aria-expanded={isRoomOverviewExpanded}>
              <div>
                <span className="roomOverviewEyebrow">Room Overview</span>
                <strong>{activeRoomLabel} overview</strong>
              </div>
              <div className="roomOverviewSummary">
                <span className="roomOverviewSummaryItem"><strong>Status</strong><small>{currentRoomCapture.status}</small></span>
                <span className="roomOverviewSummaryItem"><strong>Note</strong><small>{currentRoomCapture.note.trim() ? 'Yes' : 'No'}</small></span>
                <span className="roomOverviewSummaryItem"><strong>Photos</strong><small>{currentRoomCapture.photos.length}</small></span>
                <span className="roomOverviewSummaryItem"><strong>Items</strong><small>{currentRoomCapture.items.length}</small></span>
              </div>
              <span className="roomOverviewToggleText">{isRoomOverviewExpanded ? 'Close overview' : 'Open overview'}</span>
            </button>
            {isRoomOverviewExpanded && <div className="roomOverviewBody">
              <label className="roomOverviewField">Overall Room Status<select value={currentRoomCapture.status} onChange={e=>updateRoomCapture(activeRoom,{status:e.target.value})}>{ROOM_STATUS_OPTIONS.map(x=><option key={x}>{x}</option>)}</select></label>
              <label className="passCandidateToggle"><input type="checkbox" checked={Boolean(currentRoomCapture.addToPmcpBuilder)} onChange={e=>setPmcpBuilderForRoom(rooms.find(room => room.key === activeRoom) || { key: activeRoom, label: activeRoom }, e.target.checked)}/><span><strong>Add to PMCP Builder</strong><small>Directly activates this room overview care topic for PMCP review and selection.</small></span></label>
              <label className="workOrderToggle"><input type="checkbox" checked={Boolean(currentRoomCapture.thaActionItem)} onChange={e=>updateRoomCapture(activeRoom,{thaActionItem:e.target.checked})}/><span><strong>THA Action-Item</strong><small>Marks THA near-term follow-up responsibility for this room overview; this drives the purple rail.</small></span></label>
              {currentRoomCapture.thaActionItem && <label>THA action type<select value={currentRoomCapture.thaActionType} onChange={e=>updateRoomCapture(activeRoom,{thaActionType:e.target.value})}>{THA_ACTION_TYPES.map(option => <option key={option}>{option}</option>)}</select></label>}
              <label className="notes">Room Note / Voice Transcript<textarea value={currentRoomCapture.note} onChange={e=>updateRoomCapture(activeRoom,{note:e.target.value})} placeholder="Capture room-level context, voice transcript, or summary notes for this space."/></label>
              <div className="roomPhotoBox"><div className="photoBox"><Camera size={18}/><strong>Room Overview Photos:</strong><label className="uploadInline"><Upload size={16}/> Add Room Overview Photo<input type="file" accept="image/*" multiple onChange={e=>{addRoomPhotos(activeRoom, e.target.files); e.target.value='';}}/></label><span>{photoSummary(currentRoomCapture.photos, { emptyText: 'No room overview photos attached yet', labels: ROOM_PHOTO_LABELS })}</span></div>{currentRoomCapture.photos.length > 0 && <div className="thumbGrid roomThumbGrid">{currentRoomCapture.photos.map(photo => { const displaySrc = photoDisplaySrc(photo); return <div className="thumbCard" key={photo.id}><div className="thumb">{displaySrc ? <img src={displaySrc} alt={`Overview for ${activeRoomLabel}`}/> : <Image size={24}/>}</div><span>Overview</span><span title={photo.name}>{photo.name}</span><span className={`photoStatusBadge ${photo.uploadStatus || PHOTO_UPLOAD_STATUS.LOCAL}`}>{photoStatusLabel(photo)}</span><span className="photoStatusText">{photoStatusMessage(photo, Boolean(driveToken))}</span><button onClick={()=>removeRoomPhoto(activeRoom, photo.id)} aria-label="Remove room overview photo"><X size={14}/></button></div>; })}</div>}</div>
              <div className="roomItemsPlaceholder"><div className="roomOverviewSectionHeader"><h3>Room-level added items</h3><button type="button" onClick={openRoomItemForm}>Add Item</button></div>{roomItemFormOpen && <div className="roomItemForm"><div className="inputs roomItemInputs"><label>Item title<input value={roomItemDraft.title} onChange={e=>updateRoomItemDraft({title:e.target.value})} placeholder="e.g., Loose towel bar" autoFocus/></label><label>Item bucket/type<select value={roomItemDraft.bucket} onChange={e=>updateRoomItemDraft({bucket:e.target.value})}>{ROOM_ITEM_BUCKETS.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div><label className="discoveryCheck"><input type="checkbox" checked={roomItemDraft.isDiscovery} onChange={e=>updateRoomItemDraft({isDiscovery:e.target.checked})}/><span><strong>Discovery</strong><small>Unexpected, hidden, unusual, or out of the ordinary.</small></span></label><label className="notes">Notes<textarea value={roomItemDraft.notes} onChange={e=>updateRoomItemDraft({notes:e.target.value})} placeholder="Add room-level context, next step, or follow-up note."/></label><div className="roomItemActions"><button type="button" onClick={saveRoomItem} disabled={!roomItemDraft.title.trim()}>Save</button><button type="button" onClick={cancelRoomItemForm}>Cancel</button></div></div>}{currentRoomCapture.items.length > 0 ? <ul className="roomItemList">{currentRoomCapture.items.map(item=><li key={item.id} className="roomItemRow"><div><strong>{item.title}</strong><span>{roomItemBucketLabel(item.bucket)}{item.isDiscovery ? ' · Discovery' : ''}</span>{item.notes && <p>{item.notes}</p>}</div><button type="button" onClick={()=>removeRoomItem(activeRoom, item.id)} aria-label={`Remove ${item.title}`}><X size={14}/> Remove</button></li>)}</ul> : <p>No room-level items added yet.</p>}</div>
              <div className="smartRoomPrompt"><button type="button" className={`smartRoomPromptHeader ${isSmartPromptExpanded ? 'expanded' : 'collapsed'}`} onClick={toggleSmartPrompt} aria-expanded={isSmartPromptExpanded}><h3>Smart Room Prompt</h3><span>{isSmartPromptExpanded ? 'Close' : 'Open'}</span></button>{isSmartPromptExpanded && <div className="smartRoomGrid">{SMART_ROOM_PROMPTS.map(group => <p key={group.group}><strong>{group.group}:</strong> {group.prompt}</p>)}</div>}</div>
            </div>}
          </div>
        </div>
        <div className="checklistToolbar noPrint"><p className="lede">Checklist line items are collapsed for faster field scanning. Open/close below applies only to the detailed checklist entries.</p><div><button type="button" onClick={()=>setChecklistRowsExpanded(activeRoom, true)}>Open All</button><button type="button" onClick={()=>setChecklistRowsExpanded(activeRoom, false)}>Close All</button></div></div>
        {roomRows.map(r => {
          const category = categoryForChecklistItem(r);
          const meta = categoryInfo(category);
          const isExpanded = Boolean(expandedChecklistItems[r.id]);
          const flags = checklistSummaryFlags(r);
          const selection = passCareSelectionForRow(r, passCareOutlook);
          const rail = railStateFor(r.answer, { pmcpSelected: Boolean(r.answer.addToPmcpBuilder) || selection.pmcpDecision === 'selected', workOrderNow: r.answer.thaActionItem });
          const pmrBadgeLabelValue = pmrReportLabel(r.answer);
          const pmrBadgeClassName = pmrReportPillClass(r.answer);
          return <div className={`itemCard checklistItemCard categoryCard category-${meta.slug} ${isExpanded ? 'expanded' : 'collapsed'} ${flags.some(flag => flag.className === 'attention') ? 'needsAttention' : ''} rail-${rail.left} ${rail.right === 'work-now' ? 'rail-pass rail-work-now' : rail.right === 'pass' ? 'rail-pass' : ''}`} key={r.id}>
          <button type="button" className="checklistSummaryRow" onClick={()=>toggleChecklistItem(r.id)} aria-expanded={isExpanded} aria-controls={`item-detail-${r.id}`}>
            <span className="tradeIcon">{ICONS[r.answer.trade] || ICONS[r.trade] || '🔎'}</span>
            <span className="checklistSummaryMain"><span className="itemTitleLine"><strong>{r.item}</strong><CategoryBadge category={category}/>{isIntakeFollowUp(r) && <span className="sourceBadge">Intake Follow-Up</span>}</span><span>{r.zone} · Suggested: {displayTradeLabel(r.trade)}</span></span>
            <span className="checklistStatus"><span className={`statusBadge status-${r.answer.status.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{r.answer.status}</span><span className={`pill ${pmrBadgeClassName}`}>{pmrBadgeLabelValue}</span></span>
            <span className="checklistSummaryFlags">{flags.length ? flags.map(flag => <span key={flag.key} className={`summaryFlag ${flag.className}`}>{flag.label}</span>) : <span className="summaryFlag quiet">No notes/photos</span>}</span>
            <span className="expandHint">{isExpanded ? 'Close' : 'Open'}</span>
          </button>
          {isExpanded && <div className="checklistDetailPanel" id={`item-detail-${r.id}`}>
            <div className="itemHead expandedItemHead"><span className="tradeIcon">{ICONS[r.answer.trade] || ICONS[r.trade] || '🔎'}</span><div><div className="itemTitleLine"><h2>{r.item}</h2><CategoryBadge category={category}/>{isIntakeFollowUp(r) && <span className="sourceBadge">Intake Follow-Up</span>}</div><p>{r.zone} · Suggested: {displayTradeLabel(r.trade)}</p></div>{!r.catchAll && !isIntakeFollowUp(r) && <div className="itemOrderTools"><button onClick={()=>moveItem(r.sectionKey, r.id, -1)} title="Move item up">↑</button><button onClick={()=>moveItem(r.sectionKey, r.id, 1)} title="Move item down">↓</button><button onClick={()=>togglePinItem(r.sectionKey, r.id)} title="Pin to top">{(pinnedItems[r.sectionKey] || []).includes(r.id) ? 'Pinned' : 'Pin'}</button></div>}<span className={`pill ${pmrBadgeClassName}`}>{pmrBadgeLabelValue}</span></div>
            <div className="prompt"><Search size={16}/><strong>Prompt:</strong> {r.prompt}</div>
            {isIntakeFollowUp(r) && <div className="intakeReviewNotes"><strong>Homeowner-reported:</strong> {r.intakeFieldLabel}: {r.intakeValue}<br/><span>Verify during HTC before PMR inclusion · Target: {r.roomName || r.room} · Source: {r.source}</span></div>}
            <div className="inputs">
              <label>Status<select value={r.answer.status} onChange={e=>update(r.id,{status:e.target.value})}>{STATUS.map(x=><option key={x}>{x}</option>)}</select></label>
              <label>Action Certainty<select value={actionCertaintyFor(r.answer)} onChange={e=>update(r.id,{actionCertainty:e.target.value})}>{ACTION_CERTAINTY.map(x=><option key={x}>{x}</option>)}</select></label>
              <label>Suggested Trade / Resource<select value={r.answer.trade} onChange={e=>update(r.id,{trade:e.target.value})}>{TRADE_OPTIONS.map(x=><option key={x} value={x}>{displayTradeLabel(x)}</option>)}</select></label>
              <label>Approx. Time<select value={r.answer.effort} onChange={e=>update(r.id,{effort:e.target.value})}>{EFFORT.map(x=><option key={x}>{x}</option>)}</select></label>
              <label>Homeowner Pace<select value={r.answer.pref} onChange={e=>update(r.id,{pref:e.target.value})}>{PREFS.map(x=><option key={x}>{x}</option>)}</select></label>
              <label>Photo Ref<input value={r.answer.photoRef} onChange={e=>update(r.id,{photoRef:e.target.value})} placeholder="Photo 01 / filename"/></label>
              {isIntakeFollowUp(r) && <label className="intakeFollowUpReview">Review Status<select value={r.answer.reviewStatus} onChange={e=>update(r.id,{reviewStatus:e.target.value})}>{INTAKE_REVIEW_STATUSES.map(x=><option key={x}>{x}</option>)}</select></label>}
            </div>
            <label className="passCandidateToggle"><input type="checkbox" checked={Boolean(r.answer.addToPmcpBuilder)} onChange={e=>setPmcpBuilderForRow(r, e.target.checked)}/><span><strong>Add to PMCP Builder</strong><small>Direct field-action control that activates this canonical care topic for PMCP review/selection.</small></span></label>
            <label className="workOrderToggle"><input type="checkbox" checked={Boolean(r.answer.thaActionItem)} onChange={e=>update(r.id,{thaActionItem:e.target.checked, workOrderNow:e.target.checked})}/><span><strong>THA Action-Item</strong><small>THA near-term follow-up responsibility; purple rail supersedes green while keeping PMCP selection active.</small></span></label>
            {r.answer.thaActionItem && <label>THA action type<select value={r.answer.thaActionType} onChange={e=>update(r.id,{thaActionType:e.target.value})}>{THA_ACTION_TYPES.map(option=><option key={option}>{option}</option>)}</select></label>}
            <label className="notes">Notes for PMR detail<textarea value={r.answer.notes} onChange={e=>update(r.id,{notes:e.target.value})} placeholder="What do I see? What would I suggest? What needs confirmation? These notes sharpen the PMR language."/></label>
            <div className="photoBox"><Camera size={18}/><strong>Photo Capture:</strong><label className="uploadInline"><Upload size={16}/> Upload<input type="file" accept="image/*" multiple onChange={e=>{addPhotos(r.id, e.target.files); e.target.value='';}}/></label><span>{photoSummary(r.answer.photos)}</span></div>
            {r.answer.photos.length > 0 && <div className="thumbGrid">{r.answer.photos.map(photo => { const displaySrc = photoDisplaySrc(photo); return <div className="thumbCard" key={photo.id}><div className="thumb">{displaySrc ? <img src={displaySrc} alt={`${photo.label} for ${r.item}`}/> : <Image size={24}/>}</div><select value={photo.label} onChange={e=>updatePhoto(r.id, photo.id, {label:e.target.value})}>{PHOTO_LABELS.map(label=><option key={label}>{label}</option>)}</select><span title={photo.name}>{photo.name}</span><span className={`photoStatusBadge ${photo.uploadStatus || PHOTO_UPLOAD_STATUS.LOCAL}`}>{photoStatusLabel(photo)}</span><span className="photoStatusText">{photoStatusMessage(photo, Boolean(driveToken))}</span><button onClick={()=>removePhoto(r.id, photo.id)} aria-label="Remove photo"><X size={14}/></button></div>; })}</div>}
            {r.catchAll && <div className="reassignBox"><label>Reassign Catch-All Notes<select value={r.answer.reassignTo} onChange={e=>update(r.id,{reassignTo:e.target.value})}><option value="">Choose Section-Item</option>{rows.filter(target=>target.sectionKey===r.sectionKey && !target.catchAll).map(target=><option key={target.id} value={target.id}>{target.item}</option>)}</select></label><button onClick={()=>reassignCatchAll(r.id)} disabled={!r.answer.reassignTo}>Reassign</button></div>}
            <div className="drivePath"><FolderOpen size={16}/> {drivePath(client.name, client.date, r.roomType || r.room, r.item, r.roomName || r.room)}</div>
          </div>}
        </div>})}
      </section>
    </main>}
    {view === 'pmr' && <PMR client={client} intake={intake} rows={rows} pmr={pmr} counts={counts} quickHits={quickHits} passCareCandidates={passCareCandidates} passReview={passReview} passCareOutlook={passCareOutlook} unreviewedIntakeRows={unreviewedIntakeRows} reviewedIntakeNotes={reviewedIntakeNotes} roomCapture={roomCapture} sections={sections} />}
    {view === 'pass' && <PASSWorkspace intake={intake} rows={rows} passCareOutlook={passCareOutlook} passReview={passReview} onPassReviewChange={updatePassReview} />}
    {view === 'metrics' && <Metrics rows={rows} pmr={pmr} quickHits={quickHits} pass={pass}/>} 
  </div>
}



function StructuredIntakeQuestion({ group, intake, updateIntake }) {
  const values = structuredIntakeGroupValue(intake, group.key);
  const updateField = (fieldKey, value) => updateIntake({ [group.key]: { ...values, [fieldKey]: value } });
  return <div className="notes intakeQuestion structuredIntakeQuestion">
    <span>{group.question}</span>
    {group.help && <small>{group.help}</small>}
    <div className="structuredPromptGrid">
      {group.fields.map(field => <label key={field.key} className="structuredPromptField">
        <span>{field.label}</span>
        <textarea value={values[field.key] || ''} onChange={e=>updateField(field.key, e.target.value)} />
      </label>)}
    </div>
  </div>;
}

function IntakeView({client = {}, intake, updateIntake, copyFeedback = '', onCopyPreWalkthroughEmail, intakeFollowUpCount = 0, onReviewIntakeFollowUp}) {
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState(null);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const homeownerCompleted = completedIntakeFieldCount(intake, HOMEOWNER_QUICK_INTAKE_FIELDS);
  const fieldPrepCompleted = completedIntakeFieldCount(intake, THA_FIELD_PREP_FIELDS);
  const readyForHTC = homeownerCompleted >= 2 || fieldPrepCompleted >= 3 || intakeFollowUpCount > 0;
  const parsedUpdates = importPreview ? flattenedImportUpdates(importPreview.mapped) : [];
  const previewRows = parsedUpdates.map(row => {
    const currentValue = row.fieldKey ? structuredIntakeAnswerValue(intake, row.key, row.fieldKey) : intake[row.key];
    const hasExisting = !isUnknownIntakeAnswer(currentValue);
    return { ...row, currentValue, hasExisting, willApply: !hasExisting || confirmOverwrite };
  });
  const conflictingRows = previewRows.filter(row => row.hasExisting);
  const intakeIdMismatch = Boolean(importPreview?.detected.intakeId && intake.intakeId && importPreview.detected.intakeId !== intake.intakeId);
  const addressMismatch = Boolean(importPreview?.detected.projectAddress && client.address && !addressAppearsToMatch(importPreview.detected.projectAddress, client.address));
  const previewImport = () => {
    const parsed = parseIntakeResponseText(importText);
    setImportPreview(parsed);
    setConfirmOverwrite(false);
  };
  const applyImport = () => {
    if (!importPreview) return;
    if (conflictingRows.length && !confirmOverwrite && !window.confirm('Some mapped intake fields already have values. Apply only to blank fields and keep existing values?')) return;
    const patch = {
      importedRawResponse: importPreview.rawText,
      importedUnmappedNotes: importPreview.unmapped,
      intakeStatus: IMPORTED_INTAKE_STATUS
    };
    if (importPreview.detected.intakeId && !intake.intakeId) patch.intakeId = importPreview.detected.intakeId;
    previewRows.filter(row => row.willApply).forEach(row => {
      if (row.fieldKey) patch[row.key] = { ...structuredIntakeGroupValue({ ...intake, ...patch }, row.key), [row.fieldKey]: row.value };
      else patch[row.key] = row.value;
    });
    updateIntake(patch);
  };
  const loadTxtFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.txt') && file.type && file.type !== 'text/plain') return;
    setImportText(await file.text());
    setImportPreview(null);
  };
  return <main className="intakePage">
    <div className="pmrHeader"><div><p className="eyebrow">Homeowner Quick Intake → THA Field Prep → HTC Follow-Up → PMR</p><h1>Intake — Homeowner Context & Field Prep</h1><p>Intake captures homeowner-reported context before the walkthrough. HTC verifies conditions in the field. PMR findings are only created after review.</p></div><div className="compass">◈</div></div>
    <section className="intakeStatusSummary" aria-label="Intake status summary">
      <div><span>Homeowner Quick Intake fields completed</span><strong>{homeownerCompleted}/{HOMEOWNER_QUICK_INTAKE_FIELDS.length}</strong></div>
      <div><span>THA Field Prep fields completed</span><strong>{fieldPrepCompleted}/{THA_FIELD_PREP_FIELDS.length}</strong></div>
      <div><span>Generated HTC Follow-Up count</span><strong>{intakeFollowUpCount}</strong></div>
      <div><span>Intake Status</span><strong>{intake.intakeStatus || 'Not imported'}</strong></div>
      <div className={readyForHTC ? 'ready' : 'notReady'}><span>Ready for HTC</span><strong>{readyForHTC ? 'Yes' : 'Add context'}</strong></div>
      <button type="button" className="copyIntakeEmailButton" onClick={onCopyPreWalkthroughEmail}><ClipboardCheck size={16}/> Copy Pre-Walkthrough Intake Email</button>
      {copyFeedback && <span className="copyFeedback" role="status">{copyFeedback}</span>}
      {intakeFollowUpCount > 0 && <button type="button" className="reviewFollowUpButton" onClick={onReviewIntakeFollowUp}>Review Intake Follow-Up in HTC</button>}
    </section>
    <details className="pmrBlock intakeLane homeownerLane" open>
      <summary><span><Home size={20}/> Homeowner Quick Intake</span><small>Light, friendly pre-walkthrough context. All answers are homeowner-reported until HTC verifies them.</small></summary>
      <p className="lede">Capture only what the homeowner wants to share. Empty fields are okay; this is context for THA, not a required checklist.</p>
      <div className="quickIntakeGrid">
        <label className="notes intakeQuestion"><span>1. What are your top goals or concerns for this walkthrough?</span><textarea value={intake.notes || ''} onChange={e=>updateIntake({notes:e.target.value})} /></label>
        <label className="notes intakeQuestion"><span>2. Are there specific rooms, areas, or exterior spaces you want us to prioritize?</span><textarea value={intake.priorityAreas || ''} onChange={e=>updateIntake({priorityAreas:e.target.value})} /></label>
        {STRUCTURED_HOMEOWNER_QUICK_INTAKE_GROUPS.map(group => <StructuredIntakeQuestion key={group.key} group={group} intake={intake} updateIntake={updateIntake} />)}
        <label className="notes intakeQuestion"><span>7. Is there anything you specifically do not want overlooked?</span><textarea value={intake.doNotOverlook || ''} onChange={e=>updateIntake({doNotOverlook:e.target.value})} /></label>
      </div>
    </details>
    <section className="pmrBlock intakeImportPanel">
      <div className="intakeImportHeader"><div><h2>Import Intake Response</h2><p className="lede">Paste the homeowner reply, preview mapped answers, then apply them to blank Homeowner Quick Intake fields. THA Internal Intake / Field Prep fields are preserved.</p></div><label className="uploadInline txtUpload"><Upload size={16}/> Upload .txt<input type="file" accept=".txt,text/plain" onChange={e=>{loadTxtFile(e.target.files?.[0]); e.target.value='';}}/></label></div>
      <label className="notes intakeQuestion"><span>Paste homeowner response</span><textarea value={importText} onChange={e=>{setImportText(e.target.value); setImportPreview(null);}} placeholder="Paste the homeowner's completed structured intake reply here." /></label>
      <div className="importActions"><button type="button" onClick={previewImport} disabled={!importText.trim()}>Preview Intake Import</button><button type="button" onClick={applyImport} disabled={!importPreview || !previewRows.some(row=>row.willApply)}>Apply to Current Walkthrough</button>{conflictingRows.length > 0 && <label className="overwriteToggle"><input type="checkbox" checked={confirmOverwrite} onChange={e=>setConfirmOverwrite(e.target.checked)}/><span>Confirm overwrite of {conflictingRows.length} existing populated field{conflictingRows.length === 1 ? '' : 's'}</span></label>}</div>
      {importPreview && <div className="importPreview">
        <h3>Import Preview</h3>
        {(intakeIdMismatch || addressMismatch) && <div className="driveErrorBox" role="alert"><AlertTriangle size={16}/><span>{intakeIdMismatch ? 'Imported Intake ID does not match this walkthrough. ' : ''}{addressMismatch ? 'Imported Project Address does not appear to match this walkthrough.' : ''}</span></div>}
        <div className="previewMetaGrid">
          <div><span>Detected Intake ID</span><strong>{importPreview.detected.intakeId || 'Not detected'}</strong></div>
          <div><span>Detected Client Name</span><strong>{importPreview.detected.clientName || 'Not detected'}</strong></div>
          <div><span>Detected Project Address</span><strong>{importPreview.detected.projectAddress || 'Not detected'}</strong></div>
          <div><span>Detected Walkthrough Date</span><strong>{importPreview.detected.walkthroughDate || 'Not detected'}</strong></div>
        </div>
        <h4>Mapped Answers</h4>
        {previewRows.length ? <div className="mappedAnswerList">{previewRows.map(row => <div key={`${row.key}-${row.fieldKey || 'value'}`} className={row.hasExisting ? 'mappedAnswer conflict' : 'mappedAnswer'}><span>{row.label}</span><strong>{row.value}</strong>{row.hasExisting && <small>Existing value kept unless overwrite is confirmed: {row.currentValue}</small>}<em>{row.willApply ? 'Will apply' : 'Will skip'}</em></div>)}</div> : <p className="notRecordedText">No mapped non-blank answers found.</p>}
        <h4>Unmapped Notes / Raw Homeowner Context</h4>
        <pre className="rawImportPreview">{importPreview.unmapped || 'No extra unmapped notes detected.'}</pre>
      </div>}
      {intake.importedRawResponse && <details className="rawImportedResponse"><summary>Imported Notes / Raw Homeowner Response</summary><pre>{intake.importedRawResponse}</pre></details>}
    </section>
    <details className="pmrBlock intakeLane" open>
      <summary><span>THA Internal Intake / Field Prep</span><small>Detailed system context to guide HTC. Homeowner-reported answers become follow-up prompts only after field verification.</small></summary>
      <p className="lede">Use these fields to prepare the walkthrough without turning intake notes into findings. Verify during HTC before PMR inclusion.</p>
      <section className="intakeSubsection"><h3>Electrical</h3><div className="intakeGrid">
        <CategoryLabel category="Electrical">Electrical panel location<input value={intake.electricalPanel || ''} onChange={e=>updateIntake({electricalPanel:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Electrical">Known electrical issues or updates<input value={intake.electricalUpdates || ''} onChange={e=>updateIntake({electricalUpdates:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Electrical">Solar panel status, if present<input value={intake.solar || ''} onChange={e=>updateIntake({solar:e.target.value})}/></CategoryLabel>
      </div></section>
      <section className="intakeSubsection"><h3>Plumbing / Water</h3><div className="intakeGrid">
        <CategoryLabel category="Plumbing">Main water shut-off location<input value={intake.waterShutoff || ''} onChange={e=>updateIntake({waterShutoff:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Plumbing">Known leaks, slow drains, or past plumbing issues<input value={intake.plumbingHistory || ''} onChange={e=>updateIntake({plumbingHistory:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Plumbing">Water heater flush / age<input value={intake.waterHeater || ''} onChange={e=>updateIntake({waterHeater:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Drainage">Sewer / irrigation history<input value={intake.sewerIrrigation || ''} onChange={e=>updateIntake({sewerIrrigation:e.target.value})}/></CategoryLabel>
      </div></section>
      <section className="intakeSubsection"><h3>HVAC / Comfort</h3><div className="intakeGrid">
        <CategoryLabel category="HVAC">Furnace filter replacement<input value={intake.hvacFilter || ''} onChange={e=>updateIntake({hvacFilter:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="HVAC">Furnace service history / age<input value={intake.hvacService || ''} onChange={e=>updateIntake({hvacService:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="HVAC">A/C service history / age<input value={intake.hvacAcService || ''} onChange={e=>updateIntake({hvacAcService:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="HVAC">Comfort issues<input value={intake.comfort || ''} onChange={e=>updateIntake({comfort:e.target.value})}/></CategoryLabel>
      </div></section>
      <section className="intakeSubsection"><h3>Roof / Exterior / Drainage</h3><div className="intakeGrid">
        <CategoryLabel category="Roofing">Roof age / last replacement<input value={intake.roofAge || ''} onChange={e=>updateIntake({roofAge:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Roofing">Known roof leaks / repairs<input value={intake.roofHistory || ''} onChange={e=>updateIntake({roofHistory:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Drainage">Water pooling areas<input value={intake.drainagePooling || ''} onChange={e=>updateIntake({drainagePooling:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Drainage">Drainage / water intrusion history<input value={intake.drainageHistory || ''} onChange={e=>updateIntake({drainageHistory:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Drainage">Gutter / downspout concerns<input value={intake.gutters || ''} onChange={e=>updateIntake({gutters:e.target.value})}/></CategoryLabel>
      </div></section>
      <section className="intakeSubsection"><h3>Windows / Doors / Paint</h3><div className="intakeGrid">
        <CategoryLabel category="Openings">Drafty or hard-to-operate windows / doors<input value={intake.windowsDoors || ''} onChange={e=>updateIntake({windowsDoors:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Openings">Fogging / failed seals<input value={intake.fogging || ''} onChange={e=>updateIntake({fogging:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Painting / Staining / Protective Coatings">Last exterior paint / stain<input value={intake.paintStain || ''} onChange={e=>updateIntake({paintStain:e.target.value})}/></CategoryLabel>
      </div></section>
      <section className="intakeSubsection"><h3>Safety / Pests / Fireplaces</h3><div className="intakeGrid">
        <CategoryLabel category="Pest">Pest activity or history<input value={intake.pests || ''} onChange={e=>updateIntake({pests:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Safety">Fire extinguishers: quantity, age, location<input value={intake.fireExtinguishers || ''} onChange={e=>updateIntake({fireExtinguishers:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Safety">Smoke / CO detector age or replacement<input value={intake.smokeCO || ''} onChange={e=>updateIntake({smokeCO:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Roofing">Chimney inspection / cleaning<input value={intake.chimney || ''} onChange={e=>updateIntake({chimney:e.target.value})}/></CategoryLabel>
      </div></section>
      <section className="intakeSubsection"><h3>Product info / documents / unknowns</h3><div className="intakeGrid">
        <CategoryLabel category="Painting / Staining / Protective Coatings">Product / color labels to consolidate<input value={intake.productsColors || ''} onChange={e=>updateIntake({productsColors:e.target.value})}/></CategoryLabel>
      </div></section>
      <section className="intakeSubsection"><h3>Additional THA notes</h3><label className="notes">Other known concerns / items to pay attention to<textarea value={intake.additionalConcerns || ''} onChange={e=>updateIntake({additionalConcerns:e.target.value})}/></label></section>
    </details>
  </main>
}


function CollapsibleBlock({ title, icon = null, summary = '', defaultOpen = false, className = '', children }) {
  const [open, setOpen] = useState(defaultOpen);
  return <section className={`pmrBlock collapsibleBlock ${open ? 'isOpen' : 'isCollapsed'} ${className}`}>
    <div className="collapsibleHeader">
      <div><h2>{icon}{title}</h2>{summary && <p className="collapsibleSummary">{summary}</p>}</div>
      <button type="button" className="collapseToggle noPrint" onClick={() => setOpen(value => !value)} aria-expanded={open}>{open ? 'Close' : 'Open'}</button>
    </div>
    <div className="collapsibleContent">{children}</div>
  </section>;
}

function StatusKey({ mode = 'condition', title = '' }) {
  const isCondition = mode === 'condition';
  const entries = isCondition
    ? CONDITION_STATUS_ORDER.map(status => {
        const meta = conditionStatusMeta(status);
        return { key: status, visual: meta.visual, label: meta.label };
      })
    : [
        { key: 'orange', visual: 'orange', label: 'Needs input / review' },
        { key: 'violet', visual: 'violet', label: 'Planned / scheduled / deferred' },
        { key: 'green', visual: 'green', label: 'Verified / complete' },
        { key: 'blue', visual: 'blue', label: 'Not applicable' },
        { key: 'gray', visual: 'gray', label: 'Reference / inactive' }
      ];

  const heading = title || (isCondition ? 'Condition status' : 'Workflow status');
  const description = isCondition
    ? 'What we found during the walkthrough.'
    : 'What needs to happen next in the care plan.';

  return <section className={`statusKey statusKey-${mode}`}>
    <div className="statusKeyIntro">
      <div>
        <p className="statusKeyEyebrow">{heading}</p>
        <p className="statusKeyDescription">{description}</p>
      </div>
    </div>
    <div className="statusKeyItems">
      {entries.map(entry => <div className={`statusKeyItem ${entry.visual}`} key={entry.key}>
        <span className="statusKeyDot" aria-hidden="true"></span>
        <span>{entry.label}</span>
      </div>)}
    </div>
  </section>;
}

function PMR({client, intake, rows = [], pmr, counts, quickHits, passCareCandidates = [], passReview = {}, passCareOutlook = [], unreviewedIntakeRows = [], reviewedIntakeNotes = [], roomCapture = {}, sections = []}) {
  const summary = intakeSummary(intake);
  const hasRequiredProjectSetup = !isMissingProjectIdentityValue(client?.name) && !isMissingProjectIdentityValue(client?.address) && !isMissingProjectIdentityValue(client?.date);
  const baselineModel = buildBaselineCareModel({ intake, rows, passCareCandidates, passCareOutlook });
  const baselineByGroup = groupPassCalendar(baselineModel.baselineItems, item => item.group || 'General');
  const visiblePassIds = new Set(passCareOutlook.map(item => item.id));
  const tradeItems = pmr.filter(r => !['Handyman','Safety'].includes(r.answer.trade));
  const immediateItems = pmr.filter(r => r.answer.status === 'Immediate Concern');
  const handyItems = pmr.filter(r => r.answer.trade === 'Handyman');
  const actionItems = rows.filter(r => r.answer.thaActionItem);
  const roomActionItems = sections
    .filter(section => Boolean(roomCapture?.[section.key]?.thaActionItem))
    .map(section => ({
      id: `room-action-${section.key}`,
      roomName: section.label || section.roomName || section.key,
      item: 'Room overview follow-up',
      trade: 'Handyman',
      actionType: THA_ACTION_TYPES.includes(roomCapture?.[section.key]?.thaActionType) ? roomCapture[section.key].thaActionType : 'Research',
      note: roomCapture?.[section.key]?.note || ''
    }));
  const roomIssueCounts = Object.entries(pmr.reduce((acc, r) => {
    const room = r.roomName || r.room || 'General';
    acc[room] = (acc[room] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const maxRoomIssueCount = Math.max(1, ...roomIssueCounts.map(([, count]) => count));
  const overallSummary = pmr.length
    ? `We found ${pmr.length} PMR item${pmr.length === 1 ? '' : 's'} to consider. ${immediateItems.length ? `${immediateItems.length} item${immediateItems.length === 1 ? '' : 's'} should be handled first because they are higher concern. ` : 'No immediate higher-concern PMR items were marked. '}Handy Services items may be good candidates to group into one visit, while trade items are separated for specialist review. PASS continued-care items are listed separately as routine care and are not counted as PMR defects.`
    : 'No immediate PMR findings were identified during this walkthrough. The home appears to be in good working order based on the reviewed areas. This report still includes a proactive PASS Maintenance Calendar to help plan routine upkeep and continued home care.';
  const compactNextStep = (row) => actionCertaintyCopy(row).next;
  const roomGroups = groupByRoom(pmr);
  const tradeGroups = groupByTrade(pmr);
  const passByGroup = groupPassCalendar(passCareOutlook, passCareGroup);
  const passByResource = groupPassCalendar(passCareOutlook, item => item.resource || 'Other');
  const passByWindow = groupPassCalendar(passCareOutlook, passUpcomingBucket);
  const CalendarRow = ({ item }) => {
    const state = passCalendarState(item);
    return <article className={`passCalendarRow ${state}`}>
      <div><strong>{item.careItem}</strong><small>{item.reason}</small></div>
      <span>{item.cadence || 'As Needed'}</span>
      <span>{item.lastCompletedDisplay || 'Unknown — Verify / Establish Baseline'}</span>
      <span className="nextWindow"><CalendarDays size={15}/>{item.nextSuggestedWindow || passSuggestedWindowText(item.targetWindow || item.suggestedWindow) || 'Establish baseline at next seasonal visit'}</span>
      <span>{item.resource || 'Other'}</span>
      <span><em className={`passStatusChip ${state}`}>{passPlanningStatusText(item.followUpStatus)}</em></span>
    </article>;
  };
  const VisualActionRow = ({ row, context }) => {
    const certainty = actionCertaintyCopy(row);
    const level = priority(row.answer.status) || 'PMR';
    return <article className={`packetActionRow trade-${tradeSlug(row.answer.trade)}`}>
      <span className="lineStripe" aria-hidden="true"></span>
      <div className="packetActionMain"><h4><span className={`statusDot ${statusVisualClass(row.answer.status)}`}></span>{row.item}</h4><p>{context || row.roomName || row.room} · {displayTradeLabel(row.answer.trade)}</p></div>
      <div className="packetActionChips"><span className="chip roomChip">{row.roomName || row.room}</span><span className={`chip ${statusVisualClass(row.answer.status)}`}>{level}</span><span className="chip timeChip">{row.answer.effort}</span><span className={`chip certaintyChip ${actionCertaintyClass(certainty.label)}`}>{certainty.label}</span></div>
      <p className="packetActionNext">{compactNextStep(row)}</p>
    </article>;
  };
  return <main className="pmr">
    <div className="pmrHeader"><div><THALogo variant="full"/><p className="eyebrow">PMR — Findings & Next Steps</p><h1>{hasRequiredProjectSetup ? client.address : 'Draft PMR Preview'}</h1><p>{hasRequiredProjectSetup ? `${client.name} · ${client.date} · Intake → HTC → PMR → PASS` : 'Complete client name, property address, and walkthrough date to finalize this report.'}</p></div><div className="compassCard"><Mountain size={48}/><span>You Navigate, We Drive</span></div></div>
    <StatusKey mode="condition" title="Condition status" />
    {!hasRequiredProjectSetup && <section className="pmrBlock frontSummary"><h2>Draft PMR Preview</h2><p className="lede">Complete client name, property address, and walkthrough date to finalize this report. Print, download, and Drive package actions stay disabled until setup is complete.</p></section>}
    {unreviewedIntakeRows.length > 0 && <div className="pmrWarning"><AlertTriangle size={18}/><span>Review needed: {unreviewedIntakeRows.length} Intake Follow-Up row{unreviewedIntakeRows.length === 1 ? '' : 's'} remain Not Reviewed. Print is available after every follow-up is reviewed.</span></div>}
    <section className="snapshot homeHealthSnapshot"><h2><Home size={20}/> Home Health Snapshot</h2><div className="stat high"><strong>{counts.high}</strong><span><HealthDot level="high"/> Immediate</span></div><div className="stat med"><strong>{counts.med}</strong><span><HealthDot level="medium"/> Near‑Term</span></div><div className="stat low"><strong>{counts.low}</strong><span><HealthDot level="low"/> Monitor</span></div></section>
    <section className="pmrBlock frontSummary"><h2><ClipboardList size={20}/> Plain-English Summary</h2><p className="overallSummary">{overallSummary}</p><div className="summaryTypeGrid"><div><strong>{immediateItems.length}</strong><span>Immediate / higher concern</span></div><div><strong>{handyItems.length}</strong><span>Handy Services items</span></div><div><strong>{tradeItems.length}</strong><span>Trade items</span></div><div><strong>{passCareOutlook.length}</strong><span>PASS continued care / routine care</span></div></div></section>
    <section className="pmrBlock baselineCare"><h2>Baseline Home Care / Upkeep To-Dos</h2><p className="lede">No repair concern is implied by this section. These are baseline reminders and practical upkeep opportunities. The list becomes more tailored as Intake, HTC, PMCP Builder, and THA Action-Items are completed.</p>{Object.entries(baselineByGroup).length ? Object.entries(baselineByGroup).map(([groupName, items]) => <section className="passCalendarCareGroup" key={`baseline-${groupName}`}><h3>{groupName}</h3><div className="passCalendarTable">{items.map(item => <article className="passCalendarRow baseline" key={item.id}><div><strong>{item.title}</strong><small>{item.guidance}</small>{item.evidence.length > 0 && <small>Evidence: {item.evidence.join(' · ')}</small>}</div><span>Routine</span><span>Baseline</span><span className="nextWindow">{item.group}</span><span>{item.evidence.length ? 'Supported by intake/HTC context' : 'General homeowner care baseline'}</span><span><em className="passStatusChip baseline">Not a repair finding</em></span></article>)}</div></section>) : <p className="lede">No baseline topics generated.</p>}</section>
    <section className="pmrBlock passOutlook"><h2><ClipboardList size={20}/> Home-Specific Care Supported by Intake and/or HTC</h2><p className="lede">These care topics are supported by intake and/or walkthrough evidence and remain separate from repair findings and PMR priority counts.</p>{baselineModel.homeSpecificCare.length ? <div className="passOutlookGrid">{baselineModel.homeSpecificCare.map(item => <article className="passOutlookCard" key={`supported-care-${item.id}`}><div className="findTop"><TradeIcon trade="Handyman"/><div><h3>{item.careItem}</h3><p>{item.sourceLabel} · Intake/HTC supported care</p></div></div><div className="findGrid"><p><strong>Homeowner-facing reason:</strong><br/>{item.reason || 'Supported by intake and/or HTC context.'}</p><p><strong>Category:</strong><br/>Home-specific care supported by Intake and/or HTC</p></div></article>)}</div> : <p className="lede">No additional intake/HTC-supported care topics are pending outside PMCP selected items.</p>}</section>
    {(actionItems.length > 0 || roomActionItems.length > 0) && <section className="pmrBlock workOrderSummary"><h2><ClipboardList size={20}/> THA Action-Items / Near-Term Follow-Up</h2><p className="lede">These THA action-items stay separate from ordinary repair findings. Purple supersedes green in rails while PMCP selections remain active underneath.</p><div className="findingTypeList"><article><h3>Detailed HTC line items</h3>{actionItems.length ? actionItems.map(r => <p key={`workorder-${r.id}`}>{r.roomName || r.room} — {r.item} · {displayTradeLabel(r.answer.trade)} · {r.answer.thaActionType || 'Research'}{includePMRRow(r) ? ` · ${pmrReportLabel(r.answer)}` : ''}</p>) : <p>No detailed line-item action-items recorded.</p>}</article><article><h3>Room overview action-items</h3>{roomActionItems.length ? roomActionItems.map(item => <p key={item.id}>{item.roomName} — {item.item} · {item.actionType}{item.note ? ` · ${item.note}` : ''}</p>) : <p>No room-overview action-items recorded.</p>}</article></div></section>}
    <PassPlanSummary passCareOutlook={passCareOutlook} passReview={passReview} />
    <section className="pmrBlock roomIssueSummary"><h2><Home size={20}/> Room-by-Room Issue Count</h2><p className="lede">PMR counts only. PASS continued care stays separate and is not included in this chart.</p>{roomIssueCounts.length ? <div className="roomIssueChart">{roomIssueCounts.map(([room, count]) => <div className="roomIssueRow" key={room}><span>{room}</span><div className="roomIssueBar"><i style={{width: `${Math.max(8, (count / maxRoomIssueCount) * 100)}%`}}></i></div><strong>{count}</strong></div>)}</div> : <p className="lede">No repair issues recorded by room.</p>}</section>
    <section className="pmrBlock findingTypeSummary"><h2><AlertTriangle size={20}/> Summary by Finding Type</h2><div className="findingTypeList"><article><h3>Immediate / higher concern items</h3>{immediateItems.length ? immediateItems.map(r => <p key={`immediate-${r.id}`}>{r.roomName || r.room} — {r.item}</p>) : <p>No immediate higher-concern items recorded.</p>}</article><article><h3>Handy Services items</h3>{handyItems.length ? handyItems.map(r => <p key={`handy-${r.id}`}>{r.roomName || r.room} — {r.item}</p>) : <p>No Handy Services PMR items recorded.</p>}</article><article><h3>Trade items</h3>{tradeItems.length ? tradeItems.map(r => <p key={`trade-summary-${r.id}`}>{displayTradeLabel(r.answer.trade)}: {r.roomName || r.room} — {r.item}</p>) : <p>No trade PMR items recorded.</p>}</article><article><h3>PASS continued care / routine care</h3>{passCareOutlook.length ? passCareOutlook.map(item => <p key={`pass-summary-${item.id}`}>{item.careItem} · {item.resource}</p>) : <p>No homeowner-facing PASS continued-care items included.</p>}</article></div></section>
    <section className="pmrBlock compactFindings"><h2><AlertTriangle/> Room-by-Room Action List</h2><p className="lede">Same PMR findings grouped by room for homeowner review. Longer observations, rationale, photos, and notes are in the Detail Appendix below.</p>{pmr.length ? <div className="packetActionGroups">{Object.entries(roomGroups).map(([room, items]) => <section className="packetActionGroup" key={`room-${room}`}><h3>{room} <span>{items.length} PMR item{items.length === 1 ? '' : 's'}</span></h3>{items.map(row => <VisualActionRow key={`room-row-${row.id}`} row={row} context={room}/>)}</section>)}</div> : <p className="lede">No repair findings recorded.</p>}</section>
    <section className="pmrBlock compactFindings"><h2><Wrench/> Trade-by-Trade Action List</h2><p className="lede">Same PMR findings grouped by likely resource so a homeowner can hand a focused list to a plumber, electrician, handyman, or specialist. PASS continued-care items are not included in these PMR counts.</p>{pmr.length ? <div className="packetActionGroups">{Object.entries(tradeGroups).map(([trade, items]) => <section className="packetActionGroup" key={`trade-${trade}`}><h3>{trade} <span>{items.length} item{items.length === 1 ? '' : 's'}</span></h3>{items.map(row => <VisualActionRow key={`trade-row-${row.id}`} row={row} context={trade}/>)}</section>)}</div> : <p className="lede">No repair findings recorded by trade.</p>}</section>
    {reviewedIntakeNotes.length > 0 && <CollapsibleBlock title="Intake Follow-Up Notes" summary={`${reviewedIntakeNotes.length} reviewed intake note${reviewedIntakeNotes.length === 1 ? '' : 's'} · context only, not PMR findings`} defaultOpen={false} className="intakeFollowUpBlock"><ul className="checkList">{reviewedIntakeNotes.map(r=><li key={`note-${r.id}`}><span className="sourceBadge">Intake Follow-Up</span><span><strong>{r.roomName || r.room} — {r.item}</strong><br/><small>{r.answer.reviewStatus} · {r.intakeFieldLabel}: {r.intakeValue}</small></span></li>)}</ul></CollapsibleBlock>}
    <CollapsibleBlock title="Detail Appendix" icon={<FileText size={20}/>} summary={`${pmr.length} expanded PMR detail${pmr.length === 1 ? '' : 's'} · what we saw, why it matters, certainty, timing, and photos`} defaultOpen={false} className="detailAppendix">{pmr.map(r => {
      const certainty = actionCertaintyCopy(r);
      return <article className="finding appendixFinding" key={`appendix-${r.id}`}>
        <div className="findTop"><TradeIcon trade={r.answer.trade} big/><div><h3>{r.roomName || r.room} — {r.item}</h3><p>{r.zone} · {r.answer.status} · {displayTradeLabel(r.answer.trade)} · {certainty.label}</p></div><span className="certaintyLabel"><CertaintyDot label={certainty.label}/>{certainty.label}</span><span className={`pill ${priority(r.answer.status).toLowerCase()}`}>{priority(r.answer.status)}</span></div>
        <div className="findGrid"><p><strong>What we saw:</strong><br/>{r.answer.notes || 'No additional notes recorded yet.'}</p><p><strong>Why it matters:</strong><br/>{r.why}</p><p><strong>Action certainty:</strong><br/>{certainty.title}: {certainty.body}</p><p><strong>Timing:</strong><br/>{timingFor(r, r.answer.status)} · Homeowner pace: {r.answer.pref}</p><p><strong>Photos:</strong><br/>{photoSummary(r.answer.photos)}</p><p><strong>Notes:</strong><br/>Approx. time: {r.answer.effort} · Intake context: {intakeInfluence(r, intake)}</p></div>
      </article>
    })}</CollapsibleBlock>
    <CollapsibleBlock title="Homeowner Goals & Intake Context" icon={<Home size={20}/>} summary="Homeowner-provided context only; internal THA field-prep notes are excluded" defaultOpen={false} className="intakeSummary"><div className="findGrid"><p><strong>Primary priorities:</strong><br/>{summary.priorities}</p><p><strong>Preferred pace:</strong><br/>{summary.pace}</p><p><strong>Budget mindset:</strong><br/>{summary.budget}</p><p><strong>Decision style:</strong><br/>{summary.decision}</p><p><strong>Homeowner notes:</strong><br/>{summary.notes}</p><p><strong>Priority areas:</strong><br/>{reportValue(intake.priorityAreas, 'No priority areas recorded.')}</p><p><strong>Known issues / recurring symptoms:</strong><br/>{reportValue(structuredIntakeAnswerValue(intake, 'knownIssues', 'symptoms'), 'No homeowner-provided recurring symptoms recorded.')}</p><p><strong>Recent repairs / records:</strong><br/>{reportValue(structuredIntakeAnswerValue(intake, 'recentRepairs', 'completed') || intake.helpfulRecords, 'No homeowner-provided repair or records context recorded.')}</p><p><strong>Access notes:</strong><br/>{reportValue(structuredIntakeAnswerValue(intake, 'accessNotes', 'access'), 'No homeowner-provided access notes recorded.')}</p><p><strong>Do-not-overlook items:</strong><br/>{reportValue(intake.doNotOverlook, 'No do-not-overlook items recorded.')}</p><p><strong>Workflow:</strong><br/>Intake captures context. HTC verifies and triages. PMR documents findings and next steps. PASS tracks routine continued care and stays separate from PMR counts.</p></div></CollapsibleBlock>
    <CollapsibleBlock title="Planning Guides" icon={<ClipboardList size={20}/>} summary="Action certainty and time/investment reference" defaultOpen={false} className="guideSupportBlock"><section className="guideGrid"><div className="guideCard actionCertaintyGuide"><h2><ClipboardList size={20}/> Action Certainty Guide</h2>{ACTION_CERTAINTY_GUIDE.map(item => <p key={item.label} className={`actionGuideItem ${actionCertaintyClass(item.label)}`}><CertaintyDot label={item.label}/> <strong>{item.label}</strong><br/><span>{item.body}</span></p>)}</div><div className="guideCard timeGuideCard"><h2><Clock3 size={20}/> Time / Investment Guide</h2>{PMR_TIME_INVESTMENT_GUIDE.map(item => <p key={item.key} className={`timeGuideItem ${item.key}`}><span className="timeGuideIcon" aria-hidden="true">{item.icon}</span><strong>{item.label}</strong><span>{item.display.replace(item.label, '')}</span></p>)}</div></section></CollapsibleBlock>
    <CollapsibleBlock title="PASS Maintenance Calendar" icon={<CalendarDays/>} summary={`${passCareOutlook.length} recurring care item${passCareOutlook.length === 1 ? '' : 's'} · required even with zero PMR findings`} defaultOpen={true} className="passCalendar">
      <p className="lede passCalendarIntro">{passCalendarIntroCopy(pmr.length)}</p>
      <div className="passCalendarLegend"><span><CalendarDays size={14}/> Suggested upkeep window</span><span>Neutral = Verify / Establish Baseline</span><span>Ready = known date + next window</span><span>PMR count impact: 0</span></div>
      {Object.entries(passByGroup).map(([groupName, items]) => <section className="passCalendarCareGroup" key={`pass-group-${groupName}`}><h3>{groupName} <span>{items.length} item{items.length === 1 ? '' : 's'}</span></h3><div className="passCalendarTable"><div className="passCalendarHeader"><span>Care item</span><span>Recommended cadence</span><span>Last completed</span><span>Next suggested date/window</span><span>Resource/trade</span><span>Follow-up status</span></div>{items.map(item => <CalendarRow key={`calendar-${item.id}`} item={item}/>)}</div></section>)}
      <div className="passCalendarGroups"><section><h3>By resource / trade</h3>{Object.entries(passByResource).map(([resource, items]) => <p key={`resource-${resource}`}><strong>{resource}</strong><span>{items.map(item => item.careItem).join(' · ')}</span></p>)}</section><section><h3>By upcoming window</h3>{Object.entries(passByWindow).map(([windowName, items]) => <p key={`window-${windowName}`}><strong>{windowName}</strong><span>{items.map(item => item.careItem).join(' · ')}</span></p>)}</section></div>
    </CollapsibleBlock>
    <CollapsibleBlock title="PASS Continued Care Outlook" icon={<CalendarDays/>} summary={`${passCareOutlook.length} homeowner-facing routine care item${passCareOutlook.length === 1 ? '' : 's'} · separate from PMR defects/counts`} defaultOpen={false} className="passOutlook"><p className="lede">PASS is ongoing home-care planning, not an urgent repair list. These selected items stay separate from PMR findings, priority counts, and defects.</p><div className="passOutlookGrid">{passCareOutlook.map(item=><article className="passOutlookCard" key={item.id}><div className="findTop"><TradeIcon trade={item.rule?.trade || item.row?.answer?.trade || item.resource}/><div><h3>{item.careItem}</h3><p>{item.resource} · Care planning · {passPlanningStatusText(item.followUpStatus)}</p></div></div><div className="findGrid"><p><strong>Homeowner-facing reason:</strong><br/>{item.reason}</p><p><strong>Follow-up planning:</strong><br/>{passHomeownerFollowUpLanguage(item)}</p><p><strong>Target season / window:</strong><br/>{passSuggestedWindowText(item.targetWindow || item.suggestedWindow)}</p><p><strong>Suggested cadence:</strong><br/>{item.cadence || 'As Needed'}</p><p><strong>Responsible resource / trade:</strong><br/>{item.resource}</p></div></article>)}</div>{passCareOutlook.length === 0 && <p className="lede">No PASS continued-care items are selected for this PMR output.</p>}</CollapsibleBlock>
    <footer className="promise"><ShieldCheck/> You don’t hire trades — you hire The Homeowner Advocate. One point of contact. Every step. Every task.</footer>
  </main>
}

function passCandidateCategory(item = {}) {
  const row = item.row || {};
  const rule = item.rule || {};

  return categoryForChecklistItem({
    ...row,
    category: row.category || rule.category || item.category || '',
    trade: row.answer?.trade || row.trade || rule.trade || item.trade || item.resource || '',
    item: row.item || rule.careItem || item.careItem || '',
    prompt: row.prompt || rule.reason || item.reason || '',
    answer: row.answer || item.answer || {}
  });
}

function passReviewState(item = {}, passReview = {}) {
  const review = passReview[item.id] || {};
  const pmcpDecision = pmcpDecisionForReview(review);
  const followUpStatus = passPlanningStatusText(
    review.followUpStatus ?? item.followUpStatus ?? 'Verify / Establish Baseline'
  );
  const workflow = pmcpDecision === 'pending'
    ? { visual: 'orange', label: 'Pending PMCP decision', rank: 1 }
    : { visual: 'blue', label: pmcpDecision === 'selected' ? 'Selected for PMCP' : 'Care possibility noted', rank: pmcpDecision === 'selected' ? 2 : 3 };

  return { review, pmcpDecision, selected: pmcpDecision === 'selected', followUpStatus, workflow };
}

function PassSourceEvidence({ item }) {
  const evidence = item.sourceEvidence || {};
  const htcRows = evidence.htcRows || (item.row ? [item.row] : []);
  return <div className="passSourceEvidence">
    <p><strong>Source evidence:</strong> {evidence.label || passSourceLabel({ source: item.source, intakeEvidence: evidence.intakeEvidence, htcRows })}</p>
    {evidence.intakeEvidence && <p><strong>Intake:</strong> {evidence.intakeEvidence.label} — {evidence.intakeEvidence.value}</p>}
    {htcRows.map(row => <p key={`evidence-${item.id}-${row.id}`}><strong>HTC:</strong> {row.roomName || row.room || 'HTC'} / {row.zone || row.section || 'Checklist'} / {row.item}</p>)}
  </div>;
}

function PassReviewCard({ item, category, passReview, onPassReviewChange }) {
  const { review, pmcpDecision, selected, workflow } = passReviewState(item, passReview);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const targetWindow = review.targetWindow ?? item.targetWindow ?? passSuggestedWindowText(item.suggestedWindow);
  const cadence = review.cadence ?? item.cadence ?? 'As Needed';
  const resource = review.resource ?? item.resource;
  const lastCompletedDate = review.lastCompletedDate ?? item.lastCompletedDate ?? '';
  const dateSource = passDateSourceText(review.dateSource ?? item.dateSource);
  const nextSuggestedWindow = review.nextSuggestedWindow ?? item.nextSuggestedWindow ?? '';
  const reason = review.reason ?? item.reason ?? '';
  const internalNote = review.internalNote ?? item.internalNote ?? '';

  return <article className={`passReviewCard pmcp-${pmcpDecision} workflow-${workflow.visual} ${selected ? 'pmcp-selected' : ''}`}>
    <div className="passReviewCardHeader">
      <div className="passReviewTitle">
        <div className="passReviewBadgeRow">
          <CategoryBadge category={category}/>
          <span className={`passWorkflowBadge ${workflow.visual}`}><span className="passWorkflowDot" aria-hidden="true"></span>{workflow.label}</span>
          <span className="sourceBadge">{item.sourceEvidence?.label || (item.source === 'manual' ? 'HTC' : 'Supported')}</span>
        </div>
        <h4>{item.careItem}</h4>
        <p className="passReviewSubline">{cadence} · {resource || 'Other'}</p>
      </div>
      <button type="button" className="passReviewCardToggle" onClick={() => setOpen(value => !value)}>{open ? 'Close' : 'Open'}</button>
    </div>
    {open && <>
      <div className="passReviewTop">
        <div className="wide"><PassSourceEvidence item={item}/></div>
      </div>
      <div className="passReviewSummary">
        <div className="passReviewSummaryItem"><strong>Recommended rhythm</strong><p>{cadence}</p></div>
        <div className="passReviewSummaryItem"><strong>Suggested timing</strong><p>{passSuggestedWindowText(targetWindow)}</p></div>
      </div>
      <div className="passReviewTop">
        <label className="includeToggle">
          <input type="checkbox" checked={selected} onChange={e => onPassReviewChange(item.id, { pmcpDecision: e.target.checked ? 'selected' : 'pending' })}/>
          <span><strong>Add to this homeowner’s Preventative Maintenance Care Plan</strong><small>Selected items appear in formal PMR and Drive/export PMCP output.</small></span>
        </label>
        <button type="button" className="secondaryBtn" onClick={() => onPassReviewChange(item.id, { pmcpDecision: 'declined' })}>Not this year</button>
      </div>
      <div className="passReviewDetailsToggle">
        <button type="button" className="secondaryBtn" onClick={() => setDetailsOpen(value => !value)}>{detailsOpen ? 'Close planning details' : 'Open planning details'}</button>
      </div>
      {detailsOpen && <div className="passReviewFields">
        <div className="wide"><PassSourceEvidence item={item}/></div>
        <label className="wide">Reason<textarea value={reason} onChange={e => onPassReviewChange(item.id, { reason: e.target.value })}/></label>
        <label className="wide">Target window<input value={nextSuggestedWindow || targetWindow} onChange={e => onPassReviewChange(item.id, { nextSuggestedWindow: e.target.value, targetWindow: e.target.value, suggestedWindow: `Suggested window: ${e.target.value}` })}/></label>
        <label>Cadence<select value={cadence} onChange={e => onPassReviewChange(item.id, { cadence: e.target.value })}>{PASS_CADENCE.map(option => <option key={option}>{option}</option>)}</select></label>
        <label>Resource/trade<select value={resource} onChange={e => onPassReviewChange(item.id, { resource: e.target.value })}>{PASS_RESOURCES.map(option => <option key={option}>{option}</option>)}</select></label>
        <label>Follow-up status<select value={review.followUpStatus ?? item.followUpStatus} onChange={e => onPassReviewChange(item.id, { followUpStatus: e.target.value })}>{PASS_FOLLOW_UP_STATUSES.map(option => <option key={option}>{option}</option>)}</select></label>
        <label>Last completed date, if known<input type="date" value={lastCompletedDate} onChange={e => onPassReviewChange(item.id, { lastCompletedDate: e.target.value })}/></label>
        <label>Source of date<select value={dateSource} onChange={e => onPassReviewChange(item.id, { dateSource: e.target.value })}>{PASS_DATE_SOURCES.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
        <label className="wide passInternalNote">Internal THA note<textarea value={internalNote} onChange={e => onPassReviewChange(item.id, { internalNote: e.target.value })} placeholder="Internal planning note; not shown in PMR export."/></label>
      </div>}
    </>}
  </article>;
}

function PassReviewControls({ intake = {}, rows = [], passCareOutlook = [], passReview = {}, onPassReviewChange = () => {} }) {
  const groupedCandidates = useMemo(() => {
    const catalogItems = PASS_CARE_RULES.map(rule => buildPassCatalogItem(rule, intake, rows, passReview, passCareOutlook));
    return CATEGORY_ORDER.map(category => ({
      category,
      items: catalogItems.filter(entry => entry.category === category).sort((a, b) => (passReviewState(a, passReview).workflow.rank - passReviewState(b, passReview).workflow.rank) || String(a.careItem || '').localeCompare(String(b.careItem || '')))
    })).filter(group => group.items.length);
  }, [intake, rows, passReview, passCareOutlook]);
  const allCatalogItems = groupedCandidates.flatMap(group => group.items);
  const supportedCount = allCatalogItems.filter(item => item.sourceEvidence?.label !== 'Catalog only').length;
  const selectedCount = allCatalogItems.filter(item => passReviewState(item, passReview).selected).length;
  return <CollapsibleBlock title="Preventative Maintenance Care Plan Builder" summary={`${PASS_CARE_RULES.length} catalog items · ${supportedCount} supported · ${selectedCount} selected`} defaultOpen={true} className="passReviewPanel noPrint">
    <p><strong>PASS → PMCP:</strong> PASS is The Homeowner Advocate’s framework for turning a full preventative-maintenance catalog into a homeowner’s Preventative Maintenance Care Plan (PMCP). Intake and HTC only enrich, highlight, or activate catalog items; they do not hide unrelated topics.</p>
    <div className="passCategoryGroups">{groupedCandidates.map(group => { const meta = categoryInfo(group.category); const Icon = meta.Icon; const selectedCount = group.items.filter(item => passReviewState(item, passReview).selected).length; return <section className={`passCategoryGroup ${selectedCount ? 'hasPmcpSelected' : ''}`} key={group.category}><header className="passCategoryHeader"><div className="passCategoryTitle"><span className="passCategoryIcon"><Icon size={18}/></span><h3>{group.category}</h3></div><span className="passCategoryCount">{group.items.length} possibilities · {selectedCount} selected</span></header><div className="passReviewGrid">{group.items.map(item => <PassReviewCard key={`review-${item.id}`} item={item} category={group.category} passReview={passReview} onPassReviewChange={onPassReviewChange}/>)}</div></section>; })}</div>
    {!groupedCandidates.length && <p className="lede">No PASS catalog items are available yet.</p>}
  </CollapsibleBlock>;
}

function PassPlanSummary({ passCareOutlook = [], passReview = {} }) {
  const groupedCandidates = useMemo(() => {
    const classified = passCareOutlook.map(item => ({ item, category: passCandidateCategory(item), state: passReviewState(item, passReview) }));
    return CATEGORY_ORDER.map(category => ({ category, items: classified.filter(entry => entry.category === category) })).filter(group => group.items.length);
  }, [passCareOutlook, passReview]);

  const [openCategories, setOpenCategories] = useState(() => new Set(groupedCandidates.map(group => group.category)));

  useEffect(() => {
    setOpenCategories(new Set(groupedCandidates.map(group => group.category)));
  }, [groupedCandidates]);

  const toggleCategory = category => setOpenCategories(prev => {
    const next = new Set(prev);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    return next;
  });

  return <section className="pmrBlock passOutlook passPlanSummary"><h2><ClipboardList size={20}/> Preventative Maintenance Care Plan</h2><p className="lede">This read-only plan shows the items actually placed or formalized for the homeowner. It stays separate from the full PASS builder catalog.</p>
    {groupedCandidates.length ? groupedCandidates.map(group => {
      const selectedCount = group.items.filter(({ state }) => state.selected).length;
      const isOpen = openCategories.has(group.category);
      const meta = categoryInfo(group.category);
      const Icon = meta.Icon;
      return <section className={`passPlanCategory ${selectedCount ? 'hasSelected' : ''}`} key={group.category}>
        <header className="passPlanCategoryHeader">
          <div className="passPlanCategoryTitle"><span className="passCategoryIcon"><Icon size={18}/></span><h3>{group.category}</h3></div>
          <div className="passPlanCategoryMeta"><span>{group.items.length} possibilities · {selectedCount} selected</span><button type="button" className="secondaryBtn" onClick={() => toggleCategory(group.category)}>{isOpen ? 'Close' : 'Open'}</button></div>
        </header>
        {isOpen && <div className="passPlanCategoryGrid">{group.items.map(({ item, state }) => <article className={`passPlanItem ${state.selected ? 'selected' : ''}`} key={item.id}>
            <div className="passPlanItemBody"><h4>{item.careItem}</h4><p>{item.careTopic || item.resource || 'Other'}</p><p>{passSuggestedWindowText(item.targetWindow || item.suggestedWindow)} · {item.cadence || 'As Needed'}</p></div>
            {state.selected && <div className="passPlanItemSelectedMarker" aria-label="Selected"></div>}
          </article>)}</div>}
      </section>;
    }) : <p className="lede">No PMCP items have been formalized yet.</p>}
  </section>;
}

function PASSWorkspace({ intake = {}, rows = [], passCareOutlook = [], passReview = {}, onPassReviewChange = () => {} }) {
  const catalogCount = PASS_CARE_RULES.length;
  const selectedCount = passCareOutlook.length;
  const supportedCount = PASS_CARE_RULES.filter(rule => buildPassCatalogItem(rule, intake, rows, passReview, passCareOutlook).sourceEvidence?.label !== 'Catalog only').length;
  return <PassErrorBoundary onReturnToPmr={() => window.dispatchEvent(new CustomEvent('tha:set-view', { detail: 'pmr' }))}><main className="pmr passWorkspace"><div className="pmrHeader"><div><THALogo variant="full"/><p className="eyebrow">PASS — Preventative Maintenance Care Plan</p><h1>Preventative Maintenance Care Plan Builder</h1><p>PASS → PMCP: PASS is The Homeowner Advocate’s framework for turning a full preventative-maintenance catalog into a homeowner’s Preventative Maintenance Care Plan (PMCP). Intake and HTC enrich the catalog, while selected items become formal PMCP output.</p></div><div className="compassCard"><CalendarDays size={48}/><span>PMCP builder</span></div></div><StatusKey mode="workflow" title="PASS workflow status" /><section className="pmrBlock frontSummary"><h2><CalendarDays size={20}/> In-app Preventative Maintenance Care Plan</h2><p className="lede">The full catalog stays visible here. Intake and HTC highlight entries, while only selected items are included in formal PMR and Drive/export PMCP output.</p><div className="summaryTypeGrid"><div><strong>{catalogCount}</strong><span>Catalog items</span></div><div><strong>{supportedCount}</strong><span>Supported right now</span></div><div><strong>{selectedCount}</strong><span>Selected for PMCP</span></div></div></section><PassReviewControls intake={intake} rows={rows} passCareOutlook={passCareOutlook} passReview={passReview} onPassReviewChange={onPassReviewChange}/><PassPlanSummary passCareOutlook={passCareOutlook} passReview={passReview}/></main></PassErrorBoundary>;
}

class PassErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (!this.state.hasError) return this.props.children;
    return <main className="pmr passWorkspace"><section className="pmrBlock frontSummary"><h1>PASS could not load</h1><p className="lede">The PMCP builder hit a display error. You can retry PASS or return to the PMR while your walkthrough remains saved locally.</p><div className="buttonRow"><button onClick={() => this.setState({ hasError: false })}>Try PASS Again</button><button className="secondaryBtn" onClick={this.props.onReturnToPmr}>Return to PMR</button></div></section></main>;
  }
}

function Metrics({rows, pmr, quickHits, pass}) {
  const byTrade = Object.entries(pmr.reduce((acc,r)=>{acc[r.answer.trade]=(acc[r.answer.trade]||0)+1; return acc;},{}));
  const byCertainty = Object.entries(pmr.reduce((acc,r)=>{const key=actionCertaintyFor(r.answer); acc[key]=(acc[key]||0)+1; return acc;},{}));
  return <main className="metrics"><h1>Internal Metrics / Future PMR Intelligence</h1><div className="metricGrid"><div><strong>{pmr.length}</strong><span>PMR findings</span></div><div><strong>{quickHits.length}</strong><span>Quick-hit tasks</span></div><div><strong>{pass.length}</strong><span>PMCP Builder items</span></div><div><strong>{rows.filter(r=>r.answer.effort !== 'Unknown').length}</strong><span>Items with time data</span></div></div><section className="pmrBlock"><h2>Findings by Trade / Resource</h2>{byTrade.map(([k,v])=><p key={k} className="tradeLine"><span><TradeIcon trade={k}/> {displayTradeLabel(k)}</span><strong>{v}</strong></p>)}</section><section className="pmrBlock"><h2>Action Certainty Breakdown</h2>{byCertainty.map(([k,v])=><p key={k} className="tradeLine"><span>{k}</span><strong>{v}</strong></p>)}</section><section className="pmrBlock"><h2>Time Tracking Note</h2><p>This app captures the field estimate now. Next build should add “Actual Time Spent” after work completion, so THA can compare estimated vs. actual and improve future PMRs, pricing, scheduling, and batching. Nerdy? Yes. Useful? Very.</p></section></main>
}

createRoot(document.getElementById('root')).render(<App/>);
