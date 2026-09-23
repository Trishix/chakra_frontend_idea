import { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  FileText, DownloadSimple, Plus, Check,
  ShieldCheck, Clock,
} from '@phosphor-icons/react';
import { useStore } from '../store';
import { makeReport } from '../domain/state';
import { downloadReport } from '../domain/pdf';
import { DateText, Empty, StatusBadge } from '../components/ui';
import type { ReportSnapshot } from '../domain/types';

type CtxType = { notify: (m: string) => void };

export function ReportsPage() {
  const { caseId } = useParams<{ caseId?: string }>();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const { notify } = useOutletContext<CtxType>();

  const defaultCaseId = caseId && state.cases.some(c => c.id === caseId) ? caseId : (state.cases[0]?.id ?? 'c1');
  const [selectedCaseId, setSelectedCaseId] = useState(defaultCaseId);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [reportNotes, setReportNotes] = useState('');
  const [isComposing, setIsComposing] = useState(state.reports.length === 0);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(state.reports[0]?.id ?? null);
  const [isDownloading, setIsDownloading] = useState(false);

  const activeCase = state.cases.find(c => c.id === selectedCaseId) ?? state.cases[0];
  const selectedReport = state.reports.find(r => r.id === selectedReportId) ?? null;

  // Only reviewed or approved leads can be included in court/prosecution report
  const eligibleLeads = state.leads.filter(
    l => l.caseId === selectedCaseId && (l.status === 'reviewed' || l.leadStatus === 'approved')
  );

  function toggleLead(id: string) {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function handleSaveReport() {
    if (selectedLeadIds.length === 0) return;
    try {
      const snapshot = makeReport(
        state,
        selectedCaseId,
        selectedLeadIds,
        reportNotes,
        new Date().toISOString()
      );
      dispatch({ type: 'save-report', report: snapshot });
      setSelectedReportId(snapshot.id);
      setIsComposing(false);
      setSelectedLeadIds([]);
      setReportNotes('');
      notify(`Report snapshot "${snapshot.title}" saved successfully.`);
    } catch {
      notify('Failed to generate report snapshot.');
    }
  }

  async function handleDownload(report: ReportSnapshot) {
    setIsDownloading(true);
    try {
      await downloadReport(report);
      notify(`PDF downloaded: ci-intel-report-${report.id.slice(0, 8)}.pdf`);
    } catch {
      notify('PDF generation encountered an error. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: 'var(--muted)' }}>DOCKET /</span>
            <span className="mono">{activeCase?.reference}</span>
            <span className="badge badge-green" style={{ fontSize: 9 }}>AUDITABLE SNAPSHOTS</span>
          </div>
          <h1 style={{ fontSize: 22 }}>Investigation Reports</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            Court-ready report generator. Formalizes reviewed findings, evidence provenance, and uncertainty statements into immutable PDF snapshots.
          </p>
        </div>
        <div className="actions">
          <button
            className={`btn ${isComposing ? '' : 'btn-primary'}`}
            onClick={() => {
              setIsComposing(true);
              setSelectedLeadIds(eligibleLeads.map(l => l.id));
            }}
          >
            <Plus size={15} /> Compose New Report
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left column: saved reports list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <h3>Saved Snapshots</h3>
              <span className="badge badge-navy" style={{ fontSize: 9 }}>{state.reports.length}</span>
            </div>
            {state.reports.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
                <FileText size={28} style={{ color: 'var(--border-mid)', marginBottom: 8 }} />
                <p>No saved reports yet.</p>
                <span style={{ fontSize: 11 }}>Compose a report below from reviewed findings.</span>
              </div>
            ) : (
              state.reports.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedReportId(r.id);
                    setIsComposing(false);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 4,
                    width: '100%',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    background: selectedReportId === r.id && !isComposing ? 'var(--blue-subtle)' : 'none',
                    borderLeft: selectedReportId === r.id && !isComposing ? '3px solid var(--blue-primary)' : '3px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{r.title}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: 'var(--muted)' }}>
                    <span className="mono">{r.caseReference}</span>
                    <span>·</span>
                    <span>{r.leads.length} lead{r.leads.length !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <DateText value={r.createdAt} />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Quick Notice */}
          <div className="card" style={{ padding: '14px 16px', background: 'var(--surface-alt)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: 'var(--navy)', fontWeight: 600, fontSize: 12 }}>
              <ShieldCheck size={16} style={{ color: 'var(--blue-primary)' }} />
              <span>Chain of Custody Guarantee</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
              Saved report snapshots are immutable. Each export retains its original timestamp, cited source documents, and reviewer notes regardless of subsequent lead updates.
            </p>
          </div>
        </div>

        {/* Right column: Compose form OR View snapshot */}
        <div>
          {isComposing ? (
            <div className="card" style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <h2 style={{ fontSize: 17, color: 'var(--navy)' }}>Compose Investigation Report</h2>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    Aggregate verified leads and supporting excerpts into a formal report.
                  </p>
                </div>
                <span className="badge badge-amber" style={{ fontSize: 10 }}>DRAFTING SNAPSHOT</span>
              </div>

              <div className="form">
                <label>
                  Case Scope
                  <select
                    value={selectedCaseId}
                    onChange={e => {
                      setSelectedCaseId(e.target.value);
                      setSelectedLeadIds([]);
                    }}
                  >
                    {state.cases.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.reference} — {c.title}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <label style={{ marginBottom: 8 }}>
                    Select Reviewed Leads to Include ({selectedLeadIds.length} of {eligibleLeads.length})
                  </label>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>
                    Under investigative protocol, only leads with status <strong>Reviewed</strong> or <strong>Approved</strong> may be attached to the prosecution dossier.
                  </p>

                  {eligibleLeads.length === 0 ? (
                    <div className="note-box" style={{ background: '#f8fafc', borderColor: 'var(--border)' }}>
                      <Clock size={16} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600 }}>No reviewed leads in this case yet.</span>
                        <div style={{ marginTop: 4 }}>
                          Go to the <button className="text-btn" onClick={() => navigate('/leads')}>Review Leads queue</button> to validate candidate leads.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                      {eligibleLeads.map(l => {
                        const checked = selectedLeadIds.includes(l.id);
                        return (
                          <div
                            key={l.id}
                            onClick={() => toggleLead(l.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 12,
                              padding: '10px 14px',
                              borderRadius: 'var(--radius)',
                              border: `1.5px solid ${checked ? 'var(--blue-primary)' : 'var(--border)'}`,
                              background: checked ? 'var(--blue-subtle)' : 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleLead(l.id)}
                              style={{ marginTop: 3 }}
                              aria-label={`Select lead ${l.title}`}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{l.title}</span>
                                {l.leadType && <span className="badge badge-blue" style={{ fontSize: 9 }}>{l.leadType}</span>}
                                <StatusBadge status={l.leadStatus ?? l.status} />
                              </div>
                              <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>{l.summary}</p>
                              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                                Sources: {l.sourceIds.join(', ')} · Verified: <DateText value={l.reviewedAt || l.date} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <label>
                  Investigator Review Notes & Scope Declaration
                  <textarea
                    rows={4}
                    value={reportNotes}
                    onChange={e => setReportNotes(e.target.value)}
                    placeholder="Enter summary of cross-case analysis, investigative hypothesis, and evidentiary scope under CrPC Sec 91..."
                  />
                </label>

                <div className="note-box">
                  <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    <strong>Statutory Notice:</strong> Generated reports contain synthetic demonstration data. Restricted witness records and raw attachments are automatically omitted from exports to safeguard confidentiality.
                  </span>
                </div>

                <div className="form-actions">
                  {state.reports.length > 0 && (
                    <button className="btn" onClick={() => setIsComposing(false)}>
                      Cancel
                    </button>
                  )}
                  <button
                    className="btn btn-primary"
                    disabled={selectedLeadIds.length === 0}
                    onClick={handleSaveReport}
                  >
                    <Check size={16} /> Save Snapshot & Preview
                  </button>
                </div>
              </div>
            </div>
          ) : selectedReport ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Snapshot header toolbar */}
              <div className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: 16, color: 'var(--navy)' }}>{selectedReport.title}</h2>
                    <span className="badge badge-green" style={{ fontSize: 9 }}>SAVED SNAPSHOT</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    Case: <span className="mono">{selectedReport.caseReference}</span> · Created <DateText value={selectedReport.createdAt} /> · {selectedReport.leads.length} verified findings
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-primary"
                    disabled={isDownloading}
                    onClick={() => void handleDownload(selectedReport)}
                  >
                    <DownloadSimple size={15} />
                    {isDownloading ? 'Generating PDF…' : 'Download Court-Ready PDF'}
                  </button>
                </div>
              </div>

              {/* Printable Document Paper View */}
              <div className="card" style={{ padding: '36px 40px', background: '#fffef9', border: '1px solid #e2ddd0', boxShadow: '0 4px 20px rgba(0,0,0,.06)' }}>
                {/* Official seal header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0c1e35', paddingBottom: 16, marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#0c1e35', letterSpacing: '-.02em' }}>CI INTEL</div>
                    <div style={{ fontSize: 10, color: '#556677', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 2 }}>
                      Criminal Intelligence & Knowledge Graph Platform
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: '#0c1e35' }}>{selectedReport.caseReference}</div>
                    <div style={{ fontSize: 10, color: '#667788', marginTop: 2 }}>Dossier ID: {selectedReport.id.slice(0, 12)}</div>
                  </div>
                </div>

                {/* Report title and meta */}
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 22, color: '#0c1e35', marginBottom: 6 }}>{selectedReport.title}</h1>
                  <div style={{ fontSize: 11, color: '#556677' }}>
                    Generated on <DateText value={selectedReport.createdAt} /> · Classification: <strong>CONFIDENTIAL / PROSECUTION USE</strong>
                  </div>
                </div>

                {/* Reviewer notes */}
                <div style={{ marginBottom: 28, background: '#f8f6f0', padding: '14px 18px', borderRadius: 4, borderLeft: '3px solid #1a56db' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#0c1e35', marginBottom: 4, letterSpacing: '.05em' }}>
                    Investigator Summary & Scope
                  </div>
                  <p style={{ fontSize: 12, color: '#2a3a4a', lineHeight: 1.7, margin: 0 }}>
                    {selectedReport.notes || 'No investigator notes recorded.'}
                  </p>
                </div>

                {/* Reviewed findings */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#0c1e35', letterSpacing: '.05em', borderBottom: '1px solid #d8d0c0', paddingBottom: 6, marginBottom: 16 }}>
                    Reviewed Investigative Findings ({selectedReport.leads.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {selectedReport.leads.map((lead, idx) => (
                      <div key={lead.id} style={{ padding: '12px 16px', background: '#ffffff', border: '1px solid #e0d8c8', borderRadius: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: '#0c1e35' }}>{idx + 1}. {lead.title}</span>
                          <span className="badge badge-navy" style={{ fontSize: 9 }}>{lead.kind}</span>
                          <span className="badge badge-green" style={{ fontSize: 9 }}>{lead.leadStatus ?? lead.status}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#334455', lineHeight: 1.6, margin: '6px 0' }}>{lead.summary}</p>
                        <div style={{ fontSize: 11, color: '#556677', background: '#fbfaf5', padding: '6px 10px', borderRadius: 3, marginTop: 6 }}>
                          <strong>Reasoning:</strong> {lead.reason}
                        </div>
                        {lead.notes && (
                          <div style={{ fontSize: 11, color: '#166534', marginTop: 6 }}>
                            <strong>Reviewer Note:</strong> {lead.notes}
                          </div>
                        )}
                        <div style={{ fontSize: 10, color: '#778899', marginTop: 8 }}>
                          Cited Sources: {lead.sourceIds.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Source Register */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#0c1e35', letterSpacing: '.05em', borderBottom: '1px solid #d8d0c0', paddingBottom: 6, marginBottom: 16 }}>
                    Source Register & Primary Excerpts ({selectedReport.sources.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selectedReport.sources.map(src => (
                      <div key={src.id} style={{ fontSize: 11, color: '#334455', borderLeft: '2px solid #8899aa', paddingLeft: 12 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                          <span className="mono" style={{ fontWeight: 700, color: '#0c1e35' }}>{src.id}</span>
                          <span>—</span>
                          <span style={{ fontWeight: 600 }}>{src.title}</span>
                          <span className="badge badge-gray" style={{ fontSize: 8 }}>{src.type}</span>
                        </div>
                        <div style={{ fontStyle: 'italic', color: '#556677', lineHeight: 1.5 }}>
                          "{src.excerpt}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legal limitation footnote */}
                <div style={{ borderTop: '1px solid #d8d0c0', paddingTop: 16, fontSize: 10, color: '#778899', lineHeight: 1.6 }}>
                  <strong>Scope and Limitations:</strong> All records are synthetic demonstrations for SIH 2026 Problem Statement 26189. Review does not constitute judicial determination of guilt. Connections, identities, and assertions require independent verification through authorized legal channels.
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <Empty
                title="Select a Report Snapshot"
                action={
                  <button className="btn btn-primary" onClick={() => setIsComposing(true)}>
                    <Plus size={15} /> Compose Report
                  </button>
                }
              >
                Select a saved snapshot from the list or compose a new report from reviewed leads.
              </Empty>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
