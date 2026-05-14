import { useEffect, useState } from 'react';
import { db } from '../db';
import { fmt } from '../utils';
import { useToast } from '../context/ToastContext';
import { BudgetModal } from '../components/Modals';
import type { BudgetCategory } from '../types';

interface Props {
  weddingId: number | null;
  refreshKey: number;
  onRefresh: () => void;
}

const COLORS = ['var(--pink)', 'var(--amber)', 'var(--purple)', 'var(--teal)', 'var(--coral)', 'var(--blue)'];

export default function Budget({ weddingId, refreshKey, onRefresh }: Props) {
  const [budget, setBudget] = useState<BudgetCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<BudgetCategory | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    if (!weddingId) { setBudget([]); return; }
    db.budget.where('weddingId').equals(weddingId).toArray().then(setBudget);
  }, [weddingId, refreshKey]);

  function openAdd() { setEditItem(undefined); setShowModal(true); }
  function openEdit(b: BudgetCategory) { setEditItem(b); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditItem(undefined); }

  async function deleteBudget(id: number) {
    if (!confirm('Delete this budget category?')) return;
    await db.budget.delete(id);
    onRefresh();
    toast('Category removed');
  }

  const spent = budget.reduce((a, b) => a + b.spent, 0);
  const total = budget.reduce((a, b) => a + b.total, 0);
  const pct = total ? Math.round(spent / total * 100) : 0;

  return (
    <>
      <div className="page">
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
            <div><div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Total Spent</div><div style={{ fontSize: 26, fontWeight: 700 }}>₹{fmt(spent)}</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Budget</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--muted)' }}>₹{fmt(total)}</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Remaining</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--teal)' }}>₹{fmt(total - spent)}</div></div>
          </div>
          <div style={{ height: 9, borderRadius: 5, background: '#f0ede6', overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 5, background: 'linear-gradient(90deg,var(--pink),var(--amber))' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{pct}% utilized</div>
        </div>

        <div className="card">
          <div className="card-hd">
            <div className="card-hd-l"><i className="ti ti-chart-bar" /> Category Breakdown</div>
            <button className="btn btn-p btn-sm" onClick={openAdd}><i className="ti ti-plus" /> Add Category</button>
          </div>
          {budget.map((b, i) => {
            const bPct = b.total ? Math.round(b.spent / b.total * 100) : 0;
            const over = b.spent > b.total && b.total > 0;
            return (
              <div className="bbar" key={b.id}>
                <div className="bbar-top">
                  <span className="bbar-l">{b.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="bbar-v">
                      ₹{fmt(b.spent)} / ₹{fmt(b.total)}{' '}
                      <span style={{ color: over ? 'var(--coral)' : 'var(--amber)', fontWeight: 400, fontSize: 10 }}>
                        {bPct}%{over ? ' ⚠️' : ''}
                      </span>
                    </span>
                    <button className="btn btn-sm" onClick={() => openEdit(b)} title="Edit" style={{ padding: '2px 5px' }}>
                      <i className="ti ti-pencil" style={{ fontSize: 12 }} />
                    </button>
                    <button className="btn btn-sm" onClick={() => b.id && deleteBudget(b.id)} style={{ color: 'var(--coral)', border: 'none', padding: '2px 4px' }} title="Delete">
                      <i className="ti ti-trash" style={{ fontSize: 12 }} />
                    </button>
                  </div>
                </div>
                <div className="bbar-bg">
                  <div className="bbar-f" style={{ width: `${Math.min(bPct, 100)}%`, background: over ? 'var(--coral)' : COLORS[i % COLORS.length] }} />
                </div>
              </div>
            );
          })}
          {budget.length === 0 && <div className="empty"><i className="ti ti-chart-pie" />No budget categories yet.</div>}
        </div>
      </div>

      {showModal && (
        <BudgetModal
          weddingId={weddingId}
          editItem={editItem}
          onClose={closeModal}
          onRefresh={() => { closeModal(); onRefresh(); }}
        />
      )}
    </>
  );
}
