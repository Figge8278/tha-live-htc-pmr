import React, { useMemo, useState, useEffect } from 'react';
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
  Electrical: { label: 'Electrical', slug: 'electrical' },
  Plumbing: { label: 'Plumbing', slug: 'plumbing' },
  HVAC: { label: 'HVAC', slug: 'hvac' },
  Roofing: { label: 'Roofing', slug: 'roofing' },
  Drainage: { label: 'Drainage', slug: 'drainage' },
  Openings: { label: 'Openings', slug: 'openings' },
  Exterior: { label: 'Exterior', slug: 'exterior' },
  Pest: { label: 'Pest', slug: 'pest' },
  Safety: { label: 'Safety', slug: 'safety' },
  Surfaces: { label: 'Surfaces', slug: 'surfaces' },
  Appliances: { label: 'Appliances', slug: 'appliances' },
  'Handy / Carpentry': { label: 'Handy / Carpentry', slug: 'handy-carpentry' },
  'General / Misc': { label: 'General / Misc', slug: 'general-misc' }
};

function categoryInfo(category = 'General / Misc') {
  return CATEGORY_META[category] || CATEGORY_META['General / Misc'];
}

function categoryForChecklistItem(item = {}) {
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
  return <span className={`categoryBadge category-${meta.slug}`} aria-label={`${meta.label} category`}>{meta.label}</span>;
}

function CategoryLabel({category, children}) {
  const meta = categoryInfo(category);
  return <label className={`categoryQuestion category-${meta.slug}`}>{children}<CategoryBadge category={meta.label}/></label>;
}

const STATUS = ['Good','Monitor','Needs Attention','Immediate Concern','Unknown'];
const EFFORT = ['Unknown','15 min','30 min','45–60 min','1–2 hrs','Half day','Full day','Multi-day / trade scope'];
const ACTION_CERTAINTY = ['Clear Path','Likely Path','Needs Discovery'];
const PREFS = ['Do now','Plan soon','Budget for later','Watchlist only'];
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
const GOOGLE_CLIENT_ID_KEY = 'tha-google-client-id';
const SECTION_ORDER_KEY = 'tha-section-order';
const ITEM_ORDER_KEY = 'tha-item-order';
const PINNED_ITEMS_KEY = 'tha-pinned-items';
const ROOM_CAPTURE_KEY = 'tha-room-capture';
const WALKTHROUGH_SESSIONS_KEY = 'tha-walkthrough-sessions';
const CURRENT_WALKTHROUGH_ID_KEY = 'tha-current-walkthrough-id';
const TRADE_OPTIONS = [...Object.keys(ICONS), 'Carpentry', 'General Contractor', 'Design', 'Flooring', 'Landscape', 'Review / Assign Later'];

