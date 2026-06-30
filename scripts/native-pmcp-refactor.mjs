import fs from 'node:fs';

const mainPath = 'src/main.jsx';
const stylePath = 'src/style.css';
let source = fs.readFileSync(mainPath, 'utf8');
let styles = fs.readFileSync(stylePath, 'utf8');

function between(text, start, end, replacement) {
  const first = text.indexOf(start);
  const last = text.indexOf(end, first);
  if (first === -1 || last === -1) throw new Error(`Could not find native PMCP transform bounds: ${start} → ${end}`);
  return text.slice(0, first) + replacement + text.slice(last);
}

function replaceOnce(text, before, after) {
  if (!text.includes(before)) throw new Error(`Could not find native PMCP transform target: ${before.slice(0, 90)}`);
  return text.replace(before, after);
}

const cardComponent = String.raw`function PassReviewCard({ item, category, passReview, onPassReviewChange }) {
  const { review, pmcpDecision, selected, followUpStatus, workflow } = passReviewState(item, passReview);
  const [open, setOpen] = useState(false);
  const [planningOpen, setPlanningOpen] = useState(false);
  const reason = review.reason ?? item.reason ?? '';
  const targetWindow = review.targetWindow ?? item.targetWindow ?? passSuggestedWindowText(item.suggestedWindow);
  const cadence = review.cadence ?? item.cadence ?? 'As Needed';
  const resource = review.resource ?? item.resource;
  const lastCompletedDate = review.lastCompletedDate ?? item.lastCompletedDate ?? '';
  const dateSource = passDateSourceText(review.dateSource ?? item.dateSource);
  const nextSuggestedWindow = review.nextSuggestedWindow ?? item.nextSuggestedWindow ?? '';
  const internalNote = review.internalNote ?? item.internalNote ?? '';

  return <article className={\`passReviewCard pmcp-\${pmcpDecision} workflow-\${workflow.visual} \${selected ? 'pmcp-selected' : ''}\`}>
    <div className="passReviewCardHeader">
      <div className="passReviewTitle">
        <div className="passReviewBadgeRow">
          <CategoryBadge category={category}/>
          <span className={\`passWorkflowBadge \${workflow.visual}\`}><span className="passWorkflowDot" aria-hidden="true"></span>{workflow.label}</span>
          <span className="sourceBadge">{item.sourceEvidence?.label || (item.source === 'manual' ? 'HTC' : 'Supported')}</span>
        </div>
        <h4>{item.careItem}</h4>
        <p className="passReviewSubline">{cadence} · {resource || 'Other'}</p>
      </div>
      <button type="button" className="passReviewCardToggle" onClick={() => setOpen(value => !value)} aria-expanded={open}>{open ? 'Close' : 'Open'}</button>
    </div>
    {open && <div className="passReviewDetail">
      <div className="passReviewDecision">
        <label className="includeToggle">
          <input type="checkbox" checked={selected} onChange={e => onPassReviewChange(item.id, { pmcpDecision: e.target.checked ? 'selected' : 'pending' })}/>
          <span><strong>Add to this homeowner’s Preventative Maintenance Care Plan</strong><small>Selected items appear in the homeowner’s active care plan.</small></span>
        </label>
        <button type="button" className="secondaryBtn" onClick={() => onPassReviewChange(item.id, { pmcpDecision: 'declined' })}>Not this year</button>
      </div>
      <div className="passReviewEssentials">
        <PassSourceEvidence item={item}/>
        <div className="passRecommendation"><p><strong>Recommended rhythm:</strong> {cadence}</p><p><strong>Suggested timing:</strong> {nextSuggestedWindow || targetWindow || 'Next normal care window'}</p></div>
      </div>
      <button type="button" className="secondaryBtn passPlanningToggle" onClick={() => setPlanningOpen(value => !value)} aria-expanded={planningOpen}>{planningOpen ? 'Close planning details' : 'Open planning details'}</button>
      {planningOpen && <div className="passReviewFields passPlanningDetails">
        <label className="wide">Reason<textarea value={reason} onChange={e => onPassReviewChange(item.id, { reason: e.target.value })}/></label>
        <label className="wide">Target window<input value={nextSuggestedWindow || targetWindow} onChange={e => onPassReviewChange(item.id, { nextSuggestedWindow: e.target.value, targetWindow: e.target.value, suggestedWindow: \`Suggested window: \${e.target.value}\` })}/></label>
        <label>Cadence<select value={cadence} onChange={e => onPassReviewChange(item.id, { cadence: e.target.value })}>{PASS_CADENCE.map(option => <option key={option}>{option}</option>)}</select></label>
        <label>Resource/trade<select value={resource} onChange={e => onPassReviewChange(item.id, { resource: e.target.value })}>{PASS_RESOURCES.map(option => <option key={option}>{option}</option>)}</select></label>
        <label>Follow-up status<select value={followUpStatus} onChange={e => onPassReviewChange(item.id, { followUpStatus: e.target.value })}>{PASS_FOLLOW_UP_STATUSES.map(option => <option key={option}>{option}</option>)}</select></label>
        <label>Last completed date, if known<input type="date" value={lastCompletedDate} onChange={e => onPassReviewChange(item.id, { lastCompletedDate: e.target.value })}/></label>
        <label>Source of date<select value={dateSource} onChange={e => onPassReviewChange(item.id, { dateSource: e.target.value })}>{PASS_DATE_SOURCES.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
        <label className="wide passInternalNote">Internal THA note<textarea value={internalNote} onChange={e => onPassReviewChange(item.id, { internalNote: e.target.value })} placeholder="Internal planning note; not shown in homeowner PMR output."/></label>
      </div>}
    </div>}
  </article>;
}

`;

