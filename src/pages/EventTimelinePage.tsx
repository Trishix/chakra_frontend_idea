import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ListChecks } from '@phosphor-icons/react';
import { useStore } from '../store';
import { KindIcon } from '../components/ui';
import type { TimelineEvent } from '../domain/types';

const TYPE_COLORS: Record<TimelineEvent['type'], { dot: string; badge: string; label: string }> = {
  Financial: { dot: '#f59e0b', badge: 'badge-orange',  label: 'Bank Transfer' },
  Call:      { dot: '#3b82f6', badge: 'badge-blue',    label: 'Call Record'   },
  Vehicle:   { dot: '#22c55e', badge: 'badge-green',   label: 'Vehicle'       },
  CCTV:      { dot: '#8b5cf6', badge: 'badge-Person',  label: 'CCTV'          },
  Location:  { dot: '#ef4444', badge: 'badge-red',     label: 'Location'      },
  Incident:  { dot: '#64748b', badge: 'badge-gray',    label: 'Incident'      },
};

const ROW_ORDER: TimelineEvent['type'][] = ['Financial', 'Call', 'Vehicle', 'CCTV', 'Location', 'Incident'];

function fmtTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }) + ' IST';
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function EventTimelinePage() {
  const { caseId = 'c1' } = useParams<{ caseId: string }>();
  const { state } = useStore();
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter] = useState<Set<TimelineEvent['type']>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const current  = state.cases.find(c => c.id === caseId) ?? state.cases[0];
  const allEvents = state.timelineEvents
    .filter(e => e.caseId === caseId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const filtered = allEvents.filter(e => typeFilter.size === 0 || typeFilter.has(e.type));
  const selected = selectedId ? allEvents.find(e => e.id === selectedId) : null;

  function toggleType(t: TimelineEvent['type']) {
    setTypeFilter(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  /* Horizontal timeline: grid rows by type */
  const rowEvents = (type: TimelineEvent['type']) =>
    filtered.filter(e => e.type === type).sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const dateRange = allEvents.length > 0
    ? `${fmtDate(allEvents[0].timestamp)} — ${fmtDate(allEvents[allEvents.length - 1].timestamp)}`
    : '';

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 12 }}>
            <button className="text-btn" onClick={() => navigate(`/cases/${caseId}`)}>
              <ArrowLeft size={13} /> {current.reference}
            </button>
          </div>
          <h1 style={{ fontSize: 22 }}>Event Timeline</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            {current.reference} · {allEvents.length} events · {dateRange}
          </p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => navigate(`/cases/${caseId}/evidence`)}>
            <ListChecks size={15} /> Evidence Timeline
          </button>
        </div>
      </div>

      {/* Type filters */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        {ROW_ORDER.map(t => {
          const col = TYPE_COLORS[t];
          const count = allEvents.filter(e => e.type === t).length;
          if (!count) return null;
          return (
            <button
              key={t}
              className={`filter-chip${typeFilter.has(t) ? ' active' : ''}`}
              onClick={() => toggleType(t)}
              style={{ gap: 5 }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: col.dot, display: 'inline-block' }} />
              {col.label} <span style={{ fontFamily: 'var(--mono)', fontSize: 9 }}>{count}</span>
            </button>
          );
        })}
        {typeFilter.size > 0 && (
          <button className="text-btn" style={{ fontSize: 10 }} onClick={() => setTypeFilter(new Set())}>
            Show all
          </button>
        )}
        <span className="small muted" style={{ marginLeft: 'auto' }}>{filtered.length} events shown</span>
      </div>

      {/* Horizontal multi-row timeline */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>14 Feb 2026 — Active: By minute (17:00–21:00)</h3>
          <span className="badge badge-green" style={{ fontSize: 9 }}>Confirmed events</span>
        </div>
        <div style={{ overflowX: 'auto', padding: '12px 0' }}>
          <table style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ width: 130, textAlign: 'left', paddingLeft: 16, fontSize: 10 }}>Record Type</th>
                <th style={{ fontSize: 9, paddingLeft: 0 }}>17:30</th>
                <th style={{ fontSize: 9 }}>17:45</th>
                <th style={{ fontSize: 9 }}>18:00</th>
                <th style={{ fontSize: 9, color: 'var(--blue-primary)' }}>18:30</th>
                <th style={{ fontSize: 9 }}>19:00</th>
                <th style={{ fontSize: 9 }}>19:30</th>
                <th style={{ fontSize: 9 }}>20:00</th>
              </tr>
            </thead>
            <tbody>
              {ROW_ORDER.map(type => {
                const evs = rowEvents(type);
                if (!evs.length) return null;
                const col = TYPE_COLORS[type];
                return (
                  <tr key={type}>
                    <td style={{ paddingLeft: 16, fontSize: 11, fontWeight: 500, color: 'var(--text-2)', paddingTop: 10, paddingBottom: 10 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot, display: 'inline-block' }} />
                        {col.label}
                      </span>
                    </td>
                    <td colSpan={7} style={{ position: 'relative', padding: '10px 0' }}>
                      {/* Timeline line */}
                      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'var(--border)', zIndex: 0 }} />
                      {evs.map(ev => {
                        const d = new Date(ev.timestamp);
                        const mins = d.getUTCHours() * 60 + d.getUTCMinutes();
                        const pct = Math.max(0, Math.min(100, ((mins - 17 * 60 - 30) / (3 * 60)) * 100));
                        return (
                          <button
                            key={ev.id}
                            onClick={() => setSelectedId(selectedId === ev.id ? null : ev.id)}
                            title={ev.title}
                            style={{
                              position: 'absolute', left: `${pct}%`, top: '50%', transform: 'translate(-50%,-50%)',
                              zIndex: 2, background: selectedId === ev.id ? col.dot : 'var(--surface)',
                              border: `2px solid ${col.dot}`, borderRadius: '50%', width: 14, height: 14,
                              cursor: 'pointer', padding: 0,
                            }}
                          />
                        );
                      })}
                      {/* Labels for confirmed events */}
                      {evs.filter(ev => ev.confirmed).map(ev => {
                        const d = new Date(ev.timestamp);
                        const mins = d.getUTCHours() * 60 + d.getUTCMinutes();
                        const pct = Math.max(0, Math.min(100, ((mins - 17 * 60 - 30) / (3 * 60)) * 100));
                        return (
                          <div key={ev.id + '-label'} style={{
                            position: 'absolute', left: `${pct}%`, top: '50%', transform: 'translateX(-50%)',
                            marginTop: 12, fontSize: 8, color: col.dot, whiteSpace: 'nowrap', fontFamily: 'var(--mono)', zIndex: 3, fontWeight: 600,
                          }}>
                            {fmtTime(ev.timestamp)}
                          </div>
                        );
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected event detail */}
      {selected && (
        <div className="card" style={{ marginBottom: 20, borderColor: TYPE_COLORS[selected.type].dot }}>
          <div className="card-header" style={{ borderBottom: `2px solid ${TYPE_COLORS[selected.type].dot}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {selected.confirmed
                ? <span className="badge badge-green" style={{ fontSize: 9 }}>CONFIRMED EVENT</span>
                : <span className="badge badge-amber" style={{ fontSize: 9 }}>UNCONFIRMED</span>}
              <span className="mono" style={{ fontSize: 10 }}>#{selected.id}</span>
              <strong style={{ fontSize: 13 }}>{selected.title}</strong>
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
              {fmtDate(selected.timestamp)} · {fmtTime(selected.timestamp)}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '16px 18px' }}>
            <div>
              <h4 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 8 }}>Event detail</h4>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>{selected.detail}</p>
              {selected.confidence !== undefined && (
                <div style={{ marginTop: 10, fontSize: 12 }}>
                  Confidence: <span style={{ fontWeight: 600, color: selected.confidence >= 90 ? 'var(--green)' : 'var(--amber)', fontFamily: 'var(--mono)' }}>{selected.confidence}%</span>
                </div>
              )}
            </div>
            <div>
              <h4 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 8 }}>Related entities</h4>
              {selected.entityIds.map(eid => {
                const ent = state.entities.find(e => e.id === eid);
                return ent ? (
                  <button key={eid} onClick={() => navigate(`/entities/${eid}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', width: '100%', background: 'none', border: 0, cursor: 'pointer', fontSize: 12, textAlign: 'left', color: 'var(--text-2)' }}>
                    <KindIcon kind={ent.kind} size={13} />
                    <span style={{ fontWeight: 500 }}>{ent.label}</span>
                    <ArrowUpRight size={12} style={{ color: 'var(--muted)', marginLeft: 'auto' }} />
                  </button>
                ) : null;
              })}
            </div>
          </div>
          <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <button className="btn btn-sm btn-primary" onClick={() => navigate(`/cases/${caseId}/evidence`)}>
              View evidence timeline
            </button>
            {selected.entityIds.length > 0 && (
              <button className="btn btn-sm" onClick={() => navigate(`/cases/${caseId}/connections`)}>
                View in graph
              </button>
            )}
          </div>
        </div>
      )}

      {/* Vertical list */}
      <div className="card">
        <div className="card-header">
          <h3>All events ({filtered.length})</h3>
        </div>
        <div className="timeline-track" style={{ padding: '12px 20px' }}>
          {filtered.map(ev => {
            const col = TYPE_COLORS[ev.type];
            return (
              <button key={ev.id} className="timeline-event" onClick={() => setSelectedId(selectedId === ev.id ? null : ev.id)}
                style={{ outline: selectedId === ev.id ? `2px solid ${col.dot}` : undefined, borderRadius: 4 }}>
                <time>{fmtTime(ev.timestamp)}</time>
                <div className={`timeline-dot${ev.confirmed ? ' confirmed' : ' suggested'}`}
                  style={{ background: ev.confirmed ? col.dot : undefined, borderColor: ev.confirmed ? col.dot : undefined }} />
                <div className="timeline-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className={`badge ${col.badge}`} style={{ fontSize: 9 }}>{col.label}</span>
                    {ev.confidence !== undefined && (
                      <span className="mono" style={{ fontSize: 9, color: ev.confidence >= 90 ? 'var(--green)' : 'var(--amber)' }}>
                        {ev.confidence}%
                      </span>
                    )}
                  </div>
                  <strong>{ev.title}</strong>
                  <p>{ev.detail}</p>
                </div>
                <ArrowUpRight size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0', fontSize: 12 }}>
              No events match the current filter.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
