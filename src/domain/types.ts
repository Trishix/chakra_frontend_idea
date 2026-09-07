export type EntityKind = 'Person' | 'Phone' | 'Account' | 'Location' | 'Case' | 'Organization';
export type ReviewStatus = 'unreviewed' | 'reviewed' | 'dismissed' | 'correction';
export interface CaseRecord { id: string; reference: string; title: string; district: string; station: string; status: 'Active' | 'Under review' | 'Closed'; updated: string; summary: string; officer: string; }
export interface SourceRecord { id: string; caseId: string; title: string; type: 'FIR' | 'CDR' | 'Financial' | 'Statement'; date: string; pages: number; excerpt: string; fullText: string; restricted?: boolean; }
export interface Entity { id: string; label: string; kind: EntityKind; subtitle: string; caseIds: string[]; x: number; y: number; }
export interface Relation { id: string; source: string; target: string; label: string; date: string; sourceIds: string[]; inferred?: boolean; leadIds: string[]; }
export interface Lead { id: string; caseId: string; title: string; summary: string; reason: string; entityIds: string[]; relationIds: string[]; sourceIds: string[]; date: string; kind: 'corroborated' | 'conflict' | 'unverified'; status: ReviewStatus; notes?: string; reviewedAt?: string; }
export interface ReportSnapshot { id: string; caseId: string; title: string; createdAt: string; notes: string; leads: Lead[]; sources: SourceRecord[]; caseReference: string; }
export interface ActivityEvent { id: string; caseId: string; title: string; detail: string; time: string; }
export interface AppState { schemaVersion: 1; cases: CaseRecord[]; sources: SourceRecord[]; entities: Entity[]; relations: Relation[]; leads: Lead[]; reports: ReportSnapshot[]; activity: ActivityEvent[]; loadedPacks: string[]; }
export type Action = {type:'review';id:string;status:ReviewStatus;notes:string;time:string} | {type:'add-case';record:CaseRecord;time:string} | {type:'import-pack';caseId:string;time:string} | {type:'save-report';report:ReportSnapshot} | {type:'reset'};
