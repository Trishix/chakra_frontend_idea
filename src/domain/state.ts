import type { Action, AppState, CaseRecord, Entity, Lead, ReportSnapshot, SourceRecord } from './types';
import { createInitialState } from './fixtures';

const reviewStatuses = ['unreviewed', 'reviewed', 'dismissed', 'correction'];
const clone = <T,>(value: T): T => structuredClone(value);

function log(state: AppState, caseId: string, title: string, detail: string, time: string): AppState['activity'] {
  return [{ id: crypto.randomUUID(), caseId, title, detail, time }, ...state.activity];
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'reset': return createInitialState();
    case 'review': {
      const lead = state.leads.find(item => item.id === action.id);
      const notes = action.notes.trim();
      if (!lead || !reviewStatuses.includes(action.status) || (['dismissed', 'correction'].includes(action.status) && !notes)) return state;
      const labels = { unreviewed: 'Lead reopened', reviewed: 'Lead marked reviewed', dismissed: 'Lead dismissed', correction: 'Correction requested' };
      return {
        ...state,
        leads: state.leads.map(item => item.id === lead.id ? { ...item, status: action.status, notes, reviewedAt: action.status === 'unreviewed' ? undefined : action.time } : item),
        cases: state.cases.map(item => item.id === lead.caseId ? { ...item, updated: action.time } : item),
        activity: log(state, lead.caseId, labels[action.status], `${lead.title}${notes ? ` — ${notes}` : ''}`, action.time),
      };
    }
    case 'add-case': {
      if (!validCase(action.record) || state.cases.some(item => item.id === action.record.id || item.reference.toLowerCase() === action.record.reference.toLowerCase())) return state;
      const record = clone(action.record);
      return {
        ...state,
        cases: [...state.cases, record],
        activity: log(state, record.id, 'Case created', `${record.reference} · ${record.title}`, action.time),
      };
    }
    case 'import-pack': {
      const record = state.cases.find(item => item.id === action.caseId);
      const packId = `demo-${action.caseId}`;
      if (!record || state.loadedPacks.includes(packId)) return state;
      const sourceId = `s-${packId}`;
      const leadId = `l-${packId}`;
      const relationId = `r-${packId}`;
      const contactId = `contact-${packId}`;
      const existingCaseEntity = state.entities.find(item => item.kind === 'Case' && item.caseIds.includes(record.id));
      const caseEntity: Entity = existingCaseEntity ?? { id: `case-${packId}`, label: record.reference, kind: 'Case', subtitle: record.title, caseIds: [record.id], x: 170, y: 170 };
      if (state.sources.some(s => s.id === sourceId) || state.leads.some(l => l.id === leadId) || state.relations.some(r => r.id === relationId) || state.entities.some(e => e.id === contactId)) return state;
      const date = action.time.slice(0, 10);
      const excerpt = `A supplementary fictional statement for ${record.reference} records an additional safety referral contact, +91 •••••• 7731. The witness could not identify the user of that number.`;
      const source: SourceRecord = { id: sourceId, caseId: record.id, title: 'Supplementary statement · demo pack', type: 'Statement', date, pages: 2, excerpt, fullText: `${excerpt}\n\nPage 1, paragraph 2. This demonstration pack adds a single source-backed contact observation to the selected case. It does not establish a connection to the existing contact ending 8842. Subscriber ownership, dates of contact and any alleged affiliation require independent verification.\n\nAll content is fictional. This pack is built into the prototype; it is not an analysis of an uploaded document.` };
      const lead: Lead = { id: leadId, caseId: record.id, title: 'Additional contact requires verification', summary: 'A supplementary statement names contact ending 7731. Its user is unknown.', reason: 'One statement supplies the number without independent corroboration. Verify the original account and subscriber information before linking it to any existing person or network.', entityIds: [caseEntity.id, contactId], relationIds: [relationId], sourceIds: [sourceId], date, kind: 'unverified', status: 'unreviewed' };
      return {
        ...state,
        cases: state.cases.map(item => item.id === record.id ? { ...item, updated: action.time } : item),
        sources: [...state.sources, source],
        leads: [...state.leads, lead],
        entities: [...state.entities, ...(existingCaseEntity ? [] : [caseEntity]), { id: contactId, label: '+91 •••••• 7731', kind: 'Phone', subtitle: 'Supplementary statement · unverified', caseIds: [record.id], x: 355, y: 180 }],
        relations: [...state.relations, { id: relationId, source: caseEntity.id, target: contactId, label: 'Additional contact reported', date, sourceIds: [sourceId], leadIds: [leadId] }],
        loadedPacks: [...state.loadedPacks, packId],
        activity: log(state, record.id, 'Demo pack imported', 'One fictional statement and one unreviewed lead added.', action.time),
      };
    }
    case 'save-report': {
      if (!validReport(action.report) || !state.cases.some(item => item.id === action.report.caseId) || state.reports.some(item => item.id === action.report.id)) return state;
      const report = clone(action.report);
      return { ...state, reports: [report, ...state.reports], activity: log(state, report.caseId, 'Report snapshot saved', `${report.title} · ${report.leads.length} reviewed lead${report.leads.length === 1 ? '' : 's'}`, report.createdAt) };
    }
    default: return state;
  }
}

