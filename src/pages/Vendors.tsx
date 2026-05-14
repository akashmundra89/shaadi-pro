import { useEffect, useState } from 'react';
import { db } from '../db';
import { fmt, CAT_ICO, CAT_BG } from '../utils';
import { useToast } from '../context/ToastContext';
import { VendorModal } from '../components/Modals';
import type { Vendor } from '../types';

interface Props {
  weddingId: number | null;
  refreshKey: number;
  onRefresh: () => void;
}

const FILTERS = ['all', 'Venue', 'Catering', 'Photography', 'Décor', 'Music', 'Pandit', 'pending'];

export default function Vendors({ weddingId, refreshKey, onRefresh }: Props) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Vendor | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    if (!weddingId) { setVendors([]); return; }
    db.vendors.where('weddingId').equals(weddingId).toArray().then(setVendors);
  }, [weddingId, refreshKey]);

  function openAdd() { setEditItem(undefined); setShowModal(true); }
  function openEdit(v: Vendor) { setEditItem(v); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditItem(undefined); }

  async function deleteVendor(id: number) {
    if (!confirm('Remove this vendor?')) return;
    await db.vendors.delete(id);
    onRefresh();
    toast('Vendor removed');
  }

  const filtered = vendors
    .filter(v => filter === 'all' ? true : filter === 'pending' ? v.payStatus === 'pending' : v.category === filter)
    .filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.detail.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="page">
        <div className="fbar">
          {FILTERS.map(f => (
            <button key={f} className={`fb ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
              {f === 'pending' ? '⚠️ Pending' : f === 'all' ? 'All' : f}
            </button>
          ))}
          <div className="ml" style={{ display: 'flex', gap: 7 }}>
            <input className="inp" placeholder="Search..." style={{ width: 140 }} value={search} onChange={e => setSearch(e.target.value)} />
            <button className="btn btn-p btn-sm" onClick={openAdd}><i className="ti ti-plus" /> Add Vendor</button>
          </div>
        </div>

        {filtered.length === 0
          ? <div className="empty"><i className="ti ti-truck-delivery" />No vendors found.</div>
          : filtered.map(v => (
            <div className="row" key={v.id}>
              <div className="row-ico" style={{ background: CAT_BG[v.category] || 'var(--blue-l)' }}>{CAT_ICO[v.category] || '🏢'}</div>
              <div style={{ flex: 1 }}>
                <div className="row-name">{v.name}</div>
                <div className="row-sub">{v.detail} {v.phone ? `· ☎ ${v.phone}` : ''}</div>
                <div className="row-tags">
                  <span className="tag">{v.category}</span>
                  {v.city && <span className="tag" style={{ background: 'var(--blue-l)', color: 'var(--blue)' }}>{v.city}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>₹{fmt(v.amount || 0)}</div>
                <span className={v.payStatus === 'paid' ? 'tpaid' : v.payStatus === 'advance' ? 'tadv' : 'tpend'}>
                  {v.payStatus === 'paid' ? 'Fully paid' : v.payStatus === 'advance' ? 'Advance paid' : 'Pending ⚠️'}
                </span>
                <div style={{ marginTop: 4, display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button className="btn btn-sm" onClick={() => openEdit(v)} title="Edit">
                    <i className="ti ti-pencil" />
                  </button>
                  <button className="btn btn-sm" onClick={() => v.id && deleteVendor(v.id)} style={{ color: 'var(--coral)', borderColor: 'var(--coral-l)' }} title="Delete">
                    <i className="ti ti-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {showModal && (
        <VendorModal
          weddingId={weddingId}
          editItem={editItem}
          onClose={closeModal}
          onRefresh={() => { closeModal(); onRefresh(); }}
        />
      )}
    </>
  );
}
