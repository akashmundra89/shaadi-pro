import { useEffect, useState, useCallback } from 'react';
import { db, seedIfEmpty } from './db';
import { fmtDate } from './utils';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { ModalManager, type ModalType } from './components/Modals';
import Dashboard from './pages/Dashboard';
import Ceremonies from './pages/Ceremonies';
import Vendors from './pages/Vendors';
import Guests from './pages/Guests';
import Budget from './pages/Budget';
import TimelinePage from './pages/Timeline';
import Checklist from './pages/Checklist';
import VendorLibrary from './pages/VendorLibrary';
import type { Wedding, Page } from './types';

export default function App() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [currentWeddingId, setCurrentWeddingId] = useState<number | null>(null);
  const [currentWedding, setCurrentWedding] = useState<Wedding | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dash');
  const [modal, setModal] = useState<ModalType>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    seedIfEmpty().then(async () => {
      const ws = await db.weddings.toArray();
      setWeddings(ws);
      if (ws.length > 0 && ws[0].id) selectWedding(ws[0].id, ws);
    });
  }, []);

  async function selectWedding(id: number, ws?: Wedding[]) {
    setCurrentWeddingId(id);
    const w = await db.weddings.get(id);
    setCurrentWedding(w || null);
    const allWeddings = ws || await db.weddings.toArray();
    setWeddings(allWeddings);
    refresh();
  }

  async function refreshWeddings() {
    const ws = await db.weddings.toArray();
    setWeddings(ws);
    refresh();
  }

  async function toggleTask(id: number) {
    const t = await db.tasks.get(id);
    if (t) { await db.tasks.update(id, { done: !t.done }); refresh(); }
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
        <Sidebar
          weddings={weddings}
          currentWeddingId={currentWeddingId}
          currentPage={currentPage}
          onSelectWedding={id => selectWedding(id)}
          onNavigate={setCurrentPage}
          onNewWedding={() => setModal('add-wedding')}
        />

        <div className="main">
          <Topbar
            title={currentWedding ? `${currentWedding.name} Wedding` : 'Select a Wedding'}
            subtitle={subtitle}
          />

          {currentPage === 'dash' && (
            <Dashboard weddingId={currentWeddingId} onNavigate={setCurrentPage} onToggleTask={toggleTask} refreshKey={refreshKey} />
          )}
          {currentPage === 'ceremonies' && (
            <Ceremonies weddingId={currentWeddingId} onAddCeremony={() => setModal('add-ceremony')} refreshKey={refreshKey} onRefresh={refresh} />
          )}
          {currentPage === 'vendors' && (
            <Vendors weddingId={currentWeddingId} onAddVendor={() => setModal('add-vendor')} refreshKey={refreshKey} onRefresh={refresh} />
          )}
          {currentPage === 'guests' && (
            <Guests weddingId={currentWeddingId} onAddGuest={() => setModal('add-guest')} refreshKey={refreshKey} onRefresh={refresh} />
          )}
          {currentPage === 'budget' && (
            <Budget weddingId={currentWeddingId} onAddBudget={() => setModal('add-budget')} refreshKey={refreshKey} onRefresh={refresh} />
          )}
          {currentPage === 'timeline' && <TimelinePage />}
          {currentPage === 'checklist' && (
            <Checklist weddingId={currentWeddingId} refreshKey={refreshKey} onRefresh={refresh} />
          )}
          {currentPage === 'vlibrary' && (
            <VendorLibrary onAddLibVendor={() => setModal('add-lib-vendor')} refreshKey={refreshKey} onRefresh={refresh} />
          )}
        </div>

        <ModalManager
          modal={modal}
          weddingId={currentWeddingId}
          weddings={weddings}
          onClose={() => setModal(null)}
          onRefresh={refreshWeddings}
          onWeddingSelect={id => selectWedding(id)}
        />
      </div>
    </ToastProvider>
  );
}
