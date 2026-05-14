import { useEffect, useState } from 'react';
import { db } from '../db';
import { fmt, capStatus, getCeremonyIcon } from '../utils';
import type { Ceremony, Vendor, Guest, BudgetCategory, Task, Page } from '../types';

interface Props {
  weddingId: number | null;
  onNavigate: (page: Page) => void;
  onToggleTask: (id: number) => void;
  refreshKey: number;
}

interface DashData {
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
      db.ceremonies.where('weddingId').equals(weddingId).toArray(),
      db.vendors.where('weddingId').equals(weddingId).toArray(),
      db.guests.where('weddingId').equals(weddingId).toArray(),
      db.budget.where('weddingId').equals(weddingId).toArray(),
      db.tasks.where('weddingId').equals(weddingId).toArray(),
    ]).then(([cers, vendors, guests, budget, tasks]) => setData({ cers, vendors, guests, budget, tasks }));
  }, [weddingId, refreshKey]);

  if (!weddingId || !data) {
    return (
      <div className="page">
        <div className="empty"><i className="ti ti-home" />Select or create a wedding to get started</div>
      </div>
    );
  }

  const { cers, vendors, guests, budget, tasks } = data;
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
  const pct = totalBudget ? Math.round(totalSpent / totalBudget * 100) : 0;

  return (
    <div className="page">
      <div className="metrics">
        <div className="mc">
          <div className="mc-l"><i className="ti ti-confetti" style={{ color: 'var(--pink)' }} /> Ceremonies</div>
          <div className="mc-v">{cers.length}</div>
        </div>
        <div className="mc">
          <div className="mc-l"><i className="ti ti-users" style={{ color: 'var(--teal)' }} /> Guests</div>
          <div className="mc-v">{guests.length}<br /><span className="pill pill-g">{confirmed} confirmed</span></div>
        </div>
        <div className="mc">
          <div className="mc-l"><i className="ti ti-currency-rupee" style={{ color: 'var(--amber)' }} /> Budget Used</div>
          <div className="mc-v">₹{fmt(totalSpent)}<br /><span className="pill pill-a">{pct}%</span></div>
        </div>
        <div className="mc">
          <div className="mc-l"><i className="ti ti-truck-delivery" style={{ color: 'var(--purple)' }} /> Vendors</div>
          <div className="mc-v">{vendors.length}<br /><span className="pill pill-r">{pendingVs.length} pending</span></div>
        </div>
        <div className="mc">
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
        <div className="card">
          <div className="card-hd">
            <div className="card-hd-l"><i className="ti ti-confetti" style={{ color: 'var(--pink)' }} /> Upcoming Ceremonies</div>
            <span style={{ fontSize: 11, color: 'var(--pink)', cursor: 'pointer' }} onClick={() => onNavigate('ceremonies')}>View all →</span>
          </div>
          {cers.slice(0, 5).map(c => (
            <div className="row" key={c.id}>
              <div className="row-ico" style={{ background: 'var(--pink-l)' }}>{getCeremonyIcon(c.name)}</div>
              <div style={{ flex: 1 }}>
                <div className="row-name">{c.name}</div>
                <div className="row-sub">{c.date} · {c.time} · {c.location}</div>
              </div>
              <span className={`status s-${c.status || 'up'}`}>{capStatus(c.status)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div className="card-hd"><div className="card-hd-l"><i className="ti ti-users" style={{ color: 'var(--purple)' }} /> Guest Split</div></div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: 8, borderRadius: 7, background: 'var(--pink-l)' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--pink)' }}>{bride}</div>
                <div style={{ fontSize: 10, color: 'var(--pink-d)' }}>🎀 Bride</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: 8, borderRadius: 7, background: 'var(--purple-l)' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--purple)' }}>{groom}</div>
                <div style={{ fontSize: 10, color: 'var(--purple)' }}>👔 Groom</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {[{ n: confirmed, label: 'Confirmed', bg: 'var(--teal-l)', c: 'var(--teal)' },
                { n: awaited, label: 'Awaited', bg: 'var(--amber-l)', c: 'var(--amber)' },
                { n: declined, label: 'Declined', bg: 'var(--coral-l)', c: 'var(--coral)' }].map(x => (
                <div key={x.label} style={{ flex: 1, textAlign: 'center', padding: 5, borderRadius: 5, background: x.bg }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: x.c }}>{x.n}</div>
                  <div style={{ fontSize: 9, color: x.c }}>{x.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-hd"><div className="card-hd-l"><i className="ti ti-currency-rupee" style={{ color: 'var(--amber)' }} /> Budget</div></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div><div style={{ fontSize: 18, fontWeight: 700 }}>₹{fmt(totalSpent)}</div><div style={{ fontSize: 10, color: 'var(--muted)' }}>of ₹{fmt(totalBudget)}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)' }}>₹{fmt(totalBudget - totalSpent)} left</div></div>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: '#f0ede6', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,var(--pink),var(--amber))' }} />
            </div>
          </div>

          <div className="card">
            <div className="card-hd"><div className="card-hd-l"><i className="ti ti-checkbox" style={{ color: 'var(--coral)' }} /> Pending Tasks</div></div>
            {pendingTasks.map(t => (
              <div className="ck" key={t.id}>
                <div className="ck-box" onClick={() => t.id && onToggleTask(t.id)} />
                <span className="ck-lbl">{t.label}</span>
                <span className="ck-who">{t.who}</span>
              </div>
            ))}
            {!pendingTasks.length && <div style={{ fontSize: 12, color: 'var(--teal)', textAlign: 'center', padding: 8 }}>All tasks done! 🎉</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
