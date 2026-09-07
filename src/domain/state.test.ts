import { describe, expect, it } from 'vitest';
import { createInitialState } from './fixtures';
import { loadState, makeReport, reducer } from './state';
import type { AppState } from './types';

const time = '2026-09-08T09:30:00.000Z';
function assertReferences(state: AppState) {
  const cases = new Set(state.cases.map(x => x.id));
  const sources = new Set(state.sources.map(x => x.id));
  const entities = new Set(state.entities.map(x => x.id));
  const relations = new Set(state.relations.map(x => x.id));
  const leads = new Set(state.leads.map(x => x.id));
  for (const source of state.sources) expect(cases.has(source.caseId)).toBe(true);
  for (const entity of state.entities) for (const id of entity.caseIds) expect(cases.has(id)).toBe(true);
  for (const relation of state.relations) {
    expect(entities.has(relation.source)).toBe(true);
    expect(entities.has(relation.target)).toBe(true);
    for (const id of relation.sourceIds) expect(sources.has(id)).toBe(true);
    for (const id of relation.leadIds) expect(leads.has(id)).toBe(true);
  }
  for (const lead of state.leads) {
    expect(cases.has(lead.caseId)).toBe(true);
    for (const id of lead.sourceIds) expect(sources.has(id)).toBe(true);
    for (const id of lead.entityIds) expect(entities.has(id)).toBe(true);
    for (const id of lead.relationIds) expect(relations.has(id)).toBe(true);
  }
}

describe('fictional case fixtures', () => {
  it('contains a connected, source-backed three-case investigation', () => {
    const state = createInitialState();
    expect(state.cases.map(c => c.id)).toEqual(['c1', 'c2', 'c3']);
    expect(state.cases[0]).toMatchObject({ reference: 'DL/2026/0418', title: 'Women safety referral network', district: 'North' });
    expect(state.sources.length).toBeGreaterThanOrEqual(7);
    expect(state.sources.length).toBeLessThanOrEqual(9);
    expect(state.sources.filter(s => s.restricted)).toHaveLength(1);
    expect(state.entities.length).toBeGreaterThanOrEqual(10);
    expect(state.entities.length).toBeLessThanOrEqual(14);
    expect(state.leads.filter(l => l.caseId === 'c1').map(l => l.id)).toEqual(['l1', 'l2', 'l3']);
    assertReferences(state);
    for (const s of state.sources) {
      expect(s.fullText.length).toBeGreaterThan(200);
      expect(s.fullText).toContain(s.excerpt);
    }
    const firstLead = state.leads.find(l => l.id === 'l1')!;
    expect(firstLead.kind).toBe('corroborated');
    expect(firstLead.relationIds.length).toBeGreaterThan(0);
    for (const id of firstLead.relationIds) {
      const relation = state.relations.find(r => r.id === id)!;
      expect(relation.leadIds).toContain('l1');
      expect(relation.sourceIds.some(id => firstLead.sourceIds.includes(id))).toBe(true);
    }
    expect(new Set(firstLead.sourceIds.map(id => state.sources.find(s => s.id === id)!.caseId)).size).toBeGreaterThan(1);
    expect(state.leads.find(l => l.id === 'l3')!.kind).toBe('conflict');
  });
  it('returns fresh nested data on each initialization', () => {
    const a = createInitialState();
    a.leads[0].sourceIds.push('bad');
    expect(createInitialState().leads[0].sourceIds).not.toContain('bad');
  });
});

