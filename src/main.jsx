import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ClipboardCheck, FileText, Camera, Clock3, Download, Printer, Home, AlertTriangle, CheckCircle2, Wrench, CalendarDays, FolderOpen, Search, ShieldCheck, HardHat, Plug, Droplets, Fan, Paintbrush, Hammer, TreePine, Bug, Flame, Mountain, Wind, DoorOpen, Palette, Leaf, Settings, ClipboardList, Upload, Image, X } from 'lucide-react';
import './style.css';

const ICONS = {
  Handyman: '🧰', Electrical: '🔌', Plumbing: '🚿', HVAC: '🌡️', Roof: '🏠', Drainage: '🌧️', Windows: '🪟', Paint: '🎨', Pest: '🐜', Safety: '🔥', Appliance: '⚙️', Chimney: '🧱', Exterior: '🏡'
};
const APP_RELEASE_NOTE = {
  label: 'PMR + PASS milestone',
  summary: 'Internal release: supports PMR findings, PASS Continued Care Outlook, editable/hideable PASS review, demo scenarios, and homeowner-safe export cleanup.',
  items: [
    'PMR findings',
    'PASS Continued Care Outlook',
    'Editable/hideable PASS review',
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
  const cls = level === 'high' ? 'red' : level === 'medium' ? 'yellow' : 'green';
  return <span className={`healthDot ${cls}`} aria-label={level}></span>;
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
const ACTION_CERTAINTY_GUIDE = [
  { label: 'Clear Path', body: 'scope and next step are clear' },
  { label: 'Likely Path', body: 'likely next step, minor confirmation may be needed' },
  { label: 'Needs Discovery', body: 'more information, pricing, or specialist input needed before committing' }
];
const PREFS = ['Do now','Plan soon','Budget for later','Watchlist only'];
const PASS_CADENCE = ['Monthly','Quarterly','Seasonal','Annual','As Needed'];
const PASS_FOLLOW_UP_STATUSES = ['Not Scheduled','Planned','Scheduled','Completed','Deferred'];
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


const PASS_CARE_RULES = [
  {
    id: 'furnace-filter-rhythm',
    careItem: 'Furnace service / filter rhythm',
    resource: 'HVAC',
    trade: 'HVAC',
    cadence: 'Seasonal / filter every 1–3 months',
    suggestedWindow: 'Suggested next normal window: fall, before heating season; filter check every 1–3 months during regular use',
    intakeKeys: ['furnaceService', 'hvacService', 'hvacFilter'],
    rowKeywords: ['furnace', 'filter', 'hvac service'],
    reason: 'Care planning for normal heating-system service and airflow upkeep before peak heating demand.'
  },
  {
    id: 'ac-heat-pump-service',
    careItem: 'A/C or heat pump service',
    resource: 'HVAC',
    trade: 'HVAC',
    cadence: 'Annual',
    suggestedWindow: 'Suggested next normal window: spring, before cooling season',
    intakeKeys: ['acHeatPumpService', 'hvacAcService', 'comfort'],
    rowKeywords: ['a/c', 'ac service', 'heat pump', 'cooling'],
    reason: 'Care planning for normal cooling-system service before seasonal use.'
  },
  {
    id: 'gutters-drainage-review',
    careItem: 'Gutter/downspout/drainage review',
    resource: 'Gutters/Drainage',
    trade: 'Handyman',
    cadence: 'Seasonal',
    suggestedWindow: 'Suggested next normal window: fall after leaf drop, plus spring or snowmelt check where relevant',
    intakeKeys: ['gutters', 'drainagePooling', 'drainageHistory', 'drainageGrading'],
    rowKeywords: ['gutter', 'downspout', 'drainage', 'grading', 'pooling'],
    reason: 'Care planning for routine water-management review around the home.'
  },
  {
    id: 'water-heater-service',
    careItem: 'Water heater service / flush review',
    resource: 'Plumbing',
    trade: 'Plumbing',
    cadence: 'Annual or next plumbing visit',
    suggestedWindow: 'Suggested next normal window: annual care planning or next plumbing visit',
    intakeKeys: ['waterHeaterService', 'waterHeater', 'plumbingHistory'],
    rowKeywords: ['water heater', 'tankless', 'flush'],
    reason: 'Care planning for normal water-heater maintenance history and service review.'
  },
  {
    id: 'chimney-fireplace-service',
    careItem: 'Chimney/fireplace cleaning or inspection',
    resource: 'Roofing',
    trade: 'Chimney',
    cadence: 'Annual / Fall',
    suggestedWindow: 'Suggested next normal window: fall, before heating season or fireplace use',
    intakeKeys: ['chimneyFireplaceService', 'chimney'],
    rowKeywords: ['chimney', 'fireplace', 'hearth', 'damper'],
    reason: 'Care planning for normal fireplace and chimney service timing before seasonal use.'
  },
  {
    id: 'smoke-co-extinguisher-check',
    careItem: 'Smoke/CO detector + extinguisher check',
    resource: 'Safety',
    trade: 'Safety',
    cadence: 'Annual',
    suggestedWindow: 'Suggested next normal window: annual safety review',
    intakeKeys: ['smokeCO', 'fireExtinguishers'],
    rowKeywords: ['smoke', 'co detector', 'carbon monoxide', 'extinguisher'],
    reason: 'Care planning for routine annual safety-device date, battery, gauge, and placement review.'
  },
  {
    id: 'exterior-paint-caulk-review',
    careItem: 'Exterior paint/stain/caulk review',
    resource: 'Handy Services',
    trade: 'Paint',
    cadence: 'Annual review',
    suggestedWindow: 'Suggested next normal window: dry/warm exterior season',
    intakeKeys: ['exteriorPaintStain', 'paintStain', 'productsColors'],
    rowKeywords: ['paint', 'stain', 'caulk', 'exterior finish'],
    reason: 'Care planning for normal exterior finish review during practical weather.'
  },
  {
    id: 'pest-prevention-watch',
    careItem: 'Pest prevention/watch',
    resource: 'Pest',
    trade: 'Pest',
    cadence: 'Seasonal / As Needed',
    suggestedWindow: 'Suggested next normal window: spring/fall or as needed',
    intakeKeys: ['pestActivity', 'pests'],
    rowKeywords: ['pest', 'insect', 'rodent', 'bug'],
    reason: 'Care planning for routine pest prevention and seasonal watch items.'
  },
  {
    id: 'windows-doors-weatherstripping',
    careItem: 'Windows/doors/weatherstripping',
    resource: 'Handy Services',
    trade: 'Windows',
    cadence: 'Seasonal',
    suggestedWindow: 'Suggested next normal window: before heating or cooling season',
    intakeKeys: ['windowsDoorsRepairedReplaced', 'windowsDoors', 'fogging', 'stickyOpeningsDrafts'],
    rowKeywords: ['window', 'door', 'weatherstripping', 'draft', 'seal'],
    reason: 'Care planning for normal comfort, operation, and weatherstripping review before peak seasons.'
  }
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
      { key: 'acHeatPumpService', label: 'A/C or heat pump service' },
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

function passTextMatchesRule(text = '', rule = {}) {
  const normalized = String(text || '').toLowerCase();
  return (rule.rowKeywords || []).some(keyword => normalized.includes(keyword));
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
function passIntakeBasis(intake = {}, rule = {}) {
  const item = passIntakeValueForRule(intake, rule);
  if (!item) return 'Unknown service history';
  const value = item.value;
  const unknownish = /unknown|not sure|unsure|last .*unknown|history unknown|date unknown|age unknown|verify|ask/i.test(value);
  if (unknownish) return `Unknown service history: ${intakeFieldLabel(item.key)} — ${value}`;
  return `Homeowner-reported service history: ${intakeFieldLabel(item.key)} — ${value}`;
}
function passRoutineObservationBasis(rows = [], rule = {}) {
  const matches = rows.filter(row => {
    const text = `${row.roomName || row.room || ''} ${row.zone || ''} ${row.item || ''} ${row.prompt || ''} ${row.answer?.notes || ''}`;
    return passTextMatchesRule(text, rule) && (row.pass || row.answer?.passCandidate || row.answer?.status === 'Good' || row.answer?.status === 'Unknown');
  }).slice(0, 2);
  if (!matches.length) return '';
  return `HTC routine-care observation: ${matches.map(row => row.item).join('; ')}`;
}
function passManualBasis(row = {}) {
  return ['Manually marked PASS continued-care candidate', row.roomName || row.room, row.item].filter(Boolean).join(' · ');
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
function passManualCareRow(row = {}) {
  return {
    id: `manual-pass-${row.id}`,
    source: 'manual',
    careItem: row.item || 'Manual PASS candidate',
    reason: 'A continued-care item was noted during the walkthrough for future seasonal or routine planning.',
    targetWindow: row.answer?.passTargetWindow || 'Next normal care window',
    suggestedWindow: row.answer?.passTargetWindow ? `Suggested window: ${row.answer.passTargetWindow}` : 'Suggested window: Next normal care window',
    cadence: row.answer?.passCadence || passCadenceFor(row),
    resource: row.answer?.passResource || passResourceFor(row),
    followUpStatus: passPlanningStatusText(row.answer?.passFollowUpStatus),
    internalNote: row.answer?.passNote || '',
    basis: passManualBasis(row),
    row
  };
}
function buildPassCareOutlook({ intake = {}, rows = [] } = {}) {
  const normalizedRows = Array.isArray(rows) ? rows : [];
  const manualRows = normalizedRows.filter(row => row.answer?.passCandidate).map(passManualCareRow);
  const generatedRows = PASS_CARE_RULES.map(rule => {
    const basis = [passIntakeBasis(intake, rule), passRoutineObservationBasis(normalizedRows, rule), `Common care cadence: ${rule.cadence}`].filter(Boolean).join(' · ');
    return {
      id: `generated-pass-${rule.id}`,
      source: 'generated',
      careItem: rule.careItem,
      reason: rule.reason,
      targetWindow: passSuggestedWindowText(rule.suggestedWindow),
      suggestedWindow: `Suggested window: ${rule.suggestedWindow}`,
      cadence: rule.cadence,
      resource: rule.resource,
      followUpStatus: PASS_FOLLOW_UP_STATUSES[0],
      internalNote: '',
      basis,
      rule
    };
  });
  return [...manualRows, ...generatedRows];
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
        included: review.included !== false,
        reason: review.reason ?? item.reason,
        targetWindow,
        suggestedWindow: targetWindow ? `Suggested window: ${targetWindow}` : (review.suggestedWindow ?? item.suggestedWindow),
        cadence: review.cadence ?? item.cadence,
        resource: review.resource ?? item.resource,
        followUpStatus: passPlanningStatusText(review.followUpStatus ?? item.followUpStatus),
        internalNote: review.internalNote ?? item.internalNote ?? ''
      };
    })
    .filter(item => includeHidden || item.included !== false);
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
function removePassPrivateFields(item = {}) {
  const { internalNote, row, rule, ...publicItem } = item;
  return publicItem;
}
function sanitizedPassReviewForExport(passReview = {}, visiblePassIds = new Set()) {
  return Object.fromEntries(Object.entries(passReview || {})
    .filter(([id]) => visiblePassIds.has(id))
    .map(([id, review]) => {
      const { internalNote, included, ...publicReview } = review || {};
      return [id, publicReview];
    })
  );
}
function sanitizeRowsForPassExport(rows = [], visiblePassIds = new Set()) {
  return (rows || []).map(row => {
    if (!row.answer?.passCandidate) return row;
    const manualPassId = `manual-pass-${row.id}`;
    const { passCandidate, passTargetWindow, passCadence, passResource, passFollowUpStatus, passNote, ...publicAnswer } = row.answer;
    if (!visiblePassIds.has(manualPassId)) return { ...row, answer: { ...publicAnswer, passCandidate: false } };
    return { ...row, answer: { ...publicAnswer, passCandidate, passTargetWindow, passCadence, passResource, passFollowUpStatus } };
  });
}
function buildDrivePayload({ walkthroughName = '', client, intake, rows, pmr, passCareOutlook, passReview = {}, dynamicRooms = [], sections = [], sectionOrderState = [], itemOrderState = {}, pinnedItems = {}, roomCapture = {} }) {
  const reviewedPassOutlook = passCareOutlook || applyPassReview(buildPassCareOutlook({ intake, rows }), passReview);
  const passCareOutlookForExport = reviewedPassOutlook.map(removePassPrivateFields);
  const visiblePassIds = new Set(passCareOutlookForExport.map(item => item.id));
  const rowsForExport = sanitizeRowsForPassExport(rows, visiblePassIds);
  const pmrForExport = sanitizeRowsForPassExport(pmr, visiblePassIds);
  const passReviewForExport = sanitizedPassReviewForExport(passReview, visiblePassIds);
  return { walkthroughName, client, intake, dynamicRooms, roomCapture, sectionFlow: driveSectionFlow(sections), sectionOrder: sectionOrderState, itemOrder: itemOrderState, pinnedItems, rows: rowsForExport, pmr: pmrForExport, passReview: passReviewForExport, passCareOutlook: passCareOutlookForExport, exportedAt: new Date().toISOString() };
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
        .card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px;margin:18px 0;box-shadow:0 8px 22px var(--shadow)}.hero-card{border-top:5px solid var(--gold)}.section-card{margin-top:24px}.lede{font-size:16px;color:#40505f;margin-top:0}.section-kicker{margin:0 0 6px;color:var(--gold);font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.summary-note{background:#fffdf8;border-left:4px solid var(--gold);padding:12px 14px;border-radius:10px}.finding-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.finding-card{border-left:4px solid var(--gold)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.stat{background:var(--soft);border-radius:14px;padding:14px;text-align:center}.stat strong{font-size:30px;color:var(--navy);display:block}.pill{display:inline-block;border-radius:999px;background:var(--soft);padding:4px 9px;font-weight:800}.high{background:var(--red)}.medium{background:var(--yellow)}.low{background:var(--green)}.badge-line{display:flex;flex-wrap:wrap;gap:6px;margin:7px 0 10px}.note-card{border:1px solid var(--line);border-radius:14px;padding:14px;margin:12px 0;background:#fffdf8}.detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.detail{background:#fbf7ef;border:1px solid #eadbc2;border-radius:12px;padding:10px}.not-recorded{color:var(--muted);font-style:italic}.small{font-size:12px;color:var(--muted)}.next-step-list{list-style:none;padding:0;margin:10px 0 0;display:grid;gap:10px}.next-step-list li{border:1px solid #eadbc2;background:#fffdf8;border-radius:12px;padding:12px}.next-step-list strong,.next-step-list span{display:block}.next-step-list span{color:#40505f;margin-top:3px}.pass-card{background:#fbfdfe;border-color:#cbdfe9}.care-table th{background:#17496d}.care-table td{line-height:1.45}
    table{width:100%;border-collapse:separate;border-spacing:0;background:#fff;overflow:hidden;border-radius:12px;border:1px solid var(--line)} th,td{border-bottom:1px solid var(--line);padding:9px;text-align:left;vertical-align:top} th{background:var(--navy);color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:.03em} tr:nth-child(even) td{background:#fbf7ef} tr:last-child td{border-bottom:0} a{color:#0b5cad;font-weight:800} ul{padding-left:20px}.room-section{break-inside:avoid}.mobile-list{display:none}.photo-ref{font-size:12px;color:var(--muted)}
    @media(max-width:780px){main{padding:12px}header{border-radius:0;padding:20px 14px}.workflow span{font-size:13px}.table-wrap{overflow-x:auto}.desktop-table{min-width:760px}.mobile-list{display:block}.mobile-hidden{display:none}.note-card{padding:12px}.detail-grid{grid-template-columns:1fr}}
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
function buildPmrReportHtml(payload, photoEntries = []) {
  const pmr = payload.pmr || [];
  const rows = payload.rows || [];
  const counts = { high: pmr.filter(r=>priority(r.answer.status)==='High').length, med: pmr.filter(r=>priority(r.answer.status)==='Medium').length, low: pmr.filter(r=>priority(r.answer.status)==='Low').length };
  const quickHits = pmr.filter(r => ['Handyman','Safety'].includes(r.answer.trade) && ['15 min','30 min','45–60 min','1–2 hrs'].includes(r.answer.effort));
  const tradeItems = pmr.filter(r => !['Handyman','Safety'].includes(r.answer.trade));
  const passCareOutlook = payload.passCareOutlook || buildPassCareOutlook({ intake: payload.intake, rows });
  const reviewedIntakeNotes = rows.filter(r => isIntakeFollowUp(r) && r.answer.reviewStatus && r.answer.reviewStatus !== 'Not Reviewed' && r.answer.reviewStatus !== INTAKE_PMR_REVIEW_STATUS);
  const photoCountFor = row => photoEntries.filter(entry => entry.item === row.item && entry.room === (row.roomName || row.room)).length;
  const findingCard = r => {
    const certainty = actionCertaintyCopy(r);
    const level = priority(r.answer.status) || 'PMR';
    return `<article class="note-card finding-card"><div class="finding-head"><div><p class="section-kicker">${htmlEscape(r.roomName || r.room)} · ${htmlEscape(displayTradeLabel(r.answer.trade))}</p><h3>${htmlEscape(r.item)}</h3></div><span class="pill ${String(level).toLowerCase()}">${htmlEscape(level)}</span></div><div class="badge-line"><span class="pill">${htmlEscape(r.answer.status)}</span><span class="pill">${htmlEscape(certainty.label)}</span><span class="pill">${reportValue(r.answer.effort)}</span></div><div class="detail-grid"><div class="detail"><span class="field-label">What we saw</span>${reportValue(r.answer.notes, 'No additional notes recorded yet.')}</div><div class="detail"><span class="field-label">Why it matters</span>${reportValue(r.why)}</div><div class="detail"><span class="field-label">Recommended next step</span>${reportValue(certainty.next)}</div><div class="detail"><span class="field-label">Suggested timing</span>${htmlEscape(timingFor(r, r.answer.status))} · Homeowner pace: ${reportValue(r.answer.pref)}</div><div class="detail"><span class="field-label">Planning confidence</span>${reportValue(certainty.body)}</div><div class="detail"><span class="field-label">Photos</span>${photoCountFor(r)} linked in Photo Index</div></div></article>`;
  };
  const handyList = quickHits.map(r=>`<li><strong>${htmlEscape(r.roomName || r.room)} — ${htmlEscape(r.item)}</strong><span>${htmlEscape(displayTradeLabel(r.answer.trade))} · ${htmlEscape(r.answer.effort)} · ${htmlEscape(actionCertaintyFor(r.answer))}</span></li>`).join('') || '<li><strong>No quick-hit Handy Next Steps recorded.</strong><span>Nothing has been grouped for a Handy Services visit in this PMR.</span></li>';
  const intakeList = reviewedIntakeNotes.map(r=>`<li><strong>${htmlEscape(r.roomName || r.room)} — ${htmlEscape(r.item)}</strong><span>${htmlEscape(r.answer.reviewStatus)} · ${htmlEscape(r.intakeFieldLabel)}: ${reportValue(r.intakeValue)}</span></li>`).join('') || '<li><strong>No reviewed intake follow-up notes recorded.</strong><span>Intake context did not add separate follow-up notes for this PMR export.</span></li>';
  const body = `<section class="card hero-card"><p class="section-kicker">Homeowner deliverable</p><h2>PMR Report Overview</h2><p class="lede">This PMR turns reviewed walkthrough observations into a clear homeowner action plan. PMR findings and counts are shown separately from PASS continued-care reminders.</p></section>
    <section class="card"><h2>Workflow Summary</h2><p><strong>Intake</strong> captures homeowner context. <strong>HTC</strong> verifies conditions in the field. <strong>PMR</strong> lists reviewed findings and next steps. <strong>PASS — Continued Care</strong> is routine care planning and is not included in PMR counts or defects.</p></section>
    <section class="card"><h2>Home Health Snapshot</h2><div class="grid"><div class="stat high"><strong>${counts.high}</strong>Immediate</div><div class="stat medium"><strong>${counts.med}</strong>Near-Term</div><div class="stat low"><strong>${counts.low}</strong>Monitor</div><div class="stat"><strong>${pmr.length}</strong>PMR Findings</div></div><p class="summary-note">${reportValue(payload.intake?.notes, 'No homeowner summary notes recorded.')}</p></section>
    <section class="card"><h2>Action Certainty Guide</h2><div class="action-guide">${ACTION_CERTAINTY_GUIDE.map(item => `<div class="action-guide-item ${actionCertaintyClass(item.label)}"><strong>${htmlEscape(item.label)}</strong><span>${htmlEscape(item.body)}</span></div>`).join('')}</div></section>
    <section class="card"><h2>Time / Investment Guide</h2><div class="time-guide">${PMR_TIME_INVESTMENT_GUIDE.map(item => `<div class="time-guide-item ${item.key}"><span>${item.icon}</span><strong>${htmlEscape(item.display)}</strong></div>`).join('')}</div></section>
    <section class="card section-card"><p class="section-kicker">Section 1</p><h2>PMR Findings</h2><p class="lede">Reviewed findings from the walkthrough are listed here with practical next-step language.</p>${pmr.map(findingCard).join('') || '<p><span class="not-recorded">No PMR findings recorded.</span></p>'}</section>
    <section class="card section-card"><p class="section-kicker">Section 2</p><h2>Handy Next Steps</h2><p class="lede">Quick, practical items that may fit a grouped Handy Services visit, subject to confirmation and scheduling.</p><ul class="next-step-list">${handyList}</ul></section>
    <section class="card section-card"><p class="section-kicker">Section 3</p><h2>Trade Items</h2><p class="lede">Items below may require a licensed trade or specialist resource before pricing, scheduling, or repair scope is finalized.</p>${tradeItems.map(findingCard).join('') || '<p><span class="not-recorded">No trade items recorded.</span></p>'}</section>
    <section class="card section-card pass-card"><p class="section-kicker">Section 4 · Separate from PMR counts</p><h2>PASS Continued Care Outlook</h2><p class="lede">PASS is ongoing home-care planning. These items are not PMR defects, priority counts, or urgent repair directives.</p><div class="table-wrap"><table class="care-table"><thead><tr><th>Care item</th><th>Why it is included</th><th>Continued-care plan</th><th>Target window</th><th>Cadence</th><th>Resource</th></tr></thead><tbody>${tableRows(passCareOutlook, [{ value: r => htmlEscape(r.careItem) }, { value: r => htmlEscape(r.reason) }, { value: r => htmlEscape(passHomeownerFollowUpLanguage(r)) }, { value: r => htmlEscape(passSuggestedWindowText(r.targetWindow || r.suggestedWindow)) }, { value: r => htmlEscape(r.cadence || 'As Needed') }, { value: r => htmlEscape(r.resource) }])}</tbody></table></div></section>
    <section class="card section-card"><p class="section-kicker">Section 5</p><h2>Intake Follow-Up Notes</h2><p class="lede">Reviewed intake items are included only as context from homeowner follow-up. Intake alone does not create a PMR finding.</p><ul class="next-step-list">${intakeList}</ul></section>`;
  return reportShell('01 - PMR Report', payload.client, body, payload.walkthroughName);
}
function buildHtcChecklistHtml(payload, photoEntries = []) {
  const rows = (payload.rows || []).map(row => ({ ...row, categoryLabel: categoryInfo(categoryForChecklistItem(row)).label, photoEntries: photoEntries.filter(entry => entry.item === row.item && entry.room === (row.roomName || row.room)) }));
  const grouped = groupByRoom(rows);
  const columns = [
    { value: r => reportValue(r.roomName || r.room) }, { value: r => reportValue(r.item) }, { value: r => reportValue(r.categoryLabel) }, { value: r => reportValue(r.answer.status) }, { value: r => reportValue(r.answer.notes, 'No notes recorded') },
    { value: r => reportValue(displayTradeLabel(r.answer.trade)) }, { value: r => reportValue(r.answer.pref) }, { value: r => reportValue(actionCertaintyFor(r.answer)) }, { value: r => reportValue(r.answer.effort) },
    { value: r => r.answer.passCandidate ? 'Yes — PASS candidate' : '<span class="not-recorded">No</span>' }, { value: r => r.photoEntries.length ? `${r.photoEntries.length}<div class="photo-ref">${r.photoEntries.map(p=>htmlEscape(p.driveFileName || p.originalName)).join('<br/>')}</div>` : '<span class="not-recorded">0</span>' }
  ];
  const roomSections = Object.entries(grouped).map(([room, items]) => `<section class="card room-section"><h2>${htmlEscape(room)}</h2><div class="table-wrap mobile-hidden"><table class="desktop-table"><thead><tr><th>Room / Section</th><th>Item Title</th><th>Category</th><th>Status</th><th>Notes</th><th>Suggested Trade / Resource</th><th>Homeowner Pace</th><th>Action Certainty</th><th>Approx. Time</th><th>PASS Candidate</th><th>Photos</th></tr></thead><tbody>${tableRows(items, columns)}</tbody></table></div><div class="mobile-list">${items.map(r=>`<article class="note-card"><h3>${htmlEscape(r.item)}</h3><div class="badge-line"><span class="pill">${htmlEscape(r.categoryLabel)}</span><span class="pill">${htmlEscape(r.answer.status || 'Status not recorded')}</span><span class="pill">${htmlEscape(displayTradeLabel(r.answer.trade || 'Resource not recorded'))}</span></div><div class="detail-grid"><div class="detail"><span class="field-label">Notes</span>${reportValue(r.answer.notes, 'No notes recorded')}</div><div class="detail"><span class="field-label">Homeowner pace</span>${reportValue(r.answer.pref)}</div><div class="detail"><span class="field-label">Action certainty</span>${reportValue(actionCertaintyFor(r.answer))}</div><div class="detail"><span class="field-label">Approx. time</span>${reportValue(r.answer.effort)}</div><div class="detail"><span class="field-label">PASS candidate</span>${r.answer.passCandidate ? 'Yes' : '<span class="not-recorded">No</span>'}</div><div class="detail"><span class="field-label">Photos</span>${r.photoEntries.length ? `${r.photoEntries.length}: ${r.photoEntries.map(p=>htmlEscape(p.driveFileName || p.originalName)).join('<br/>')}` : '<span class="not-recorded">0</span>'}</div></div></article>`).join('')}</div></section>`).join('');
  const body = `<section class="card"><h2>HTC Checklist Field Documentation Record</h2><p class="lede">Room-by-room HTC documentation in walkthrough order. Neutral or blank details are softened so completed observations, notes, resources, pacing, certainty, time, PASS candidate status, and photo references are easier to scan in the field.</p></section>${roomSections || '<section class="card"><p><span class="not-recorded">No checklist items recorded.</span></p></section>'}`;
  return reportShell('02 - HTC Checklist', payload.client, body, payload.walkthroughName);
}
function buildIntakeSummaryHtml(payload) {
  const intake = payload.intake || {};
  const sections = INTAKE_EXPORT_SECTIONS.map(section => {
    const rows = section.fields.map(([label, key]) => ({ label, value: fieldValue(intake, key) }));
    return `<section class="card"><h2>${htmlEscape(section.title)}</h2><table><thead><tr><th>Topic</th><th>Homeowner Context</th></tr></thead><tbody>${tableRows(rows, [{value:r=>reportValue(r.label)}, {value:r=>reportValue(r.value)}])}</tbody></table></section>`;
  }).join('');
  const body = `<section class="card"><h2>Intake — Homeowner Context & Field Prep</h2><p class="lede">Intake captures homeowner-reported context before the walkthrough. HTC verifies conditions in the field. PMR findings are only created after review. Imported raw responses are included only as homeowner-provided context, not verified findings. Empty fields are shown as “Not recorded” for context without turning missing information into a finding.</p></section>${sections}`;
  return reportShell('03 - Intake Summary', payload.client, body, payload.walkthroughName);
}
function buildPhotoIndexHtml(payload, photoEntries = []) {
  const grouped = photoEntries.reduce((acc, entry) => { const room = entry.room || 'Room'; acc[room] = [...(acc[room] || []), entry]; return acc; }, {});
  const sections = Object.entries(grouped).map(([room, entries]) => `<section class="card room-section"><h2>${htmlEscape(room)}</h2><div class="table-wrap"><table><thead><tr><th>Room</th><th>Checklist Item / Room Overview</th><th>Photo Label</th><th>Uploaded Drive File Name</th><th>Drive Link</th></tr></thead><tbody>${tableRows(entries, [{value:e=>reportValue(e.room)}, {value:e=>reportValue(e.item)}, {value:e=>reportValue(e.label)}, {value:e=>reportValue(e.driveFileName || flatPhotoDriveName({room:e.room,item:e.item,label:e.label,originalName:e.originalName}))}, {value:e=>e.driveViewLink ? `<a href="${htmlEscape(e.driveViewLink)}">Open photo</a>` : '<span class="not-recorded">Link not available</span>'}])}</tbody></table></div></section>`).join('') || '<section class="card"><p><span class="not-recorded">No photos recorded.</span></p></section>';
  const body = `<section class="card"><h2>Photo Index</h2><p class="lede">Photos are grouped by room or section. The Drive Photos folder remains flattened with readable file names; this index connects each file back to its room overview or checklist item.</p><p class="small">Thumbnails are intentionally omitted here to keep the exported local HTML package lightweight.</p></section>${sections}`;
  return reportShell('04 - Photo Index', payload.client, body, payload.walkthroughName);
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
  await uploadDriveHtml(accessToken, packageId, '01 - Intake Summary.html', buildIntakeSummaryHtml(payload));
  await uploadDriveHtml(accessToken, packageId, '02 - HTC Checklist.html', buildHtcChecklistHtml(payload, photoEntries));
  await uploadDriveHtml(accessToken, packageId, '03 - PMR Report.html', buildPmrReportHtml(payload, photoEntries));
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
  return {
    ...Object.fromEntries(Object.entries(INTAKE_DEFAULTS).map(([key, value]) => [key, Array.isArray(value) ? [] : ''])),
    intakeId: '',
    intakeStatus: '',
    importedRawResponse: '',
    importedUnmappedNotes: ''
  };
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
        'generated-pass-chimney-fireplace-service': { included: false },
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
        'generated-pass-smoke-co-extinguisher-check': { included: false }
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
        'generated-pass-gutters-drainage-review': { included: false },
        'manual-pass-11': { included: false },
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
  const [passReview, setPassReview] = useState(initialState.data.passReview || {});
  const [roomItemFormOpen, setRoomItemFormOpen] = useState(false);
  const [roomItemDraft, setRoomItemDraft] = useState(EMPTY_ROOM_ITEM_DRAFT);
  const [dragSectionKey, setDragSectionKey] = useState('');
  const [photoFeedback, setPhotoFeedback] = useState({ state: '', message: '' });
  const [copyFeedback, setCopyFeedback] = useState('');
  const [storageWarning, setStorageWarning] = useState('');
  const [saveStatus, setSaveStatus] = useState({ state: 'saved', time: initialState.activeId ? 'loaded' : '' });
  const [expandedChecklistItems, setExpandedChecklistItems] = useState({});
  const [controlsCollapsed, setControlsCollapsed] = useState(() => {
    const initialClient = initialState.data.client || {};
    const missingBasicInfo = !initialClient.name?.trim() || !initialClient.address?.trim() || !initialClient.date?.trim();
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
  const passCareCandidates = buildPassCareOutlook({ intake, rows });
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
  const updateIntake = (patch) => setIntake(prev => normalizeIntakeData({...prev, ...patch}));
  const updatePassReview = (id, patch) => setPassReview(prev => ({...prev, [id]: {...(prev[id] || {}), ...patch}}));
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
    intake: normalizeIntakeData(intake),
    dynamicRooms,
    sectionOrder: sectionOrderState,
    itemOrder: itemOrderState,
    pinnedItems,
    roomCapture,
    passReview
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
  }, [client, answers, intake, dynamicRooms, sectionOrderState, itemOrderState, pinnedItems, roomCapture, passReview, walkthroughName]);
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
    setPassReview(data?.passReview || clean.passReview);
    setRoomItemFormOpen(false);
    setRoomItemDraft(EMPTY_ROOM_ITEM_DRAFT);
    setExpandedChecklistItems({});
    setView('intake');
  };
  const startNewWalkthrough = () => {
    const nextId = `walkthrough-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const nextName = `New Walkthrough ${new Date().toLocaleDateString()}`;
    applyWalkthroughData(cleanWalkthroughData());
    setWalkthroughName(nextName);
    setActiveWalkthroughId(nextId);
    setSelectedWalkthroughId('');
    setControlsCollapsed(false);
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
    const openedMissingBasicInfo = !openedClient.name?.trim() || !openedClient.address?.trim() || !openedClient.date?.trim();
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
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(buildDrivePayload({walkthroughName, client, intake, rows, pmr, passCareOutlook, passReview, dynamicRooms, sections, sectionOrderState, itemOrderState, pinnedItems, roomCapture}), null, 2)], {type:'application/json'});
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
  const controlsMissingFields = [
    !client.name?.trim() && 'Client Name',
    !client.address?.trim() && 'Project Address',
    !client.date?.trim() && 'Walkthrough Date / Visit Label'
  ].filter(Boolean);
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
    if (r.answer.passCandidate) flags.push({ key: 'pass', className: 'pass', label: `PASS: ${r.answer.passCadence || 'Candidate'}` });
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
    const counts = {
      pmr: sectionRows.filter(includePMRRow).length,
      photos: capture.photos.length + sectionRows.reduce((total, row) => total + row.answer.photos.length, 0),
      pass: sectionRows.filter(row => row.answer.passCandidate).length,
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
    if (counts.pass) badges.push({ key: 'pass', label: `PASS ${counts.pass}`, tone: 'pass' });
    if (counts.trade) badges.push({ key: 'trade', label: `Trade ${counts.trade}`, tone: 'attention' });
    if (counts.handy) badges.push({ key: 'handy', label: `Handy ${counts.handy}`, tone: 'handy' });
    if (counts.watch) badges.push({ key: 'watch', label: `Watch ${counts.watch}`, tone: 'watch' });
    return { ...counts, badges, hasAttention, immediateCount };
  };
  const syncDrive = async ({includeDownload=false, retryQueue=false} = {}) => {
    if (includeDownload) downloadJSON();
    const payload = buildDrivePayload({walkthroughName, client, intake, rows, pmr, passCareOutlook, passReview, dynamicRooms, sections, sectionOrderState, itemOrderState, pinnedItems, roomCapture});
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
      <div className="releaseNote noPrint" aria-label="Current internal release note">
        <strong>{APP_RELEASE_NOTE.label}</strong>
        <span>{APP_RELEASE_NOTE.summary}</span>
      </div>
      <nav><button onClick={()=>setView('intake')} className={view==='intake'?'on':''}><Home size={18}/> Intake</button><button onClick={()=>setView('form')} className={view==='form'?'on':''}><ClipboardCheck size={18}/> HTC</button><button onClick={()=>setView('pmr')} className={view==='pmr'?'on':''}><FileText size={18}/> PMR</button><button onClick={()=>setView('metrics')} className={view==='metrics'?'on':''}><Clock3 size={18}/> Metrics</button></nav>
    </header>
    <section className={`walkthroughControlsPanel noPrint ${controlsCollapsed ? 'collapsed' : 'expanded'} ${controlsNeedsAttention ? 'needsAttention' : ''}`} aria-label="Walkthrough Control Panel">
      <div className="walkthroughControlsHeader">
        <div>
          <h2>Walkthrough Control Panel</h2>
          <p>{controlsCollapsed ? 'Compact walkthrough setup summary.' : 'Name, save, export, and output controls for this walkthrough.'}</p>
        </div>
        {!controlsCollapsed && <button type="button" onClick={()=>setControlsCollapsedPreference(true)}>Hide Controls</button>}
      </div>
      <div className="walkthroughControlsSummary" aria-label="Walkthrough control summary">
        <div className="summaryItem"><span>Working Session Name</span><strong title={walkthroughName || 'Untitled Walkthrough'}>{walkthroughName || 'Untitled Walkthrough'}</strong></div>
        <div className="summaryItem"><span>Client Name</span><strong title={client.name || 'Missing'}>{client.name || 'Missing'}</strong></div>
        <div className="summaryItem"><span>Project Address</span><strong title={client.address || 'Missing'}>{client.address || 'Missing'}</strong></div>
        <div className="summaryItem"><span>Walkthrough Date / Visit Label</span><strong title={client.date || 'Missing'}>{client.date || 'Missing'}</strong></div>
        <div className="summaryItem"><span>Intake ID</span><strong title={intake.intakeId || 'Not generated yet'}>{intake.intakeId || 'Not generated yet'}</strong></div>
        <span className={`saveStatus ${saveStatus.state}`} role="status" aria-live="polite"><span className="saveStatusDot" aria-hidden="true"></span>{saveStatusText(saveStatus, hasUnsavedVisiblePhotos)}</span>
        <span className={`driveSummaryPill ${driveMeta.lastError ? 'error' : (driveToken ? 'connected' : '')}`} title={driveSummaryText}>{driveSummaryText}</span>
        {controlsNeedsAttention && <span className="controlAttentionPill" role="status"><AlertTriangle size={14}/> {controlsAttentionText}</span>}
        {controlsCollapsed && <button type="button" className="openControlsButton" onClick={()=>setControlsCollapsedPreference(false)}>Open Controls</button>}
      </div>
      {!controlsCollapsed && <div className="walkthroughControlsBody">
        <section className="controlGroup sessionCard" aria-label="Walkthrough Info">
          <div className="controlGroupTitle"><h3>Walkthrough Info</h3></div>
          <label>Working Session Name<input value={walkthroughName} onChange={e=>setWalkthroughName(e.target.value)} placeholder="Name this working session"/></label>
          <label>Client Name<input value={client.name} onChange={e=>setClient({...client,name:e.target.value})}/></label>
          <label>Project Address<input value={client.address} onChange={e=>setClient({...client,address:e.target.value})}/></label>
          <label>Walkthrough Date / Visit Label<input value={client.date} onChange={e=>setClient({...client,date:e.target.value})}/></label>
        </section>
        <section className="controlGroup sessionCard" aria-label="Local Work">
          <div className="controlGroupTitle"><h3>Local Work</h3></div>
          <div className="walkthroughActions" aria-label="Walkthrough save and backup actions">
            <button type="button" onClick={startNewWalkthrough}>Start New Blank Walkthrough</button>
            <div className="manualSaveGroup"><button type="button" onClick={saveWalkthrough}>Save Working Walkthrough</button><span className={`saveStatus ${saveStatus.state}`} role="status" aria-live="polite"><span className="saveStatusDot" aria-hidden="true"></span>{saveStatusText(saveStatus, hasUnsavedVisiblePhotos)}</span></div>
            <button type="button" onClick={()=>syncDrive({includeDownload:true})}><Download size={16}/> Download Emergency Backup</button>
          </div>
          <label>Open Saved Walkthrough<select value={selectedWalkthroughId} onChange={e=>openSavedWalkthrough(e.target.value)}><option value="">Choose saved walkthrough</option>{savedSessionList.map(session=><option key={session.id} value={session.id}>{session.name || 'Untitled Walkthrough'}{session.updatedAt ? ` · ${new Date(session.updatedAt).toLocaleString()}` : ''}</option>)}</select></label>
          <button type="button" onClick={deleteSavedWalkthrough} disabled={!selectedWalkthroughId || !savedSessions[selectedWalkthroughId]}>Delete Selected Walkthrough</button>
        </section>
        <details className="controlGroup demoScenarioCard" aria-label="Developer / Demo Tools">
          <summary className="demoScenarioSummary"><span>Developer / Demo Tools</span><small>Test Walkthrough Scenarios are available for QA only and stay outside the normal homeowner workflow.</small></summary>
          <div className="demoScenarioIntro"><h3>Test Walkthrough Scenarios</h3><p>Load these only when testing PMR/PASS export behavior. Start real homeowner walkthroughs from the blank intake and HTC workflow above.</p></div>
          <div className="demoScenarioGrid">{DEMO_WALKTHROUGH_SCENARIOS.map(scenario => <article className="demoScenario" key={scenario.id}><div><h4>{scenario.name}</h4><p>{scenario.description}</p><ul>{scenario.checks.map(check => <li key={check}>{check}</li>)}</ul></div><button type="button" onClick={()=>loadDemoScenario(scenario)}>Load Demo</button></article>)}</div>
        </details>
        <section className="controlGroup releaseNoteCard" aria-label="Current Release Note">
          <div className="controlGroupTitle"><h3>Release Note</h3><p>{APP_RELEASE_NOTE.label}</p></div>
          <p>{APP_RELEASE_NOTE.summary}</p>
          <ul>{APP_RELEASE_NOTE.items.map(item => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className="controlGroup clientCard" aria-label="PMR Output">
          <div className="controlGroupTitle"><h3>PMR Output</h3></div>
          <div className="pmrPrintActions" aria-label="PMR print actions"><button onClick={()=>window.print()}><Printer size={16}/> Print / Save Draft PMR</button><button className="finalPrintButton" onClick={printFinalPMR}><Printer size={16}/> Print Final PMR</button></div>
        </section>
        <section className="controlGroup driveStatus driveSetupPanel" aria-label="Drive Export">
          <div className="driveSetupHeader">
            <div>
              <h3>Drive Export</h3>
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
      </div>}
    </section>
    {(storageWarning || photoFeedback.message) && <section className="appWarning noPrint" role="alert" aria-live="assertive"><AlertTriangle size={18}/><div>{storageWarning && <strong>{storageWarning}</strong>}{photoFeedback.message && <span className={`photoFeedback ${photoFeedback.state}`}>{photoFeedback.message}</span>}</div></section>}
    {view === 'intake' && <IntakeView client={client} intake={intake} updateIntake={updateIntake} copyFeedback={copyFeedback} onCopyPreWalkthroughEmail={copyPreWalkthroughIntakeEmail} intakeFollowUpCount={intakeFollowUpRows.length} onReviewIntakeFollowUp={()=>{ setView('form'); setActiveRoom(INTAKE_FOLLOW_UP_SECTION_KEY); }} />}
    {view === 'form' && <main className="grid">
      <aside className="roomNav noPrint"><h3>Walkthrough Sections</h3><div className="addRoomTools">{Object.values(DYNAMIC_ROOM_TYPES).map(type => <button key={type.roomType} onClick={()=>addDynamicRoom(type.roomType)}>{type.addLabel} {type.roomType}</button>)}</div>{rooms.map(r => <div key={r.key} className="sectionNavRow" draggable onDragStart={()=>setDragSectionKey(r.key)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); moveSection(dragSectionKey, r.key); setDragSectionKey('');}} onDragEnd={()=>setDragSectionKey('')}><span className="sectionDragHandle" title="Drag to reorder walkthrough flow">⋮⋮</span><button className={`sectionSelect ${activeRoom===r.key?'active':''} ${roomSummaryFor(r).hasAttention ? 'hasRoomAttention' : 'roomGood'}`} onClick={()=>setActiveRoom(r.key)}><span className="sectionName">{r.label}</span><span className="roomSummaryBadges" aria-label={`${r.label} room summary`}>{roomSummaryFor(r).badges.map(badge => <span key={badge.key} className={`roomSummaryBadge ${badge.tone}`}>{badge.label}</span>)}</span></button></div>)}<div className="hint"><Camera size={18}/> Prompt: Capture context, close-up, and detail photos. Store by room/item folder path.</div></aside>
      <section className="formPanel">
        <h1>{rooms.find(r=>r.key===activeRoom)?.label || activeRoom} HTC</h1><div className="roomCaptureShell"><div className="roomCaptureTop"><label>Overall Room Status<select value={roomCaptureFor(activeRoom).status} onChange={e=>updateRoomCapture(activeRoom,{status:e.target.value})}>{ROOM_STATUS_OPTIONS.map(x=><option key={x}>{x}</option>)}</select></label><button type="button" onClick={openRoomItemForm}>Add Item</button></div><span className="roomCaptureHelp">Add anything that needs tracking beyond ‘looks good.’</span>{roomItemFormOpen && <div className="roomItemForm"><div className="inputs roomItemInputs"><label>Item title<input value={roomItemDraft.title} onChange={e=>updateRoomItemDraft({title:e.target.value})} placeholder="e.g., Loose towel bar" autoFocus/></label><label>Item bucket/type<select value={roomItemDraft.bucket} onChange={e=>updateRoomItemDraft({bucket:e.target.value})}>{ROOM_ITEM_BUCKETS.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div><label className="discoveryCheck"><input type="checkbox" checked={roomItemDraft.isDiscovery} onChange={e=>updateRoomItemDraft({isDiscovery:e.target.checked})}/><span><strong>Discovery</strong><small>Unexpected, hidden, unusual, or out of the ordinary.</small></span></label><label className="notes">Notes<textarea value={roomItemDraft.notes} onChange={e=>updateRoomItemDraft({notes:e.target.value})} placeholder="Add room-level context, next step, or follow-up note."/></label><div className="roomItemActions"><button type="button" onClick={saveRoomItem} disabled={!roomItemDraft.title.trim()}>Save</button><button type="button" onClick={cancelRoomItemForm}>Cancel</button></div></div>}<label className="notes">Room Note / Voice Transcript<textarea value={roomCaptureFor(activeRoom).note} onChange={e=>updateRoomCapture(activeRoom,{note:e.target.value})} placeholder="Capture room-level context, voice transcript, or summary notes for this space."/></label><div className="roomPhotoBox"><div className="photoBox"><Camera size={18}/><strong>Room Overview Photos:</strong><label className="uploadInline"><Upload size={16}/> Add Room Overview Photo<input type="file" accept="image/*" multiple onChange={e=>{addRoomPhotos(activeRoom, e.target.files); e.target.value='';}}/></label><span>{photoSummary(roomCaptureFor(activeRoom).photos, { emptyText: 'No room overview photos attached yet', labels: ROOM_PHOTO_LABELS })}</span></div>{roomCaptureFor(activeRoom).photos.length > 0 && <div className="thumbGrid roomThumbGrid">{roomCaptureFor(activeRoom).photos.map(photo => { const displaySrc = photoDisplaySrc(photo); return <div className="thumbCard" key={photo.id}><div className="thumb">{displaySrc ? <img src={displaySrc} alt={`Overview for ${rooms.find(room=>room.key===activeRoom)?.label || activeRoom}`}/> : <Image size={24}/>}</div><span>Overview</span><span title={photo.name}>{photo.name}</span><span className={`photoStatusBadge ${photo.uploadStatus || PHOTO_UPLOAD_STATUS.LOCAL}`}>{photoStatusLabel(photo)}</span><span className="photoStatusText">{photoStatusMessage(photo, Boolean(driveToken))}</span><button onClick={()=>removeRoomPhoto(activeRoom, photo.id)} aria-label="Remove room overview photo"><X size={14}/></button></div>; })}</div>}</div><div className="smartRoomPrompt"><h3>Smart Room Prompt</h3><div className="smartRoomGrid">{SMART_ROOM_PROMPTS.map(group => <p key={group.group}><strong>{group.group}:</strong> {group.prompt}</p>)}</div></div><div className="roomItemsPlaceholder"><h3>Items list for this room</h3>{roomCaptureFor(activeRoom).items.length > 0 ? <ul className="roomItemList">{roomCaptureFor(activeRoom).items.map(item=><li key={item.id} className="roomItemRow"><div><strong>{item.title}</strong><span>{roomItemBucketLabel(item.bucket)}{item.isDiscovery ? ' · Discovery' : ''}</span>{item.notes && <p>{item.notes}</p>}</div><button type="button" onClick={()=>removeRoomItem(activeRoom, item.id)} aria-label={`Remove ${item.title}`}><X size={14}/> Remove</button></li>)}</ul> : <p>No room-level items added yet.</p>}{rows.filter(r=>r.sectionKey===activeRoom && includePMRRow(r)).length > 0 && <><h4>Checklist items currently flagged</h4><ul>{rows.filter(r=>r.sectionKey===activeRoom && includePMRRow(r)).slice(0,5).map(r=><li key={`placeholder-${r.id}`}>{r.item} · {r.answer.status}</li>)}</ul></>}</div></div><div className="checklistToolbar noPrint"><p className="lede">Fuller data capture: collapsed for faster field scanning. Open only the items that need detail.</p><div><button type="button" onClick={()=>setChecklistRowsExpanded(activeRoom, true)}>Expand All</button><button type="button" onClick={()=>setChecklistRowsExpanded(activeRoom, false)}>Collapse All</button></div></div>
        {roomRows.map(r => {
          const category = categoryForChecklistItem(r);
          const meta = categoryInfo(category);
          const isExpanded = Boolean(expandedChecklistItems[r.id]);
          const flags = checklistSummaryFlags(r);
          const itemPriority = priority(r.answer.status);
          return <div className={`itemCard checklistItemCard categoryCard category-${meta.slug} ${isExpanded ? 'expanded' : 'collapsed'} ${flags.some(flag => flag.className === 'attention') ? 'needsAttention' : ''}`} key={r.id}>
          <button type="button" className="checklistSummaryRow" onClick={()=>toggleChecklistItem(r.id)} aria-expanded={isExpanded} aria-controls={`item-detail-${r.id}`}>
            <span className="tradeIcon">{ICONS[r.answer.trade] || ICONS[r.trade] || '🔎'}</span>
            <span className="checklistSummaryMain"><span className="itemTitleLine"><strong>{r.item}</strong><CategoryBadge category={category}/>{isIntakeFollowUp(r) && <span className="sourceBadge">Intake Follow-Up</span>}</span><span>{r.zone} · Suggested: {displayTradeLabel(r.trade)}</span></span>
            <span className="checklistStatus"><span className={`statusBadge status-${r.answer.status.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{r.answer.status}</span><span className={`pill ${itemPriority.toLowerCase()}`}>{itemPriority || 'No PMR'}</span></span>
            <span className="checklistSummaryFlags">{flags.length ? flags.map(flag => <span key={flag.key} className={`summaryFlag ${flag.className}`}>{flag.label}</span>) : <span className="summaryFlag quiet">No notes/photos</span>}</span>
            <span className="expandHint">{isExpanded ? 'Collapse' : 'Open'}</span>
          </button>
          {isExpanded && <div className="checklistDetailPanel" id={`item-detail-${r.id}`}>
            <div className="itemHead expandedItemHead"><span className="tradeIcon">{ICONS[r.answer.trade] || ICONS[r.trade] || '🔎'}</span><div><div className="itemTitleLine"><h2>{r.item}</h2><CategoryBadge category={category}/>{isIntakeFollowUp(r) && <span className="sourceBadge">Intake Follow-Up</span>}</div><p>{r.zone} · Suggested: {displayTradeLabel(r.trade)}</p></div>{!r.catchAll && !isIntakeFollowUp(r) && <div className="itemOrderTools"><button onClick={()=>moveItem(r.sectionKey, r.id, -1)} title="Move item up">↑</button><button onClick={()=>moveItem(r.sectionKey, r.id, 1)} title="Move item down">↓</button><button onClick={()=>togglePinItem(r.sectionKey, r.id)} title="Pin to top">{(pinnedItems[r.sectionKey] || []).includes(r.id) ? 'Pinned' : 'Pin'}</button></div>}<span className={`pill ${itemPriority.toLowerCase()}`}>{itemPriority || 'No PMR'}</span></div>
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
            <label className="passCandidateToggle"><input type="checkbox" checked={r.answer.passCandidate} onChange={e=>update(r.id,{passCandidate:e.target.checked})}/><span><strong>PASS Candidate</strong><small>Ongoing care after PMR — not urgency or a finding.</small></span></label>
            {r.answer.passCandidate && <div className="passMetaGrid"><label>Target season / window<input value={r.answer.passTargetWindow} onChange={e=>update(r.id,{passTargetWindow:e.target.value})} placeholder="e.g., Fall before heating season"/></label><label>Suggested cadence<select value={r.answer.passCadence} onChange={e=>update(r.id,{passCadence:e.target.value})}>{PASS_CADENCE.map(x=><option key={x}>{x}</option>)}</select></label><label>Responsible resource / trade<select value={r.answer.passResource} onChange={e=>update(r.id,{passResource:e.target.value})}>{PASS_RESOURCES.map(x=><option key={x}>{x}</option>)}</select></label><label>Follow-up status<select value={r.answer.passFollowUpStatus} onChange={e=>update(r.id,{passFollowUpStatus:e.target.value})}>{PASS_FOLLOW_UP_STATUSES.map(x=><option key={x}>{x}</option>)}</select></label><label className="passInternalNote">Internal THA note<input value={r.answer.passNote} onChange={e=>update(r.id,{passNote:e.target.value})} placeholder="Internal planning note; not urgency language"/></label></div>}
            <label className="notes">Notes for PMR detail<textarea value={r.answer.notes} onChange={e=>update(r.id,{notes:e.target.value})} placeholder="What do I see? What would I suggest? What needs confirmation? These notes sharpen the PMR language."/></label>
            <div className="photoBox"><Camera size={18}/><strong>Photo Capture:</strong><label className="uploadInline"><Upload size={16}/> Upload<input type="file" accept="image/*" multiple onChange={e=>{addPhotos(r.id, e.target.files); e.target.value='';}}/></label><span>{photoSummary(r.answer.photos)}</span></div>
            {r.answer.photos.length > 0 && <div className="thumbGrid">{r.answer.photos.map(photo => { const displaySrc = photoDisplaySrc(photo); return <div className="thumbCard" key={photo.id}><div className="thumb">{displaySrc ? <img src={displaySrc} alt={`${photo.label} for ${r.item}`}/> : <Image size={24}/>}</div><select value={photo.label} onChange={e=>updatePhoto(r.id, photo.id, {label:e.target.value})}>{PHOTO_LABELS.map(label=><option key={label}>{label}</option>)}</select><span title={photo.name}>{photo.name}</span><span className={`photoStatusBadge ${photo.uploadStatus || PHOTO_UPLOAD_STATUS.LOCAL}`}>{photoStatusLabel(photo)}</span><span className="photoStatusText">{photoStatusMessage(photo, Boolean(driveToken))}</span><button onClick={()=>removePhoto(r.id, photo.id)} aria-label="Remove photo"><X size={14}/></button></div>; })}</div>}
            {r.catchAll && <div className="reassignBox"><label>Reassign Catch-All Notes<select value={r.answer.reassignTo} onChange={e=>update(r.id,{reassignTo:e.target.value})}><option value="">Choose Section-Item</option>{rows.filter(target=>target.sectionKey===r.sectionKey && !target.catchAll).map(target=><option key={target.id} value={target.id}>{target.item}</option>)}</select></label><button onClick={()=>reassignCatchAll(r.id)} disabled={!r.answer.reassignTo}>Reassign</button></div>}
            <div className="drivePath"><FolderOpen size={16}/> {drivePath(client.name, client.date, r.roomType || r.room, r.item, r.roomName || r.room)}</div>
          </div>}
        </div>})}
      </section>
    </main>}
    {view === 'pmr' && <PMR client={client} intake={intake} pmr={pmr} counts={counts} quickHits={quickHits} passCareCandidates={passCareCandidates} passCareOutlook={passCareOutlook} passReview={passReview} onPassReviewChange={updatePassReview} unreviewedIntakeRows={unreviewedIntakeRows} reviewedIntakeNotes={reviewedIntakeNotes} />}
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
      <div><span>Intake ID</span><strong>{intake.intakeId || 'Not generated yet'}</strong></div>
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
        <CategoryLabel category="Exterior">Last exterior paint / stain<input value={intake.paintStain || ''} onChange={e=>updateIntake({paintStain:e.target.value})}/></CategoryLabel>
      </div></section>
      <section className="intakeSubsection"><h3>Safety / Pests / Fireplaces</h3><div className="intakeGrid">
        <CategoryLabel category="Pest">Pest activity or history<input value={intake.pests || ''} onChange={e=>updateIntake({pests:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Safety">Fire extinguishers: quantity, age, location<input value={intake.fireExtinguishers || ''} onChange={e=>updateIntake({fireExtinguishers:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Safety">Smoke / CO detector age or replacement<input value={intake.smokeCO || ''} onChange={e=>updateIntake({smokeCO:e.target.value})}/></CategoryLabel>
        <CategoryLabel category="Roofing">Chimney inspection / cleaning<input value={intake.chimney || ''} onChange={e=>updateIntake({chimney:e.target.value})}/></CategoryLabel>
      </div></section>
      <section className="intakeSubsection"><h3>Product info / documents / unknowns</h3><div className="intakeGrid">
        <CategoryLabel category="Surfaces">Product / color labels to consolidate<input value={intake.productsColors || ''} onChange={e=>updateIntake({productsColors:e.target.value})}/></CategoryLabel>
      </div></section>
      <section className="intakeSubsection"><h3>Additional THA notes</h3><label className="notes">Other known concerns / items to pay attention to<textarea value={intake.additionalConcerns || ''} onChange={e=>updateIntake({additionalConcerns:e.target.value})}/></label></section>
    </details>
  </main>
}

function PMR({client, intake, pmr, counts, quickHits, passCareOutlook = [], passCareCandidates = passCareOutlook, passReview = {}, onPassReviewChange = () => {}, unreviewedIntakeRows = [], reviewedIntakeNotes = []}) {
  const summary = intakeSummary(intake);
  const visiblePassIds = new Set(passCareOutlook.map(item => item.id));
  const tradeItems = pmr.filter(r => !['Handyman','Safety'].includes(r.answer.trade));
  return <main className="pmr">
    <div className="pmrHeader"><div><THALogo variant="full"/><p className="eyebrow">PMR — Findings & Next Steps</p><h1>{client.address}</h1><p>{client.name} · {client.date} · Intake → HTC → PMR → PASS</p></div><div className="compassCard"><Mountain size={48}/><span>You Navigate, We Drive</span></div></div>
    {unreviewedIntakeRows.length > 0 && <div className="pmrWarning"><AlertTriangle size={18}/><span>Draft warning: {unreviewedIntakeRows.length} Intake Follow-Up row{unreviewedIntakeRows.length === 1 ? '' : 's'} remain Not Reviewed. Use Print Final PMR only after every follow-up is reviewed.</span></div>}
    <section className="pmrBlock intakeSummary"><h2><Home size={20}/> Homeowner Goals & Preferences</h2><div className="findGrid"><p><strong>Primary priorities:</strong><br/>{summary.priorities}</p><p><strong>Preferred pace:</strong><br/>{summary.pace}</p><p><strong>Budget mindset:</strong><br/>{summary.budget}</p><p><strong>Decision style:</strong><br/>{summary.decision}</p><p><strong>Homeowner notes:</strong><br/>{summary.notes}</p><p><strong>Workflow:</strong><br/>Intake captures context. HTC verifies and triages. PMR documents findings and next steps. PASS tracks routine continued care and stays separate from PMR counts.</p></div></section>
    <section className="pmrBlock intakeSummary"><h2>Context From Intake</h2><div className="findGrid"><p><strong>Systems history:</strong><br/>Panel: {intake.electricalPanel || 'Unknown'}<br/>Water shut-off: {intake.waterShutoff || 'Unknown'}<br/>Furnace: {intake.hvacService || 'Unknown'}<br/>A/C: {intake.hvacAcService || 'Unknown'}</p><p><strong>Known issues:</strong><br/>{intake.plumbingHistory || 'No plumbing history recorded.'}<br/>{intake.comfort || ''}</p><p><strong>Exterior history:</strong><br/>Roof: {intake.roofAge || 'Unknown'}<br/>Drainage: {intake.drainagePooling || 'Unknown'}<br/>Paint/Stain: {intake.paintStain || 'Unknown'}</p><p><strong>Safety history:</strong><br/>Smoke/CO: {intake.smokeCO || 'Unknown'}<br/>Fire extinguishers: {intake.fireExtinguishers || 'Unknown'}</p><p><strong>Misc. history:</strong><br/>Pest: {intake.pests || 'Unknown'}<br/>Chimney: {intake.chimney || 'Unknown'}</p><p><strong>Do-not-overlook items:</strong><br/>{intake.doNotOverlook || 'No do-not-overlook items recorded.'}</p></div></section>
    <section className="snapshot"><h2><Home size={20}/> Home Health Snapshot</h2><div className="stat high"><strong>{counts.high}</strong><span><HealthDot level="high"/> Immediate</span></div><div className="stat med"><strong>{counts.med}</strong><span><HealthDot level="medium"/> Near‑Term</span></div><div className="stat low"><strong>{counts.low}</strong><span><HealthDot level="low"/> Monitor</span></div></section><section className="guideGrid"><div className="guideCard actionCertaintyGuide"><h2><ClipboardList size={20}/> Action Certainty Guide</h2>{ACTION_CERTAINTY_GUIDE.map(item => <p key={item.label} className={`actionGuideItem ${actionCertaintyClass(item.label)}`}><CertaintyDot label={item.label}/> <strong>{item.label}</strong><br/><span>{item.body}</span></p>)}</div><div className="guideCard timeGuideCard"><h2><Clock3 size={20}/> Time / Investment Guide</h2>{PMR_TIME_INVESTMENT_GUIDE.map(item => <p key={item.key} className={`timeGuideItem ${item.key}`}><span className="timeGuideIcon" aria-hidden="true">{item.icon}</span><strong>{item.label}</strong><span>{item.display.replace(item.label, '')}</span></p>)}</div></section><section className="pmrBlock"><h2><Wrench/> Handy Next Steps</h2><p className="lede">Quick, practical items that may fit a grouped Handy Services visit, subject to confirmation and scheduling.</p><ul className="checkList">{quickHits.map(r=><li key={r.id}><TradeIcon trade={r.answer.trade}/> <span><strong>{r.room}: {r.item}</strong><br/><small>{displayTradeLabel(r.answer.trade)} · {r.answer.effort}</small></span><CertaintyDot label={actionCertaintyFor(r.answer)}/></li>)}</ul></section>
    <section className="pmrBlock"><h2><AlertTriangle/> PMR Findings</h2><p className="lede">Reviewed PMR findings are listed here with homeowner-ready next steps. PASS continued-care items are not included in these counts.</p>{pmr.map(r => {
      const certainty = actionCertaintyCopy(r);
      return <article className="finding" key={r.id}>
        <div className="findTop"><TradeIcon trade={r.answer.trade} big/><div><h3>{r.roomName || r.room} — {r.item}</h3><p>{r.zone} · {r.answer.status} · {displayTradeLabel(r.answer.trade)} · {certainty.label}</p></div><span className="certaintyLabel"><CertaintyDot label={certainty.label}/>{certainty.label}</span><span className={`pill ${priority(r.answer.status).toLowerCase()}`}>{priority(r.answer.status)}</span></div>
        <div className="findGrid"><p><strong>What we saw:</strong><br/>{r.answer.notes || 'No additional notes recorded yet.'}</p><p><strong>Why it matters:</strong><br/>{r.why}</p><p><strong>{certainty.title}:</strong><br/>{certainty.body}</p><p><strong>Next step language:</strong><br/>{certainty.next}</p><p><strong>Suggested timing:</strong><br/>{timingFor(r, r.answer.status)} · Homeowner pace: {r.answer.pref}</p><p><strong>Approx. time:</strong><br/>{r.answer.effort} · {displayTradeLabel(r.answer.trade)} · Action certainty: {certainty.label}</p><p><strong>How homeowner intake affects this:</strong><br/>{intakeInfluence(r, intake)}</p><p><strong>Photos / reference:</strong><br/>{photoSummary(r.answer.photos)}</p></div>
      </article>
    })}</section>
    <section className="pmrBlock"><h2><HardHat/> Trade Items</h2><p className="lede">Licensed trade or specialist items are separated here for scope review, pricing, and scheduling clarity.</p>{tradeItems.length ? tradeItems.map(r=><p className="tradeLine" key={`trade-${r.id}`}><span><TradeIcon trade={r.answer.trade}/> <strong>{r.roomName || r.room} — {r.item}</strong><br/><small>{displayTradeLabel(r.answer.trade)} · {r.answer.effort} · {actionCertaintyFor(r.answer)}</small></span><strong>{priority(r.answer.status)}</strong></p>) : <p className="lede">No trade items recorded.</p>}</section>
    {reviewedIntakeNotes.length > 0 && <section className="pmrBlock"><h2>Intake Follow-Up Notes</h2><ul className="checkList">{reviewedIntakeNotes.map(r=><li key={`note-${r.id}`}><span className="sourceBadge">Intake Follow-Up</span><span><strong>{r.roomName || r.room} — {r.item}</strong><br/><small>{r.answer.reviewStatus} · {r.intakeFieldLabel}: {r.intakeValue}</small></span></li>)}</ul></section>}
    <section className="pmrBlock passOutlook"><h2><CalendarDays/> PASS Continued Care Outlook</h2><p className="lede">PASS is ongoing home-care planning, not an urgent repair list. These items stay separate from PMR findings, priority counts, and defects. Use the review controls to include, hide, or tune homeowner-facing wording before export.</p><div className="passReviewPanel noPrint"><h3>THA PASS review before homeowner export</h3><p>Manual PASS candidates stay included by default. Generated continued-care items are also included by default and can be hidden here.</p><div className="passReviewGrid">{passCareCandidates.map(item => {
      const review = passReview[item.id] || {};
      const included = review.included !== false;
      const reason = review.reason ?? item.reason;
      const reviewedTargetWindow = review.targetWindow ?? (review.suggestedWindow ? passSuggestedWindowText(review.suggestedWindow) : undefined);
      const targetWindow = reviewedTargetWindow ?? item.targetWindow ?? passSuggestedWindowText(item.suggestedWindow);
      const cadence = review.cadence ?? item.cadence ?? 'As Needed';
      const resource = review.resource ?? item.resource;
      const followUpStatus = passPlanningStatusText(review.followUpStatus ?? item.followUpStatus);
      const internalNote = review.internalNote ?? item.internalNote ?? '';
      return <article className={`passReviewCard ${included ? 'included' : 'hidden'}`} key={`review-${item.id}`}><div className="passReviewTop"><label className="includeToggle"><input type="checkbox" checked={included} onChange={e=>onPassReviewChange(item.id, { included: e.target.checked })}/><span><strong>{included ? 'Include' : 'Hidden from export'}</strong><small>{item.source === 'manual' ? 'Manual PASS candidate' : 'Generated continued-care item'}</small></span></label><span className="sourceBadge">{item.source === 'manual' ? 'Manual' : 'Generated'}</span></div><h4>{item.careItem}</h4><label>Homeowner-facing reason<textarea value={reason} onChange={e=>onPassReviewChange(item.id, { reason: e.target.value })}/></label><label>Target season / window<input value={targetWindow} onChange={e=>onPassReviewChange(item.id, { targetWindow: e.target.value, suggestedWindow: `Suggested window: ${e.target.value}` })}/></label><label>Suggested cadence<select value={cadence} onChange={e=>onPassReviewChange(item.id, { cadence: e.target.value })}>{PASS_CADENCE.map(option=><option key={option} value={option}>{option}</option>)}</select></label><label>Responsible resource / trade<select value={resource} onChange={e=>onPassReviewChange(item.id, { resource: e.target.value })}>{PASS_RESOURCES.map(option=><option key={option} value={option}>{option}</option>)}</select></label><label>Follow-up status<select value={followUpStatus} onChange={e=>onPassReviewChange(item.id, { followUpStatus: e.target.value })}>{PASS_FOLLOW_UP_STATUSES.map(option=><option key={option} value={option}>{option}</option>)}</select></label><label className="passInternalNote">Internal THA note<textarea value={internalNote} onChange={e=>onPassReviewChange(item.id, { internalNote: e.target.value })} placeholder="Internal planning note; not shown in PMR export."/></label></article>
    })}</div></div><div className="passOutlookGrid">{passCareOutlook.map(item=><article className="passOutlookCard" key={item.id}><div className="findTop"><TradeIcon trade={item.rule?.trade || item.row?.answer?.trade || item.resource}/><div><h3>{item.careItem}</h3><p>{item.resource} · Care planning · {passPlanningStatusText(item.followUpStatus)}</p></div></div><div className="findGrid"><p><strong>Homeowner-facing reason:</strong><br/>{item.reason}</p><p><strong>Follow-up planning:</strong><br/>{passHomeownerFollowUpLanguage(item)}</p><p><strong>Target season / window:</strong><br/>{passSuggestedWindowText(item.targetWindow || item.suggestedWindow)}</p><p><strong>Suggested cadence:</strong><br/>{item.cadence || 'As Needed'}</p><p><strong>Responsible resource / trade:</strong><br/>{item.resource}</p></div></article>)}</div>{passCareCandidates.length > 0 && passCareOutlook.length === 0 && <p className="lede">All PASS continued-care items are hidden from the homeowner export for this draft.</p>}{passCareCandidates.some(item => !visiblePassIds.has(item.id)) && <p className="passHiddenNote noPrint">Hidden PASS items stay out of PMR export and Drive package.</p>}</section>
    <footer className="promise"><ShieldCheck/> You don’t hire trades — you hire The Homeowner Advocate. One point of contact. Every step. Every task.</footer>
  </main>
}

function Metrics({rows, pmr, quickHits, pass}) {
  const byTrade = Object.entries(pmr.reduce((acc,r)=>{acc[r.answer.trade]=(acc[r.answer.trade]||0)+1; return acc;},{}));
  const byCertainty = Object.entries(pmr.reduce((acc,r)=>{const key=actionCertaintyFor(r.answer); acc[key]=(acc[key]||0)+1; return acc;},{}));
  return <main className="metrics"><h1>Internal Metrics / Future PMR Intelligence</h1><div className="metricGrid"><div><strong>{pmr.length}</strong><span>PMR findings</span></div><div><strong>{quickHits.length}</strong><span>Quick-hit tasks</span></div><div><strong>{pass.length}</strong><span>PASS candidates</span></div><div><strong>{rows.filter(r=>r.answer.effort !== 'Unknown').length}</strong><span>Items with time data</span></div></div><section className="pmrBlock"><h2>Findings by Trade / Resource</h2>{byTrade.map(([k,v])=><p key={k} className="tradeLine"><span><TradeIcon trade={k}/> {displayTradeLabel(k)}</span><strong>{v}</strong></p>)}</section><section className="pmrBlock"><h2>Action Certainty Breakdown</h2>{byCertainty.map(([k,v])=><p key={k} className="tradeLine"><span>{k}</span><strong>{v}</strong></p>)}</section><section className="pmrBlock"><h2>Time Tracking Note</h2><p>This app captures the field estimate now. Next build should add “Actual Time Spent” after work completion, so THA can compare estimated vs. actual and improve future PMRs, pricing, scheduling, and batching. Nerdy? Yes. Useful? Very.</p></section></main>
}

createRoot(document.getElementById('root')).render(<App/>);