export function makeReport(state: AppState, caseId: string, leadIds: string[], notes: string, time: string): ReportSnapshot {
  const record = state.cases.find(item => item.id === caseId);
  if (!record) throw new Error('Cannot create a report for an unknown case.');
  const requestedIds = new Set(leadIds);
  const accessibleIds = new Set(state.sources.filter(source => !source.restricted).map(source => source.id));
  const leads = state.leads.filter(lead => lead.caseId === caseId && lead.status === 'reviewed' && requestedIds.has(lead.id))
    .map(lead => ({ ...clone(lead), sourceIds: lead.sourceIds.filter(id => accessibleIds.has(id)) }));
  const selectedSources = new Set(leads.flatMap(lead => lead.sourceIds));
  return {
    id: crypto.randomUUID(), caseId, title: `${record.title} · investigation note`, createdAt: time, notes: notes.trim(),
    leads, sources: clone(state.sources.filter(source => selectedSources.has(source.id) && !source.restricted)), caseReference: record.reference,
  };
}

type ObjectValue = Record<string, unknown>;
const object = (value: unknown): value is ObjectValue => typeof value === 'object' && value !== null && !Array.isArray(value);
const strings = (value: ObjectValue, keys: string[]): boolean => keys.every(key => typeof value[key] === 'string');
const optionalString = (value: ObjectValue, key: string): boolean => value[key] === undefined || typeof value[key] === 'string';
const stringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string' && item.length > 0);
const uniqueIds = (values: { id: string }[]) => new Set(values.map(item => item.id)).size === values.length;

function validCase(value: unknown): value is CaseRecord {
  return object(value) && strings(value, ['id', 'reference', 'title', 'district', 'station', 'status', 'updated', 'summary', 'officer']) && !!value.id && !!String(value.reference).trim() && !!String(value.title).trim() && ['Active', 'Under review', 'Closed'].includes(String(value.status));
}
function validSource(value: unknown): value is SourceRecord {
  return object(value) && strings(value, ['id', 'caseId', 'title', 'type', 'date', 'excerpt', 'fullText']) && !!value.id && ['FIR', 'CDR', 'Financial', 'Statement'].includes(String(value.type)) && typeof value.pages === 'number' && Number.isInteger(value.pages) && value.pages > 0 && (value.restricted === undefined || typeof value.restricted === 'boolean');
}
function validLead(value: unknown): value is Lead {
  return object(value) && strings(value, ['id', 'caseId', 'title', 'summary', 'reason', 'date', 'kind', 'status']) && !!value.id && ['corroborated', 'conflict', 'unverified'].includes(String(value.kind)) && reviewStatuses.includes(String(value.status)) && ['entityIds', 'relationIds', 'sourceIds'].every(key => stringArray(value[key])) && optionalString(value, 'notes') && optionalString(value, 'reviewedAt') && (!['dismissed', 'correction'].includes(String(value.status)) || (typeof value.notes === 'string' && value.notes.trim().length > 0));
}
function validReport(value: unknown): value is ReportSnapshot {
  if (!object(value) || !strings(value, ['id', 'caseId', 'title', 'createdAt', 'notes', 'caseReference']) || !value.id || !Array.isArray(value.leads) || !value.leads.every(validLead) || !Array.isArray(value.sources) || !value.sources.every(validSource)) return false;
  const leads = value.leads as Lead[];
  const sources = value.sources as SourceRecord[];
  const sourceIds = new Set(sources.map(source => source.id));
  return uniqueIds(leads) && uniqueIds(sources) && sources.every(source => !source.restricted) && leads.every(lead => lead.caseId === value.caseId && lead.status === 'reviewed' && lead.sourceIds.every(id => sourceIds.has(id)));
}

