import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { MagnifyingGlass, VideoCamera, Plus, Check, Play, ShieldCheck, Crosshair } from '@phosphor-icons/react';
import { useStore } from '../store';
import { DateText } from '../components/ui';
import type { CameraRecording } from '../domain/types';

type CtxType = { notify: (m: string) => void };

function fmtTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }) + ' IST';
}

interface DetectionBox {
  id: string;
  label: string;
  confidence: string;
  color: string;
  borderStyle: 'solid' | 'dashed';
  top: string;
  left: string;
  width: string;
  height: string;
}

interface CameraVisualConfig {
  imageSrc: string;
  gateBadge: string;
  fps: string;
  boxes: DetectionBox[];
}

const CAMERA_VISUALS: Record<string, CameraVisualConfig> = {
  cam1: {
    imageSrc: '/assets/cctv-isbt-gate2.jpg',
    gateBadge: 'GATE 2 DEPARTURE',
    fps: '25.0 FPS · H.264 · 1080p',
    boxes: [
      {
        id: 'box-veh',
        label: 'VEHICLE [DL-1C-AA-0921]',
        confidence: '94.2%',
        color: '#00e5ff',
        borderStyle: 'solid',
        top: '40%',
        left: '48%',
        width: '18%',
        height: '24%',
      },
      {
        id: 'box-plate',
        label: 'PLATE: DL-1C-AA-0921',
        confidence: '97.8%',
        color: '#10b981',
        borderStyle: 'solid',
        top: '50.5%',
        left: '50.5%',
        width: '4.8%',
        height: '4%',
      },
      {
        id: 'box-person',
        label: 'PERSON [Adult male]',
        confidence: '88.5%',
        color: '#fbbf24',
        borderStyle: 'dashed',
        top: '43%',
        left: '30%',
        width: '5.5%',
        height: '19%',
      },
    ],
  },
  cam2: {
    imageSrc: '/assets/cctv-ndls-paharganj.jpg',
    gateBadge: 'PAHARGANJ EXIT',
    fps: '24.0 FPS · H.264 · 1080p',
    boxes: [
      {
        id: 'box-veh-ndls',
        label: 'VEHICLE [DL-1C-AA-0921 (partial)]',
        confidence: '82.1%',
        color: '#00e5ff',
        borderStyle: 'solid',
        top: '52%',
        left: '6.5%',
        width: '9.5%',
        height: '13%',
      },
      {
        id: 'box-crowd',
        label: 'PEDESTRIAN TRAFFIC',
        confidence: '84.0%',
        color: '#fbbf24',
        borderStyle: 'dashed',
        top: '55%',
        left: '62%',
        width: '16%',
        height: '22%',
      },
    ],
  },
  cam3: {
    imageSrc: '/assets/cctv-ring-road-toll.jpg',
    gateBadge: 'LANE 07 ANPR',
    fps: '30.0 FPS · H.265 · 4K ANPR',
    boxes: [
      {
        id: 'box-veh-toll',
        label: 'VEHICLE [DL-1C-AA-0921]',
        confidence: '98.7%',
        color: '#00e5ff',
        borderStyle: 'solid',
        top: '41%',
        left: '46%',
        width: '17%',
        height: '35%',
      },
      {
        id: 'box-plate-toll',
        label: 'PLATE: DL-1C-AA-0921',
        confidence: '99.4%',
        color: '#10b981',
        borderStyle: 'solid',
        top: '73%',
        left: '50.5%',
        width: '4.8%',
        height: '2.8%',
      },
      {
        id: 'box-person-toll',
        label: 'PERSON [Toll Attendant]',
        confidence: '91.2%',
        color: '#fbbf24',
        borderStyle: 'dashed',
        top: '48%',
        left: '44.5%',
        width: '5%',
        height: '20%',
      },
    ],
  },
};