describe('review decisions', () => {
  it.each(['dismissed', 'correction'] as const)('requires a reason for %s', status => {
    const state = createInitialState();
    expect(reducer(state, { type: 'review', id: 'l3', status, notes: '  ', time })).toBe(state);
  });
  it('records a reason and event without changing the previous state', () => {
    const before = createInitialState();
    const state = reducer(before, { type: 'review', id: 'l3', status: 'dismissed', notes: '  Date of birth and address differ.  ', time });
    expect(state.leads.find(l => l.id === 'l3')).toMatchObject({ status: 'dismissed', notes: 'Date of birth and address differ.', reviewedAt: time });
    expect(before.leads.find(l => l.id === 'l3')!.status).toBe('unreviewed');
    expect(state.activity.length).toBe(before.activity.length + 1);
    expect(state.activity[0]).toMatchObject({ caseId: 'c1', time });
  });
  it('ignores a missing lead', () => {
    const state = createInitialState();
    expect(reducer(state, { type: 'review', id: 'missing', status: 'reviewed', notes: '', time })).toBe(state);
  });
  it('reopening a reviewed lead removes its report eligibility', () => {
    const checked = reducer(createInitialState(), { type: 'review', id: 'l1', status: 'reviewed', notes: 'Source checked.', time });
    expect(makeReport(checked, 'c1', ['l1'], '', time).leads).toHaveLength(1);
    const reopened = reducer(checked, { type: 'review', id: 'l1', status: 'unreviewed', notes: 'New source received.', time });
    expect(reopened.leads.find(l => l.id === 'l1')!.reviewedAt).toBeUndefined();
    expect(makeReport(reopened, 'c1', ['l1'], '', time).leads).toEqual([]);
  });
});

describe('import and case actions', () => {
  it('imports one source and lead for each case exactly once with valid graph references', () => {
    for (const caseId of ['c1', 'c2', 'c3']) {
      const initial = createInitialState();
      const imported = reducer(initial, { type: 'import-pack', caseId, time });
      expect(imported.sources).toHaveLength(initial.sources.length + 1);
      expect(imported.leads).toHaveLength(initial.leads.length + 1);
      expect(imported.relations.length).toBeGreaterThan(initial.relations.length);
      expect(imported.sources.at(-1)!.caseId).toBe(caseId);
      expect(imported.leads.at(-1)!.caseId).toBe(caseId);
      expect(imported.loadedPacks).toHaveLength(1);
      assertReferences(imported);
      expect(reducer(imported, { type: 'import-pack', caseId, time })).toBe(imported);
      expect(initial.loadedPacks).toEqual([]);
    }
  });
  it('ignores import for an unknown case', () => {
    const initial = createInitialState();
    expect(reducer(initial, { type: 'import-pack', caseId: 'missing', time })).toBe(initial);
  });
  it('adds a case and supports importing into it', () => {
    const initial = createInitialState();
    const record = { ...initial.cases[0], id: 'c4', reference: 'DL/2026/0901', title: 'New inquiry' };
    const added = reducer(initial, { type: 'add-case', record, time });
    record.title = 'Changed outside state';
    expect(added.cases.find(c => c.id === 'c4')!.title).toBe('New inquiry');
    expect(added.activity[0].caseId).toBe('c4');
    expect(reducer(added, { type: 'add-case', record, time })).toBe(added);
    assertReferences(reducer(added, { type: 'import-pack', caseId: 'c4', time }));
  });
  it('reset restores the complete initial state', () => {
    const imported = reducer(createInitialState(), { type: 'import-pack', caseId: 'c1', time });
    expect(reducer(imported, { type: 'reset' })).toEqual(createInitialState());
  });
});

