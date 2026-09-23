import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Check, X as XIcon, Graph } from '@phosphor-icons/react';
import { useStore } from '../store';
import { ConfidenceBadge, StatusBadge, Modal } from '../components/ui';
import type { LeadStatus } from '../domain/types';

type CtxType = { notify: (m: string) => void };

export function ReviewLeadsPage() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const { notify } = useOutletContext<CtxType>();

  const [tab, setTab] = useState<LeadStatus>('pending');
  const [caseFilter, setCaseFilter] = useState('all');
  const [approveId, setApproveId]     = useState<string | null>(null);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectId, setRejectId]       = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError]  = useState('');

  const allLeads = state.leads.filter(l =>
    (caseFilter === 'all' || l.caseId === caseFilter) &&
    (tab === 'pending' ? l.leadStatus === 'pending' : tab === 'approved' ? l.leadStatus === 'approved' : l.leadStatus === 'rejected')
  );

  const counts = {
    pending:  state.leads.filter(l => l.leadStatus === 'pending').length,
    approved: state.leads.filter(l => l.leadStatus === 'approved').length,
    rejected: state.leads.filter(l => l.leadStatus === 'rejected').length,
  };

  function approveLead() {
    if (!approveId) return;
    dispatch({ type: 'approve-lead', id: approveId, notes: approveNotes.trim(), time: new Date().toISOString() });
    setApproveId(null); setApproveNotes('');
    notify('Lead approved and marked reviewed.');
  }

  function rejectLead() {
    if (!rejectId) return;
    if (!rejectReason.trim()) { setRejectError('A reason is required.'); return; }
    dispatch({ type: 'reject-lead', id: rejectId, notes: rejectReason.trim(), time: new Date().toISOString() });
    setRejectId(null); setRejectReason(''); setRejectError('');
    notify('Lead rejected. Decision recorded.');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 style={{ fontSize: 22 }}>Review Leads</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            AI-generated investigative leads requiring human validation before use.
          </p>
        </div>
        <div className="actions">
          <div className="select-wrap">
            <span style={{ color: 'var(--muted)' }}>Case</span>
            <select value={caseFilter} onChange={e => setCaseFilter(e.target.value)} aria-label="Filter by case">
              <option value="all">All cases</option>
              {state.cases.map(c => <option key={c.id} value={c.id}>{c.reference}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {(['pending', 'approved', 'rejected'] as LeadStatus[]).map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span>{counts[t]}</span>
          </button>
        ))}
      </div>

      {allLeads.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          <p style={{ fontSize: 13 }}>No {tab} leads{caseFilter !== 'all' ? ' for this case' : ''}.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {allLeads.map(lead => {
            const caseRec = state.cases.find(c => c.id === lead.caseId);
            return (
              <div key={lead.id} className="card">
                <div style={{ padding: '14px 18px' }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        {lead.leadType && <span className="badge badge-blue" style={{ fontSize: 9 }}>{lead.leadType}</span>}
                        {lead.confidence !== undefined && <ConfidenceBadge value={lead.confidence} />}
                        <StatusBadge status={lead.leadStatus ?? lead.status} />
                        {caseRec && (
                          <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{caseRec.reference}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{lead.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5, lineHeight: 1.65 }}>{lead.summary}</div>
                    </div>
                  </div>

                  {/* Entity chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                    {lead.entityIds.map(eid => {
                      const ent = state.entities.find(e => e.id === eid);
                      if (!ent) return null;
                      return (
                        <button key={eid} className={`filter-chip badge-${ent.kind}`} onClick={() => navigate(`/entities/${eid}`)}>
                          {ent.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, color: 'var(--muted)', marginBottom: 10, flexWrap: 'wrap' }}>
                    <span>{lead.sourceIds.length} source{lead.sourceIds.length !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>{lead.date}</span>
                    {lead.notes && (
                      <>
                        <span>·</span>
                        <span style={{ fontStyle: 'italic' }}>Note: {lead.notes}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button className="btn btn-sm" onClick={() => navigate(`/cases/${lead.caseId}`)}>
                      View Case
                    </button>
                    <button className="btn btn-sm" onClick={() => navigate(`/cases/${lead.caseId}/connections`)}>
                      <Graph size={12} /> View Graph
                    </button>
                    <button className="btn btn-sm" onClick={() => navigate(`/cases/${lead.caseId}/evidence`)}>
                      View Evidence
                    </button>
                    {lead.leadStatus === 'pending' && (
                      <>
                        <button className="btn btn-sm" style={{ color: 'var(--green)', borderColor: 'var(--green-border)' }}
                          onClick={() => { setApproveId(lead.id); setApproveNotes(''); }}>
                          <Check size={12} /> Approve
                        </button>
                        <button className="btn btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red-border)' }}
                          onClick={() => { setRejectId(lead.id); setRejectReason(''); setRejectError(''); }}>
                          <XIcon size={12} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 16, padding: '10px 14px', fontSize: 10, color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        AI assists investigators. All leads require human validation. Review decisions are recorded locally and do not constitute legal findings.
      </div>

      {/* Approve modal */}
      <Modal open={!!approveId} onClose={() => setApproveId(null)} title="Approve this lead"
        description={state.leads.find(l => l.id === approveId)?.title}>
        <div className="form">
          <label>Reviewer note (optional)
            <textarea rows={4} value={approveNotes} onChange={e => setApproveNotes(e.target.value)}
              placeholder="Record what you checked and any remaining limitations." />
          </label>
          <p className="small muted">Approval records your review. It does not establish that a connection is proof of wrongdoing.</p>
          <div className="form-actions">
            <button className="btn" onClick={() => setApproveId(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={approveLead}><Check size={14} /> Approve lead</button>
          </div>
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal open={!!rejectId} onClose={() => setRejectId(null)} title="Reject this lead"
        description={state.leads.find(l => l.id === rejectId)?.title}>
        <div className="form">
          <label>Reason for rejection (required)
            <textarea rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Explain why this lead should not be pursued." />
          </label>
          {rejectError && <p className="error-msg">{rejectError}</p>}
          <div className="form-actions">
            <button className="btn" onClick={() => setRejectId(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={rejectLead}>Reject lead</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