const INTAKE_DEFAULTS = {
  priorities: ['Safety','Function'], pace: 'Plan soon', budgetStyle: 'Balanced', decisionStyle: 'Wants options',
  notes: 'Homeowners want a clear plan, staged priorities, and no pressure to do everything at once.',
  electricalPanel: 'Garage wall - verify access and labeling during walkthrough.', electricalUpdates: 'Unknown / ask about recent panel or fixture work.',
  waterShutoff: 'Mechanical room - verify and photo label.', plumbingHistory: 'Slow kitchen drain reported; no known active leak.', waterHeater: 'Last flush unknown.', sewerIrrigation: 'Unknown sewer scope; irrigation service likely seasonal.',
  hvacFilter: 'Filter replacement date unknown.', hvacService: 'Furnace service likely overdue; A/C service unknown.', comfort: 'No major comfort complaints noted yet.',
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
  return `THA Drive / Clients / ${clean(client)} / ${date || 'Walkthrough'} / Photos / ${clean(room)} / ${clean(roomName)} / ${clean(item)}`;
}
function cleanDriveName(value) {
  return (value || 'Untitled').replace(/[\\/:*?"<>|]/g, '-').trim().slice(0, 90) || 'Untitled';
}
function photoList(answer) {
  if (Array.isArray(answer?.photos)) return answer.photos;
  return Object.entries(answer?.photos || {}).filter(([, val]) => val).map(([key]) => ({
    id: key,
    label: key === 'close' ? 'Close-up' : key === 'detail' ? 'Detail' : 'Context',
    name: answer?.photoRef || key,
    dataUrl: ''
  }));
}
function normalizeAnswer(answer, item) {
  return {
    status: answer?.status || 'Good',
    trade: answer?.trade || item.trade,
    effort: answer?.effort || item.effort,
    actionCertainty: actionCertaintyFor(answer || {}),
    pref: answer?.pref || 'Plan soon',
    notes: answer?.notes || '',
    photos: photoList(answer),
    photoRef: answer?.photoRef || '',
    reassignTo: answer?.reassignTo || '',
    isDiscovery: typeof answer?.isDiscovery === 'boolean' ? answer.isDiscovery : false
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
function queueDrivePayload(payload) {
  const queue = safeJsonParse(localStorage.getItem(DRIVE_QUEUE_KEY), []);
  const next = [...queue, { id: Date.now(), createdAt: new Date().toISOString(), payload }];
  localStorage.setItem(DRIVE_QUEUE_KEY, JSON.stringify(next));
  return next.length;
}
function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
function requestDriveToken(clientId) {
  return new Promise((resolve, reject) => {
    if (!clientId) {
      reject(new Error('Google OAuth Client ID is required.'));
      return;
    }
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: response => {
        if (response.error) reject(new Error(response.error));
        else resolve(response.access_token);
      }
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}
async function driveFetch(accessToken, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken}`, ...(options.headers || {}) }
  });
  if (!response.ok) throw new Error(await response.text());
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
  return driveFetch(accessToken, 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body
  });
}
function uploadDriveJson(accessToken, folderId, name, data) {
  return uploadDriveBlob(accessToken, folderId, name, new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'application/json');
}
function buildDrivePayload({ walkthroughName = '', client, intake, rows, pmr, dynamicRooms = [], sections = [], sectionOrderState = [], itemOrderState = {}, pinnedItems = {}, roomCapture = {} }) {
  return { walkthroughName, client, intake, dynamicRooms, roomCapture, sectionFlow: sections.map((section, index) => ({ order: index + 1, key: section.key, label: section.label, roomType: section.roomType || section.label, roomName: section.roomName || section.label })), sectionOrder: sectionOrderState, itemOrder: itemOrderState, pinnedItems, rows, pmr, exportedAt: new Date().toISOString() };
}
async function uploadDriveBundle(accessToken, payload) {
  const clientFolderName = cleanDriveName(`${payload.client.name || 'Client'} - ${payload.client.address || 'Property Address'}`);
  const dateFolderName = cleanDriveName(payload.client.date || 'Walkthrough Date');
  const rootId = await findOrCreateDriveFolder(accessToken, 'THA Clients');
  const clientId = await findOrCreateDriveFolder(accessToken, clientFolderName, rootId);
  const dateId = await findOrCreateDriveFolder(accessToken, dateFolderName, clientId);
  const intakeId = await findOrCreateDriveFolder(accessToken, 'Intake', dateId);
  const htcId = await findOrCreateDriveFolder(accessToken, 'HTC Walkthrough', dateId);
  const pmrId = await findOrCreateDriveFolder(accessToken, 'PMR Reports', dateId);
  const photosId = await findOrCreateDriveFolder(accessToken, 'Photos', dateId);
  await uploadDriveJson(accessToken, intakeId, 'intake.json', { client: payload.client, intake: payload.intake });
  await uploadDriveJson(accessToken, htcId, 'htc-walkthrough.json', { client: payload.client, roomCapture: payload.roomCapture || {}, rows: payload.rows });
  await uploadDriveJson(accessToken, pmrId, 'pmr-data.json', { client: payload.client, intake: payload.intake, pmr: payload.pmr });
  const sectionFlow = payload.sectionFlow || [];
  const sectionOrderLookup = Object.fromEntries(sectionFlow.map(section => [section.key, section.order]));
  const sectionLookup = Object.fromEntries(sectionFlow.map(section => [section.key, section]));
  for (const [sectionKey, capture] of Object.entries(payload.roomCapture || {})) {
    const photos = photoList(capture).filter(photo => photo.dataUrl);
    if (!photos.length) continue;
    const section = sectionLookup[sectionKey] || {};
    const roomTypeId = await findOrCreateDriveFolder(accessToken, cleanDriveName(section.roomType || section.label || sectionKey), photosId);
    const orderPrefix = sectionOrderLookup[sectionKey] ? `${String(sectionOrderLookup[sectionKey]).padStart(2, '0')} - ` : '';
    const roomNameId = await findOrCreateDriveFolder(accessToken, cleanDriveName(`${orderPrefix}${section.roomName || section.label || sectionKey}`), roomTypeId);
    const overviewId = await findOrCreateDriveFolder(accessToken, 'Room Overview', roomNameId);
    for (const [index, photo] of photos.entries()) {
      const blob = dataUrlToBlob(photo.dataUrl);
      const extension = blob.type.split('/')[1] || 'jpg';
      await uploadDriveBlob(accessToken, overviewId, `${String(index + 1).padStart(2, '0')} - ${photo.label || 'Overview'} - ${cleanDriveName(photo.name)}.${extension}`, blob, blob.type);
    }
  }
  for (const row of payload.rows) {
    const photos = photoList(row.answer).filter(photo => photo.dataUrl);
    if (!photos.length) continue;
    const roomTypeId = await findOrCreateDriveFolder(accessToken, cleanDriveName(row.roomType || row.room), photosId);
    const orderPrefix = sectionOrderLookup[row.sectionKey] ? `${String(sectionOrderLookup[row.sectionKey]).padStart(2, '0')} - ` : '';
    const roomNameId = await findOrCreateDriveFolder(accessToken, cleanDriveName(`${orderPrefix}${row.roomName || row.room}`), roomTypeId);
    const itemId = await findOrCreateDriveFolder(accessToken, cleanDriveName(row.item), roomNameId);
    for (const [index, photo] of photos.entries()) {
      const blob = dataUrlToBlob(photo.dataUrl);
      const extension = blob.type.split('/')[1] || 'jpg';
      await uploadDriveBlob(accessToken, itemId, `${String(index + 1).padStart(2, '0')} - ${photo.label} - ${cleanDriveName(photo.name)}.${extension}`, blob, blob.type);
    }
  }
}

function safeJsonParse(value, fallback) {
  try {
    const parsed = JSON.parse(value || 'null');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
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
    client: safeJsonParse(localStorage.getItem('tha-client'), { name: 'Christine & Matt', address: 'Sample Home', date: '2026-04 Walkthrough' }),
    answers: safeJsonParse(localStorage.getItem('tha-answers'), null) || sampleAnswers,
    intake: safeJsonParse(localStorage.getItem('tha-intake'), null) || INTAKE_DEFAULTS,
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
  const [driveClientId, setDriveClientId] = useState(() => localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || '');
  const [driveMeta, setDriveMeta] = useState(() => safeJsonParse(localStorage.getItem(DRIVE_META_KEY), null) || { lastSaved: '', lastError: '' });
  const [pendingCount, setPendingCount] = useState(() => safeJsonParse(localStorage.getItem(DRIVE_QUEUE_KEY), []).length);
  const [driveBusy, setDriveBusy] = useState(false);
  const [sectionOrderState, setSectionOrderState] = useState(initialState.data.sectionOrder);
  const [itemOrderState, setItemOrderState] = useState(initialState.data.itemOrder);
  const [pinnedItems, setPinnedItems] = useState(initialState.data.pinnedItems);
  const [roomCapture, setRoomCapture] = useState(initialState.data.roomCapture);
  const [roomItemFormOpen, setRoomItemFormOpen] = useState(false);
  const [roomItemDraft, setRoomItemDraft] = useState(EMPTY_ROOM_ITEM_DRAFT);
  const [dragSectionKey, setDragSectionKey] = useState('');
  useEffect(()=>localStorage.setItem('tha-client', JSON.stringify(client)), [client]);
  useEffect(()=>localStorage.setItem('tha-answers', JSON.stringify(answers)), [answers]);
  useEffect(()=>localStorage.setItem('tha-intake', JSON.stringify(intake)), [intake]);
  useEffect(()=>localStorage.setItem(DYNAMIC_ROOMS_KEY, JSON.stringify(dynamicRooms)), [dynamicRooms]);
  useEffect(()=>localStorage.setItem(GOOGLE_CLIENT_ID_KEY, driveClientId), [driveClientId]);
  useEffect(()=>localStorage.setItem(DRIVE_META_KEY, JSON.stringify(driveMeta)), [driveMeta]);
  useEffect(()=>localStorage.setItem(SECTION_ORDER_KEY, JSON.stringify(sectionOrderState)), [sectionOrderState]);
  useEffect(()=>localStorage.setItem(ITEM_ORDER_KEY, JSON.stringify(itemOrderState)), [itemOrderState]);
  useEffect(()=>localStorage.setItem(PINNED_ITEMS_KEY, JSON.stringify(pinnedItems)), [pinnedItems]);
  useEffect(()=>localStorage.setItem(ROOM_CAPTURE_KEY, JSON.stringify(roomCapture)), [roomCapture]);
  useEffect(()=>localStorage.setItem(WALKTHROUGH_SESSIONS_KEY, JSON.stringify(savedSessions)), [savedSessions]);
  useEffect(()=>{
    if (activeWalkthroughId) localStorage.setItem(CURRENT_WALKTHROUGH_ID_KEY, activeWalkthroughId);
    else localStorage.removeItem(CURRENT_WALKTHROUGH_ID_KEY);
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
  const sections = useMemo(() => orderedSectionList(baseSections.map(section => ({
    ...section,
    rows: orderSectionRows(section.rows, itemOrderState[section.key], pinnedItems[section.key] || [])
  })), sectionOrderState), [baseSections, sectionOrderState, itemOrderState, pinnedItems]);
  const rooms = sections;
  const checklistItems = useMemo(() => sections.flatMap(section => section.rows), [sections]);
  const itemById = useMemo(() => Object.fromEntries(checklistItems.map(item => [item.id, item])), [checklistItems]);
  const rows = checklistItems.map(item => ({...item, answer: normalizeAnswer(answers[item.id], item)}));
  useEffect(() => {
    if (!sections.some(section => section.key === activeRoom)) setActiveRoom(sections[0]?.key || '');
  }, [sections, activeRoom]);
  const pmr = rows.filter(r => includePMR(r.answer));
  const counts = { high: pmr.filter(r=>priority(r.answer.status)==='High').length, med: pmr.filter(r=>priority(r.answer.status)==='Medium').length, low: pmr.filter(r=>priority(r.answer.status)==='Low').length };
  const quickHits = pmr.filter(r => ['Handyman','Safety'].includes(r.answer.trade) && ['15 min','30 min','45–60 min','1–2 hrs'].includes(r.answer.effort));
  const pass = pmr.filter(r => r.pass);
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
  const addPhotos = (id, files) => Array.from(files || []).forEach(file => {
    const reader = new FileReader();
    reader.onload = event => setAnswers(prev => {
      const current = normalizeAnswer(prev[id], itemById[id]);
      return {...prev, [id]: {...current, photos: [...current.photos, {id:`${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`, label:'Context', name:file.name, type:file.type, dataUrl:event.target.result}]}};
    });
    reader.readAsDataURL(file);
  });
  const updatePhoto = (id, photoId, patch) => update(id, {photos: normalizeAnswer(answers[id], itemById[id]).photos.map(photo => photo.id === photoId ? {...photo, ...patch} : photo)});
  const removePhoto = (id, photoId) => update(id, {photos: normalizeAnswer(answers[id], itemById[id]).photos.filter(photo => photo.id !== photoId)});
  const addRoomPhotos = (sectionKey, files) => Array.from(files || []).forEach(file => {
    const reader = new FileReader();
    reader.onload = event => setRoomCapture(prev => {
      const current = {
        status: prev?.[sectionKey]?.status || ROOM_STATUS_OPTIONS[0],
        note: prev?.[sectionKey]?.note || '',
        photos: photoList(prev?.[sectionKey]).map(photo => ({ ...photo, label: photo.label || 'Overview' })),
        items: Array.isArray(prev?.[sectionKey]?.items) ? prev[sectionKey].items : []
      };
      return {
        ...prev,
        [sectionKey]: {
          ...current,
          photos: [...current.photos, { id: `room-${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`, name: file.name, label: 'Overview', type: file.type, dataUrl: event.target.result }]
        }
      };
    });
    reader.readAsDataURL(file);
  });
  const removeRoomPhoto = (sectionKey, photoId) => {
    const current = roomCaptureFor(sectionKey);
    updateRoomCapture(sectionKey, { photos: current.photos.filter(photo => photo.id !== photoId) });
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
  const itemIdsForSection = (sectionKey) => (sections.find(section => section.key === sectionKey)?.rows || []).filter(row => !row.catchAll).map(row => row.id);
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
    const id = activeWalkthroughId || `walkthrough-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const name = walkthroughName.trim() || client.name || client.address || 'Untitled Walkthrough';
    const session = {
      id,
      name,
      updatedAt: new Date().toISOString(),
      data: currentWalkthroughData()
    };
    setSavedSessions(prev => ({ ...prev, [id]: session }));
    setActiveWalkthroughId(id);
    setSelectedWalkthroughId(id);
    setWalkthroughName(name);
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
  const connectDrive = async () => {
    setDriveBusy(true);
    try {
      await loadGoogleIdentityScript();
      const token = await requestDriveToken(driveClientId);
      setDriveToken(token);
      setDriveMeta(meta => ({...meta, lastError:''}));
    } catch (error) {
      setDriveMeta(meta => ({...meta, lastError:error.message || 'Unable to connect Google Drive'}));
    } finally {
      setDriveBusy(false);
    }
  };
  const savedSessionList = Object.values(savedSessions).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const syncDrive = async ({includeDownload=false, retryQueue=false} = {}) => {
    if (includeDownload) downloadJSON();
    const payload = buildDrivePayload({walkthroughName, client, intake, rows, pmr, dynamicRooms, sections, sectionOrderState, itemOrderState, pinnedItems, roomCapture});
    if (!navigator.onLine || !driveToken) {
      const count = queueDrivePayload(payload);
      setPendingCount(count);
      setDriveMeta(meta => ({...meta, lastError:'Pending Drive Sync'}));
      return;
    }
    setDriveBusy(true);
    try {
      if (retryQueue) {
        const queue = safeJsonParse(localStorage.getItem(DRIVE_QUEUE_KEY), []);
        for (const item of queue) await uploadDriveBundle(driveToken, item.payload);
        localStorage.setItem(DRIVE_QUEUE_KEY, '[]');
        setPendingCount(0);
      }
      await uploadDriveBundle(driveToken, payload);
      setDriveMeta({lastSaved:new Date().toLocaleString(), lastError:''});
    } catch (error) {
      const count = queueDrivePayload(payload);
      setPendingCount(count);
      setDriveMeta(meta => ({...meta, lastError:'Pending Drive Sync'}));
    } finally {
      setDriveBusy(false);
    }
  };
  return <div className="app">
    <header className="topbar">
      <div className="brand"><THALogo variant="full"/><div><span>Handy‑Triage Checklist → PMR</span></div></div>
      <nav><button onClick={()=>setView('intake')} className={view==='intake'?'on':''}><Home size={18}/> Intake</button><button onClick={()=>setView('form')} className={view==='form'?'on':''}><ClipboardCheck size={18}/> HTC Form</button><button onClick={()=>setView('pmr')} className={view==='pmr'?'on':''}><FileText size={18}/> PMR Preview</button><button onClick={()=>setView('metrics')} className={view==='metrics'?'on':''}><Clock3 size={18}/> Metrics</button></nav>
    </header>
    <section className="sessionCard noPrint">
      <label>Current Walkthrough Name<input value={walkthroughName} onChange={e=>setWalkthroughName(e.target.value)} placeholder="Name this walkthrough"/></label>
      <button type="button" onClick={startNewWalkthrough}>Start New Blank Walkthrough</button>
      <button type="button" onClick={saveWalkthrough}>Save Working Walkthrough</button>
      <label>Open Saved Walkthrough<select value={selectedWalkthroughId} onChange={e=>openSavedWalkthrough(e.target.value)}><option value="">Choose saved walkthrough</option>{savedSessionList.map(session=><option key={session.id} value={session.id}>{session.name || 'Untitled Walkthrough'}{session.updatedAt ? ` · ${new Date(session.updatedAt).toLocaleString()}` : ''}</option>)}</select></label>
      <button type="button" onClick={deleteSavedWalkthrough} disabled={!selectedWalkthroughId || !savedSessions[selectedWalkthroughId]}>Delete Selected Walkthrough</button>
    </section>
    <section className="clientCard noPrint">
      <label>Client<input value={client.name} onChange={e=>setClient({...client,name:e.target.value})}/></label>
      <label>Address<input value={client.address} onChange={e=>setClient({...client,address:e.target.value})}/></label>
      <label>Walkthrough Folder / Date<input value={client.date} onChange={e=>setClient({...client,date:e.target.value})}/></label>
      <button onClick={()=>syncDrive({includeDownload:true})}><Download size={16}/> Download Walkthrough Backup</button>
      <button onClick={()=>window.print()}><Printer size={16}/> Print / Save Draft PMR</button>
    </section>
    <section className="driveStatus noPrint">
      <label>Google OAuth Client ID<span className="fieldHelp">Requires a Google OAuth Client ID, not a Google Drive folder link.</span><input value={driveClientId} onChange={e=>setDriveClientId(e.target.value)} placeholder="Paste web client ID for Drive upload"/></label>
      <button onClick={connectDrive} disabled={driveBusy}><FolderOpen size={16}/> Connect Google Drive</button>
      <button onClick={()=>syncDrive({retryQueue:true})} disabled={driveBusy || !driveToken}><Upload size={16}/> Save to Drive</button>
      <span className={driveToken ? 'drivePill connected' : 'drivePill'}>{driveToken ? 'Connected' : 'Not connected'}</span>
      <span>Last saved to Drive: {driveMeta.lastSaved || 'Never'}</span>
      <span className={pendingCount ? 'pendingSync on' : 'pendingSync'}>{pendingCount ? `Pending Drive Sync: ${pendingCount}` : 'Pending sync count: 0'}</span>
      <small className="driveSetupNote">Google Drive export is still in setup/testing. Use Download Walkthrough Backup for now.</small>
    </section>
    {view === 'intake' && <IntakeView intake={intake} updateIntake={updateIntake} />}
    {view === 'form' && <main className="grid">
      <aside className="roomNav noPrint"><h3>Walkthrough Sections</h3><div className="addRoomTools">{Object.values(DYNAMIC_ROOM_TYPES).map(type => <button key={type.roomType} onClick={()=>addDynamicRoom(type.roomType)}>{type.addLabel} {type.roomType}</button>)}</div>{rooms.map(r => <div key={r.key} className="sectionNavRow" draggable onDragStart={()=>setDragSectionKey(r.key)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); moveSection(dragSectionKey, r.key); setDragSectionKey('');}} onDragEnd={()=>setDragSectionKey('')}><span className="sectionDragHandle" title="Drag to reorder walkthrough flow">⋮⋮</span><button className={`sectionSelect ${activeRoom===r.key?'active':''}`} onClick={()=>setActiveRoom(r.key)}>{r.label}</button></div>)}<div className="hint"><Camera size={18}/> Prompt: Capture context, close-up, and detail photos. Store by room/item folder path.</div></aside>
      <section className="formPanel">
        <h1>{rooms.find(r=>r.key===activeRoom)?.label || activeRoom} HTC</h1><div className="roomCaptureShell"><div className="roomCaptureTop"><label>Overall Room Status<select value={roomCaptureFor(activeRoom).status} onChange={e=>updateRoomCapture(activeRoom,{status:e.target.value})}>{ROOM_STATUS_OPTIONS.map(x=><option key={x}>{x}</option>)}</select></label><button type="button" onClick={openRoomItemForm}>Add Item</button></div><span className="roomCaptureHelp">Add anything that needs tracking beyond ‘looks good.’</span>{roomItemFormOpen && <div className="roomItemForm"><div className="inputs roomItemInputs"><label>Item title<input value={roomItemDraft.title} onChange={e=>updateRoomItemDraft({title:e.target.value})} placeholder="e.g., Loose towel bar" autoFocus/></label><label>Item bucket/type<select value={roomItemDraft.bucket} onChange={e=>updateRoomItemDraft({bucket:e.target.value})}>{ROOM_ITEM_BUCKETS.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div><label className="discoveryCheck"><input type="checkbox" checked={roomItemDraft.isDiscovery} onChange={e=>updateRoomItemDraft({isDiscovery:e.target.checked})}/><span><strong>Discovery</strong><small>Unexpected, hidden, unusual, or out of the ordinary.</small></span></label><label className="notes">Notes<textarea value={roomItemDraft.notes} onChange={e=>updateRoomItemDraft({notes:e.target.value})} placeholder="Add room-level context, next step, or follow-up note."/></label><div className="roomItemActions"><button type="button" onClick={saveRoomItem} disabled={!roomItemDraft.title.trim()}>Save</button><button type="button" onClick={cancelRoomItemForm}>Cancel</button></div></div>}<label className="notes">Room Note / Voice Transcript<textarea value={roomCaptureFor(activeRoom).note} onChange={e=>updateRoomCapture(activeRoom,{note:e.target.value})} placeholder="Capture room-level context, voice transcript, or summary notes for this space."/></label><div className="roomPhotoBox"><div className="photoBox"><Camera size={18}/><strong>Room Overview Photos:</strong><label className="uploadInline"><Upload size={16}/> Add Room Overview Photo<input type="file" accept="image/*" multiple onChange={e=>{addRoomPhotos(activeRoom, e.target.files); e.target.value='';}}/></label><span>{photoSummary(roomCaptureFor(activeRoom).photos, { emptyText: 'No room overview photos attached yet', labels: ROOM_PHOTO_LABELS })}</span></div>{roomCaptureFor(activeRoom).photos.length > 0 && <div className="thumbGrid roomThumbGrid">{roomCaptureFor(activeRoom).photos.map(photo => <div className="thumbCard" key={photo.id}><div className="thumb">{photo.dataUrl ? <img src={photo.dataUrl} alt={`Overview for ${rooms.find(room=>room.key===activeRoom)?.label || activeRoom}`}/> : <Image size={24}/>}</div><span>Overview</span><span title={photo.name}>{photo.name}</span><button onClick={()=>removeRoomPhoto(activeRoom, photo.id)} aria-label="Remove room overview photo"><X size={14}/></button></div>)}</div>}</div><div className="smartRoomPrompt"><h3>Smart Room Prompt</h3><div className="smartRoomGrid">{SMART_ROOM_PROMPTS.map(group => <p key={group.group}><strong>{group.group}:</strong> {group.prompt}</p>)}</div></div><div className="roomItemsPlaceholder"><h3>Items list for this room</h3>{roomCaptureFor(activeRoom).items.length > 0 ? <ul className="roomItemList">{roomCaptureFor(activeRoom).items.map(item=><li key={item.id} className="roomItemRow"><div><strong>{item.title}</strong><span>{roomItemBucketLabel(item.bucket)}{item.isDiscovery ? ' · Discovery' : ''}</span>{item.notes && <p>{item.notes}</p>}</div><button type="button" onClick={()=>removeRoomItem(activeRoom, item.id)} aria-label={`Remove ${item.title}`}><X size={14}/> Remove</button></li>)}</ul> : <p>No room-level items added yet.</p>}{rows.filter(r=>r.sectionKey===activeRoom && includePMR(r.answer)).length > 0 && <><h4>Checklist items currently flagged</h4><ul>{rows.filter(r=>r.sectionKey===activeRoom && includePMR(r.answer)).slice(0,5).map(r=><li key={`placeholder-${r.id}`}>{r.item} · {r.answer.status}</li>)}</ul></>}</div></div><p className="lede">Fuller data capture: status, action certainty, suggested trade, time, notes, and photo references.</p>
        {rows.filter(r=>r.sectionKey===activeRoom).map(r => {
          const category = categoryForChecklistItem(r);
          const meta = categoryInfo(category);
          return <div className={`itemCard categoryCard category-${meta.slug}`} key={r.id}>
          <div className="itemHead"><span className="tradeIcon">{ICONS[r.answer.trade] || ICONS[r.trade] || '🔎'}</span><div><div className="itemTitleLine"><h2>{r.item}</h2><CategoryBadge category={category}/></div><p>{r.zone} · Suggested: {displayTradeLabel(r.trade)}</p></div>{!r.catchAll && <div className="itemOrderTools"><button onClick={()=>moveItem(r.sectionKey, r.id, -1)} title="Move item up">↑</button><button onClick={()=>moveItem(r.sectionKey, r.id, 1)} title="Move item down">↓</button><button onClick={()=>togglePinItem(r.sectionKey, r.id)} title="Pin to top">{(pinnedItems[r.sectionKey] || []).includes(r.id) ? 'Pinned' : 'Pin'}</button></div>}<span className={`pill ${priority(r.answer.status).toLowerCase()}`}>{priority(r.answer.status) || 'No PMR'}</span></div>
          <div className="prompt"><Search size={16}/><strong>Prompt:</strong> {r.prompt}</div>
          <div className="inputs">
            <label>Status<select value={r.answer.status} onChange={e=>update(r.id,{status:e.target.value})}>{STATUS.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Action Certainty<select value={actionCertaintyFor(r.answer)} onChange={e=>update(r.id,{actionCertainty:e.target.value})}>{ACTION_CERTAINTY.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Suggested Trade / Resource<select value={r.answer.trade} onChange={e=>update(r.id,{trade:e.target.value})}>{TRADE_OPTIONS.map(x=><option key={x} value={x}>{displayTradeLabel(x)}</option>)}</select></label>
            <label>Approx. Time<select value={r.answer.effort} onChange={e=>update(r.id,{effort:e.target.value})}>{EFFORT.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Homeowner Pace<select value={r.answer.pref} onChange={e=>update(r.id,{pref:e.target.value})}>{PREFS.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Photo Ref<input value={r.answer.photoRef} onChange={e=>update(r.id,{photoRef:e.target.value})} placeholder="Photo 01 / filename"/></label>
          </div>
          <label className="notes">Notes for PMR detail<textarea value={r.answer.notes} onChange={e=>update(r.id,{notes:e.target.value})} placeholder="What do I see? What would I suggest? What needs confirmation? These notes sharpen the PMR language."/></label>
          <div className="photoBox"><Camera size={18}/><strong>Photo Capture:</strong><label className="uploadInline"><Upload size={16}/> Upload<input type="file" accept="image/*" multiple onChange={e=>{addPhotos(r.id, e.target.files); e.target.value='';}}/></label><span>{photoSummary(r.answer.photos)}</span></div>
          {r.answer.photos.length > 0 && <div className="thumbGrid">{r.answer.photos.map(photo => <div className="thumbCard" key={photo.id}><div className="thumb">{photo.dataUrl ? <img src={photo.dataUrl} alt={`${photo.label} for ${r.item}`}/> : <Image size={24}/>}</div><select value={photo.label} onChange={e=>updatePhoto(r.id, photo.id, {label:e.target.value})}>{PHOTO_LABELS.map(label=><option key={label}>{label}</option>)}</select><span title={photo.name}>{photo.name}</span><button onClick={()=>removePhoto(r.id, photo.id)} aria-label="Remove photo"><X size={14}/></button></div>)}</div>}
          {r.catchAll && <div className="reassignBox"><label>Reassign Catch-All Notes<select value={r.answer.reassignTo} onChange={e=>update(r.id,{reassignTo:e.target.value})}><option value="">Choose Section-Item</option>{rows.filter(target=>target.sectionKey===r.sectionKey && !target.catchAll).map(target=><option key={target.id} value={target.id}>{target.item}</option>)}</select></label><button onClick={()=>reassignCatchAll(r.id)} disabled={!r.answer.reassignTo}>Reassign</button></div>}
          <div className="drivePath"><FolderOpen size={16}/> {drivePath(client.name, client.date, r.roomType || r.room, r.item, r.roomName || r.room)}</div>
        </div>})}
      </section>
    </main>}
    {view === 'pmr' && <PMR client={client} intake={intake} pmr={pmr} counts={counts} quickHits={quickHits} pass={pass} />}
    {view === 'metrics' && <Metrics rows={rows} pmr={pmr} quickHits={quickHits} pass={pass}/>} 
  </div>
}


function IntakeView({intake, updateIntake}) {
  const togglePriority = (value) => {
    const current = Array.isArray(intake.priorities) ? intake.priorities : [];
    updateIntake({priorities: current.includes(value) ? current.filter(x => x !== value) : [...current, value]});
  };
  return <main className="intakePage">
    <div className="pmrHeader"><div><p className="eyebrow">Client Intake</p><h1>Homeowner Context & Preferences</h1><p>This is the homeowner-supplied info that shapes the PMR before we ever start walking the house.</p></div><div className="compass">◈</div></div>
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
      <CategoryLabel category="HVAC">Furnace / A/C service history<input value={intake.hvacService || ''} onChange={e=>updateIntake({hvacService:e.target.value})}/></CategoryLabel>
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

function PMR({client, intake, pmr, counts, quickHits, pass}) {
  const summary = intakeSummary(intake);
  return <main className="pmr">
    <div className="pmrHeader"><div><THALogo variant="full"/><p className="eyebrow">Preventive Maintenance Report</p><h1>{client.address}</h1><p>{client.name} · {client.date}</p></div><div className="compassCard"><Mountain size={48}/><span>You Navigate, We Drive</span></div></div>
    <section className="pmrBlock intakeSummary"><h2><Home size={20}/> Homeowner Goals & Preferences</h2><div className="findGrid"><p><strong>Primary priorities:</strong><br/>{summary.priorities}</p><p><strong>Preferred pace:</strong><br/>{summary.pace}</p><p><strong>Budget mindset:</strong><br/>{summary.budget}</p><p><strong>Decision style:</strong><br/>{summary.decision}</p><p><strong>Homeowner notes:</strong><br/>{summary.notes}</p><p><strong>PMR interpretation:</strong><br/>Recommendations below are staged to match the homeowner’s goals, urgency, and preferred pace.</p></div></section>
    <section className="pmrBlock intakeSummary"><h2>Context From Intake</h2><div className="findGrid"><p><strong>Systems history:</strong><br/>Panel: {intake.electricalPanel || 'Unknown'}<br/>Water shut-off: {intake.waterShutoff || 'Unknown'}<br/>HVAC: {intake.hvacService || 'Unknown'}</p><p><strong>Known issues:</strong><br/>{intake.plumbingHistory || 'No plumbing history recorded.'}<br/>{intake.comfort || ''}</p><p><strong>Exterior history:</strong><br/>Roof: {intake.roofAge || 'Unknown'}<br/>Drainage: {intake.drainagePooling || 'Unknown'}<br/>Paint/Stain: {intake.paintStain || 'Unknown'}</p><p><strong>Safety history:</strong><br/>Smoke/CO: {intake.smokeCO || 'Unknown'}<br/>Fire extinguishers: {intake.fireExtinguishers || 'Unknown'}</p><p><strong>Misc. history:</strong><br/>Pest: {intake.pests || 'Unknown'}<br/>Chimney: {intake.chimney || 'Unknown'}</p><p><strong>Additional concerns:</strong><br/>{intake.additionalConcerns || 'No additional concerns recorded.'}</p></div></section>
    <section className="snapshot"><h2><Home size={20}/> Home Health Snapshot</h2><div className="stat high"><strong>{counts.high}</strong><span><CertaintyDot label="Needs Discovery"/> Immediate</span></div><div className="stat med"><strong>{counts.med}</strong><span><CertaintyDot label="Likely Path"/> Near‑Term</span></div><div className="stat low"><strong>{counts.low}</strong><span><CertaintyDot label="Clear Path"/> Monitor</span></div></section><section className="guideGrid"><div className="guideCard"><h2><ClipboardList size={20}/> Action Certainty Guide</h2><p><CertaintyDot label="Needs Discovery"/> <strong>Needs Discovery</strong><br/><span>Gather more information before committing.</span></p><p><CertaintyDot label="Likely Path"/> <strong>Likely Path</strong><br/><span>Probable solution; start here and verify.</span></p><p><CertaintyDot label="Clear Path"/> <strong>Clear Path</strong><br/><span>Straightforward solution.</span></p></div><div className="guideCard"><h2><Clock3 size={20}/> Investment Guide (Time)</h2><p><CertaintyDot label="Clear Path"/> <strong>Quick</strong> — 0–2 hrs</p><p><CertaintyDot label="Likely Path"/> <strong>Short</strong> — 2–6 hrs</p><p><CertaintyDot label="Needs Discovery"/> <strong>Long / Trade Scope</strong> — verify first</p></div></section><section className="pmrBlock"><h2><Wrench/> Handy‑Next‑Steps</h2><p className="lede">Quick, practical items that may fit a grouped Handy Services visit, subject to confirmation.</p><ul className="checkList">{quickHits.map(r=><li key={r.id}><TradeIcon trade={r.answer.trade}/> <span><strong>{r.room}: {r.item}</strong><br/><small>{displayTradeLabel(r.answer.trade)} · {r.answer.effort}</small></span><CertaintyDot label={actionCertaintyFor(r.answer)}/></li>)}</ul></section>
<section className="pmrBlock"><h2><CalendarDays/> P.A.S.S. Reminder Planner</h2><p className="lede">Precision Annual & Seasonal Services: no subscription, only what is relevant.</p><ul className="checkList">{pass.map(r=><li key={r.id}><TradeIcon trade={r.answer.trade}/> <span><strong>{r.item}</strong><br/><small>{r.frequency || 'Recurring'} · {timingFor(r, r.answer.status)}</small></span><CertaintyDot label={actionCertaintyFor(r.answer)}/></li>)}</ul></section>

    <section className="pmrBlock"><h2><AlertTriangle/> Priority Action Plan</h2>{pmr.map(r => {
      const certainty = actionCertaintyCopy(r);
      return <article className="finding" key={r.id}>
        <div className="findTop"><TradeIcon trade={r.answer.trade} big/><div><h3>{r.roomName || r.room} — {r.item}</h3><p>{r.zone} · {r.answer.status} · {displayTradeLabel(r.answer.trade)} · {certainty.label}</p></div><span className="certaintyLabel"><CertaintyDot label={certainty.label}/>{certainty.label}</span><span className={`pill ${priority(r.answer.status).toLowerCase()}`}>{priority(r.answer.status)}</span></div>
        <div className="findGrid"><p><strong>What we saw:</strong><br/>{r.answer.notes || 'No additional notes recorded yet.'}</p><p><strong>Why it matters:</strong><br/>{r.why}</p><p><strong>{certainty.title}:</strong><br/>{certainty.body}</p><p><strong>Next step language:</strong><br/>{certainty.next}</p><p><strong>Suggested timing:</strong><br/>{timingFor(r, r.answer.status)} · Homeowner pace: {r.answer.pref}</p><p><strong>Approx. time:</strong><br/>{r.answer.effort} · {displayTradeLabel(r.answer.trade)} · Action certainty: {certainty.label}</p><p><strong>How homeowner intake affects this:</strong><br/>{intakeInfluence(r, intake)}</p><p><strong>Photos / reference:</strong><br/>{photoSummary(r.answer.photos)}</p></div>
      </article>
    })}</section>
    <footer className="promise"><ShieldCheck/> You don’t hire trades — you hire The Homeowner Advocate. One point of contact. Every step. Every task.</footer>
  </main>
}

function Metrics({rows, pmr, quickHits, pass}) {
  const byTrade = Object.entries(pmr.reduce((acc,r)=>{acc[r.answer.trade]=(acc[r.answer.trade]||0)+1; return acc;},{}));
  const byCertainty = Object.entries(pmr.reduce((acc,r)=>{const key=actionCertaintyFor(r.answer); acc[key]=(acc[key]||0)+1; return acc;},{}));
  return <main className="metrics"><h1>Internal Metrics / Future PMR Intelligence</h1><div className="metricGrid"><div><strong>{pmr.length}</strong><span>PMR findings</span></div><div><strong>{quickHits.length}</strong><span>Quick-hit tasks</span></div><div><strong>{pass.length}</strong><span>PASS candidates</span></div><div><strong>{rows.filter(r=>r.answer.effort !== 'Unknown').length}</strong><span>Items with time data</span></div></div><section className="pmrBlock"><h2>Findings by Trade / Resource</h2>{byTrade.map(([k,v])=><p key={k} className="tradeLine"><span><TradeIcon trade={k}/> {displayTradeLabel(k)}</span><strong>{v}</strong></p>)}</section><section className="pmrBlock"><h2>Action Certainty Breakdown</h2>{byCertainty.map(([k,v])=><p key={k} className="tradeLine"><span>{k}</span><strong>{v}</strong></p>)}</section><section className="pmrBlock"><h2>Time Tracking Note</h2><p>This app captures the field estimate now. Next build should add “Actual Time Spent” after work completion, so THA can compare estimated vs. actual and improve future PMRs, pricing, scheduling, and batching. Nerdy? Yes. Useful? Very.</p></section></main>
}

createRoot(document.getElementById('root')).render(<App/>);
