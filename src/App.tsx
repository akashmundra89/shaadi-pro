import { useEffect, useState, useCallback } from 'react';
import { supabase } from './lib/supabase';
import * as api from './lib/api';
import { fmtDate, daysUntil } from './utils';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { AddWeddingModal, EditWeddingModal } from './components/Modals';
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
  const [showEditWeddingModal, setShowEditWeddingModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signInAsGuest() {
    await supabase.auth.signInAnonymously();
  }

  useEffect(() => {
    if (!session) return;
    api.seedIfEmpty().then(ws => {
      setWeddings(ws);
      if (ws.length > 0 && ws[0].id) selectWedding(ws[0].id, ws);
    });
  }, [session]);

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

  async function handleWeddingUpdated(updated: Wedding) {
    const ws = await api.getWeddings();
    setWeddings(ws);
    if (updated.id === currentWeddingId) setCurrentWedding(updated);
  }

  async function toggleTask(id: number, currentDone: boolean) {
    await api.updateTask(id, { done: !currentDone });
    refresh();
  }

  async function exportWeddingAll() {
    if (!currentWeddingId || !currentWedding) return;
    const XLSX = await import('xlsx');
    const [cers, vendors, guests, budget, tasks, timeline] = await Promise.all([
      api.getCeremonies(currentWeddingId),
      api.getVendors(currentWeddingId),
      api.getGuests(currentWeddingId),
      api.getBudget(currentWeddingId),
      api.getTasks(currentWeddingId),
      api.getTimeline(currentWeddingId),
    ]);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      cers.map(c => ({ Name: c.name, Date: c.date, Time: c.time, Location: c.location, 'Expected Guests': c.guests, Side: c.side, Status: c.status }))
    ), 'Ceremonies');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      vendors.map(v => ({ Name: v.name, Category: v.category, City: v.city, Phone: v.phone, 'Amount (₹)': v.amount, 'Pay Status': v.payStatus, Details: v.detail }))
    ), 'Vendors');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      guests.map(g => ({ Name: g.name, Phone: g.phone || '', Side: g.side, Relation: g.relation, Ceremonies: g.ceremonies, RSVP: g.rsvp, Transport: g.transport, 'Food Pref': g.food, 'Room No': g.roomNumber || '', 'Checked In': g.checkedIn ? 'Yes' : 'No' }))
    ), 'Guests');

    const totalSpent = budget.reduce((s, b) => s + b.spent, 0);
    const totalBudget = currentWedding.totalBudget ?? budget.reduce((s, b) => s + b.total, 0);
    const budgetRows = budget.map(b => ({
      Category: b.category, 'Spent (₹)': b.spent, 'Budget (₹)': b.total,
      'Remaining (₹)': b.total - b.spent,
      '% Used': b.total ? Math.round(b.spent / b.total * 100) + '%' : '0%',
    }));
    budgetRows.push({ Category: 'TOTAL', 'Spent (₹)': totalSpent, 'Budget (₹)': totalBudget, 'Remaining (₹)': totalBudget - totalSpent, '% Used': totalBudget ? Math.round(totalSpent / totalBudget * 100) + '%' : '0%' });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(budgetRows), 'Budget');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      [...timeline].sort((a, b) => a.sortOrder - b.sortOrder).map(t => ({ Day: t.day === 'main' ? 'Wedding Day' : 'Pre-Wedding', Time: t.time, Event: t.text, Details: t.sub }))
    ), 'Timeline');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      tasks.map(t => ({ Type: t.type === 'pre' ? 'Pre-Wedding' : 'Wedding Day', Task: t.label, 'Assigned To': t.who, Done: t.done ? 'Yes' : 'No' }))
    ), 'Checklist');

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${currentWedding.name}_backup_${date}.xlsx`);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setWeddings([]);
    setCurrentWeddingId(null);
    setCurrentWedding(null);
  }

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

  if (!session) {
    return <AuthPage onGuestAccess={signInAsGuest} />;
  }

  const daysLeft = currentWedding?.date ? daysUntil(currentWedding.date) : null;

  const subtitle = currentWedding ? (
    <>{currentWedding.venue || ''} · {currentWedding.city || ''} · {fmtDate(currentWedding.date)} &nbsp;·&nbsp; <span style={{ color: 'var(--pink)', fontWeight: 700 }}>{daysLeft !== null && daysLeft > 0 ? `${daysLeft} days to go` : 'Event passed'}</span></>
  ) : 'No wedding selected';

  return (
    <ToastProvider>
      <div className="app">
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
            hasWedding={!!currentWedding}
            onExportAll={exportWeddingAll}
            onEditWedding={() => setShowEditWeddingModal(true)}
          />

          {currentPage === 'dash' && (
            <Dashboard weddingId={currentWeddingId} onNavigate={navigateTo} onToggleTask={(id, done) => toggleTask(id, done)} refreshKey={refreshKey} />
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

        {showWeddingModal && (
          <AddWeddingModal
            onClose={() => setShowWeddingModal(false)}
            onRefresh={refreshWeddings}
            onSelect={id => selectWedding(id)}
          />
        )}
        {showEditWeddingModal && currentWedding && (
          <EditWeddingModal
            wedding={currentWedding}
            onClose={() => setShowEditWeddingModal(false)}
            onSaved={handleWeddingUpdated}
          />
        )}
      </div>
    </ToastProvider>
  );
}
