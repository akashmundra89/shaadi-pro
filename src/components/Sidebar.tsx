import { useState } from 'react';
import type React from 'react';
import type { Wedding, Page } from '../types';
import { fmtDate } from '../utils';
import heroPng from '../assets/hero.png';

const COLORS = ['var(--amber)', 'var(--purple)', 'var(--teal)', 'var(--pink)', 'var(--coral)'];
const BGS = ['var(--amber-l)', 'var(--purple-l)', 'var(--teal-l)', 'var(--pink-l)', 'var(--coral-l)'];

interface Props {
  weddings: Wedding[];
  currentWeddingId: number | null;
  currentPage: Page;
  onSelectWedding: (id: number) => void;
  onNavigate: (page: Page) => void;
  onNewWedding: () => void;
  onSignOut: () => void;
  onRenameWedding: (id: number, name: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
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

export default function Sidebar({ weddings, currentWeddingId, currentPage, onSelectWedding, onNavigate, onNewWedding, onSignOut, onRenameWedding, isOpen, onClose }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  function startRename(w: Wedding, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(w.id!);
    setEditName(w.name);
  }

  async function commitRename(id: number) {
    const name = editName.trim();
    if (name) await onRenameWedding(id, name);
    setEditingId(null);
  }

  function cancelRename() { setEditingId(null); }

  return (
    <div className={`sb${isOpen ? ' sb-open' : ''}`}>
      <div className="sb-top">
        <div className="sb-hero">
          <img className="sb-hero-img" src={heroPng} alt="" />
          <div className="sb-hero-overlay" />
          <div className="sb-hero-dec">💍</div>
          {/* Mobile close button */}
          <button
            className="sb-close-btn"
            onClick={onClose}
            title="Close menu"
          >
            <i className="ti ti-x" />
          </button>
        </div>
        <div className="brand">
          <div className="brand-ico">🪔</div>
          <div>
            <div className="brand-t">Shaadi Pro</div>
            <div className="brand-s">Wedding Manager</div>
          </div>
        </div>
      </div>

      <div className="sb-scroll">
        <div className="sb-sec">
          <div className="sb-lbl">Navigation</div>
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
            const isEditing = editingId === w.id;
            return (
              <div
                key={w.id}
                className={`w-pill ${w.id === currentWeddingId ? 'on' : ''}`}
                onClick={() => !isEditing && w.id && onSelectWedding(w.id)}
              >
                <div className="w-ava" style={{ background: BGS[ci], color: COLORS[ci] }}>{init}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  {isEditing ? (
                    <input
                      className="inp"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitRename(w.id!);
                        if (e.key === 'Escape') cancelRename();
                      }}
                      onBlur={() => commitRename(w.id!)}
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: 12, padding: '2px 6px', width: '100%' }}
                      autoFocus
                    />
                  ) : (
                    <div className="w-nm">{w.name}</div>
                  )}
                  <div className="w-mt">{w.city || ''} · {fmtDate(w.date)}</div>
                </div>
                {w.id === currentWeddingId && !isEditing && (
                  <button
                    className="btn btn-sm"
                    onClick={e => startRename(w, e)}
                    title="Rename"
                    style={{ color: 'var(--muted)', fontSize: 12, padding: '2px 4px', border: 'none', flexShrink: 0 }}
                  >
                    <i className="ti ti-pencil" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="sb-foot">
        <button className="btn-add" onClick={onNewWedding}>
          <i className="ti ti-plus" /> New Wedding
        </button>
        <button className="btn-signout" onClick={onSignOut}>
          <i className="ti ti-logout" /> Sign Out
        </button>
      </div>
    </div>
  );
}
