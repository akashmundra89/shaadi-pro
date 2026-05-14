import { useEffect, useState } from 'react';
import { db } from '../db';
import { capStatus, getCeremonyIcon } from '../utils';
import { useToast } from '../context/ToastContext';
import type { Ceremony } from '../types';

const ICO_BG: Record<string, string> = {
  active: 'var(--pink-l)', upcoming: 'var(--amber-l)', soon: 'var(--teal-l)', done: 'var(--teal-l)',
};

interface Props {
  weddingId: number | null;
  onAddCeremony: () => void;
  refreshKey: number;
  onRefresh: () => void;
}

export default function Ceremonies({ weddingId, onAddCeremony, refreshKey, onRefresh }: Props) {
  const [cers, setCers] = useState<Ceremony[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!weddingId) { setCers([]); return; }
    db.ceremonies.where('weddingId').equals(weddingId).toArray().then(setCers);
  }, [weddingId, refreshKey]);

  async function deleteCer(id: number) {
    if (!confirm('Delete this ceremony?')) return;
    await db.ceremonies.delete(id);
    onRefresh();
    toast('Ceremony deleted');
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Ceremonies</div>
        <button className="btn btn-p btn-sm" onClick={onAddCeremony}><i className="ti ti-plus" /> Add Ceremony</button>
      </div>

      {cers.length === 0
        ? <div className="empty"><i className="ti ti-confetti" />No ceremonies yet. Add your first ceremony!</div>
        : cers.map(c => (
          <div className="row" key={c.id}>
            <div className="row-ico" style={{ background: ICO_BG[c.status] || 'var(--purple-l)' }}>{getCeremonyIcon(c.name)}</div>
            <div style={{ flex: 1 }}>
              <div className="row-name">{c.name}</div>
              <div className="row-sub">{c.date} · {c.time} · {c.location}</div>
              <div className="row-tags">
                <span className="tag" style={{ background: 'var(--pink-l)', color: 'var(--pink)' }}>{c.side || 'Both sides'}</span>
                <span className="tag">~{c.guests || 0} guests</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`status s-${c.status || 'up'}`}>{capStatus(c.status)}</span>
              <div style={{ marginTop: 5, display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button className="btn btn-sm" onClick={() => c.id && deleteCer(c.id)} style={{ color: 'var(--coral)', borderColor: 'var(--coral-l)' }}>
                  <i className="ti ti-trash" />
                </button>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}