describe('immutable report snapshots', () => {
  it('includes only reviewed matching-case leads and accessible source references', () => {
    let state = createInitialState();
    for (const id of ['l1', 'l2', 'l4']) state = reducer(state, { type: 'review', id, status: 'reviewed', notes: 'Verified against source.', time });
    const restrictedId = state.sources.find(s => s.restricted)!.id;
    state.leads[0].sourceIds.push(restrictedId);
    const report = makeReport(state, 'c1', ['l1', 'l2', 'l3', 'l4', 'missing', 'l1'], 'Working note', time);
    expect(report.leads.map(l => l.id)).toEqual(['l1', 'l2']);
    expect(report.sources.some(s => s.restricted)).toBe(false);
    expect(report.leads.flatMap(l => l.sourceIds)).not.toContain(restrictedId);
    expect(report.caseReference).toBe('DL/2026/0418');
    const originalSourceText = report.sources[0].fullText;
    state.sources.find(s => s.id === report.sources[0].id)!.fullText = 'changed';
    state.leads[0].title = 'Changed lead';
    state.leads[0].entityIds.push('missing');
    expect(report.sources[0].fullText).toBe(originalSourceText);
    expect(report.leads[0].title).not.toBe('Changed lead');
    expect(report.leads[0].entityIds).not.toContain('missing');
  });
  it('stores a detached report and does not duplicate the same snapshot', () => {
    const state = reducer(createInitialState(), { type: 'review', id: 'l1', status: 'reviewed', notes: '', time });
    const report = makeReport(state, 'c1', ['l1'], 'Original', time);
    const saved = reducer(state, { type: 'save-report', report });
    report.notes = 'Edited outside state';
    report.leads[0].sourceIds.push('missing');
    expect(saved.reports[0].notes).toBe('Original');
    expect(saved.reports[0].leads[0].sourceIds).not.toContain('missing');
    expect(saved.activity.length).toBe(state.activity.length + 1);
    expect(reducer(saved, { type: 'save-report', report })).toBe(saved);
  });
  it('rejects an unknown report case', () => {
    expect(() => makeReport(createInitialState(), 'missing', [], '', time)).toThrow();
  });
  it('refuses to store a report containing a restricted source', () => {
    const state = reducer(createInitialState(), { type: 'review', id: 'l1', status: 'reviewed', notes: '', time });
    const report = makeReport(state, 'c1', ['l1'], '', time);
    report.sources.push(state.sources.find(source => source.restricted)!);
    expect(reducer(state, { type: 'save-report', report })).toBe(state);
  });
});

describe('persistence', () => {
  it('round-trips valid edited state', () => {
    const state = reducer(createInitialState(), { type: 'review', id: 'l1', status: 'reviewed', notes: 'Checked', time });
    expect(loadState(JSON.stringify(state))).toEqual(state);
  });
  it('preserves imported packs and historical report snapshots on reload', () => {
    let state = reducer(createInitialState(), { type: 'import-pack', caseId: 'c1', time });
    state = reducer(state, { type: 'review', id: 'l1', status: 'reviewed', notes: '', time });
    const report = makeReport(state, 'c1', ['l1'], 'Reviewed source trail', time);
    state = reducer(state, { type: 'save-report', report });
    state = reducer(state, { type: 'review', id: 'l1', status: 'dismissed', notes: 'Later information changed assessment.', time });
    const restored = loadState(JSON.stringify(state));
    expect(restored).toEqual(state);
    expect(restored.reports[0].leads[0].status).toBe('reviewed');
    expect(restored.leads.find(l => l.id === 'l1')!.status).toBe('dismissed');
    expect(reducer(restored, { type: 'import-pack', caseId: 'c1', time })).toBe(restored);
  });
  it.each([null, '', '{', 'null', '[]', '{}', '{"schemaVersion":2}', '{"schemaVersion":1,"cases":null}'])('recovers safely from %s', raw => {
    expect(loadState(raw)).toEqual(createInitialState());
  });
  it('rejects malformed nested values, duplicate IDs, and dangling references', () => {
    const badStates = [
      (s: AppState) => { s.leads[0].sourceIds = null as never; },
      (s: AppState) => { s.entities[0].x = 'bad' as never; },
      (s: AppState) => { s.cases.push(s.cases[0]); },
      (s: AppState) => { s.relations[0].source = 'missing'; },
      (s: AppState) => { s.sources[0].restricted = 'false' as never; },
      (s: AppState) => { s.activity.push({ id: 'invalid' } as never); },
    ];
    for (const corrupt of badStates) {
      const state = createInitialState();
      corrupt(state);
      expect(loadState(JSON.stringify(state))).toEqual(createInitialState());
    }
  });
});
