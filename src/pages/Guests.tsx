import { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../db';
import { useToast } from '../context/ToastContext';
import { GuestModal, CheckInModal } from '../components/Modals';
import type { Guest } from '../types';

interface Props {
  weddingId: number | null;
  refreshKey: number;
  onRefresh: () => void;
}

export default function Guests({ weddingId, refreshKey, onRefresh }: Props) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Guest | undefined>();
  const [checkInGuest, setCheckInGuest] = useState<Guest | null>(null);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!weddingId) { setGuests([]); return; }
    db.guests.where('weddingId').equals(weddingId).toArray().then(setGuests);
  }, [weddingId, refreshKey]);

  function openAdd() { setEditItem(undefined); setShowModal(true); }
  function openEdit(g: Guest) { setEditItem(g); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditItem(undefined); }

  async function deleteGuest(id: number) {
    if (!confirm('Remove this guest?')) return;
    await db.guests.delete(id);
    onRefresh();
  }

  async function importGuests(e: React.ChangeEvent<HTMLInputElement>) {
    if (!weddingId) { toast('Select a wedding first'); return; }
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const wb = XLSX.read(ev.target?.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws) as Record<string, string>[];
      const newGuests = rows.map(r => ({
        weddingId: weddingId!,
        name: r.Name || r.name || '',
        side: (r.Side || r.side || 'Both') as Guest['side'],
        relation: r.Relation || r.relation || '',
        ceremonies: r.Ceremonies || r.ceremonies || 'All',
        rsvp: (r.RSVP || r.rsvp || 'Awaited') as Guest['rsvp'],
        transport: r.Transport || r.transport || '—',
        food: r.FoodPref || r.food || r.Food || 'Veg',
        phone: r.Phone || r.phone || '',
      })).filter(g => g.name);
      await db.guests.bulkAdd(newGuests);
      onRefresh();
      toast(`✓ Imported ${newGuests.length} guests`);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }

  async function exportGuests() {
    if (!weddingId) { toast('Select a wedding first'); return; }
    const gs = await db.guests.where('weddingId').equals(weddingId).toArray();
    const rows = gs.map(g => ({
      Name: g.name, Phone: g.phone || '', Side: g.side, Relation: g.relation,
      Ceremonies: g.ceremonies, RSVP: g.rsvp, Transport: g.transport, FoodPref: g.food,
      HotelRoom: g.roomNumber || '', CheckedIn: g.checkedIn ? 'Yes' : 'No',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Guests');
    const w = await db.weddings.get(weddingId);
    XLSX.writeFile(wb, `${(w || { name: 'Wedding' }).name}_guests.xlsx`);
    toast('✓ Guest list downloaded');
  }

  const filtered = guests.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) || (g.relation || '').toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.length;
  const conf = filtered.filter(g => g.rsvp === 'Yes').length;
  const await_ = filtered.filter(g => g.rsvp === 'Awaited').length;
  const dec = filtered.filter(g => g.rsvp === 'No').length;
  const bride = filtered.filter(g => g.side === 'Bride').length;
  const groom = filtered.filter(g => g.side === 'Groom').length;
  const checkedIn = guests.filter(g => g.checkedIn).length;

  return (
    <>
      <div className="page">
        <div className="gstat">
          {[
            { n: total, label: 'Total', bg: '#f5f3ef', c: 'var(--text)' },
            { n: conf, label: 'Confirmed', bg: 'var(--teal-l)', c: 'var(--teal)' },
            { n: await_, label: 'Awaited', bg: 'var(--amber-l)', c: 'var(--amber)' },
            { n: dec, label: 'Declined', bg: 'var(--coral-l)', c: 'var(--coral)' },
            { n: checkedIn, label: 'Hotel In', bg: 'var(--purple-l)', c: 'var(--purple)' },
          ].map(x => (
            <div key={x.label} className="gst" style={{ background: x.bg }}>
              <div className="gst-n" style={{ color: x.c }}>{x.n}</div>
              <div className="gst-l">{x.label}</div>
            </div>
          ))}
        </div>

        <div className="g2" style={{ marginBottom: 12 }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-hd" style={{ color: 'var(--pink)' }}><div className="card-hd-l">🎀 Bride's Side — {bride} guests</div></div>
            <div style={{ height: 5, borderRadius: 3, background: '#f0ede6', overflow: 'hidden' }}>
              <div style={{ width: `${total ? Math.round(bride / total * 100) : 0}%`, height: '100%', background: 'var(--pink)', borderRadius: 3 }} />
            </div>
          </div>
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-hd" style={{ color: 'var(--purple)' }}><div className="card-hd-l">👔 Groom's Side — {groom} guests</div></div>
            <div style={{ height: 5, borderRadius: 3, background: '#f0ede6', overflow: 'hidden' }}>
              <div style={{ width: `${total ? Math.round(groom / total * 100) : 0}%`, height: '100%', background: 'var(--purple)', borderRadius: 3 }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <div className="card-hd-l"><i className="ti ti-users" /> Guest List</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              <input className="inp" placeholder="Search guest..." style={{ width: 140 }} value={search} onChange={e => setSearch(e.target.value)} />
              <label className="btn btn-t btn-sm" style={{ cursor: 'pointer' }}>
                <i className="ti ti-upload" /> Upload Excel
                <input type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} ref={fileRef} onChange={importGuests} />
              </label>
              <button className="btn btn-sm" onClick={exportGuests}><i className="ti ti-download" /> Download Excel</button>
              <button className="btn btn-p btn-sm" onClick={openAdd}><i className="ti ti-plus" /> Add Guest</button>
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8 }}>Upload Excel columns: Name, Phone, Side (Bride/Groom/Both), Relation, Ceremonies, RSVP (Yes/No/Awaited), Transport, FoodPref</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr><th>Name</th><th>Phone</th><th>Side</th><th>Relation</th><th>Ceremonies</th><th>RSVP</th><th>Food</th><th>Hotel</th><th /></tr>
              </thead>
              <tbody>
                {filtered.map(g => (
                  <tr key={g.id}>
                    <td><strong>{g.name}</strong></td>
                    <td style={{ fontSize: 11 }}>{g.phone || '—'}</td>
                    <td><span className={`side-${g.side === 'Bride' ? 'b' : g.side === 'Groom' ? 'g' : 'bo'}`}>{g.side || '—'}</span></td>
                    <td>{g.relation || '—'}</td>
                    <td style={{ fontSize: 11 }}>{g.ceremonies || '—'}</td>
                    <td className={`rsvp-${g.rsvp === 'Yes' ? 'y' : g.rsvp === 'No' ? 'n' : 'w'}`}>
                      {g.rsvp === 'Yes' ? '✓ Yes' : g.rsvp === 'No' ? '✗ No' : '⏳ Awaited'}
                    </td>
                    <td>{g.food || '—'}</td>
                    <td>
                      {g.checkedIn ? (
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--teal-l)', color: 'var(--teal)', border: 'none', fontSize: 11, padding: '3px 6px', whiteSpace: 'nowrap' }}
                          onClick={() => setCheckInGuest(g)}
                          title="Update room"
                        >
                          🏨 {g.roomNumber}
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm"
                          style={{ fontSize: 11, padding: '3px 6px', whiteSpace: 'nowrap' }}
                          onClick={() => setCheckInGuest(g)}
                          title="Check in"
                        >
                          <i className="ti ti-login" /> Check In
                        </button>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm" onClick={() => openEdit(g)} title="Edit" style={{ padding: '3px 5px' }}>
                          <i className="ti ti-pencil" />
                        </button>
                        <button className="btn btn-sm" onClick={() => g.id && deleteGuest(g.id)} style={{ color: 'var(--coral)', border: 'none', padding: '3px 5px' }} title="Delete">
                          <i className="ti ti-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <GuestModal
          weddingId={weddingId}
          editItem={editItem}
          onClose={closeModal}
          onRefresh={() => { closeModal(); onRefresh(); }}
        />
      )}

      {checkInGuest && (
        <CheckInModal
          guest={checkInGuest}
          onClose={() => setCheckInGuest(null)}
          onRefresh={() => { setCheckInGuest(null); onRefresh(); }}
        />
      )}
    </>
  );
}
