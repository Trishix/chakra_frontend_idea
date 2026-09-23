import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MagnifyingGlass, List, Bell, CaretDown, FolderOpen, ArrowUpRight, X } from '@phosphor-icons/react';
import { useStore } from '../../store';
import { Modal } from '../ui';

interface Props {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: Props) {
  const { state } = useStore();
  const navigate = useNavigate();
  const params = useParams<{ caseId?: string }>();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const activeCaseId = params.caseId;
  const activeCase = activeCaseId ? state.cases.find(c => c.id === activeCaseId) : null;

  const pendingAlerts = state.leads.filter(l => l.leadStatus === 'pending').length;

  const filteredCases = state.cases.filter(c =>
    `${c.reference} ${c.title} ${c.district}`.toLowerCase().includes(searchText.toLowerCase())
  );

  function openCase(id: string) {
    setSearchOpen(false);
    setSearchText('');
    navigate(`/cases/${id}`);
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button className="topbar-icon-btn topbar-menu-btn" onClick={onMenuToggle} aria-label="Toggle navigation" id="menu-toggle-btn">
            <List size={19} />
          </button>

          <div className="topbar-crumb">
            <span>CI INTEL</span>
            {activeCase && (
              <>
                <span className="slash">/</span>
                <span className="topbar-case-chip">
                  <span className="case-status-dot" />
                  {activeCase.reference}
                </span>
                <strong>{activeCase.title.length > 45 ? activeCase.title.slice(0, 45) + '…' : activeCase.title}</strong>
              </>
            )}
          </div>
        </div>

        <div className="topbar-right">
          {/* Global search */}
          <button className="topbar-search" onClick={() => { setSearchText(''); setSearchOpen(true); }}>
            <MagnifyingGlass size={14} />
            <span>Search cases…</span>
            <kbd>⌘K</kbd>
          </button>

          {/* Alert bell */}
          <button className="topbar-icon-btn" aria-label={`${pendingAlerts} pending leads`} onClick={() => navigate('/leads')}>
            <Bell size={17} />
            {pendingAlerts > 0 && (
              <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid var(--navy)' }} />
            )}
          </button>

          <div className="topbar-divider" />

          {/* Profile */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button className="topbar-profile" onClick={() => setProfileOpen(v => !v)} aria-label="Investigator profile">
              <div className="topbar-avatar">RV</div>
              <span className="topbar-profile-name">Insp. R. Varma</span>
              <CaretDown size={11} style={{ color: '#5a7d96' }} />
            </button>
            {profileOpen && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '8px', minWidth: 180, boxShadow: '0 8px 24px rgba(12,30,53,.12)', zIndex: 40 }}>
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>Insp. Rajesh Varma</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>PS Special Cell, NCR</div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', padding: '6px 10px 4px' }}>SIH 2026 Demo — Synthetic Data</div>
                <button className="sidebar-bottom-btn" onClick={() => { setProfileOpen(false); }} style={{ width: '100%', borderRadius: 'var(--radius)', padding: '6px 10px' }}>
                  <X size={13} /> Close
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global search modal */}
      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="Search cases" description="Find a case by reference, subject or district.">
        <div className="search-bar" style={{ marginBottom: 14 }}>
          <MagnifyingGlass size={16} />
          <input
            autoFocus
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="FIR reference, title, or district…"
            aria-label="Search cases"
          />
        </div>
        <div>
          {filteredCases.map(c => (
            <button
              key={c.id}
              onClick={() => openCase(c.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 4px', borderBottom: '1px solid var(--border)', textAlign: 'left', background: 'none', cursor: 'pointer' }}
            >
              <FolderOpen size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy)' }}>{c.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{c.reference} · {c.district}</div>
              </div>
              <ArrowUpRight size={16} style={{ color: 'var(--muted)' }} />
            </button>
          ))}
          {filteredCases.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '24px 0' }}>No cases match this search.</p>
          )}
        </div>
      </Modal>
    </>
  );
}
