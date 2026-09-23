import { useEffect, useRef, useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Toast, Modal } from './components/ui';
import { LockKey } from '@phosphor-icons/react';

/* ─── Lazy page imports ──────────────────────────────────── */
import { DashboardPage }        from './pages/DashboardPage';
import { CasesPage }            from './pages/CasesPage';
import { CaseOverviewPage }     from './pages/CaseOverviewPage';
import { CaseConnectionsPage }  from './pages/CaseConnectionsPage';
import { EvidenceTimelinePage } from './pages/EvidenceTimelinePage';
import { EventTimelinePage }    from './pages/EventTimelinePage';
import { CameraSearchPage }     from './pages/CameraSearchPage';
import { ReviewLeadsPage }      from './pages/ReviewLeadsPage';
import { EvidenceHistoryPage }  from './pages/EvidenceHistoryPage';
import { EntityProfilePage }    from './pages/EntityProfilePage';
import { AIAssistantPage }      from './pages/AIAssistantPage';
import { ReportsPage }          from './pages/ReportsPage';

/* ─── App layout shell (persistent across all routes) ────── */
function AppLayout() {
  const { dispatch } = useStore();
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function notify(message: string) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4200);
  }

  function doReset() {
    dispatch({ type: 'reset' });
    setResetOpen(false);
    notify('Demonstration restored to initial FIR-409 dataset.');
  }

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Trigger search via topbar - handled in Topbar component
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <Sidebar
        onReset={() => setResetOpen(true)}
        onAbout={() => setAboutOpen(true)}
        mobileOpen={mobileNav}
        onMobileClose={() => setMobileNav(false)}
      />

      <div className="app-main">
        <Topbar onMenuToggle={() => setMobileNav(v => !v)} />
        <main id="main-content" className="page-content">
          <Outlet context={{ notify }} />
        </main>
      </div>

      <Toast message={toast} onDismiss={() => setToast('')} />

      {/* About modal */}
      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About CI INTEL">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <img src="/ci-intel.svg" alt="" style={{ width: 36 }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--navy)' }}>CI INTEL</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>AI-Powered Criminal Network Analysis</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>
          SIH 2026 prototype for Problem Statement 26189. Built to demonstrate how fragmented records — FIRs, CDR data, financial transactions, CCTV — can be connected into a knowledge graph to surface hidden criminal network relationships.
        </p>
        <div className="note-box">
          <LockKey size={17} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>This is a synthetic demonstration. All data is fictional. No real government databases, CDR records, or financial systems are connected.</span>
        </div>
        <div style={{ marginTop: 16, fontSize: 11, color: 'var(--muted)' }}>
          Dataset: FIR-409/2026/NZ · State vs. Tariq Ahmed @ Syndicate 11
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={() => setAboutOpen(false)}>Close</button>
        </div>
      </Modal>

      {/* Reset modal */}
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset demonstration?" description="This restores the original FIR-409 synthetic dataset and clears all review decisions.">
        <div className="form-actions">
          <button className="btn" onClick={() => setResetOpen(false)}>Keep my changes</button>
          <button className="btn btn-danger" onClick={doReset}>Reset demonstration</button>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Router definition ──────────────────────────────────── */
const router = createBrowserRouter([
  {
    path: '/',
    element: <WrappedLayout />,
    children: [
      { index: true,                              element: <DashboardPage /> },
      { path: 'cases',                            element: <CasesPage /> },
      { path: 'cases/:caseId',                    element: <CaseOverviewPage /> },
      { path: 'cases/:caseId/connections',        element: <CaseConnectionsPage /> },
      { path: 'cases/:caseId/evidence',           element: <EvidenceTimelinePage /> },
      { path: 'cases/:caseId/timeline',           element: <EventTimelinePage /> },
      { path: 'camera',                           element: <CameraSearchPage /> },
      { path: 'leads',                            element: <ReviewLeadsPage /> },
      { path: 'evidence-history',                 element: <EvidenceHistoryPage /> },
      { path: 'entities/:entityId',               element: <EntityProfilePage /> },
      { path: 'assistant',                        element: <AIAssistantPage /> },
      { path: 'reports',                          element: <ReportsPage /> },
      { path: 'cases/:caseId/reports',            element: <ReportsPage /> },
    ],
  },
]);

function WrappedLayout() {
  return (
    <StoreProvider>
      <AppLayout />
    </StoreProvider>
  );
}

export function App() {
  return <RouterProvider router={router} />;
}