const controlsAndPlan = String.raw`function PreventativeMaintenanceCarePlan({ passCareCandidates = [], passReview = {}, title = 'Preventative Maintenance Care Plan', pmr = false }) {
  const [openGroups, setOpenGroups] = useState({});
  const groupedCandidates = useMemo(() => {
    const classified = passCareCandidates.map(item => ({ item, category: passCandidateCategory(item), state: passReviewState(item, passReview) }));
    return CATEGORY_ORDER.map(category => ({ category, items: classified.filter(entry => entry.category === category) })).filter(group => group.items.length);
  }, [passCareCandidates, passReview]);
  const selectedCount = groupedCandidates.flatMap(group => group.items).filter(entry => entry.state.selected).length;
  return <section className={\`pmrBlock preventativeMaintenanceCarePlan \${pmr ? 'pmrCarePlan' : 'passCarePlan'}\`}>
    <h2><CalendarDays size={20}/>{title}</h2>
    <p className="lede">All supported care possibilities stay visible by trade. Green identifies the care items the homeowner has chosen to keep active.</p>
    <div className="summaryTypeGrid carePlanSummary"><div><strong>{passCareCandidates.length}</strong><span>Supported possibilities</span></div><div><strong>{selectedCount}</strong><span>Active selected care</span></div><div><strong>{Math.max(0, passCareCandidates.length - selectedCount)}</strong><span>Still available</span></div></div>
    <div className="passCategoryGroups">{groupedCandidates.map(group => {
      const meta = categoryInfo(group.category); const Icon = meta.Icon;
      const selectedInGroup = group.items.filter(entry => entry.state.selected).length;
      const isOpen = openGroups[group.category] ?? Boolean(selectedInGroup);
      return <section className={\`passCategoryGroup readOnlyCareGroup \${selectedInGroup ? 'hasPmcpSelected' : ''}\`} key={group.category}>
        <header className="passCategoryHeader"><div className="passCategoryTitle"><span className="passCategoryIcon"><Icon size={18}/></span><h3>{group.category}</h3></div><span className="passCategoryCount">{group.items.length} possibilities · {selectedInGroup} selected</span><button type="button" className="secondaryBtn" onClick={() => setOpenGroups(previous => ({ ...previous, [group.category]: !isOpen }))}>{isOpen ? 'Close' : 'Open'}</button></header>
        {isOpen && <div className="passReviewGrid">{group.items.map(({ item, state }) => <article className={\`passReviewCard readOnlyCareItem pmcp-\${state.pmcpDecision} \${state.selected ? 'pmcp-selected' : ''}\`} key={\`care-plan-\${item.id}\`}><div className="passReviewCardHeader"><div className="passReviewTitle"><h4>{item.careItem}</h4><p className="passReviewSubline">{state.selected ? 'Active care plan' : 'Available upkeep'} · {item.resource || 'Other'}</p></div></div></article>)}</div>}
      </section>;
    })}</div>
    {!groupedCandidates.length && <p className="lede">No supported care possibilities are available yet. Add relevant Intake context or mark an HTC row as a PASS Candidate.</p>}
  </section>;
}

function PassReviewControls({ passCareCandidates = [], passReview = {}, onPassReviewChange = () => {} }) {
  const groupedCandidates = useMemo(() => {
    const classified = passCareCandidates.map(item => {
      const state = passReviewState(item, passReview);
      return { item, category: passCandidateCategory(item), workflow: state.workflow };
    });
    return CATEGORY_ORDER.map(category => ({ category, items: classified.filter(entry => entry.category === category).sort((a, b) => a.workflow.rank - b.workflow.rank || String(a.item.careItem || '').localeCompare(String(b.item.careItem || ''))) })).filter(group => group.items.length);
  }, [passCareCandidates, passReview]);
  const pendingCount = groupedCandidates.flatMap(group => group.items).filter(entry => entry.workflow.visual === 'orange').length;
  return <CollapsibleBlock title="PMCP Builder" summary={\`\${passCareCandidates.length} supported care possibilit\${passCareCandidates.length === 1 ? 'y' : 'ies'} · \${pendingCount} pending\`} defaultOpen={true} className="passReviewPanel noPrint">
    <p><strong>PASS → PMCP:</strong> Review what Intake and HTC established, then use the homeowner conversation to activate care now, leave it pending, or note it for another year.</p>
    <div className="passCategoryGroups">{groupedCandidates.map(group => { const meta = categoryInfo(group.category); const Icon = meta.Icon; const selectedCount = group.items.filter(({ item }) => passReviewState(item, passReview).selected).length; return <section className={\`passCategoryGroup \${selectedCount ? 'hasPmcpSelected' : ''}\`} key={group.category}><header className="passCategoryHeader"><div className="passCategoryTitle"><span className="passCategoryIcon"><Icon size={18}/></span><h3>{group.category}</h3></div><span className="passCategoryCount">{group.items.length} possibilities · {selectedCount} selected</span></header><div className="passReviewGrid">{group.items.map(({ item }) => <PassReviewCard key={\`review-\${item.id}\`} item={item} category={group.category} passReview={passReview} onPassReviewChange={onPassReviewChange}/>)}</div></section>; })}</div>
    {!groupedCandidates.length && <p className="lede">No supported PMCP care possibilities are available yet. Add a PASS-relevant Intake answer or mark an HTC row as PASS Candidate.</p>}
  </CollapsibleBlock>;
}

`;

