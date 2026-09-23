export type EntityKind = 'Person' | 'Phone' | 'Account' | 'Location' | 'Case' | 'Organization' | 'Vehicle' | 'Incident' | 'Financial';
export type ReviewStatus = 'unreviewed' | 'reviewed' | 'dismissed' | 'correction';
export type LeadStatus = 'pending' | 'approved' | 'rejected';

export interface CaseRecord {
  id: string;
  reference: string;
  title: string;
  district: string;
  station: string;
  status: 'Active' | 'Under review' | 'Closed';
  updated: string;
  summary: string;
  officer: string;
  classification?: string;
  linkedCases?: string[];
}

export interface SourceRecord {
  id: string;
  caseId: string;
  title: string;
  type: 'FIR' | 'CDR' | 'Financial' | 'Statement' | 'CCTV' | 'ANPR';
  date: string;
  pages: number;
  excerpt: string;
  fullText: string;
  restricted?: boolean;
}

export interface Entity {
  id: string;
  label: string;
  kind: EntityKind;
  subtitle: string;
  caseIds: string[];
  x: number;
  y: number;
  status?: string;
  metadata?: Record<string, string>;
}

export interface Relation {
  id: string;
  source: string;
  target: string;
  label: string;
  date: string;
  sourceIds: string[];
  inferred?: boolean;
  leadIds: string[];
}

export interface Lead {
  id: string;
  caseId: string;
  title: string;
  summary: string;
  reason: string;
  entityIds: string[];
  relationIds: string[];
  sourceIds: string[];
  date: string;
  kind: 'corroborated' | 'conflict' | 'unverified';
  status: ReviewStatus;
  leadStatus?: LeadStatus;
  confidence?: number;
  leadType?: string;
  notes?: string;
  reviewedAt?: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  type: 'Financial' | 'Call' | 'Vehicle' | 'CCTV' | 'Location' | 'Incident';
  title: string;
  detail: string;
  timestamp: string;
  sourceId?: string;
  entityIds: string[];
  confirmed: boolean;
  confidence?: number;
}

export interface CameraRecording {
  id: string;
  caseId: string;
  cameraId: string;
  cameraName: string;
  location: string;
  timestamp: string;
  detectedEntities: string[];
  matchScore: number;
  frameRef: string;
  notes?: string;
}

export interface AILead {
  id: string;
  caseId: string;
  leadId: string;
  type: string;
  confidence: number;
  relatedEntity: string;
  explanation: string;
  sourceRef: string;
  timestamp: string;
  status: LeadStatus;
}

export interface ReportSnapshot {
  id: string;
  caseId: string;
  title: string;
  createdAt: string;
  notes: string;
  leads: Lead[];
  sources: SourceRecord[];
  caseReference: string;
}

export interface ActivityEvent {
  id: string;
  caseId: string;
  title: string;
  detail: string;
  time: string;
  type?: 'call' | 'financial' | 'cctv' | 'location' | 'case' | 'evidence' | 'lead';
}

export interface AppState {
  schemaVersion: 1;
  cases: CaseRecord[];
  sources: SourceRecord[];
  entities: Entity[];
  relations: Relation[];
  leads: Lead[];
  timelineEvents: TimelineEvent[];
  cameraRecordings: CameraRecording[];
  aiLeads: AILead[];
  reports: ReportSnapshot[];
  activity: ActivityEvent[];
  loadedPacks: string[];
}

export type Action =
  | { type: 'review'; id: string; status: ReviewStatus; notes: string; time: string }
  | { type: 'approve-lead'; id: string; notes: string; time: string }
  | { type: 'reject-lead'; id: string; notes: string; time: string }
  | { type: 'add-case'; record: CaseRecord; time: string }
  | { type: 'import-pack'; caseId: string; time: string }
  | { type: 'save-report'; report: ReportSnapshot }
  | { type: 'reset' };
