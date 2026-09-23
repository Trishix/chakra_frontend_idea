import type { Action, AppState, CaseRecord, Lead, LeadStatus, ReportSnapshot, SourceRecord } from './types';
import { createInitialState } from './fixtures';

const reviewStatuses = ['unreviewed', 'reviewed', 'dismissed', 'correction'];
const clone = <T,>(value: T): T => structuredClone(value);

function log(state: AppState, caseId: string, title: string, detail: string, time: string, type?: AppState['activity'][number]['type']): AppState['activity'] {
  return [{ id: crypto.randomUUID(), caseId, title, detail, time, type }, ...state.activity];
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'reset': return createInitialState();

    case 'review': {
      const lead = state.leads.find(item => item.id === action.id);
      const notes = action.notes.trim();
      if (!lead || !reviewStatuses.includes(action.status) || (['dismissed', 'correction'].includes(action.status) && !notes)) return state;
      const labels: Record<string, string> = { unreviewed: 'Lead reopened', reviewed: 'Lead marked reviewed', dismissed: 'Lead dismissed', correction: 'Correction requested' };
      return {
        ...state,
        leads: state.leads.map(item => item.id === lead.id ? { ...item, status: action.status, notes, reviewedAt: action.status === 'unreviewed' ? undefined : action.time } : item),
        cases: state.cases.map(item => item.id === lead.caseId ? { ...item, updated: action.time } : item),
        activity: log(state, lead.caseId, labels[action.status], `${lead.title}${notes ? ` - ${notes}` : ''}`, action.time, 'lead'),
      };
    }

    case 'approve-lead': {
      const lead = state.leads.find(item => item.id === action.id);
      if (!lead) return state;
      const aiLead = state.aiLeads.find(a => a.leadId === action.id);
      return {
        ...state,
        leads: state.leads.map(item => item.id === lead.id ? { ...item, leadStatus: 'approved' as LeadStatus, status: 'reviewed', notes: action.notes.trim(), reviewedAt: action.time } : item),
        aiLeads: aiLead ? state.aiLeads.map(a => a.leadId === action.id ? { ...a, status: 'approved' as LeadStatus } : a) : state.aiLeads,
        cases: state.cases.map(item => item.id === lead.caseId ? { ...item, updated: action.time } : item),
        activity: log(state, lead.caseId, 'Lead approved', `${lead.title}${action.notes.trim() ? ` - ${action.notes.trim()}` : ''}`, action.time, 'lead'),
      };
    }

    case 'reject-lead': {
      const lead = state.leads.find(item => item.id === action.id);
      if (!lead || !action.notes.trim()) return state;
      const aiLead = state.aiLeads.find(a => a.leadId === action.id);
      return {
        ...state,
        leads: state.leads.map(item => item.id === lead.id ? { ...item, leadStatus: 'rejected' as LeadStatus, status: 'dismissed', notes: action.notes.trim(), reviewedAt: action.time } : item),
        aiLeads: aiLead ? state.aiLeads.map(a => a.leadId === action.id ? { ...a, status: 'rejected' as LeadStatus } : a) : state.aiLeads,
        cases: state.cases.map(item => item.id === lead.caseId ? { ...item, updated: action.time } : item),
        activity: log(state, lead.caseId, 'Lead rejected', `${lead.title} - ${action.notes.trim()}`, action.time, 'lead'),
      };
    }

    case 'add-case': {
      if (!validCase(action.record) || state.cases.some(item => item.id === action.record.id || item.reference.toLowerCase() === action.record.reference.toLowerCase())) return state;
      const record = clone(action.record);
      return {
        ...state,
        cases: [...state.cases, record],
        activity: log(state, record.id, 'Case created', `${record.reference} - ${record.title}`, action.time),
      };
    }

    case 'import-pack': {
      const record = state.cases.find(item => item.id === action.caseId);
      const packId = `demo-${action.caseId}`;
      if (!record || state.loadedPacks.includes(packId)) return state;
      return {
        ...state,
        loadedPacks: [...state.loadedPacks, packId],
        activity: log(state, record.id, 'Demo pack imported', 'Synthetic record added.', action.time),
      };
    }

    case 'save-report': {
      if (!validReport(action.report) || !state.cases.some(item => item.id === action.report.caseId) || state.reports.some(item => item.id === action.report.id)) return state;
      const report = clone(action.report);
      return {
        ...state,
        reports: [report, ...state.reports],
        activity: log(state, report.caseId, 'Report snapshot saved', `${report.title} - ${report.leads.length} reviewed lead${report.leads.length === 1 ? '' : 's'}`, report.createdAt),
      };
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
    id: crypto.randomUUID(), caseId, title: `${record.title} - investigation note`, createdAt: time, notes: notes.trim(),
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
  return object(value) && strings(value, ['id', 'caseId', 'title', 'type', 'date', 'excerpt', 'fullText']) && !!value.id && ['FIR', 'CDR', 'Financial', 'Statement', 'CCTV', 'ANPR'].includes(String(value.type)) && typeof value.pages === 'number' && Number.isInteger(value.pages) && value.pages > 0 && (value.restricted === undefined || typeof value.restricted === 'boolean');
}
function validLead(value: unknown): value is Lead {
  return object(value) && strings(value, ['id', 'caseId', 'title', 'summary', 'reason', 'date', 'kind', 'status']) && !!value.id && ['corroborated', 'conflict', 'unverified'].includes(String(value.kind)) && reviewStatuses.includes(String(value.status)) && ['entityIds', 'relationIds', 'sourceIds'].every(key => stringArray(value[key])) && optionalString(value, 'notes') && optionalString(value, 'reviewedAt');
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
  const entityKinds = ['Person', 'Phone', 'Account', 'Location', 'Case', 'Organization', 'Vehicle', 'Incident', 'Financial'];
  if (!candidate.entities.every((entity: unknown) => object(entity as ObjectValue) && strings(entity as ObjectValue, ['id', 'label', 'kind', 'subtitle']) && !!(entity as ObjectValue).id && entityKinds.includes((entity as ObjectValue).kind as string) && stringArray((entity as ObjectValue).caseIds) && typeof (entity as ObjectValue).x === 'number' && Number.isFinite((entity as ObjectValue).x) && typeof (entity as ObjectValue).y === 'number' && Number.isFinite((entity as ObjectValue).y))) return false;
  if (!candidate.relations.every((relation: unknown) => object(relation as ObjectValue) && strings(relation as ObjectValue, ['id', 'source', 'target', 'label', 'date']) && !!(relation as ObjectValue).id && stringArray((relation as ObjectValue).sourceIds) && stringArray((relation as ObjectValue).leadIds) && ((relation as ObjectValue).inferred === undefined || typeof (relation as ObjectValue).inferred === 'boolean'))) return false;
  if (!candidate.activity.every((event: unknown) => object(event as ObjectValue) && strings(event as ObjectValue, ['id', 'caseId', 'title', 'detail', 'time']) && !!(event as ObjectValue).id)) return false;
  if (!arrayKeys.every(key => uniqueIds(candidate[key as keyof AppState] as { id: string }[])) || new Set(candidate.loadedPacks).size !== candidate.loadedPacks.length) return false;
  return true;
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
