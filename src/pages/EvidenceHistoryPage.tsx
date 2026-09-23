import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DownloadSimple, CheckCircle, ArrowUpRight } from '@phosphor-icons/react';
import { useStore } from '../store';


type HandoverEntry = {
  id: string; status: string; statusClass: string;
  artifact: string; custodian: string; time: string; ref: string;
};

const HANDOVER_HISTORY: HandoverEntry[] = [
  { id: 'h1', status: 'SEALED & HASH-MATCHED', statusClass: 'badge-green',   artifact: 'Forensic Image Extraction · CFSL-2026-M882 (Apple iPhone 14 Pro, Space Gray) · Seal No: EVD-SL-9041', custodian: 'SI Devender Singh (#DL-CB-5120) → CFSL Cyber Lab Node', time: '2026-03-03T14:38:12.000Z', ref: 'SHA-256: 94a1d821...bf32e091' },
  { id: 'h2', status: 'TRANSFERRED & RECEIPTED', statusClass: 'badge-amber', artifact: 'Malkhana Vault Transit to Judicial Magistrate Patiala House · CASH-INR-45L-HAWALA (45,00,000 INR Currency Notes) · Seal No: CB-VAL-04-A', custodian: 'DySP S. Mathur (#DL-CB-1002) → CMM Court Registry', time: '2026-03-03T12:15:04.000Z', ref: 'SHA-256: af899e12...01deaa77' },
  { id: 'h3', status: 'SEAL INTACT', statusClass: 'badge-blue',              artifact: 'Cryptographic Hash Stamping (Sec 65B Certificate #8821) · CCTV_NZ_0914_ISBTKashmereGate_02.mp4 · Seal: HSM-PKI-EVD-992', custodian: 'Automated Forensic Ingest Node (NIC-DEL-01)', time: '2026-03-03T09:12:00.000Z', ref: 'SHA-256: aa70144f...6346e990' },
];

function fmtTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' IST';
}

export function EvidenceHistoryPage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [checkValue, setCheckValue] = useState('94a1d813bc89a02ce761bf32e8912fa');
  const [checkResult, setCheckResult] = useState<'idle' | 'match' | 'nomatch'>('idle');

  const primaryCase = state.cases[0];

  function doCheck() {
    setCheckResult(checkValue.trim().length > 10 ? 'match' : 'nomatch');
  }

  function exportHistory() {
    const lines = [
      'CI INTEL — Evidence History Export',
      'SYNTHETIC DEMONSTRATION DATA — Not a legal document',
      '='.repeat(60),
      `Case: ${primaryCase.reference}`,
      `Generated: ${new Date().toISOString()}`,
      '',
      'EVIDENCE HANDLING HISTORY',
      ...HANDOVER_HISTORY.map(h =>
        `\n[${fmtTime(h.time)}] ${h.status}\n  Artifact: ${h.artifact}\n  Custodian: ${h.custodian}\n  Ref: ${h.ref}`
      ),
      '',
      'SYNTHETIC DATA — FIR-409/2026/NZ prototype',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ci-intel-evidence-history-${primaryCase.reference.replace(/\//g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 11, color: 'var(--muted)' }}>
            <span>DOCKET /</span>
            <button className="text-btn" style={{ fontSize: 11 }} onClick={() => navigate('/cases/c1')}>{primaryCase.reference}</button>
            <span>/ Evidence History</span>
            <span className="badge badge-green" style={{ fontSize: 9 }}>DEMONSTRATION RECORD</span>
          </div>
          <h1 style={{ fontSize: 22 }}>Evidence History</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Traceability and audit trail for evidence handling.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={exportHistory}>
            <DownloadSimple size={15} /> Export history
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="metric-row" style={{ marginBottom: 24 }}>
        <div className="metric-card good-card">
          <div className="metric-label">Record Checks</div>
          <div className="metric-value">100%</div>
          <div className="metric-sub">1,429 demonstration events</div>
        </div>
        <div className="metric-card blue-card">
          <div className="metric-label">Stored Items</div>
          <div className="metric-value">7</div>
          <div className="metric-sub">In vault — Malkhana #04</div>
        </div>
        <div className="metric-card good-card">
          <div className="metric-label">Signing Certificates</div>
          <div className="metric-value">28</div>
          <div className="metric-sub">Active demonstration certs</div>
        </div>
        <div className="metric-card blue-card">
          <div className="metric-label">Evidence Handovers</div>
          <div className="metric-value">12</div>
          <div className="metric-sub">Logged cycles — Patiala House</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Handling history */}
        <div className="card">
          <div className="card-header">
            <h3>Evidence Handling History</h3>
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>Append-only demonstration log</span>
          </div>
          <div>
            {HANDOVER_HISTORY.map(h => (
              <div key={h.id} style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <span className={`badge ${h.statusClass}`} style={{ fontSize: 9, flexShrink: 0 }}>{h.status}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto', flexShrink: 0, fontFamily: 'var(--mono)' }}>
                    {fmtTime(h.time)}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 6 }}>{h.artifact}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Custodian: {h.custodian}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, fontFamily: 'var(--mono)' }}>{h.ref}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Fingerprint check */}
          <div className="card">
            <div className="card-header">
              <h3>Check a file fingerprint</h3>
              <span className="badge badge-gray" style={{ fontSize: 9 }}>Demo check</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.6 }}>
                Enter a file fingerprint or seal number to compare it with the sample case records.
              </p>
              <textarea
                rows={3}
                value={checkValue}
                onChange={e => setCheckValue(e.target.value)}
                style={{ width: '100%', fontSize: 11, fontFamily: 'var(--mono)' }}
              />
              <button className="btn btn-primary btn-wide" style={{ marginTop: 10 }} onClick={doCheck}>
                <CheckCircle size={15} /> Check record
              </button>
              {checkResult === 'match' && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)', fontSize: 11, color: 'var(--green)' }}>
                  <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                  Record matches — Zero modifications detected across 4 demonstration nodes.
                </div>
              )}
              {checkResult === 'nomatch' && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius)', fontSize: 11, color: 'var(--red)' }}>
                  No match found in demonstration records. Verify the fingerprint value.
                </div>
              )}
            </div>
          </div>

          {/* Evidence storage */}
          <div className="card">
            <div className="card-header"><h3>Evidence storage</h3><span className="badge badge-navy" style={{ fontSize: 9 }}>VAULT #04</span></div>
            <div className="card-body">
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>
                <strong>PS Special Cell Vault #04, New Delhi</strong>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Key Custodian: HC Ram Avtar (#DL-HC-209)</div>
              </div>
              {[
                { label: '3x Apple iPhone 14 Pro', ref: '#MK-882/26' },
                { label: '4x Physical SIM Cards',  ref: '#MK-883/26' },
                { label: '45,00,000 INR Currency', ref: '#CB-VAL-04' },
              ].map(item => (
                <div key={item.ref} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 11 }}>
                  <span style={{ color: 'var(--text-2)' }}>{item.label}</span>
                  <span className="mono" style={{ color: 'var(--muted)' }}>{item.ref}</span>
                </div>
              ))}
              <button className="btn btn-sm btn-wide" style={{ marginTop: 12 }}
                onClick={() => navigate('/cases/c1')}>
                <ArrowUpRight size={12} /> View case record
              </button>
            </div>
          </div>

          <div style={{ fontSize: 10, color: 'var(--muted)', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            This is a synthetic demonstration. Evidence records, custodians, and fingerprints are fictional and for prototype purposes only.
          </div>
        </div>
      </div>
    </div>
  );
}
