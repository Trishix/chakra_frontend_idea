import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Graph, ArrowUpRight } from '@phosphor-icons/react';
import { useStore } from '../store';
import { KindIcon, StatusBadge, DateText } from '../components/ui';

export function EntityProfilePage() {
  const { entityId = 'e-tariq' } = useParams<{ entityId: string }>();
  const { state } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'connections' | 'timeline' | 'evidence'>('overview');

  const entity = state.entities.find(e => e.id === entityId) ?? state.entities[0];
  const caseRecs = state.cases.filter(c => entity.caseIds.includes(c.id));

  const connections = state.relations.filter(
    r => r.source === entity.id || r.target === entity.id
  ).map(r => {
    const otherId = r.source === entity.id ? r.target : r.source;
    const other = state.entities.find(e => e.id === otherId);
    return { relation: r, entity: other };
  }).filter(c => c.entity);

  const relatedSources = state.sources.filter(s =>
    state.relations.some(r =>
      (r.source === entity.id || r.target === entity.id) && r.sourceIds.includes(s.id)
    )
  );

  const relevantEvents = state.timelineEvents.filter(e =>
    e.entityIds.includes(entity.id)
  ).sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  if (!entity) {
    return (
      <div className="page">
        <p style={{ color: 'var(--muted)' }}>Entity not found.</p>
        <button className="btn" onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Back */}
      <div style={{ marginBottom: 16 }}>
        <button className="text-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={13} /> Back
        </button>
      </div>

      {/* Profile header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0, background: 'var(--blue-subtle)', border: '1.5px solid var(--blue-border)', color: 'var(--blue-primary)' }}>
            <KindIcon kind={entity.kind} size={28} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <span className={`badge badge-${entity.kind}`} style={{ fontSize: 10 }}>{entity.kind}</span>
              {entity.status && <StatusBadge status={entity.status} />}
              {entity.caseIds.map(cid => {
                const c = state.cases.find(x => x.id === cid);
                return c ? <span key={cid} className="mono badge badge-navy" style={{ fontSize: 9 }}>{c.reference}</span> : null;
              })}
            </div>
            <h1 style={{ fontSize: 22 }}>{entity.label}</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{entity.subtitle}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary" onClick={() => navigate(`/cases/${entity.caseIds[0] ?? 'c1'}/connections`)}>
              <Graph size={14} /> View Network
            </button>
            <button className="btn" onClick={() => navigate('/assistant')}>
              Ask AI
            </button>
          </div>
        </div>

        {/* Sub-nav */}
        <div className="tab-bar" style={{ padding: '0 24px', borderTop: '1px solid var(--border)' }}>
          {(['overview', 'connections', 'timeline', 'evidence'] as const).map(t => (
            <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)} style={{ marginBottom: 0 }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Metadata */}
          {entity.metadata && Object.keys(entity.metadata).length > 0 && (
            <div className="card">
              <div className="card-header"><h3>Details</h3></div>
              <div className="card-body">
                {Object.entries(entity.metadata).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <span style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{k}</span>
                    <span style={{ color: 'var(--text-2)', fontWeight: 500, textAlign: 'right', maxWidth: 200, wordBreak: 'break-word' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related cases */}
          <div className="card">
            <div className="card-header"><h3>Related cases</h3><span style={{ fontSize: 11, color: 'var(--muted)' }}>{caseRecs.length}</span></div>
            {caseRecs.map(c => (
              <button key={c.id} onClick={() => navigate(`/cases/${c.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 18px', background: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{c.title}</div>
                  <div className="mono" style={{ fontSize: 10, marginTop: 2 }}>{c.reference}</div>
                </div>
                <StatusBadge status={c.status} />
                <ArrowUpRight size={14} style={{ color: 'var(--muted)' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'connections' && (
        <div className="card">
          <div className="card-header">
            <h3>Connections ({connections.length})</h3>
            <button className="text-btn" onClick={() => navigate(`/cases/${entity.caseIds[0] ?? 'c1'}/connections`)}>
              Open in graph <ArrowUpRight size={13} />
            </button>
          </div>
          <div>
            {connections.map(({ relation: r, entity: other }) => other && (
              <button key={r.id} onClick={() => navigate(`/entities/${other.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '12px 18px', background: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 32, height: 32, borderRadius: 4, background: 'var(--surface-alt)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', color: 'var(--muted)', flexShrink: 0 }}>
                  <KindIcon kind={other.kind} size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{other.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    {r.label}
                    {r.inferred && <span className="badge badge-amber" style={{ fontSize: 8, marginLeft: 6 }}>Inferred</span>}
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>
                  <DateText value={r.date} />
                </span>
                <ArrowUpRight size={13} style={{ color: 'var(--muted)' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="card">
          <div className="card-header"><h3>Events ({relevantEvents.length})</h3></div>
          <div style={{ padding: '12px 20px' }}>
            {relevantEvents.length === 0
              ? <p style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>No events for this entity.</p>
              : relevantEvents.map(ev => (
                <div key={ev.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ minWidth: 60, fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', paddingTop: 2, flexShrink: 0 }}>
                    <DateText value={ev.timestamp} />
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: ev.confirmed ? 'var(--ev-teal)' : '#d97706', marginTop: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{ev.detail}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {tab === 'evidence' && (
        <div className="card">
          <div className="card-header"><h3>Source records ({relatedSources.length})</h3></div>
          {relatedSources.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>No source records linked to this entity.</p>
            : relatedSources.map(s => (
              <div key={s.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="badge badge-blue" style={{ fontSize: 9 }}>{s.type}</span>
                  <span className="mono" style={{ fontSize: 10 }}>{s.id}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}><DateText value={s.date} /></span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>{s.title}</div>
                {!s.restricted && <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>{s.excerpt}</p>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
