import { useEffect, useState } from 'react';
import { db } from '../db';
import { capStatus, getCeremonyIcon } from '../utils';
import { useToast } from '../context/ToastContext';
import { CeremonyModal, NotifyGuestsModal } from '../components/Modals';
import type { Ceremony, Guest } from '../types';

const ICO_BG: Record<string, string> = {
  active: 'var(--pink-l)', upcoming: 'var(--amber-l)', soon: 'var(--teal-l)', done: 'var(--teal-l)',
};

interface Props {
  weddingId: number | null;
  refreshKey: number;
  onRefresh: () => void;
}

export default function Ceremonies({ weddingId, refreshKey, onRefresh }: Props) {
  const [cers, setCers] = useState<Ceremony[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Ceremony | undefined>();
  const [notifyCeremony, setNotifyCeremony] = useState<Ceremony | null>(null);
  const [checkedInGuests, setCheckedInGuests] = useState<Guest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!weddingId) { setCers([]); return; }
    db.ceremonies.where('weddingId').equals(weddingId).toArray().then(setCers);
  }, [weddingId, refreshKey]);

  function openAdd() { setEditItem(undefined); setShowModal(true); }
  function openEdit(c: Ceremony) { setEditItem(c); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditItem(undefined); }

  async function deleteCer(id: number) {
    if (!confirm('Delete this ceremony?')) return;
    await db.ceremonies.delete(id);
    onRefresh();
    toast('Ceremony deleted');
  }

  async function openNotify(c: Ceremony) {
    if (!weddingId) return;
    const guests = await db.guests.where('weddingId').equals(weddingId).toArray();
    const inHotel = guests.filter(g => g.checkedIn);
    setCheckedInGuests(inHotel);
    setNotifyCeremony(c);
  }

  return (
    <>
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Ceremonies</div>
          <button className="btn btn-p btn-sm" onClick={openAdd}><i className="ti ti-plus" /> Add Ceremony</button>
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
                <div style={{ marginTop: 5, display: 'flex', gap: 4, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button className="btn btn-sm" onClick={() => openNotify(c)} title="Notify hotel guests" style={{ color: 'var(--teal)', borderColor: 'var(--teal-l)', fontSize: 11 }}>
                    <i className="ti ti-brand-whatsapp" /> Notify Hotel
                  </button>
                  <button className="btn btn-sm" onClick={() => openEdit(c)} title="Edit">
                    <i className="ti ti-pencil" />
                  </button>
                  <button className="btn btn-sm" onClick={() => c.id && deleteCer(c.id)} style={{ color: 'var(--coral)', borderColor: 'var(--coral-l)' }} title="Delete">
                    <i className="ti ti-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {showModal && (
        <CeremonyModal
          weddingId={weddingId}
          editItem={editItem}
          onClose={closeModal}
          onRefresh={() => { closeModal(); onRefresh(); }}
        />
      )}

      {notifyCeremony && (
        <NotifyGuestsModal
          ceremony={notifyCeremony}
          checkedInGuests={checkedInGuests}
          onClose={() => setNotifyCeremony(null)}
        />
      )}
    </>
  );
}