const workspace = String.raw`function PASSWorkspace({ passCareCandidates = [], passCareOutlook = [], passReview = {}, onPassReviewChange = () => {} }) {
  const selectedCount = passCareOutlook.length;
  return <PassErrorBoundary onReturnToPmr={() => window.dispatchEvent(new CustomEvent('tha:set-view', { detail: 'pmr' }))}><main className="pmr passWorkspace"><div className="pmrHeader"><div><THALogo variant="full"/><p className="eyebrow">PASS — Preventative Maintenance Care Plan</p><h1>PMCP Builder</h1><p>PASS → PMCP: PASS is The Homeowner Advocate’s framework for turning selected upkeep priorities into a homeowner’s Preventative Maintenance Care Plan (PMCP). The PMCP is the care-plan product created through this builder.</p></div><div className="compassCard"><CalendarDays size={48}/><span>PMCP builder</span></div></div><StatusKey mode="workflow" title="PASS workflow status" /><section className="pmrBlock frontSummary pmcpAtGlance"><h2><CalendarDays size={20}/> PMCP at a Glance</h2><p className="lede">A quick decision summary. The full, read-only Preventative Maintenance Care Plan is below the Builder.</p><div className="summaryTypeGrid"><div><strong>{passCareCandidates.length}</strong><span>Supported possibilities</span></div><div><strong>{selectedCount}</strong><span>Selected for PMCP</span></div><div><strong>{Math.max(0, passCareCandidates.length - selectedCount)}</strong><span>Still available</span></div></div></section><PassReviewControls passCareCandidates={passCareCandidates} passReview={passReview} onPassReviewChange={onPassReviewChange}/><PreventativeMaintenanceCarePlan passCareCandidates={passCareCandidates} passReview={passReview}/></main></PassErrorBoundary>;
}

`;

source = between(source, 'function PassReviewCard(', 'function PassReviewControls(', cardComponent + controlsAndPlan);
source = between(source, 'function PASSWorkspace(', 'class PassErrorBoundary', workspace);
source = replaceOnce(source,
  'function PMR({client, intake, pmr, counts, quickHits, passCareOutlook = [], unreviewedIntakeRows = [], reviewedIntakeNotes = []}) {',
  'function PMR({client, intake, pmr, counts, quickHits, passCareOutlook = [], passCareCandidates = [], passReview = {}, unreviewedIntakeRows = [], reviewedIntakeNotes = []}) {');
