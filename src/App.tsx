import { useEffect, useState, useCallback } from 'react';
import { supabase } from './lib/supabase';
import * as api from './lib/api';
import { fmtDate } from './utils';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { ModalManager } from './components/Modals';
import AuthPage from './components/AuthPage';
import Dashboard from './pages/Dashboard';
import Ceremonies from './pages/Ceremonies';
import Vendors from './pages/Vendors';
import Guests from './pages/Guests';
import Budget from './pages/Budget';
import TimelinePage from './pages/Timeline';
import Checklist from './pages/Checklist';
import VendorLibrary from './pages/VendorLibrary';
import type { Wedding, Page } from './types';
import type { Session } from '@supabase/supabase-js';

const PAGE_HASH: Record<string, Page> = {
  '#dash': 'dash', '#ceremonies': 'ceremonies', '#vendors': 'vendors',
  '#guests': 'guests', '#budget': 'budget', '#timeline': 'timeline',
  '#checklist': 'checklist', '#vlibrary': 'vlibrary',
};

function getPageFromHash(): Page {
  return PAGE_HASH[window.location.hash] ?? 'dash';
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined); // undefined = loading
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [currentWeddingId, setCurrentWeddingId] = useState<number | null>(null);
  const [currentWedding, setCurrentWedding] = useState<Wedding | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(getPageFromHash());
  const [showWeddingModal, setShowWeddingModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load weddings when session is available
  useEffect(() => {
    if (!session) return;
    api.seedIfEmpty().then(async () => {
      const ws = await api.getWeddings();
      setWeddings(ws);
      if (ws.length > 0 && ws[0].id) selectWedding(ws[0].id, ws);
    });
  }, [session]);

  // Hash routing
  useEffect(() => {
    function onHashChange() { setCurrentPage(getPageFromHash()); }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function navigateTo(page: Page) {
    window.location.hash = page;
    setCurrentPage(page);
    setSidebarOpen(false);
  }

  async function selectWedding(id: number, ws?: Wedding[]) {
    setCurrentWeddingId(id);
    const w = await api.getWedding(id);
    setCurrentWedding(w || null);
    const allWeddings = ws || await api.getWeddings();
    setWeddings(allWeddings);
    refresh();
  }

  async function refreshWeddings() {
    const ws = await api.getWeddings();
    setWeddings(ws);
    refresh();
  }

  async function toggleTask(id: number) {
    const tasks = currentWeddingId ? await api.getTasks(currentWeddingId) : [];
    const t = tasks.find(x => x.id === id);
    if (t) { await api.updateTask(id, { done: !t.done }); refresh(); }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setWeddings([]);
    setCurrentWeddingId(null);
    setCurrentWedding(null);
  }

  // Loading state
  if (session === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1C0F14' }}>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🪔</div>
          Loading Shaadi Pro...
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return <AuthPage />;
  }

  const daysLeft = currentWedding?.date
    ? Math.ceil((new Date(currentWedding.date).getTime() - Date.now()) / 86400000)
    : null;

  const subtitle = currentWedding
    ? `${currentWedding.venue || ''} · ${currentWedding.city || ''} · ${fmtDate(currentWedding.date)} &nbsp;·&nbsp; <span style="color:var(--pink);font-weight:700">${daysLeft !== null && daysLeft > 0 ? daysLeft + ' days to go' : 'Event passed'}</span>`
    : 'No wedding selected';

  return (
    <ToastProvider>
      <div className="app">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="sb-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          weddings={weddings}
          currentWeddingId={currentWeddingId}
          currentPage={currentPage}
          onSelectWedding={id => selectWedding(id)}
          onNavigate={navigateTo}
          onNewWedding={() => setShowWeddingModal(true)}
          onSignOut={signOut}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="main">
          <Topbar
            title={currentWedding ? `${currentWedding.name} Wedding` : 'Select a Wedding'}
            subtitle={subtitle}
            onMenuToggle={() => setSidebarOpen(o => !o)}
          />

          {currentPage === 'dash' && (
            <Dashboard weddingId={currentWeddingId} onNavigate={navigateTo} onToggleTask={toggleTask} refreshKey={refreshKey} />
          )}
          {currentPage === 'ceremonies' && (
            <Ceremonies weddingId={currentWeddingId} refreshKey={refreshKey} onRefresh={refresh} />
          )}
          {currentPage === 'vendors' && (
            <Vendors weddingId={currentWeddingId} refreshKey={refreshKey} onRefresh={refresh} />
          )}
          {currentPage === 'guests' && (
            <Guests weddingId={currentWeddingId} refreshKey={refreshKey} onRefresh={refresh} />
          )}
          {currentPage === 'budget' && (
            <Budget weddingId={currentWeddingId} refreshKey={refreshKey} onRefresh={refresh} />
          )}
          {currentPage === 'timeline' && (
            <TimelinePage weddingId={currentWeddingId} refreshKey={refreshKey} onRefresh={refresh} />
          )}
          {currentPage === 'checklist' && (
            <Checklist weddingId={currentWeddingId} refreshKey={refreshKey} onRefresh={refresh} />
          )}
          {currentPage === 'vlibrary' && (
            <VendorLibrary refreshKey={refreshKey} onRefresh={refresh} />
          )}
        </div>

        <ModalManager
          show={showWeddingModal}
          onClose={() => setShowWeddingModal(false)}
          onRefresh={refreshWeddings}
          onWeddingSelect={id => selectWedding(id)}
        />
      </div>
    </ToastProvider>
  );
}
