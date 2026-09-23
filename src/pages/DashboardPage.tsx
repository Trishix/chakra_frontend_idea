import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import {
  FolderOpen, Graph, ArrowUpRight, Detective, Clock,
  CurrencyDollar, Phone, VideoCamera, MapPin, Sparkle,
} from '@phosphor-icons/react';
import { useStore } from '../store';
import { StatusBadge, ConfidenceBadge, DateText } from '../components/ui';

type CtxType = { notify: (m: string) => void };

export function DashboardPage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const { notify } = useOutletContext<CtxType>();

  const activeCases   = state.cases.filter(c => c.status === 'Active').length;
  const pendingLeads  = state.leads.filter(l => l.leadStatus === 'pending').length;
  const totalEntities = state.entities.length;
  const cctv          = state.cameraRecordings.length;
  const mainCase      = state.cases[0];

  const activityIcons: Record<string, React.ReactNode> = {
    financial: <CurrencyDollar size={14} />,
    call:      <Phone size={14} />,
    cctv:      <VideoCamera size={14} />,
    location:  <MapPin size={14} />,
    lead:      <Detective size={14} />,
    evidence:  <FolderOpen size={14} />,
    case:      <FolderOpen size={14} />,
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page">
      {/* Greeting row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 22 }}>{greeting}, Inspector Varma</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            FIR-409/2026/NZ active · PS Special Cell, New Delhi ·{' '}
            <span className="badge badge-red" style={{ fontSize: 9, verticalAlign: 'middle' }}>S-2 RESTRICTED</span>
          </p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => navigate('/leads')}>
            <Detective size={15} /> Review Leads
            {pendingLeads > 0 && <span className="badge badge-amber" style={{ marginLeft: 4 }}>{pendingLeads}</span>}
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/cases/${mainCase.id}/connections`)}>
            <Graph size={15} /> View Network
          </button>
        </div>
      </div>

      {/* Metric row */}
      <div className="metric-row" style={{ marginBottom: 24 }}>
        <div className="metric-card blue-card" onClick={() => navigate('/cases')} style={{ cursor: 'pointer' }}>
          <div className="metric-label">Active Cases</div>
          <div className="metric-value">{activeCases}</div>
          <div className="metric-sub">{state.cases.length} total investigations</div>
        </div>
        <div className="metric-card warn-card" onClick={() => navigate('/leads')} style={{ cursor: 'pointer' }}>
          <div className="metric-label">Pending AI Leads</div>
          <div className="metric-value">{pendingLeads}</div>
          <div className="metric-sub">Require investigator review</div>
        </div>
        <div className="metric-card good-card" onClick={() => navigate(`/cases/${mainCase.id}/connections`)} style={{ cursor: 'pointer' }}>
          <div className="metric-label">Network Entities</div>
          <div className="metric-value">{totalEntities}</div>
          <div className="metric-sub">{state.relations.length} relationships mapped</div>
        </div>
        <div className="metric-card blue-card" onClick={() => navigate('/camera')} style={{ cursor: 'pointer' }}>
          <div className="metric-label">Camera Recordings</div>
          <div className="metric-value">{cctv}</div>
          <div className="metric-sub">CCTV & ANPR matches</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Active investigations */}
          <div className="card">
            <div className="card-header">
              <h3>Active Investigations</h3>
              <button className="text-btn" onClick={() => navigate('/cases')}>
                View all <ArrowUpRight size={13} />
              </button>
            </div>
            <div>
              {state.cases.map(c => {
                const pending = state.leads.filter(l => l.caseId === c.id && l.leadStatus === 'pending').length;
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '12px 18px', background: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <FolderOpen size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        {c.reference} · {c.district} · <DateText value={c.updated} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {pending > 0 && <span className="badge badge-amber">{pending} pending</span>}
                      <StatusBadge status={c.status} />
                    </div>
                    <ArrowUpRight size={15} style={{ color: 'var(--muted)' }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="card">
            <div className="card-header">
              <h3>Recent Activity</h3>
              <span className="small muted">FIR-409 · Last 24h</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {state.activity.slice(0, 5).map(a => (
                <button
                  key={a.id}
                  onClick={() => navigate(`/cases/${a.caseId}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 18px', background: 'none', border: '0', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 'var(--radius)', background: 'var(--surface-alt)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', color: 'var(--muted)', flexShrink: 0 }}>
                    {activityIcons[a.type ?? 'evidence'] ?? <Clock size={14} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--navy)' }}>{a.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.detail}</div>
                  </div>
                  <time style={{ fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>
                    <DateText value={a.time} />
                  </time>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* AI Insights */}
          <div className="card">
            <div className="card-header">
              <h3><Sparkle size={14} style={{ marginRight: 5, verticalAlign: 'middle', color: 'var(--blue-primary)' }} />AI Insights</h3>
              <button className="text-btn" onClick={() => navigate('/leads')}>
                Review all <ArrowUpRight size={13} />
              </button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {state.aiLeads.map(ai => (
                <div key={ai.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span className="badge badge-blue" style={{ fontSize: 9 }}>{ai.type}</span>
                    <ConfidenceBadge value={ai.confidence} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55 }}>{ai.explanation}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <button
                      className="btn btn-sm"
                      onClick={() => { notify('Lead approved.'); }}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-sm"
                      onClick={() => navigate(`/cases/${ai.caseId}/connections`)}
                    >
                      <Graph size={12} /> Graph
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '8px 12px', fontSize: 10, color: 'var(--muted)', background: 'var(--surface-alt)', borderTop: '1px solid var(--border)', borderRadius: '0 0 6px 6px' }}>
              AI assists investigators. All findings require human validation.
            </div>
          </div>

          {/* Case summary */}
          <div className="card">
            <div className="card-header">
              <h3>FIR-409 Summary</h3>
              <button className="text-btn" onClick={() => navigate(`/cases/${mainCase.id}`)}>
                Open <ArrowUpRight size={13} />
              </button>
            </div>
            <div className="card-body" style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>
              {mainCase.summary}
            </div>
            <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-sm" onClick={() => navigate(`/cases/${mainCase.id}/connections`)}>
                <Graph size={12} /> Network
              </button>
              <button className="btn btn-sm" onClick={() => navigate(`/cases/${mainCase.id}/evidence`)}>
                Evidence
              </button>
              <button className="btn btn-sm btn-primary" onClick={() => navigate(`/cases/${mainCase.id}`)}>
                Case Overview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