source = replaceOnce(source,
  '    <section className="pmrBlock roomIssueSummary">',
  '    {!pmr.length && <section className="pmrBlock frontSummary baselineUpkeep"><h2><CalendarDays size={20}/> Baseline Home Care / Upkeep To-Dos</h2><p className="lede">No repair concerns were identified in the reviewed areas. The care-plan opportunities below are preventive upkeep items supported by this walkthrough, not defects and not part of PMR priority counts.</p></section>}\n    <PreventativeMaintenanceCarePlan passCareCandidates={passCareCandidates} passReview={passReview} pmr={true}/>\n    <section className="pmrBlock roomIssueSummary">');
source = replaceOnce(source,
  '    {view === \'pmr\' && <PMR client={client} intake={intake} pmr={pmr} counts={counts} quickHits={quickHits} passCareOutlook={passCareOutlook} unreviewedIntakeRows={unreviewedIntakeRows} reviewedIntakeNotes={reviewedIntakeNotes}/>}',
  '    {view === \'pmr\' && <PMR client={client} intake={intake} pmr={pmr} counts={counts} quickHits={quickHits} passCareOutlook={passCareOutlook} passCareCandidates={passCareCandidates} passReview={passReview} unreviewedIntakeRows={unreviewedIntakeRows} reviewedIntakeNotes={reviewedIntakeNotes}/>}');

source = source.replace("{open ? 'Collapse' : 'Expand'}", "{open ? 'Close' : 'Open'}");
source = source.replace("{isSmartPromptExpanded ? 'Collapse' : 'Open'}", "{isSmartPromptExpanded ? 'Close' : 'Open'}");
source = source.replace("{isExpanded ? 'Collapse' : 'Open'}", "{isExpanded ? 'Close' : 'Open'}");
source = source.replace('Checklist line items are collapsed for faster field scanning. Expand/collapse below applies only to the detailed checklist entries.', 'Checklist line items are closed for faster field scanning. Open/close below applies only to the detailed checklist entries.');
source = source.replace('>Expand All</button><button type="button" onClick={()=>setChecklistRowsExpanded(activeRoom, false)}>Collapse All</button>', '>Open All</button><button type="button" onClick={()=>setChecklistRowsExpanded(activeRoom, false)}>Close All</button>');
source = source.replace('<span className={`statusBadge status-${r.answer.status.toLowerCase().replace(/[^a-z0-9]+/g, \'-\')}`}>{r.answer.status}</span><span className={`pill ${itemPriority.toLowerCase()}`}>{itemPriority || \'No PMR\'}</span>', '<span className={`statusBadge status-${r.answer.status.toLowerCase().replace(/[^a-z0-9]+/g, \'-\')}`}>Condition: {r.answer.status}</span><span className={`pill ${itemPriority.toLowerCase()}`}>Repair report: {itemPriority ? \'Included\' : \'None\'}</span>');
source = source.replace("{flags.length ? flags.map(flag => <span key={flag.key} className={`summaryFlag ${flag.className}`}>{flag.label}</span>) : <span className=\"summaryFlag quiet\">No notes/photos</span>}", "{flags.length ? flags.map(flag => <span key={flag.key} className={`summaryFlag ${flag.className}`}>{String(flag.label || '').replace(/^PASS:\\s*/i, 'Routine care: ')}</span>) : <span className=\"summaryFlag quiet\">Routine care: None</span>}");
source = source.replace('               </div>\n             </button>\n             {isRoomOverviewExpanded && <div className="roomOverviewBody">', '               </div><span className="roomOverviewControl">{isRoomOverviewExpanded ? \'Close overview\' : \'Open overview\'}</span>\n             </button>\n             {isRoomOverviewExpanded && <div className="roomOverviewBody">');

