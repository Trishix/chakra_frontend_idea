import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { MagnifyingGlass, Plus, ArrowUpRight, FunnelSimple, FolderOpen } from '@phosphor-icons/react';
import { useStore } from '../store';
import { StatusBadge, DateText, Empty, Modal } from '../components/ui';
import type { CaseRecord } from '../domain/types';

type CtxType = { notify: (m: string) => void };

export function CasesPage() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const { notify } = useOutletContext<CtxType>();

  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('All');
  const [district, setDistrict] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle]     = useState('');
  const [newDistrict, setNewDistrict] = useState('North');
  const [station, setStation] = useState('');

  const filtered = state.cases.filter(c =>
    (status === 'All' || c.status === status) &&
    (district === 'All' || c.district === district) &&
    `${c.title} ${c.reference} ${c.district}`.toLowerCase().includes(search.toLowerCase())
  );

  const districts = [...new Set(state.cases.map(c => c.district))];

  function addCase(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !station.trim()) return;
    const time = new Date().toISOString();
    const record: CaseRecord = {
      id: crypto.randomUUID(),
      reference: `DEMO/2026/${String(state.cases.length + 420).padStart(4, '0')}`,
      title: title.trim(), district: newDistrict, station: station.trim(),
      officer: 'Insp. R. Varma', status: 'Active', updated: time,
      summary: 'New demonstration case. Attach documents or add evidence to begin.',
    };
    dispatch({ type: 'add-case', record, time });
    setCreateOpen(false); setTitle(''); setStation('');
    notify(`Case ${record.reference} created.`);
    navigate(`/cases/${record.id}`);
  }

  const tabs = ['All', 'Active', 'Under review', 'Closed'];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Case Register</h1>
          <p>Active investigations, evidence connections and review decisions.</p>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> New Case
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="tab-bar" style={{ marginBottom: 18 }}>
        {tabs.map(t => (
          <button key={t} className={`tab${status === t ? ' active' : ''}`} onClick={() => setStatus(t)}>
            {t}
            <span>{state.cases.filter(c => t === 'All' || c.status === t).length}</span>
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <div className="search-bar" style={{ maxWidth: 320 }}>
          <MagnifyingGlass size={15} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by case, reference or district"
            aria-label="Search cases"
          />
        </div>
        <div className="select-wrap">
          <FunnelSimple size={13} />
          <select value={district} onChange={e => setDistrict(e.target.value)} aria-label="Filter by district">
            <option value="All">All districts</option>
            {districts.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <span className="small muted" style={{ marginLeft: 'auto' }}>{filtered.length} investigation{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Cases table */}
      <div className="card">
        {filtered.length === 0
          ? <Empty title="No matching cases">Try a different search or clear the filter.</Empty>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Case / Subject</th>
                    <th>Status</th>
                    <th>District</th>
                    <th>Officer</th>
                    <th>Pending</th>
                    <th>Updated</th>
                    <th><span className="sr-only">Open</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const pending = state.leads.filter(l => l.caseId === c.id && l.leadStatus === 'pending').length;
                    return (
                      <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/cases/${c.id}`)}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--navy)' }}>{c.title}</div>
                          <div className="mono" style={{ marginTop: 3 }}>{c.reference}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{c.station}</div>
                        </td>
                        <td><StatusBadge status={c.status} /></td>
                        <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{c.district}</td>
                        <td style={{ fontSize: 11, color: 'var(--muted)' }}>{c.officer}</td>
                        <td>
                          {pending > 0
                            ? <span className="badge badge-amber">{pending}</span>
                            : <span style={{ fontSize: 11, color: 'var(--muted)' }}>—</span>}
                        </td>
                        <td style={{ fontSize: 11, color: 'var(--muted)' }}><DateText value={c.updated} /></td>
                        <td><ArrowUpRight size={15} style={{ color: 'var(--muted)' }} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        <div style={{ padding: '10px 14px', fontSize: 10, color: 'var(--muted)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FolderOpen size={13} />
          Synthetic demonstration data — FIR-409/2026/NZ prototype
        </div>
      </div>

      {/* Create case modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create a case" description="Create a local demonstration record.">
        <form onSubmit={addCase} className="form">
          <label>Case subject
            <input required maxLength={100} value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter investigation subject" />
          </label>
          <div className="form-row">
            <label>District
              <select value={newDistrict} onChange={e => setNewDistrict(e.target.value)}>
                {['North','Central','East','South','West','NCR','Faridabad'].map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label>Station
              <input required maxLength={80} value={station} onChange={e => setStation(e.target.value)} placeholder="Station name" />
            </label>
          </div>
          <p className="small muted">A demonstration reference will be assigned on creation.</p>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit">Create case</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
