import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowRight, Sparkle, Graph, ArrowUpRight, Clock } from '@phosphor-icons/react';


type CtxType = { notify: (m: string) => void };

interface QueryResult {
  query: string;
  summary: string;
  metrics: { label: string; value: string }[];
  path: { label: string; connector?: string }[];
  sources: { id: string; type: string; confidence: number; timestamp: string }[];
  reasoning: string;
  entities: string[];
  caseId: string;
}

const CANNED_RESPONSES: Record<string, QueryResult> = {
  phone: {
    query: 'Find all individuals connected to Case 409 through phone numbers in the last 6 months',
    summary: '8 related entities found through phone network analysis.',
    metrics: [
      { label: 'Related entities', value: '8' },
      { label: 'Phone links', value: '3' },
      { label: 'Common locations', value: '2' },
      { label: 'Associated incidents', value: '4' },
    ],
    path: [
      { label: 'FIR-409/2026/NZ', connector: '→' },
      { label: '+91 98102-44109', connector: '→' },
      { label: 'Tariq Ahmed', connector: '→' },
      { label: 'Chandni Chowk', connector: '→' },
      { label: 'FIR-112/2025' },
    ],
    sources: [
      { id: 'CDR-004', type: 'CDR', confidence: 94, timestamp: '2026-02-14T18:45:00Z' },
      { id: 'CDR-007', type: 'CDR', confidence: 88, timestamp: '2026-01-18T14:20:00Z' },
      { id: 'FIR-409', type: 'FIR', confidence: 100, timestamp: '2026-01-02T11:30:00Z' },
    ],
    reasoning: 'Phone +91 98102-44109 (142 contact events in CDR-004) is the primary device linked to FIR-409. The same IMEI appears in CDR-007 for FIR-112/2025 Faridabad case, with 6 overlapping contacts during a 22-minute window on 18 Jan 2026. Subscriber verification required before attributing device use to a specific individual.',
    entities: ['e-tariq', 'e-phone1', 'e-case1', 'e-case2'],
    caseId: 'c1',
  },
  financial: {
    query: 'Show financial links for Tariq Ahmed',
    summary: 'Two financial accounts linked to Tariq Ahmed through payment records.',
    metrics: [
      { label: 'Financial accounts', value: '2' },
      { label: 'Total value', value: 'Rs.45,00,000' },
      { label: 'Transactions', value: '4' },
      { label: 'Linked cases', value: '2' },
    ],
    path: [
      { label: 'Tariq Ahmed', connector: '→' },
      { label: '001920-88123', connector: '→' },
      { label: 'sharma.enterprises@okaxis', connector: '→' },
      { label: 'Sunita Devi' },
    ],
    sources: [
      { id: 'FIN-001', type: 'Financial', confidence: 91, timestamp: '2026-02-14T17:42:10Z' },
      { id: 'FIN-003', type: 'Financial', confidence: 86, timestamp: '2026-02-08T09:00:00Z' },
    ],
    reasoning: 'FIN-001 records Rs.45,00,000 NEFT transfer from account 001920-88123 (Hawala Primary Hub) to sharma.enterprises@okaxis (Axis Bank Surat) at 17:42 IST on 14 Feb 2026. Three payments totaling Rs.14,50,000 in Surat ledger SL-91 match FIR-089/2026 entries. Account-holder verification required before attributing ownership to named individuals.',
    entities: ['e-tariq', 'e-acct1', 'e-acct2', 'e-sunita'],
    caseId: 'c1',
  },
  cctv: {
    query: 'Correlate CCTV sightings with CDR data on 14 Feb 2026',
    summary: 'Vehicle DL-1C-AA-0921 sighted at 2 locations, consistent with CDR tower disconnect timeline.',
    metrics: [
      { label: 'CCTV matches', value: '2' },
      { label: 'CDR events', value: '142' },
      { label: 'Location overlaps', value: '3' },
      { label: 'Time consistency', value: '96%' },
    ],
    path: [
      { label: 'CDR Disconnect (18:05)', connector: '→' },
      { label: 'Ring Road Toll (18:22)', connector: '→' },
      { label: 'ISBT Gate 2 (18:39)', connector: '→' },
      { label: 'NDLS Paharganj (19:14)' },
    ],
    sources: [
      { id: 'CDR-004', type: 'CDR', confidence: 94, timestamp: '2026-02-14T18:05:22Z' },
      { id: 'ANPR-001', type: 'ANPR', confidence: 99, timestamp: '2026-02-14T18:22:15Z' },
      { id: 'CCTV-001', type: 'CCTV', confidence: 94, timestamp: '2026-02-14T18:39:12Z' },
    ],
    reasoning: 'CDR-004 records tower disconnect at Chandni Chowk (18:05:22 IST). ANPR-001 captures DL-1C-AA-0921 at Ring Road Junction 04 at 18:22 (4.2 km, ~17 min). CCTV-001 confirms same plate at ISBT Gate 2 at 18:39 (94.2% match). Estimated speed: 21.9 km/h — consistent with evening traffic. Second sighting at NDLS Paharganj at 19:14 (82.1% — plate partially obscured).',
    entities: ['e-tariq', 'e-vehicle', 'e-vikram', 'e-loc1', 'e-loc2', 'e-loc3'],
    caseId: 'c1',
  },
};

