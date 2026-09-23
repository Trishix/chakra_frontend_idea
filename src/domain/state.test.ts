import { describe, expect, it } from 'vitest';
import { createInitialState } from './fixtures';
import { loadState, makeReport, reducer } from './state';

const time = '2026-02-14T20:00:00.000Z';

describe('FIR-409 fixture data', () => {
  it('has FIR-409 as the primary case', () => {
    const state = createInitialState();
    expect(state.cases[0].reference).toBe('FIR-409/2026/NZ');
    expect(state.cases[0].title).toContain('Tariq Ahmed');
    expect(state.cases).toHaveLength(3);
  });

  it('has Tariq Ahmed entity with correct metadata', () => {
    const state = createInitialState();
    const tariq = state.entities.find(e => e.id === 'e-tariq');
    expect(tariq).toBeDefined();
    expect(tariq!.label).toBe('Tariq Ahmed');
    expect(tariq!.kind).toBe('Person');
    expect(tariq!.status).toBe('IN CUSTODY');
  });

  it('has Vehicle entity type for DL-1C-AA-0921', () => {
    const state = createInitialState();
    const vehicle = state.entities.find(e => e.kind === 'Vehicle');
    expect(vehicle).toBeDefined();
    expect(vehicle!.label).toBe('DL-1C-AA-0921');
  });

  it('has leads with confidence scores and leadType', () => {
    const state = createInitialState();
    const l1 = state.leads.find(l => l.id === 'l1');
    expect(l1!.confidence).toBe(94);
    expect(l1!.leadType).toBe('Telecom Correlation');
    expect(l1!.leadStatus).toBe('pending');
  });

  it('has 8 timeline events with correct types', () => {
    const state = createInitialState();
    expect(state.timelineEvents.length).toBe(8);
    expect(state.timelineEvents.filter(e => e.type === 'Financial').length).toBeGreaterThanOrEqual(2);
    expect(state.timelineEvents.filter(e => e.type === 'CCTV').length).toBeGreaterThanOrEqual(1);
  });

  it('has 3 camera recordings', () => {
    const state = createInitialState();
    expect(state.cameraRecordings.length).toBe(3);
    const isbt = state.cameraRecordings.find(c => c.cameraId === 'CAM-DL-KG-0418');
    expect(isbt!.matchScore).toBe(94.2);
  });

  it('has 3 AI leads', () => {
    const state = createInitialState();
    expect(state.aiLeads.length).toBe(3);
    expect(state.aiLeads[0].status).toBe('pending');
  });

  it('returns fresh data on each init', () => {
    const a = createInitialState();
    a.leads[0].notes = 'mutated';
    expect(createInitialState().leads[0].notes).toBeUndefined();
  });
});

describe('approve-lead action', () => {
  it('approves a lead and records activity', () => {
    const state = createInitialState();
    const next = reducer(state, { type: 'approve-lead', id: 'l1', notes: 'Verified against CDR-004', time });
    const lead = next.leads.find(l => l.id === 'l1');
    expect(lead!.leadStatus).toBe('approved');
    expect(lead!.status).toBe('reviewed');
    expect(lead!.reviewedAt).toBe(time);
    expect(next.activity[0].title).toBe('Lead approved');
    expect(next.aiLeads.find(a => a.leadId === 'l1')!.status).toBe('approved');
  });

  it('ignores unknown lead id', () => {
    const state = createInitialState();
    expect(reducer(state, { type: 'approve-lead', id: 'missing', notes: '', time })).toBe(state);
  });
});

describe('reject-lead action', () => {
  it('requires a reason', () => {
    const state = createInitialState();
    expect(reducer(state, { type: 'reject-lead', id: 'l1', notes: '  ', time })).toBe(state);
  });

  it('rejects a lead with reason', () => {
    const state = createInitialState();
    const next = reducer(state, { type: 'reject-lead', id: 'l2', notes: 'Insufficient evidence', time });
    const lead = next.leads.find(l => l.id === 'l2');
    expect(lead!.leadStatus).toBe('rejected');
    expect(lead!.status).toBe('dismissed');
    expect(next.activity[0].title).toBe('Lead rejected');
  });
});

describe('report generation', () => {
  it('includes only reviewed leads and non-restricted sources', () => {
    let state = createInitialState();
    state = reducer(state, { type: 'approve-lead', id: 'l1', notes: 'checked', time });
    const report = makeReport(state, 'c1', ['l1'], 'Test notes', time);
    expect(report.leads).toHaveLength(1);
    expect(report.sources.every(s => !s.restricted)).toBe(true);
    expect(report.caseReference).toBe('FIR-409/2026/NZ');
  });
});

describe('reset action', () => {
  it('restores initial FIR-409 state', () => {
    const modified = reducer(createInitialState(), { type: 'approve-lead', id: 'l1', notes: 'test', time });
    const reset = reducer(modified, { type: 'reset' });
    expect(reset.leads.find(l => l.id === 'l1')!.leadStatus).toBe('pending');
    expect(reset.cases[0].reference).toBe('FIR-409/2026/NZ');
  });
});

describe('persistence', () => {
  it('round-trips state with Vehicle entity kind', () => {
    const state = createInitialState();
    const restored = loadState(JSON.stringify(state));
    expect(restored.entities.find(e => e.kind === 'Vehicle')!.label).toBe('DL-1C-AA-0921');
  });

  it('falls back to initial state on bad input', () => {
    expect(loadState('not-json')).toEqual(createInitialState());
    expect(loadState(null)).toEqual(createInitialState());
    expect(loadState('')).toEqual(createInitialState());
  });
});
