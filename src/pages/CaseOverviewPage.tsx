import { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Graph, Clock, ArrowLeft, ArrowUpRight, Check, X as XIcon,
  Phone, Car, MapPin, Bank, Person, Buildings, Folder,
  Sparkle, UploadSimple, FileText,
} from '@phosphor-icons/react';
import { useStore } from '../store';
import { StatusBadge, ConfidenceBadge, DateText, Empty, Modal } from '../components/ui';
import { ImportEvidenceModal } from '../components/ImportEvidenceModal';

type CtxType = { notify: (m: string) => void };

export function CaseOverviewPage() {
  const { caseId = 'c1' } = useParams<{ caseId: string }>();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const { notify } = useOutletContext<CtxType>();

  const [rejectLeadId, setRejectLeadId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [approveLeadId, setApproveLeadId] = useState<string | null>(null);
  const [approveNotes, setApproveNotes] = useState('');
  const [summaryClosed, setSummaryClosed] = useState(true);
  const [importOpen, setImportOpen] = useState(false);

  const current = state.cases.find(c => c.id === caseId) ?? state.cases[0];
  const caseLeads = state.leads.filter(l => l.caseId === caseId);
  const caseEntities = state.entities.filter(e => e.caseIds.includes(caseId));
  const caseSources = state.sources.filter(s => s.caseId === caseId);

  const people  = caseEntities.filter(e => e.kind === 'Person');
  const phones  = caseEntities.filter(e => e.kind === 'Phone');
  const vehicles= caseEntities.filter(e => e.kind === 'Vehicle');
  const locs    = caseEntities.filter(e => e.kind === 'Location');
  const accts   = caseEntities.filter(e => e.kind === 'Financial');
  const cases   = caseEntities.filter(e => e.kind === 'Case');

  function approveLead() {
    if (!approveLeadId) return;
    dispatch({ type: 'approve-lead', id: approveLeadId, notes: approveNotes.trim(), time: new Date().toISOString() });
    setApproveLeadId(null); setApproveNotes('');
    notify('Lead approved and marked reviewed.');
  }

  function rejectLead() {
    if (!rejectLeadId) return;
    if (!rejectReason.trim()) { setRejectError('A reason is required to reject a lead.'); return; }
    dispatch({ type: 'reject-lead', id: rejectLeadId, notes: rejectReason.trim(), time: new Date().toISOString() });
    setRejectLeadId(null); setRejectReason(''); setRejectError('');
    notify('Lead rejected. Decision recorded.');
  }

  const kindIcon = (k: string) => {
    const map: Record<string, React.ReactNode> = {
      Person: <Person size={13} />, Phone: <Phone size={13} />,
      Vehicle: <Car size={13} />, Location: <MapPin size={13} />,
      Financial: <Bank size={13} />, Case: <Folder size={13} />,
      Organization: <Buildings size={13} />,
    };
    return map[k] ?? null;
  };

  const leadTypeBadge = (_kind: string) => 'badge-gray';
  void leadTypeBadge;

  return (
    <div className="page">
      {/* Breadcrumb + nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, fontSize: 12 }}>
        <button className="text-btn" onClick={() => navigate('/cases')}>
          <ArrowLeft size={14} /> Cases
        </button>
        <span style={{ color: 'var(--border-mid)' }}>/</span>
        <span className="mono">{current.reference}</span>
        {current.classification && (
          <span className="badge badge-red" style={{ fontSize: 9 }}>{current.classification}</span>
        )}
        <StatusBadge status={current.status} />
      </div>

      {/* Case title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, lineHeight: 1.2 }}>{current.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
          <span>{current.station}</span>
          <span>·</span>
          <span>{current.district} district</span>
          <span>·</span>
          <span>Lead officer: {current.officer}</span>
          <span>·</span>
          <span>Updated: <DateText value={current.updated} /></span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setImportOpen(true)}>
            <UploadSimple size={15} /> Import Evidence
          </button>
          <button className="btn" onClick={() => navigate(`/cases/${caseId}/connections`)}>
            <Graph size={15} /> Network Graph
          </button>
          <button className="btn" onClick={() => navigate(`/cases/${caseId}/reports`)}>
            <FileText size={15} /> Investigation Report
          </button>
          <button className="btn" onClick={() => navigate(`/cases/${caseId}/timeline`)}>
            <Clock size={15} /> Timeline
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'People', count: people.length, icon: <Person size={13} />, kind: 'Person' },
          { label: 'Phones', count: phones.length, icon: <Phone size={13} />, kind: 'Phone' },
          { label: 'Locations', count: locs.length, icon: <MapPin size={13} />, kind: 'Location' },
          { label: 'Vehicles', count: vehicles.length, icon: <Car size={13} />, kind: 'Vehicle' },
          { label: 'Accounts', count: accts.length, icon: <Bank size={13} />, kind: 'Financial' },
          { label: 'Linked Cases', count: cases.length, icon: <Folder size={13} />, kind: 'Case' },
        ].map(({ label, count, icon }) => (
          <button
            key={label}
            onClick={() => navigate(`/cases/${caseId}/connections`)}
            className="btn btn-sm"
            style={{ gap: 5, color: 'var(--text-2)' }}
          >
            {icon}
            <span style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{count}</span>
            <span style={{ fontWeight: 400, color: 'var(--muted)' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/cases/${caseId}/connections`)}>
          <Graph size={15} /> Connections
        </button>
        <button className="btn" onClick={() => navigate(`/cases/${caseId}/evidence`)}>
          Evidence Timeline
        </button>
        <button className="btn" onClick={() => navigate(`/cases/${caseId}/timeline`)}>
          <Clock size={15} /> Event Timeline
        </button>
        <button className="btn" onClick={() => navigate('/assistant')}>
          <Sparkle size={15} /> Ask AI
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Left — leads */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Case summary (collapsed) */}
          <div className="card">
            <button
              className="card-header"
              style={{ width: '100%', cursor: 'pointer', background: 'none', border: 0, textAlign: 'left' }}
              onClick={() => setSummaryClosed(v => !v)}
            >
              <h3>Case Summary</h3>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{summaryClosed ? 'Show' : 'Hide'}</span>
            </button>
            {!summaryClosed && (
              <div className="card-body" style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
                {current.summary}
              </div>
            )}
          </div>

          {/* AI Leads */}
          <div className="card">
            <div className="card-header">
              <h3>
                <Sparkle size={14} style={{ marginRight: 5, verticalAlign: 'middle', color: 'var(--blue-primary)' }} />
                AI Leads
              </h3>
              <span className="badge badge-amber" style={{ fontSize: 9 }}>
                {caseLeads.filter(l => l.leadStatus === 'pending').length} pending
              </span>
            </div>

            {caseLeads.length === 0
              ? <Empty title="No leads for this case">Import evidence to generate leads.</Empty>
              : caseLeads.map(lead => (
                <div key={lead.id} style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        {lead.leadType && <span className="badge badge-blue" style={{ fontSize: 9 }}>{lead.leadType}</span>}
                        {lead.confidence !== undefined && <ConfidenceBadge value={lead.confidence} />}
                        <StatusBadge status={lead.leadStatus ?? lead.status} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{lead.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.6 }}>{lead.summary}</div>
                    </div>
                  </div>

                  {/* Entity chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                    {lead.entityIds.slice(0, 4).map(eid => {
                      const ent = state.entities.find(e => e.id === eid);
                      if (!ent) return null;
                      return (
                        <button
                          key={eid}
                          className={`filter-chip badge-${ent.kind}`}
                          onClick={() => navigate(`/entities/${eid}`)}
                        >
                          {kindIcon(ent.kind)} {ent.label}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button className="btn btn-sm" onClick={() => navigate(`/cases/${caseId}/connections`)}>
                      <Graph size={12} /> Graph
                    </button>
                    <button className="btn btn-sm" onClick={() => navigate(`/cases/${caseId}/evidence`)}>
                      Evidence
                    </button>
                    {lead.leadStatus === 'pending' && (
                      <>
                        <button className="btn btn-sm" style={{ color: 'var(--green)', borderColor: 'var(--green-border)' }}
                          onClick={() => { setApproveLeadId(lead.id); setApproveNotes(''); }}>
                          <Check size={12} /> Approve
                        </button>
                        <button className="btn btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red-border)' }}
                          onClick={() => { setRejectLeadId(lead.id); setRejectReason(''); setRejectError(''); }}>
                          <XIcon size={12} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Right — people and metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* People */}
          <div className="card">
            <div className="card-header">
              <h3>People in this case</h3>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{people.length}</span>
            </div>
            {people.map(p => (
              <button key={p.id} onClick={() => navigate(`/entities/${p.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 16px', background: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--blue-subtle)', border: '1px solid var(--blue-border)', display: 'grid', placeItems: 'center', color: 'var(--blue-primary)', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                  {p.label.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{p.subtitle}</div>
                </div>
                {p.status && <StatusBadge status={p.status} />}
              </button>
            ))}
          </div>

          {/* Sources */}
          <div className="card">
            <div className="card-header">
              <h3>Source records</h3>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{caseSources.length}</span>
            </div>
            {caseSources.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid var(--border)' }}>
                <span className={`badge badge-blue`} style={{ fontSize: 9, flexShrink: 0 }}>{s.type}</span>
                <span style={{ fontSize: 11, color: 'var(--text-2)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                {s.restricted && <span className="badge badge-red" style={{ fontSize: 9 }}>Restricted</span>}
              </div>
            ))}
          </div>

          {/* Linked cases */}
          {(current.linkedCases?.length ?? 0) > 0 && (
            <div className="card">
              <div className="card-header"><h3>Linked cases</h3></div>
              {current.linkedCases!.map(ref => {
                const linked = state.cases.find(c => c.reference === ref);
                return (
                  <button key={ref}
                    onClick={() => linked && navigate(`/cases/${linked.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 16px', borderBottom: '1px solid var(--border)', background: 'none', border: 0, cursor: 'pointer', textAlign: 'left' }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--blue-primary)' }}>{ref}</span>
                    {linked && <StatusBadge status={linked.status} />}
                    <ArrowUpRight size={13} style={{ color: 'var(--muted)', marginLeft: 'auto' }} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Approve modal */}
      <Modal open={!!approveLeadId} onClose={() => setApproveLeadId(null)} title="Approve this lead"
        description={state.leads.find(l => l.id === approveLeadId)?.title}>
        <div className="form">
          <label>Reviewer note (optional)
            <textarea rows={4} value={approveNotes} onChange={e => setApproveNotes(e.target.value)}
              placeholder="Record what you checked and any remaining limitations." />
          </label>
          <p className="small muted">Approval records your review. It does not establish that a connection is proof of wrongdoing.</p>
          <div className="form-actions">
            <button className="btn" onClick={() => setApproveLeadId(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={approveLead}><Check size={14} /> Approve lead</button>
          </div>
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal open={!!rejectLeadId} onClose={() => setRejectLeadId(null)} title="Reject this lead"
        description={state.leads.find(l => l.id === rejectLeadId)?.title}>
        <div className="form">
          <label>Reason for rejection (required)
            <textarea rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Explain why this lead should not be pursued." />
          </label>
          {rejectError && <p className="error-msg">{rejectError}</p>}
          <div className="form-actions">
            <button className="btn" onClick={() => setRejectLeadId(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={rejectLead}>Reject lead</button>
          </div>
        </div>
      </Modal>

      {/* Ingestion & Import modal */}
      <ImportEvidenceModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        caseId={caseId}
        onNotify={notify}
      />
    </div>
  );
}
