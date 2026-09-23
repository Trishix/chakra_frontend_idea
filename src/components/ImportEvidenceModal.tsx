import { useRef, useState } from 'react';
import {
  Modal,
} from './ui';
import {
  FileText, UploadSimple, Paperclip, Check, WarningCircle, ShieldCheck, X,
} from '@phosphor-icons/react';
import { useStore } from '../store';

interface Props {
  open: boolean;
  onClose: () => void;
  caseId: string;
  onNotify: (msg: string) => void;
}

export function ImportEvidenceModal({ open, onClose, caseId, onNotify }: Props) {
  const { state, dispatch } = useStore();
  const [selectedCaseId, setSelectedCaseId] = useState(caseId);
  const [mode, setMode] = useState<'pack' | 'file'>('pack');
  const [selectedPack, setSelectedPack] = useState<'witness' | 'hawala' | 'anpr'>('witness');
  const [busy, setBusy] = useState(false);
  const [fileAttached, setFileAttached] = useState<{ name: string; size: string; hash: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const packs = [
    {
      id: 'witness',
      title: 'Supplementary Witness Record (STMT-002)',
      desc: 'Corroborates courier handover at ISBT Kashmere Gate on 14 Feb 2026. Attaches 1 verified statement.',
      type: 'Statement',
    },
    {
      id: 'hawala',
      title: 'Hawala Ledger Addendum (FIN-002)',
      desc: '3 supplementary NEFT receipts matching Axis Bank Surat ledger SL-91 with timestamp correlation.',
      type: 'Financial',
    },
    {
      id: 'anpr',
      title: 'Automated ANPR Night Log (ANPR-002)',
      desc: 'Jaipur highway toll optical capture of vehicle DL-1C-AA-0921 moving south.',
      type: 'ANPR',
    },
  ];

  function handleImportPack() {
    setBusy(true);
    setTimeout(() => {
      dispatch({
        type: 'import-pack',
        caseId: selectedCaseId,
        time: new Date().toISOString(),
      });
      setBusy(false);
      onNotify(`Evidence pack imported into ${state.cases.find(c => c.id === selectedCaseId)?.reference}.`);
      onClose();
    }, 700);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulated cryptographic hash generation for Sec 65B compliance
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const mockHash = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');

    setFileAttached({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      hash: `SHA-256: ${mockHash}...`,
    });
  }

  function handleCompleteFileUpload() {
    if (!fileAttached) return;
    onNotify(`Attached "${fileAttached.name}" with hash seal ${fileAttached.hash.slice(0, 16)}.`);
    setFileAttached(null);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Evidence Ingestion & Import"
      description="Ingest prepared synthetic evidence packs or upload local case files under chain-of-custody controls."
      wide
    >
      <div className="form">
        <label>
          Target Case Dossier
          <select value={selectedCaseId} onChange={e => setSelectedCaseId(e.target.value)}>
            {state.cases.map(c => (
              <option key={c.id} value={c.id}>
                {c.reference} — {c.title}
              </option>
            ))}
          </select>
        </label>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 8, background: 'var(--surface-alt)', padding: 4, borderRadius: 'var(--radius)' }}>
          <button
            type="button"
            className={`btn ${mode === 'pack' ? 'btn-primary' : ''}`}
            style={{ flex: 1, fontSize: 12 }}
            onClick={() => setMode('pack')}
          >
            <FileText size={15} /> Predefined Demonstration Pack
          </button>
          <button
            type="button"
            className={`btn ${mode === 'file' ? 'btn-primary' : ''}`}
            style={{ flex: 1, fontSize: 12 }}
            onClick={() => setMode('file')}
          >
            <Paperclip size={15} /> Upload Case Document / File
          </button>
        </div>

        {mode === 'pack' ? (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              {packs.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPack(p.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 'var(--radius)',
                    border: `1.5px solid ${selectedPack === p.id ? 'var(--blue-primary)' : 'var(--border)'}`,
                    background: selectedPack === p.id ? 'var(--blue-subtle)' : 'var(--surface)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="evidence-pack"
                    checked={selectedPack === p.id}
                    onChange={() => setSelectedPack(p.id as any)}
                    style={{ marginTop: 2 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{p.title}</span>
                      <span className="badge badge-navy" style={{ fontSize: 8 }}>{p.type}</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="note-box" style={{ marginTop: 14 }}>
              <ShieldCheck size={16} style={{ color: 'var(--blue-primary)', flexShrink: 0 }} />
              <span>
                Demonstration pack imports merge synthetic source documents and leads into the case graph with idempotent SHA-256 reference hashes.
              </span>
            </div>

            <div className="form-actions">
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={handleImportPack}
              >
                <UploadSimple size={15} />
                {busy ? 'Ingesting records…' : 'Ingest Demonstration Pack'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-mid)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--surface-alt)',
                transition: 'border-color .15s',
              }}
            >
              <UploadSimple size={32} style={{ color: 'var(--blue-primary)', marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>
                Click to browse or drop case files here
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                Supports FIR scans (PDF), CDR logs (CSV/TXT), and Surveillance footage stills (PNG/JPG) up to 25 MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
            </div>

            {fileAttached && (
              <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileText size={20} style={{ color: 'var(--blue-primary)' }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{fileAttached.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{fileAttached.size}</div>
                    </div>
                  </div>
                  <button className="icon-btn" onClick={() => setFileAttached(null)}>
                    <X size={15} />
                  </button>
                </div>
                <div style={{ marginTop: 8, padding: '6px 10px', background: '#f8fafc', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} style={{ color: 'var(--green)' }} />
                  <span className="mono" style={{ fontSize: 10, color: 'var(--navy)' }}>{fileAttached.hash}</span>
                  <span className="badge badge-green" style={{ fontSize: 8, marginLeft: 'auto' }}>Sec 65B Stamped</span>
                </div>
              </div>
            )}

            <div className="note-box" style={{ marginTop: 14 }}>
              <WarningCircle size={16} style={{ color: 'var(--amber)', flexShrink: 0 }} />
              <span>
                Uploaded files remain within this in-memory browser demonstration session and are never transmitted to external clouds or unauthenticated servers.
              </span>
            </div>

            <div className="form-actions">
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!fileAttached}
                onClick={handleCompleteFileUpload}
              >
                <Check size={15} /> Seal &amp; Attach to Case
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
