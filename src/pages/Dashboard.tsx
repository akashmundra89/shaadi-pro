import { useEffect, useState } from 'react';
import * as api from '../lib/api';
import { fmt, capStatus, getCeremonyIcon, fmtDate } from '../utils';
import type { Ceremony, Vendor, Guest, BudgetCategory, Task, Page, Wedding } from '../types';
import heroPng from '../assets/hero.png';

interface Props {
  weddingId: number | null;
  onNavigate: (page: Page) => void;
  onToggleTask: (id: number) => void;
  refreshKey: number;
}

interface DashData {
  wedding: Wedding | null;
  cers: Ceremony[];
  vendors: Vendor[];
  guests: Guest[];
  budget: BudgetCategory[];
  tasks: Task[];
}

export default function Dashboard({ weddingId, onNavigate, onToggleTask, refreshKey }: Props) {
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => {
    if (!weddingId) { setData(null); return; }
    Promise.all([
      api.getWedding(weddingId),
      api.getCeremonies(weddingId),
      api.getVendors(weddingId),
      api.getGuests(weddingId),
      api.getBudget(weddingId),
      api.getTasks(weddingId),
    ]).then(([wedding, cers, vendors, guests, budget, tasks]) =>
      setData({ wedding: wedding || null, cers, vendors, guests, budget, tasks })
    );
  }, [weddingId, refreshKey]);

  if (!weddingId || !data) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 380 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🪔</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            Welcome to Shaadi Pro
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Select a wedding from the sidebar or create a new one to start managing your special day.
          </div>
        </div>
      </div>
    );
  }

  const { wedding, cers, vendors, guests, budget, tasks } = data;
  const totalSpent = budget.reduce((a, b) => a + b.spent, 0);
  const totalBudget = budget.reduce((a, b) => a + b.total, 0);
  const confirmed = guests.filter(g => g.rsvp === 'Yes').length;
  const done = tasks.filter(t => t.done).length;
  const pendingVs = vendors.filter(v => v.payStatus === 'pending');
  const pendingTasks = tasks.filter(t => !t.done).slice(0, 4);
  const bride = guests.filter(g => g.side === 'Bride').length;
  const groom = guests.filter(g => g.side === 'Groom').length;
  const awaited = guests.filter(g => g.rsvp === 'Awaited').length;
  const declined = guests.filter(g => g.rsvp === 'No').length;
  const checkedIn = guests.filter(g => g.checkedIn).length;
  const pct = totalBudget ? Math.round(totalSpent / totalBudget * 100) : 0;
  const daysLeft = wedding?.date
    ? Math.ceil((new Date(wedding.date).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="page">
      {/* Hero Banner */}
      <div className="dash-hero">
        <img className="dash-hero-img" src={heroPng} alt="" />
        <div className="dash-hero-overlay" />
        <div className="dash-hero-body">
          <div>
            <div className="dash-hero-eyebrow">
              <i className="ti ti-heart" /> Wedding Management
            </div>
            <div className="dash-hero-title">
              {wedding?.name || 'Wedding'} Wedding
            </div>
            <div className="dash-hero-sub">
              <i className="ti ti-map-pin" style={{ opacity: .7 }} />
              {wedding?.venue}{wedding?.city ? ` · ${wedding.city}` : ''}
            </div>
          </div>
          <div className="dash-hero-row">
            <div className="dash-hero-badges">
              <span className="dash-badge dbg-gold">
                <i className="ti ti-calendar-event" /> {fmtDate(wedding?.date || '')}
              </span>
              <span className="dash-badge dbg-pink">
                🎀 {bride} Bride's guests
              </span>
              <span className="dash-badge dbg-teal">
                🤵 {groom} Groom's guests
              </span>
              {checkedIn > 0 && (
                <span className="dash-badge dbg-gold">
                  🏨 {checkedIn} hotel check-ins
                </span>
              )}
            </div>
            {daysLeft !== null && (
              <div className="dash-countdown">
                {daysLeft > 0 ? (
                  <>
                    <div className="dash-days">{daysLeft}</div>
                    <div className="dash-days-l">days to go</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 22, color: '#FFD875' }}>🎉</div>
                    <div className="dash-days-l" style={{ marginTop: 4 }}>Completed!</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metrics">
        <div className="mc mc-pink">
          <div className="mc-l"><i className="ti ti-confetti" style={{ color: 'var(--pink)' }} /> Ceremonies</div>
          <div className="mc-v">{cers.length}</div>
        </div>
        <div className="mc mc-teal">
          <div className="mc-l"><i className="ti ti-users" style={{ color: 'var(--teal)' }} /> Guests</div>
          <div className="mc-v">{guests.length}<br /><span className="pill pill-g">{confirmed} confirmed</span></div>
        </div>
        <div className="mc mc-amber">
          <div className="mc-l"><i className="ti ti-currency-rupee" style={{ color: 'var(--amber)' }} /> Budget Used</div>
          <div className="mc-v">₹{fmt(totalSpent)}<br /><span className="pill pill-a">{pct}%</span></div>
        </div>
        <div className="mc mc-purple">
          <div className="mc-l"><i className="ti ti-truck-delivery" style={{ color: 'var(--purple)' }} /> Vendors</div>
          <div className="mc-v">{vendors.length}<br /><span className="pill pill-r">{pendingVs.length} pending</span></div>
        </div>
        <div className="mc mc-coral">
          <div className="mc-l"><i className="ti ti-checkbox" style={{ color: 'var(--coral)' }} /> Tasks</div>
          <div className="mc-v">{done}/{tasks.length}<br /><span className="pill pill-p">{tasks.length - done} pending</span></div>
        </div>
      </div>

      {pendingVs.length > 0 && (
        <div className="notice">
          ⚠️ <strong>{pendingVs.length} vendor payment(s) pending:</strong> {pendingVs.map(v => v.name).join(', ')}
        </div>
      )}

      <div className="g32">
        {/* Ceremonies column */}
        <div className="card">
          <div className="card-hd">
            <div className="card-hd-l"><i className="ti ti-confetti" style={{ color: 'var(--pink)' }} /> Upcoming Ceremonies</div>
            <span style={{ fontSize: 11, color: 'var(--pink)', cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate('ceremonies')}>View all →</span>
          </div>
          {cers.length === 0
            ? <div style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>No ceremonies yet</div>
            : cers.slice(0, 5).map(c => (
              <div className="row" key={c.id}>
                <div className="row-ico" style={{ background: 'var(--pink-l)' }}>{getCeremonyIcon(c.name)}</div>
                <div style={{ flex: 1 }}>
                  <div className="row-name">{c.name}</div>
                  <div className="row-sub">{c.date} · {c.time} · {c.location}</div>
                </div>
                <span className={`status s-${c.status || 'up'}`}>{capStatus(c.status)}</span>
              </div>
            ))
          }
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Guest split */}
          <div className="card">
            <div className="card-hd"><div className="card-hd-l"><i className="ti ti-users" style={{ color: 'var(--purple)' }} /> Guest Overview</div></div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '10px 8px', borderRadius: 8, background: 'var(--pink-l)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pink)' }}>{bride}</div>
                <div style={{ fontSize: 10, color: 'var(--pink-d)' }}>🎀 Bride's Side</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '10px 8px', borderRadius: 8, background: 'var(--purple-l)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--purple)' }}>{groom}</div>
                <div style={{ fontSize: 10, color: 'var(--purple)' }}>🤵 Groom's Side</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {[{ n: confirmed, label: 'Confirmed', bg: 'var(--teal-l)', c: 'var(--teal)' },
                { n: awaited, label: 'Awaited', bg: 'var(--amber-l)', c: 'var(--amber)' },
                { n: declined, label: 'Declined', bg: 'var(--coral-l)', c: 'var(--coral)' }].map(x => (
                <div key={x.label} style={{ flex: 1, textAlign: 'center', padding: '6px 4px', borderRadius: 6, background: x.bg }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: x.c }}>{x.n}</div>
                  <div style={{ fontSize: 9, color: x.c, marginTop: 1 }}>{x.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="card">
            <div className="card-hd"><div className="card-hd-l"><i className="ti ti-currency-rupee" style={{ color: 'var(--amber)' }} /> Budget</div></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>₹{fmt(totalSpent)}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>of ₹{fmt(totalBudget)} budgeted</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)' }}>₹{fmt(totalBudget - totalSpent)}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>remaining</div>
              </div>
            </div>
            <div style={{ height: 9, borderRadius: 5, background: '#F0EBE2', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: 5, background: pct > 95 ? 'var(--coral)' : 'linear-gradient(90deg,var(--pink),var(--amber))' }} />
            </div>
            <div style={{ marginTop: 5, textAlign: 'right', fontSize: 10, color: 'var(--muted)' }}>{pct}% used</div>
          </div>

          {/* Pending tasks */}
          <div className="card">
            <div className="card-hd"><div className="card-hd-l"><i className="ti ti-checkbox" style={{ color: 'var(--coral)' }} /> Pending Tasks</div></div>
            {pendingTasks.length > 0
              ? pendingTasks.map(t => (
                <div className="ck" key={t.id}>
                  <div className="ck-box" onClick={() => t.id && onToggleTask(t.id)} />
                  <span className="ck-lbl">{t.label}</span>
                  <span className="ck-who">{t.who}</span>
                </div>
              ))
              : <div style={{ fontSize: 12, color: 'var(--teal)', textAlign: 'center', padding: '12px 0', fontWeight: 600 }}>All tasks done! 🎉</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
