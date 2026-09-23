import { NavLink, useParams } from 'react-router-dom';
import {
  ChartPie, FolderOpen, Graph, ListChecks, Clock, VideoCamera,
  Detective, ClockCounterClockwise, Robot, ArrowCounterClockwise, X, FileText,
} from '@phosphor-icons/react';
import { useStore } from '../../store';

import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

interface Props {
  onReset: () => void;
  onAbout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ onReset, onAbout, mobileOpen, onMobileClose }: Props) {
  const { state } = useStore();
  const params = useParams<{ caseId?: string }>();
  const activeCaseId = params.caseId ?? 'c1';
  const activeCase = state.cases.find(c => c.id === activeCaseId) ?? state.cases[0];

  const pendingLeads = state.leads.filter(l => l.leadStatus === 'pending').length;
  const activeCases = state.cases.filter(c => c.status === 'Active').length;

  type NavItem = { to: string; label: string; icon: PhosphorIcon; end?: boolean; badge?: string; badgeType?: 'warn' | 'alert' };
  const nav: NavItem[] = [
    { to: '/',              label: 'Dashboard',        icon: ChartPie,             end: true },
    { to: '/cases',         label: 'Cases',             icon: FolderOpen,           badge: String(activeCases) },
    { to: `/cases/${activeCaseId}/connections`, label: 'Connections', icon: Graph },
    { to: `/cases/${activeCaseId}/evidence`,    label: 'Evidence',    icon: ListChecks,    badge: String(state.sources.filter(s => s.caseId === activeCaseId).length) },
    { to: '/camera',        label: 'Camera Search',     icon: VideoCamera,          badge: '3' },
    { to: `/cases/${activeCaseId}/timeline`,    label: 'Event Timeline', icon: Clock },
    { to: '/leads',         label: 'Review Leads',      icon: Detective,            badge: pendingLeads > 0 ? String(pendingLeads) : undefined, badgeType: pendingLeads > 0 ? 'warn' : undefined },
    { to: '/evidence-history', label: 'Evidence History', icon: ClockCounterClockwise },
    { to: '/reports',       label: 'Reports',           icon: FileText,             badge: state.reports.length > 0 ? String(state.reports.length) : undefined },
    { to: '/assistant',     label: 'AI Assistant',      icon: Robot },
  ];

  return (
    <>
      {mobileOpen && <div className="nav-scrim" onClick={onMobileClose} />}
      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Brand */}
        <a href="/" className="sidebar-brand" onClick={e => { e.preventDefault(); onMobileClose(); }}>
          <img src="/ci-intel.svg" alt="" />
          <span>CI INTEL</span>
        </a>

        {/* Active case context */}
        {activeCase && (
          <div className="sidebar-case-badge">
            <div className="badge-label">Active Case</div>
            <div className="badge-ref">{activeCase.reference}</div>
          </div>
        )}

        {/* Nav */}
        <nav aria-label="Main navigation">
          {nav.map(({ to, label, icon: Icon, badge, badgeType, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={onMobileClose}
            >
              <Icon size={17} weight="regular" />
              <span className="nav-label">{label}</span>
              {badge && (
                <span className={`nav-badge${badgeType === 'warn' ? ' warn' : ''}`}>
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          <button className="sidebar-bottom-btn" onClick={onAbout}>
            <Detective size={15} />
            About CI INTEL
          </button>
          <button className="sidebar-bottom-btn" onClick={onReset}>
            <ArrowCounterClockwise size={15} />
            Reset demo
          </button>
          <div className="demo-badge">
            <div className="demo-badge-dot" />
            <div className="demo-badge-text">
              <strong>Synthetic Data</strong>
              <span>FIR-409 prototype</span>
            </div>
          </div>
        </div>

        {/* Mobile close */}
        {mobileOpen && (
          <button className="icon-btn" style={{ position: 'absolute', top: 14, right: 12 }} onClick={onMobileClose} aria-label="Close navigation">
            <X size={18} />
          </button>
        )}
      </aside>
    </>
  );
}