export function CameraSearchPage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const { notify } = useOutletContext<CtxType>();

  const [query, setQuery]       = useState('Find vehicles connected to Case 409 near the railway station between 18:00 and 21:00 on 14 Feb 2026');
  const [dateFilter, setDate]   = useState('2026-02-14');
  const [location, setLocation] = useState('All locations');
  const [entity, setEntity]     = useState('All entities');
  const [searched, setSearched] = useState(true);
  const [selectedCam, setSelectedCam] = useState<CameraRecording | null>(state.cameraRecordings[0] ?? null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const locations = ['All locations', ...new Set(state.cameraRecordings.map(c => c.location))];
  const entities  = ['All entities', 'DL-1C-AA-0921', 'Tariq Ahmed', 'Vikramaditya Malhotra'];

  const results = searched ? state.cameraRecordings.filter(r => {
    const matchLoc = location === 'All locations' || r.location.includes(location);
    const matchEnt = entity === 'All entities' || r.detectedEntities.some(e => e.toLowerCase().includes(entity.toLowerCase()));
    const matchDate = !dateFilter || r.timestamp.startsWith(dateFilter);
    return matchLoc && matchEnt && matchDate;
  }) : [];

  function doSearch() {
    setSearched(true);
    if (results.length > 0) setSelectedCam(results[0]);
  }

  function addToEvidence(rec: CameraRecording) {
    setAddedIds(prev => new Set([...prev, rec.id]));
    notify(`${rec.cameraName} added to evidence for FIR-409.`);
  }

  const scoreColor = (s: number) => s >= 90 ? 'var(--green)' : s >= 80 ? 'var(--amber)' : 'var(--muted)';

  // Visual configuration for active recording (always falls back to cam1 / cctv-isbt-gate2.jpg)
  const activeVisual: CameraVisualConfig = (selectedCam && CAMERA_VISUALS[selectedCam.id]) 
    ? CAMERA_VISUALS[selectedCam.id] 
    : CAMERA_VISUALS.cam1;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 style={{ fontSize: 22 }}>Camera Search</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            CCTV &amp; ANPR surveillance records — {state.cameraRecordings.length} recordings indexed ·{' '}
            <span className="badge badge-green" style={{ fontSize: 9 }}>CRPC Sec 91 Compliant</span>
            <span className="badge badge-amber" style={{ fontSize: 9, marginLeft: 4 }}>DEMO DATA</span>
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div className="search-bar" style={{ flex: 1 }}>
              <MagnifyingGlass size={15} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Describe what you're looking for…" />
            </div>
            <button className="btn btn-primary" onClick={doSearch}>
              <MagnifyingGlass size={14} /> Search recordings
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11 }}>
            <div className="select-wrap">
              <span style={{ color: 'var(--muted)' }}>Date</span>
              <input type="date" value={dateFilter} onChange={e => setDate(e.target.value)} style={{ border: 0, padding: '2px 4px', minHeight: 26, fontSize: 11, background: 'transparent' }} />
            </div>
            <div className="select-wrap">
              <span style={{ color: 'var(--muted)' }}>Location</span>
              <select value={location} onChange={e => setLocation(e.target.value)} aria-label="Filter by location">
                {locations.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="select-wrap">
              <span style={{ color: 'var(--muted)' }}>Entity / Vehicle</span>
              <select value={entity} onChange={e => setEntity(e.target.value)} aria-label="Filter by entity">
                {entities.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          {searched && query && (
            <div style={{ marginTop: 10, padding: '6px 10px', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 11 }}>
              <span style={{ color: 'var(--muted)' }}>Entities: </span>
              <span className="badge badge-green" style={{ fontSize: 9, marginRight: 4 }}>Vehicle: DL-1C-AA-0921</span>
              <span className="badge badge-blue" style={{ fontSize: 9, marginRight: 4 }}>ISBT / Kashmere Gate</span>
              <span className="badge badge-navy" style={{ fontSize: 9 }}>FIR-409/2026/NZ</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

        {/* Main video area */}
        <div className="card" style={{ overflow: 'hidden', border: '1px solid var(--border-mid)' }}>
          {selectedCam ? (
            <>
              {/* Surveillance CCTV Frame with Realistic Still Asset */}
              <div
                style={{
                  background: '#070b11',
                  aspectRatio: '16/9',
                  position: 'relative',
                  overflow: 'hidden',
                  userSelect: 'none',
                }}
              >
                {/* 1. CCTV Video Still Image */}
                <img
                  src={activeVisual.imageSrc}
                  alt={selectedCam.cameraName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    filter: 'contrast(1.08) brightness(0.96)',
                  }}
                  onError={(e) => {
                    // Fail-safe: Never allow the media view to go blank
                    e.currentTarget.src = '/assets/cctv-isbt-gate2.jpg';
                  }}
                />

                {/* 2. CCTV Scanline / Noise subtle overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
                    backgroundSize: '100% 3px, 3px 100%',
                    opacity: 0.7,
                  }}
                />

                {/* 3. Top CCTV HUD Header Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: '8px 12px',
                    background: 'linear-gradient(180deg, rgba(7, 11, 17, 0.88) 0%, rgba(7, 11, 17, 0.4) 75%, transparent 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#ef4444',
                      boxShadow: '0 0 6px #ef4444',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171', fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>
                    REC
                  </span>
                  <span style={{ fontSize: 11, color: '#e2e8f0', fontFamily: 'var(--mono)', fontWeight: 600 }}>
                    {fmtTime(selectedCam.timestamp)}
                  </span>
                  <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'var(--mono)' }}>
                    <DateText value={selectedCam.timestamp} />
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#38bdf8', fontFamily: 'var(--mono)', fontWeight: 600 }}>
                    {selectedCam.cameraId}
                  </span>
                  <span className="badge badge-amber" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.04em' }}>
                    {activeVisual.gateBadge}
                  </span>
                </div>

                {/* 4. Crosshairs in center */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    opacity: 0.35,
                    color: '#38bdf8',
                  }}
                >
                  <Crosshair size={28} weight="thin" />
                </div>

                {/* 5. Object Detection Bounding Boxes Overlay */}
                {activeVisual.boxes.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      position: 'absolute',
                      left: b.left,
                      top: b.top,
                      width: b.width,
                      height: b.height,
                      border: `2px ${b.borderStyle} ${b.color}`,
                      borderRadius: 2,
                      boxShadow: `0 0 8px ${b.color}44`,
                      zIndex: 3,
                      pointerEvents: 'none',
                    }}
                  >
                    {/* Corner accents */}
                    <div style={{ position: 'absolute', top: -1, left: -1, width: 4, height: 4, background: b.color }} />
                    <div style={{ position: 'absolute', top: -1, right: -1, width: 4, height: 4, background: b.color }} />
                    <div style={{ position: 'absolute', bottom: -1, left: -1, width: 4, height: 4, background: b.color }} />
                    <div style={{ position: 'absolute', bottom: -1, right: -1, width: 4, height: 4, background: b.color }} />

                    {/* Detection Tag / Confidence Pill */}
                    <span
                      style={{
                        position: 'absolute',
                        top: -19,
                        left: -2,
                        fontSize: 8.5,
                        fontWeight: 700,
                        color: '#070b11',
                        background: b.color,
                        padding: '1px 5px',
                        fontFamily: 'var(--mono)',
                        whiteSpace: 'nowrap',
                        borderRadius: '2px 2px 0 0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {b.label} · {b.confidence}
                    </span>
                  </div>
                ))}

                {/* 6. Bottom CCTV HUD Footer Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '6px 12px',
                    background: 'linear-gradient(0deg, rgba(7, 11, 17, 0.92) 0%, rgba(7, 11, 17, 0.5) 75%, transparent 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 2,
                  }}
                >
                  <span style={{ fontSize: 9.5, color: '#94a3b8', fontFamily: 'var(--mono)' }}>
                    {selectedCam.frameRef}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={12} color="#10b981" />
                    <span style={{ fontSize: 9, color: '#10b981', fontFamily: 'var(--mono)', fontWeight: 600 }}>
                      CRPC SEC 91 HASH VERIFIED
                    </span>
                    <span className="badge badge-amber" style={{ fontSize: 8.5, padding: '1px 6px', fontWeight: 700 }}>
                      DEMO DATA
                    </span>
                  </div>
                  <span style={{ fontSize: 9.5, color: '#94a3b8', fontFamily: 'var(--mono)' }}>
                    {activeVisual.fps}
                  </span>
                </div>
              </div>

              {/* Recording Metadata & Action Controls */}
              <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <VideoCamera size={18} style={{ color: 'var(--blue-primary)', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: 14, color: 'var(--navy)', display: 'block' }}>{selectedCam.cameraName}</strong>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                      Location: {selectedCam.location} · {selectedCam.cameraId} · {fmtTime(selectedCam.timestamp)}
                    </span>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ANPR Match</div>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 16, color: scoreColor(selectedCam.matchScore) }}>
                      {selectedCam.matchScore}%
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6, margin: '8px 0 14px' }}>
                  {selectedCam.notes}
                </p>

                {/* Target Entities Detected Pill List */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Detected Entities:</span>
                  {selectedCam.detectedEntities.map((ent, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 11,
                        fontFamily: 'var(--mono)',
                        padding: '2px 8px',
                        borderRadius: 3,
                        background: ent.includes('DL-1C') ? 'rgba(0, 229, 255, 0.12)' : 'rgba(251, 191, 36, 0.12)',
                        color: ent.includes('DL-1C') ? '#00e5ff' : '#fbbf24',
                        border: `1px solid ${ent.includes('DL-1C') ? '#00e5ff44' : '#fbbf2444'}`,
                      }}
                    >
                      {ent}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-sm" onClick={() => navigate('/evidence-history')}>
                    <Play size={12} weight="bold" /> Open Recording
                  </button>
                  <button className="btn btn-sm" onClick={() => navigate(`/cases/c1/evidence`)}>
                    View Evidence
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={addedIds.has(selectedCam.id)}
                    onClick={() => addToEvidence(selectedCam)}
                  >
                    {addedIds.has(selectedCam.id) ? (
                      <>
                        <Check size={12} weight="bold" /> Added
                      </>
                    ) : (
                      <>
                        <Plus size={12} weight="bold" /> Add to Evidence
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
              <VideoCamera size={36} style={{ color: 'var(--border-mid)', marginBottom: 12 }} />
              <p style={{ fontSize: 12 }}>Run a search to load recordings.</p>
            </div>
          )}
        </div>

        {/* Results panel */}
        <div className="card" style={{ border: '1px solid var(--border)' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3>Matching recordings</h3>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{results.length} matches · Sorted by match score</span>
          </div>
          {results.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
              No recordings match. Adjust filters and search again.
            </div>
          ) : (
            results.sort((a, b) => b.matchScore - a.matchScore).map((r) => {
              const isSelected = selectedCam?.id === r.id;
              const rVisual = CAMERA_VISUALS[r.id] || CAMERA_VISUALS.cam1;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedCam(r)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 14px',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    background: isSelected ? 'var(--blue-subtle)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderLeft: isSelected ? '3px solid var(--blue-primary)' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <strong style={{ fontSize: 12.5, color: 'var(--navy)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.cameraName}
                    </strong>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 12, color: scoreColor(r.matchScore) }}>
                      {r.matchScore}%
                    </span>
                  </div>

                  <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 8 }}>
                    {fmtTime(r.timestamp)} · {r.cameraId}
                  </div>

                  {/* Visual preview strip with actual thumbnail */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#070b11',
                      borderRadius: 3,
                      padding: 4,
                      marginBottom: 8,
                      border: '1px solid #1e293b',
                    }}
                  >
                    <img
                      src={rVisual.imageSrc}
                      alt={r.cameraName}
                      style={{
                        width: 48,
                        height: 28,
                        objectFit: 'cover',
                        borderRadius: 2,
                        flexShrink: 0,
                        filter: 'contrast(1.05)',
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/cctv-isbt-gate2.jpg';
                      }}
                    />
                    <div style={{ fontSize: 9.5, color: '#38bdf8', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.detectedEntities.join(' · ')}
                    </div>
                  </div>

                  <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.45, margin: 0 }}>
                    {r.notes}
                  </p>
                  {r.location.includes('NDLS') && (
                    <span className="badge badge-amber" style={{ fontSize: 8, marginTop: 6, display: 'inline-block' }}>
                      Rear dent match
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