function validState(value: unknown): value is AppState {
  if (!object(value) || value.schemaVersion !== 1) return false;
  const arrayKeys = ['cases', 'sources', 'entities', 'relations', 'leads', 'reports', 'activity'];
  if (!arrayKeys.every(key => Array.isArray(value[key])) || !stringArray(value.loadedPacks)) return false;
  const candidate = value as unknown as AppState;
  if (!candidate.cases.every(validCase) || !candidate.sources.every(validSource) || !candidate.leads.every(validLead) || !candidate.reports.every(validReport)) return false;
  if (!candidate.entities.every(entity => object(entity) && strings(entity, ['id', 'label', 'kind', 'subtitle']) && !!entity.id && ['Person', 'Phone', 'Account', 'Location', 'Case', 'Organization'].includes(entity.kind) && stringArray(entity.caseIds) && typeof entity.x === 'number' && Number.isFinite(entity.x) && typeof entity.y === 'number' && Number.isFinite(entity.y))) return false;
  if (!candidate.relations.every(relation => object(relation) && strings(relation, ['id', 'source', 'target', 'label', 'date']) && !!relation.id && stringArray(relation.sourceIds) && stringArray(relation.leadIds) && (relation.inferred === undefined || typeof relation.inferred === 'boolean'))) return false;
  if (!candidate.activity.every(event => object(event) && strings(event, ['id', 'caseId', 'title', 'detail', 'time']) && !!event.id)) return false;
  if (!arrayKeys.every(key => uniqueIds(candidate[key as keyof AppState] as { id: string }[])) || new Set(candidate.loadedPacks).size !== candidate.loadedPacks.length) return false;
  const caseIds = new Set(candidate.cases.map(item => item.id));
  const sourceIds = new Set(candidate.sources.map(item => item.id));
  const entityIds = new Set(candidate.entities.map(item => item.id));
  const relationIds = new Set(candidate.relations.map(item => item.id));
  const leadIds = new Set(candidate.leads.map(item => item.id));
  return candidate.sources.every(source => caseIds.has(source.caseId))
    && candidate.entities.every(entity => entity.caseIds.every(id => caseIds.has(id)))
    && candidate.relations.every(relation => entityIds.has(relation.source) && entityIds.has(relation.target) && relation.sourceIds.every(id => sourceIds.has(id)) && relation.leadIds.every(id => leadIds.has(id)))
    && candidate.leads.every(lead => caseIds.has(lead.caseId) && lead.sourceIds.every(id => sourceIds.has(id)) && lead.entityIds.every(id => entityIds.has(id)) && lead.relationIds.every(id => relationIds.has(id)))
    && candidate.reports.every(report => caseIds.has(report.caseId))
    && candidate.activity.every(event => caseIds.has(event.caseId));
}

export function loadState(raw: string | null): AppState {
  if (!raw) return createInitialState();
  try {
    const parsed: unknown = JSON.parse(raw);
    return validState(parsed) ? parsed : createInitialState();
  } catch {
    return createInitialState();
  }
}