const registry = String.raw`const PMCP_CARE_TOPIC_REGISTRY = [
  { id: 'furnace-filter-replacement', label: 'Furnace filter replacement', intakeFieldIds: ['hvacFilter'], htcKeywords: ['furnace filter'], category: 'HVAC / Mechanical', cadence: 'Every 1–3 months' },
  { id: 'furnace-service', label: 'Furnace service', intakeFieldIds: ['hvacService'], htcKeywords: ['furnace service', 'furnace / ac service'], category: 'HVAC / Mechanical', cadence: 'Annual' },
  { id: 'ac-heat-pump-service', label: 'A/C or heat-pump service', intakeFieldIds: ['hvacAcService'], htcKeywords: ['a/c service', 'heat pump', 'furnace / ac service'], category: 'HVAC / Mechanical', cadence: 'Annual' },
  { id: 'dryer-vent-cleaning', label: 'Dryer vent cleaning', intakeFieldIds: [], htcKeywords: ['dryer vent', 'exterior flap'], category: 'Handy Services', cadence: 'Annual' },
  { id: 'gutter-downspout-review', label: 'Gutter/downspout review', intakeFieldIds: ['gutters'], htcKeywords: ['gutter', 'downspout'], category: 'Exterior & Site / Grounds', cadence: 'Seasonal' },
  { id: 'exterior-caulking-review', label: 'Exterior caulk / paint / stain review', intakeFieldIds: ['paintStain'], htcKeywords: ['exterior paint', 'caulk wear', 'stain'], category: 'Painting / Staining / Protective Coatings', cadence: 'Annual' },
  { id: 'smoke-co-detector-check', label: 'Smoke/CO detector check', intakeFieldIds: ['smokeCO'], htcKeywords: ['smoke', 'co detector'], category: 'Safety / Life Safety', cadence: 'Annual' },
  { id: 'fire-extinguisher-check', label: 'Fire extinguisher check', intakeFieldIds: ['fireExtinguishers'], htcKeywords: ['fire extinguisher'], category: 'Safety / Life Safety', cadence: 'Annual' },
  { id: 'chimney-cleaning-review', label: 'Chimney / fireplace inspection or cleaning, if applicable', intakeFieldIds: ['chimney'], htcKeywords: ['chimney', 'fireplace'], category: 'Exterior & Site / Grounds', cadence: 'Annual / Fall' }
];

function canonicalPmcpTopic(item = {}) {
  const value = [item.rule?.id, item.careItem, item.row?.item, item.reason].filter(Boolean).join(' ').toLowerCase();
  return PMCP_CARE_TOPIC_REGISTRY.find(topic => topic.htcKeywords.some(keyword => value.includes(keyword)) || topic.intakeFieldIds.some(field => item.sourceEvidence?.intakeEvidence?.field === field)) || null;
}

function withCanonicalPmcpTopic(item = {}) {
  const topic = canonicalPmcpTopic(item);
  return topic ? { ...item, careTopicId: topic.id, careTopic: topic, careItem: topic.label, category: topic.category || item.category, cadence: item.cadence || topic.cadence } : item;
}

`;
source = source.replace('function buildPassCareOutlook({ intake = {}, rows = [], passReview = {} } = {}) {', registry + 'function buildPassCareOutlook({ intake = {}, rows = [], passReview = {} } = {}) {');
source = source.replace('return { ...base, ...calendarFields, suggestedWindow: `Suggested window: ${calendarFields.nextSuggestedWindow}` };', 'return withCanonicalPmcpTopic({ ...base, ...calendarFields, suggestedWindow: `Suggested window: ${calendarFields.nextSuggestedWindow}` });');
source = source.replace('return {\n    ...item,\n    ...buildPassCalendarFields({ rule: {}, rows: [row], item, review: { followUpStatus: item.followUpStatus, ...review } })\n  };', 'return withCanonicalPmcpTopic({\n    ...item,\n    ...buildPassCalendarFields({ rule: {}, rows: [row], item, review: { followUpStatus: item.followUpStatus, ...review } })\n  });');

if (!styles.includes('.passReviewDecision')) {
  styles += `\n/* Native PMCP builder and read-only care-plan layout */
.passReviewDetail{display:grid;gap:14px;padding:0 16px 16px}.passReviewDecision{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;padding-top:14px;border-top:1px solid var(--line,#dbe3e8)}.passReviewEssentials{display:grid;gap:10px;padding:12px;border:1px solid var(--line,#dbe3e8);border-radius:10px;background:#f9fbfc}.passRecommendation{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.passRecommendation p{margin:0}.passPlanningToggle{justify-self:start}.passPlanningDetails{margin-top:0}.preventativeMaintenanceCarePlan{margin-top:22px}.readOnlyCareItem{cursor:default}.readOnlyCareItem .passReviewCardHeader{padding:12px 14px}.readOnlyCareItem.pmcp-selected{border-right:6px solid #52aa4b}.readOnlyCareGroup.hasPmcpSelected{border-left:5px solid #52aa4b}.roomOverviewControl{margin-left:auto;white-space:nowrap;font-size:12px;font-weight:800;color:#173e57}.baselineUpkeep{border-left:5px solid #76a976;background:#fbfefb}@media(max-width:720px){.passReviewDecision{flex-direction:column}.passRecommendation{grid-template-columns:1fr}.roomOverviewControl{display:block;margin-top:6px}}\n`;
}

fs.writeFileSync(mainPath, source);
fs.writeFileSync(stylePath, styles);
console.log('Native PMCP rebuild transform completed.');
