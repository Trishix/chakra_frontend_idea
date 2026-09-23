import { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft, Check, X as XIcon, ArrowUpRight,
  VideoCamera, FileText, LockKey, Graph, UploadSimple,
} from '@phosphor-icons/react';
import { useStore } from '../store';
import { StatusBadge, Modal, DateText } from '../components/ui';
import { ImportEvidenceModal } from '../components/ImportEvidenceModal';

type CtxType = { notify: (m: string) => void };

export function EvidenceTimelinePage() {
  const { caseId = 'c1' } = useParams<{ caseId: string }>();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const { notify } = useOutletContext<CtxType>();

  const [approveId, setApproveId]     = useState<string | null>(null);
  const [rejectId, setRejectId]       = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError]  = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [fullSourceId, setFullSourceId] = useState<string | null>(null);
  const [importOpen, setImportOpen]   = useState(false);

  const sources = state.sources.filter(s => s.caseId === caseId);
  const leads   = state.leads.filter(l => l.caseId === caseId);
  const current = state.cases.find(c => c.id === caseId) ?? state.cases[0];

  function approveLead() {
    if (!approveId) return;
    dispatch({ type: 'approve-lead', id: approveId, notes: approveNotes.trim(), time: new Date().toISOString() });
    setApproveId(null); setApproveNotes('');
    notify('Lead approved.');
  }

  function rejectLead() {
    if (!rejectId) return;
    if (!rejectReason.trim()) { setRejectError('A reason is required.'); return; }
    dispatch({ type: 'reject-lead', id: rejectId, notes: rejectReason.trim(), time: new Date().toISOString() });
    setRejectId(null); setRejectReason(''); setRejectError('');
    notify('Lead rejected.');
  }

  const fullSource = fullSourceId ? state.sources.find(s => s.id === fullSourceId) : null;

  /* Build combined timeline: sources first, then AI leads */
  type TLItem =
    | { kind: 'source'; source: typeof sources[0]; step: number }
    | { kind: 'lead';   lead: typeof leads[0];   step: number };

  const items: TLItem[] = [
    ...sources.map((s, i) => ({ kind: 'source' as const, source: s, step: i + 1 })),
    ...leads.map((l, i) => ({ kind: 'lead' as const, lead: l, step: sources.length + i + 1 })),
  ];

  const typeColor: Record<string, string> = {
    FIR:       'badge-navy',
    CDR:       'badge-blue',
    Financial: 'badge-orange',
    CCTV:      'badge-green',
    ANPR:      'badge-green',
    Statement: 'badge-gray',
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 12 }}>
            <button className="text-btn" onClick={() => navigate(`/cases/${caseId}`)}>
              <ArrowLeft size={13} /> {current.reference}
            </button>
          </div>
          <h1 style={{ fontSize: 22 }}>Evidence Timeline</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            Source records and AI-suggested links — {sources.length} records · {leads.filter(l => l.leadStatus === 'pending').length} pending review
          </p>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setImportOpen(true)}>
            <UploadSimple size={15} /> Ingest Evidence
          </button>
          <button className="btn" onClick={() => navigate(`/cases/${caseId}/connections`)}>
            <Graph size={15} /> View Network
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Timeline */}
        <div className="card">
          <div className="card-header">
            <h3>Evidence trail — {current.reference}</h3>
            <span className="mono" style={{ fontSize: 10 }}>Main case: {current.reference}</span>
          </div>
          <div style={{ padding: '8px 20px' }}>
            {items.map(item => {
              if (item.kind === 'source') {
                const s = item.source;
                const expanded = expandedId === s.id;
                return (
                  <div key={s.id} className="ev-card">
                    <div className="ev-num">{item.step}</div>
                    <div className="ev-body">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span className={`badge ev-type-recorded ${typeColor[s.type] ?? 'badge-gray'}`} style={{ fontSize: 9 }}>
                          RECORDED EVIDENCE
                        </span>
                        <span className={`badge ${typeColor[s.type] ?? 'badge-gray'}`} style={{ fontSize: 9 }}>{s.type}</span>
                        {s.restricted && <span className="badge badge-red" style={{ fontSize: 9 }}>Restricted</span>}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                        <DateText value={s.date} /> · {s.pages} pages · {s.id}
                      </div>
                      {!s.restricted && (
                        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 8, lineHeight: 1.65, background: 'var(--surface-alt)', padding: '8px 10px', borderRadius: 3, borderLeft: '2px solid var(--border-mid)' }}>
                          {expanded ? s.excerpt : s.excerpt.slice(0, 120) + (s.excerpt.length > 120 ? '…' : '')}
                        </div>
                      )}
                      {s.restricted && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px', background: 'var(--surface-alt)', borderRadius: 3, marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
                          <LockKey size={14} /> Access restricted in this demonstration view.
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                        {!s.restricted && (
                          <button className="btn btn-sm" onClick={() => setFullSourceId(s.id)}>
                            <FileText size={12} /> View Source
                          </button>
                        )}
                        {s.excerpt.length > 120 && !s.restricted && (
                          <button className="text-btn" style={{ fontSize: 10 }} onClick={() => setExpandedId(expanded ? null : s.id)}>
                            {expanded ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              /* Lead item */
              const l = item.lead;
              const isSuggested = l.kind === 'corroborated' || l.kind === 'unverified';
              const badgeClass = isSuggested ? 'ev-type-suggested' : 'ev-type-match';
              const badgeLabel = l.kind === 'corroborated' ? 'SUGGESTED LINK' : 'SUGGESTED MATCH';
              return (
                <div key={l.id} className="ev-card" style={{ background: l.leadStatus === 'pending' ? '#fffbeb' : undefined }}>
                  <div className="ev-num" style={{ background: l.leadStatus === 'pending' ? '#d97706' : l.leadStatus === 'approved' ? '#166534' : '#64748b' }}>
                    {item.step}
                  </div>
                  <div className="ev-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span className={`badge ${badgeClass}`} style={{ fontSize: 9 }}>{badgeLabel}</span>
                      <StatusBadge status={l.leadStatus ?? l.status} />
                      {l.confidence !== undefined && (
                        <span className="mono" style={{ fontSize: 10, color: l.confidence >= 90 ? 'var(--green)' : 'var(--amber)' }}>
                          {l.confidence}%
                        </span>
                      )}
                      {l.leadStatus === 'pending' && (
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--amber)' }}>Pending review</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{l.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.65 }}>{l.summary}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                      <button className="btn btn-sm" onClick={() => navigate(`/cases/${caseId}/connections`)}>
                        <Graph size={12} /> View Graph
                      </button>
                      {l.sourceIds[0] && (
                        <button className="btn btn-sm" onClick={() => setFullSourceId(l.sourceIds[0])}>
                          <FileText size={12} /> View Source
                        </button>
                      )}
                      {l.sourceIds.some(id => {
                        const src = state.sources.find(s => s.id === id);
                        return src?.type === 'CCTV' || src?.type === 'ANPR';
                      }) && (
                        <button className="btn btn-sm" onClick={() => navigate('/camera')}>
                          <VideoCamera size={12} /> View recording
                        </button>
                      )}
                      {l.leadStatus === 'pending' && (
                        <>
                          <button className="btn btn-sm" style={{ color: 'var(--green)', borderColor: 'var(--green-border)' }}
                            onClick={() => { setApproveId(l.id); setApproveNotes(''); }}>
                            <Check size={12} /> Approve
                          </button>
                          <button className="btn btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red-border)' }}
                            onClick={() => { setRejectId(l.id); setRejectReason(''); setRejectError(''); }}>
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
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header"><h3>Review Action</h3></div>
            <div className="card-body" style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
              Review each AI-suggested link against its source records. Add a reason before approving or rejecting. Your decision is recorded locally.
            </div>
            <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-primary btn-wide" onClick={() => navigate('/leads')}>
                Review all leads
              </button>
              <button className="btn btn-wide" onClick={() => navigate(`/cases/${caseId}/connections`)}>
                <Graph size={14} /> Open network graph
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Sources</h3><span style={{ fontSize: 11, color: 'var(--muted)' }}>{sources.length}</span></div>
            {sources.map(s => (
              <button key={s.id}
                onClick={() => !s.restricted && setFullSourceId(s.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 16px', background: 'none', borderBottom: '1px solid var(--border)', cursor: s.restricted ? 'default' : 'pointer', textAlign: 'left' }}>
                <span className={`badge ${typeColor[s.type] ?? 'badge-gray'}`} style={{ fontSize: 9, flexShrink: 0 }}>{s.type}</span>
                <span style={{ fontSize: 11, color: 'var(--text-2)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                {s.restricted ? <LockKey size={13} style={{ color: 'var(--muted)' }} /> : <ArrowUpRight size={13} style={{ color: 'var(--muted)' }} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Source document modal */}
      <Modal open={!!fullSource} onClose={() => setFullSourceId(null)} title="Source document" description="Synthetic demonstration record." wide>
        {fullSource && (
          <div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, fontSize: 11, color: 'var(--muted)' }}>
              <span className={`badge ${typeColor[fullSource.type] ?? 'badge-gray'}`}>{fullSource.type}</span>
              <span><DateText value={fullSource.date} /></span>
              <span>{fullSource.pages} pages</span>
              <span className="badge badge-gray">SYNTHETIC RECORD</span>
            </div>
            <div className="source-doc">
              <div className="source-doc-header">CI INTEL / DEMONSTRATION RECORD · {fullSource.id}</div>
              <h2 style={{ fontSize: 18, marginBottom: 16 }}>{fullSource.title}</h2>
              <hr className="divider-line" style={{ marginBottom: 20 }} />
              <blockquote className="source-doc">
                <mark>{fullSource.excerpt}</mark>
              </blockquote>
              {fullSource.fullText.split('\n\n').filter(p => p !== fullSource.excerpt).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Approve modal */}
      <Modal open={!!approveId} onClose={() => setApproveId(null)} title="Approve this lead"
        description={leads.find(l => l.id === approveId)?.title}>
        <div className="form">
          <label>Reviewer note (optional)
            <textarea rows={4} value={approveNotes} onChange={e => setApproveNotes(e.target.value)}
              placeholder="Record what you checked." />
          </label>
          <div className="form-actions">
            <button className="btn" onClick={() => setApproveId(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={approveLead}><Check size={14} /> Approve</button>
          </div>
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal open={!!rejectId} onClose={() => setRejectId(null)} title="Reject this lead"
        description={leads.find(l => l.id === rejectId)?.title}>
        <div className="form">
          <label>Reason (required)
            <textarea rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Explain why this lead should not be pursued." />
          </label>
          {rejectError && <p className="error-msg">{rejectError}</p>}
          <div className="form-actions">
            <button className="btn" onClick={() => setRejectId(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={rejectLead}>Reject</button>
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
