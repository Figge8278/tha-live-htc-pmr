import React, { useMemo, useState } from 'react';

export const PMCP_CARE_TOPICS = [
  {
    id: 'furnace-filter-replacement',
    label: 'Furnace filter replacement',
    category: 'HVAC / Mechanical',
    defaultResource: 'Handy Services',
    defaultCadence: 'Every 1–3 months',
    defaultTiming: 'Ongoing, based on filter condition',
    intakeFieldIds: ['hvacFilter'],
    htcKeywords: ['furnace filter', 'filter condition and size']
  },
  {
    id: 'furnace-service',
    label: 'Furnace service',
    category: 'HVAC / Mechanical',
    defaultResource: 'HVAC',
    defaultCadence: 'Annual',
    defaultTiming: 'Before heating season',
    intakeFieldIds: ['hvacService'],
    htcKeywords: ['furnace service', 'furnace / ac service']
  },
  {
    id: 'ac-heat-pump-service',
    label: 'A/C or heat-pump service',
    category: 'HVAC / Mechanical',
    defaultResource: 'HVAC',
    defaultCadence: 'Annual',
    defaultTiming: 'Before cooling season',
    intakeFieldIds: ['hvacAcService'],
    htcKeywords: ['a/c service', 'heat pump', 'furnace / ac service']
  },
  {
    id: 'dryer-vent-cleaning',
    label: 'Dryer vent cleaning',
    category: 'Handy Services',
    defaultResource: 'Handy Services',
    defaultCadence: 'Annual',
    defaultTiming: 'Fall or next laundry / exterior visit',
    intakeFieldIds: [],
    htcKeywords: ['dryer vent', 'exterior flap']
  },
  {
    id: 'gutter-downspout-review',
    label: 'Gutter/downspout review',
    category: 'Exterior & Site / Grounds',
    defaultResource: 'Gutters/Drainage',
    defaultCadence: 'Seasonal',
    defaultTiming: 'Spring and fall',
    intakeFieldIds: ['gutters'],
    htcKeywords: ['gutter', 'downspout']
  },
  {
    id: 'exterior-caulking-review',
    label: 'Exterior caulk / paint / stain review',
    category: 'Painting / Staining / Protective Coatings',
    defaultResource: 'Paint',
    defaultCadence: 'Annual',
    defaultTiming: 'Spring exterior review',
    intakeFieldIds: ['paintStain'],
    htcKeywords: ['exterior paint', 'caulk wear', 'stain']
  },
  {
    id: 'smoke-co-detector-check',
    label: 'Smoke/CO detector check',
    category: 'Safety / Life Safety',
    defaultResource: 'Safety',
    defaultCadence: 'Annual',
    defaultTiming: 'Annual safety review',
    intakeFieldIds: ['smokeCO'],
    htcKeywords: ['smoke', 'co detector']
  },
  {
    id: 'fire-extinguisher-check',
    label: 'Fire extinguisher check',
    category: 'Safety / Life Safety',
    defaultResource: 'Safety',
    defaultCadence: 'Annual',
    defaultTiming: 'Annual safety review',
    intakeFieldIds: ['fireExtinguishers'],
    htcKeywords: ['fire extinguisher']
  },
  {
    id: 'chimney-cleaning-review',
    label: 'Chimney / fireplace inspection or cleaning, if applicable',
    category: 'Exterior & Site / Grounds',
    defaultResource: 'Chimney',
    defaultCadence: 'Annual / Fall',
    defaultTiming: 'Before fireplace season',
    intakeFieldIds: ['chimney'],
    htcKeywords: ['chimney', 'fireplace']
  }
];

export function pmcpDecisionFor(value) {
  return ['pending', 'selected', 'declined'].includes(value) ? value : 'pending';
}

export function careTopicForCandidate(candidate = {}) {
  const text = [candidate.rule?.id, candidate.careItem, candidate.row?.item, candidate.reason]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const intakeKey = candidate.sourceEvidence?.intakeEvidence?.field || '';
  return PMCP_CARE_TOPICS.find(topic =>
    topic.intakeFieldIds.includes(intakeKey) || topic.htcKeywords.some(keyword => text.includes(keyword))
  ) || null;
}

export function normalizeCareCandidate(candidate = {}) {
  const topic = careTopicForCandidate(candidate);
  if (!topic) return candidate;
  return {
    ...candidate,
    careTopicId: topic.id,
    careTopic: topic,
    careItem: topic.label,
    category: topic.category,
    resource: candidate.resource || topic.defaultResource,
    cadence: candidate.cadence || topic.defaultCadence,
    targetWindow: candidate.targetWindow || topic.defaultTiming
  };
}

export function groupCareCandidates(candidates = [], review = {}) {
  return candidates.reduce((groups, candidate) => {
    const normalized = normalizeCareCandidate(candidate);
    const decision = pmcpDecisionFor(review[normalized.id]?.pmcpDecision);
    const category = normalized.category || 'Specialty / Other';
    groups[category] = [...(groups[category] || []), { ...normalized, pmcpDecision: decision }];
    return groups;
  }, {});
}

export function ReadOnlyCarePlan({ candidates = [], review = {}, categoryIcon: CategoryIcon, className = '' }) {
  const [openGroups, setOpenGroups] = useState({});
  const groups = useMemo(() => groupCareCandidates(candidates, review), [candidates, review]);
  const entries = Object.entries(groups);
  return <section className={className}>
    <h2>Preventative Maintenance Care Plan</h2>
    <p>All supported care possibilities stay visible by trade. Green identifies active selected care.</p>
    {entries.map(([category, items]) => {
      const selected = items.filter(item => item.pmcpDecision === 'selected').length;
      const open = openGroups[category] ?? Boolean(selected);
      return <section key={category} className={`passCategoryGroup ${selected ? 'hasPmcpSelected' : ''}`}>
        <header className="passCategoryHeader">
          <div className="passCategoryTitle">{CategoryIcon ? <CategoryIcon category={category}/> : null}<h3>{category}</h3></div>
          <span className="passCategoryCount">{items.length} possibilities · {selected} selected</span>
          <button type="button" className="secondaryBtn" onClick={() => setOpenGroups(previous => ({ ...previous, [category]: !open }))}>{open ? 'Close' : 'Open'}</button>
        </header>
        {open && <div className="passReviewGrid">{items.map(item => <article className={`passReviewCard pmcp-${item.pmcpDecision} ${item.pmcpDecision === 'selected' ? 'pmcp-selected' : ''}`} key={item.id}>
          <div className="passReviewCardHeader"><div className="passReviewTitle"><h4>{item.careItem}</h4><p className="passReviewSubline">{item.pmcpDecision === 'selected' ? 'Active care plan' : 'Available upkeep'} · {item.resource || 'Other'}</p></div></div>
        </article>)}</div>}
      </section>;
    })}
  </section>;
}