function detectQuery(q: string): QueryResult | null {
  const lower = q.toLowerCase();
  if (lower.includes('phone') || lower.includes('cdr') || lower.includes('409') || lower.includes('individual')) return CANNED_RESPONSES.phone;
  if (lower.includes('financial') || lower.includes('tariq') || lower.includes('payment') || lower.includes('account')) return CANNED_RESPONSES.financial;
  if (lower.includes('cctv') || lower.includes('camera') || lower.includes('correlat') || lower.includes('14 feb')) return CANNED_RESPONSES.cctv;
  return null;
}

const EXAMPLE_QUERIES = [
  'Find all individuals connected to Case 409 through phone numbers in the last 6 months',
  'Show financial links for Tariq Ahmed',
  'Correlate CCTV sightings with CDR data on 14 Feb 2026',
];

function fmtTs(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' IST';
}

export function AIAssistantPage() {
  const navigate  = useNavigate();
  const { notify } = useOutletContext<CtxType>();

  const [input, setInput]     = useState('');
  const [result, setResult]   = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<{ q: string; res: QueryResult }[]>([]);
  const [loading, setLoading] = useState(false);

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setTimeout(() => {
      const res = detectQuery(trimmed);
      if (res) {
        const r = { ...res, query: trimmed };
        setResult(r);
        setHistory(prev => [{ q: trimmed, res: r }, ...prev.slice(0, 4)]);
      } else {
        setResult({
          query: trimmed,
          summary: 'This prototype supports three prepared query types. Try one of the example queries below.',
          metrics: [],
          path: [],
          sources: [],
          reasoning: 'No prepared response matched this query. The prototype recognises queries about phone/CDR connections, financial links, and CCTV/CDR correlation for FIR-409/2026/NZ.',
          entities: [],
          caseId: 'c1',
        });
      }
      setLoading(false);
    }, 600);
    setInput('');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 style={{ fontSize: 22 }}>
            <Sparkle size={20} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--blue-primary)' }} />
            AI Investigation Assistant
          </h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            Query the synthetic FIR-409 knowledge graph. Results require investigator validation.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: history.length > 0 ? '220px 1fr' : '1fr', gap: 20, alignItems: 'start' }}>

        {/* History sidebar */}
        {history.length > 0 && (
          <div className="card">
            <div className="card-header"><h3>Recent queries</h3></div>
            {history.map((h, i) => (
              <button key={i} onClick={() => setResult(h.res)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <Clock size={13} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  {h.q.length > 60 ? h.q.slice(0, 60) + '…' : h.q}
                </span>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Query input */}
          <div className="card">
            <div style={{ padding: '16px 18px' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 8 }}>
                Investigation query
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(input); }}
                  placeholder="Describe what you want to investigate…"
                  rows={2}
                  style={{ flex: 1, fontSize: 13, resize: 'none' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => submit(input)}
                  disabled={loading || !input.trim()}
                  style={{ alignSelf: 'flex-end', minHeight: 40 }}
                >
                  {loading ? '…' : <><ArrowRight size={15} /> Query</>}
                </button>
              </div>
              <div style={{ marginTop: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', marginRight: 8 }}>Example queries:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {EXAMPLE_QUERIES.map(q => (
                    <button key={q} className="filter-chip"
                      onClick={() => { setInput(q); submit(q); }}
                      style={{ fontSize: 10, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <>
              {/* Summary */}
              <div className="card">
                <div className="card-header" style={{ background: 'var(--blue-subtle)', borderRadius: '6px 6px 0 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkle size={15} style={{ color: 'var(--blue-primary)' }} />
                    <h3 style={{ color: 'var(--blue-primary)' }}>Result</h3>
                  </div>
                  <span className="badge badge-gray" style={{ fontSize: 9 }}>SYNTHETIC DATA — Requires validation</span>
                </div>
                <div className="card-body">
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--navy)', marginBottom: 14 }}>{result.summary}</p>

                  {result.metrics.length > 0 && (
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, padding: '12px 14px', background: 'var(--surface-alt)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      {result.metrics.map(m => (
                        <div key={m.label} style={{ textAlign: 'center', minWidth: 80 }}>
                          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--mono)' }}>{m.value}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.path.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <h4 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 10 }}>Relationship path</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', padding: '10px 14px', background: 'var(--surface-alt)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        {result.path.map((node, i) => (
                          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 3 }}>
                              {node.label}
                            </span>
                            {node.connector && <span style={{ color: 'var(--muted)', fontSize: 12 }}>{node.connector}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.sources.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <h4 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 8 }}>Sources</h4>
                      {result.sources.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 11 }}>
                          <span className="mono badge badge-blue" style={{ fontSize: 9 }}>{s.id}</span>
                          <span className="badge badge-gray" style={{ fontSize: 9 }}>{s.type}</span>
                          <span style={{ color: 'var(--muted)' }}>{fmtTs(s.timestamp)}</span>
                          <span style={{ marginLeft: 'auto', fontWeight: 600, fontFamily: 'var(--mono)', color: s.confidence >= 90 ? 'var(--green)' : 'var(--amber)' }}>
                            {s.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.reasoning && (
                    <div>
                      <h4 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 8 }}>Reasoning</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75 }}>{result.reasoning}</p>
                    </div>
                  )}
                </div>

                <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-sm btn-primary" onClick={() => navigate(`/cases/${result.caseId}/connections`)}>
                    <Graph size={12} /> View Graph
                  </button>
                  <button className="btn btn-sm" onClick={() => navigate(`/cases/${result.caseId}/evidence`)}>
                    View Evidence <ArrowUpRight size={12} />
                  </button>
                  <button className="btn btn-sm" onClick={() => {
                    const followUp = `Investigate further: ${result.query}`;
                    setInput(followUp);
                    notify('Follow-up query loaded. Edit and submit to continue.');
                  }}>
                    Investigate further
                  </button>
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ fontSize: 11, color: 'var(--muted)', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', lineHeight: 1.65 }}>
                <strong>Important:</strong> AI assists the investigator. All connections, paths and findings are from synthetic data and require human validation before any investigative or legal action. This system does not access live NCRB, CCTNS, CDR or financial databases.
              </div>
            </>
          )}

          {!result && (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <Sparkle size={32} style={{ color: 'var(--border-mid)', marginBottom: 12 }} />
              <p style={{ fontSize: 13 }}>Enter a query or select an example to begin.</p>
              <p style={{ fontSize: 11, marginTop: 6 }}>The assistant analyses the FIR-409/2026/NZ synthetic knowledge graph.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
