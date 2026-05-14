import type { Wedding, Page } from '../types';
import { fmtDate } from '../utils';

const COLORS = ['var(--amber)', 'var(--purple)', 'var(--teal)', 'var(--pink)', 'var(--coral)'];
const BGS = ['var(--amber-l)', 'var(--purple-l)', 'var(--teal-l)', 'var(--pink-l)', 'var(--coral-l)'];

interface Props {
  weddings: Wedding[];
  currentWeddingId: number | null;
  currentPage: Page;
  onSelectWedding: (id: number) => void;
  onNavigate: (page: Page) => void;
  onNewWedding: () => void;
}

const NAV_ITEMS: { page: Page; icon: string; label: string }[] = [
  { page: 'dash', icon: 'ti ti-layout-dashboard', label: 'Dashboard' },
  { page: 'ceremonies', icon: 'ti ti-confetti', label: 'Ceremonies' },
  { page: 'vendors', icon: 'ti ti-truck-delivery', label: 'Wedding Vendors' },
  { page: 'guests', icon: 'ti ti-users', label: 'Guest List' },
  { page: 'budget', icon: 'ti ti-chart-pie', label: 'Budget (₹)' },
  { page: 'timeline', icon: 'ti ti-calendar-time', label: 'Day Timeline' },
  { page: 'checklist', icon: 'ti ti-checkbox', label: 'Checklist' },
  { page: 'vlibrary', icon: 'ti ti-building-store', label: 'Vendor Library' },
];

export default function Sidebar({ weddings, currentWeddingId, currentPage, onSelectWedding, onNavigate, onNewWedding }: Props) {
  return (
    <div className="sb">
      <div className="sb-top">
        <div className="brand">
          <div className="brand-ico">🪔</div>
          <div>
            <div className="brand-t">Shaadi Pro</div>
            <div className="brand-s">Event Manager Platform</div>
          </div>
        </div>
      </div>

      <div className="sb-scroll">
        <div className="sb-sec">
          <div className="sb-lbl">Platform</div>
          {NAV_ITEMS.map(item => (
            <div
              key={item.page}
              className={`nav ${currentPage === item.page ? 'on' : ''}`}
              onClick={() => onNavigate(item.page)}
            >
              <i className={item.icon} />
              {item.label}
            </div>
          ))}
        </div>

        <hr className="divider" />

        <div className="sb-sec">
          <div className="sb-lbl">Weddings</div>
          {weddings.map((w, i) => {
            const init = w.name.split('×').map(s => s.trim()[0] || '').join('') || w.name.slice(0, 2).toUpperCase();
            const ci = i % COLORS.length;
            return (
              <div
                key={w.id}
                className={`w-pill ${w.id === currentWeddingId ? 'on' : ''}`}
                onClick={() => w.id && onSelectWedding(w.id)}
              >
                <div className="w-ava" style={{ background: BGS[ci], color: COLORS[ci] }}>{init}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="w-nm">{w.name}</div>
                  <div className="w-mt">{w.city || ''} · {fmtDate(w.date)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sb-foot">
        <button className="btn-add" onClick={onNewWedding}>
          <i className="ti ti-plus" /> New Wedding
        </button>
      </div>
    </div>
  );
}
