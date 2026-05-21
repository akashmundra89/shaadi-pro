import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import * as api from '../lib/api';
import { CAT_ICO, CAT_BG, stars } from '../utils';
import { useToast } from '../context/ToastContext';
import { LibVendorModal } from '../components/Modals';
import type { VendorLib, Wedding } from '../types';

interface Props {
  refreshKey: number;
  onRefresh: () => void;
}

const CATEGORIES = ['all', 'Venue', 'Catering', 'Photography', 'Décor', 'Music', 'Pandit', 'Makeup', 'Transport'];

export default function VendorLibrary({ refreshKey, onRefresh }: Props) {
  const [vendors, setVendors] = useState<VendorLib[]>([]);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [cityFilter, setCityFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<VendorLib | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([api.getVendorLib(), api.getWeddings()])
      .then(([vs, ws]) => { setVendors(vs); setWeddings(ws); });
  }, [refreshKey]);

  function openAdd() { setEditItem(undefined); setShowModal(true); }
  function openEdit(v: VendorLib) { setEditItem(v); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditItem(undefined); }

  async function useVendorInWedding(libId: number, wId: number) {
    if (!wId) { toast('Select a wedding first'); return; }
    const v = vendors.find(x => x.id === libId);
    const w = weddings.find(x => x.id === wId);
    if (!v || !w) return;
    await api.addVendor({ weddingId: wId, name: v.name, category: v.category, city: v.city, amount: 0, payStatus: 'pending', phone: v.phone || '', detail: v.detail || '' });
    const used = v.usedIn || [];
    if (!used.includes(w.name)) await api.updateVendorLib(libId, { usedIn: [...used, w.name] });
    onRefresh();
    toast(`✓ ${v.name} added to ${w.name}`);
  }

  function downloadLibrary() {
    if (filtered.length === 0) { toast('No vendors to download'); return; }
    const rows = filtered.map(v => ({
      Name: v.name, Category: v.category, City: v.city,
      Phone: v.phone || '', Rating: v.rating, Details: v.detail || '',
      UsedIn: (v.usedIn || []).join(', '),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'VendorLibrary');
    XLSX.writeFile(wb, 'vendor_library.xlsx');
    toast('✓ Vendor library downloaded');
  }

  async function deleteLibVendor(id: number) {
    if (!confirm('Remove from library?')) return;
    await api.deleteVendorLib(id);
    onRefresh();
  }

  const cities = [...new Set(vendors.map(v => v.city).filter(Boolean))].sort();

  const filtered = vendors
    .filter(v => cityFilter === 'all' || v.city === cityFilter)
    .filter(v => catFilter === 'all' || v.category === catFilter)
    .filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()) || (v.city || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Vendor Library</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Master list of all vendors — reuse across multiple weddings, filtered by city/location</div>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <button className="btn btn-sm" onClick={downloadLibrary}><i className="ti ti-download" /> Download Excel</button>
            <button className="btn btn-p btn-sm" onClick={openAdd}><i className="ti ti-plus" /> Add to Library</button>
          </div>
        </div>

        <div className="fbar">
          <button className={`fb ${cityFilter === 'all' ? 'on' : ''}`} onClick={() => setCityFilter('all')}>All Cities</button>
          {cities.map(city => (
            <button key={city} className={`fb ${cityFilter === city ? 'on' : ''}`} onClick={() => setCityFilter(city)}>{city}</button>
          ))}
        </div>

        <div className="fbar">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`fb ${catFilter === cat ? 'on' : ''}`} onClick={() => setCatFilter(cat)}>
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
          <div className="ml">
            <input className="inp" placeholder="Search library..." style={{ width: 160 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0
          ? <div className="empty"><i className="ti ti-building-store" />No vendors in library for this filter.</div>
          : filtered.map(v => (
            <div className="vlib-card" key={v.id}>
              <div className="vlib-ico" style={{ background: CAT_BG[v.category] || 'var(--blue-l)' }}>{CAT_ICO[v.category] || '🏢'}</div>
              <div className="vlib-info">
                <div className="vlib-name">{v.name}</div>
                <div className="vlib-sub">{v.detail} {v.phone ? `· ☎ ${v.phone}` : ''}</div>
                <div style={{ marginTop: 3, display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="vlib-loc">{v.city || '—'}</span>
                  <span className="tag">{v.category}</span>
                  <span style={{ fontSize: 10, color: 'var(--amber)' }}>{stars(v.rating)}</span>
                </div>
                {v.usedIn?.length > 0 && <div className="vlib-weddings">Used in: {v.usedIn.join(', ')}</div>}
              </div>
              <div className="vlib-actions">
                <UseInWeddingDropdown libId={v.id!} weddings={weddings} onUse={useVendorInWedding} />
                <button className="btn btn-sm" onClick={() => openEdit(v)} title="Edit">
                  <i className="ti ti-pencil" />
                </button>
                <button className="btn btn-sm" onClick={() => v.id && deleteLibVendor(v.id)} style={{ color: 'var(--coral)', borderColor: 'var(--coral-l)' }} title="Delete">
                  <i className="ti ti-trash" />
                </button>
              </div>
            </div>
          ))
        }
      </div>

      {showModal && (
        <LibVendorModal
          editItem={editItem}
          onClose={closeModal}
          onRefresh={() => { closeModal(); onRefresh(); }}
        />
      )}
    </>
  );
}

function UseInWeddingDropdown({ libId, weddings, onUse }: { libId: number; weddings: Wedding[]; onUse: (libId: number, wId: number) => void }) {
  const [selectedId, setSelectedId] = useState(0);
  return (
    <div>
      <select className="sel" style={{ fontSize: 11, padding: '4px 6px', marginBottom: 4, display: 'block', width: '100%' }} value={selectedId} onChange={e => setSelectedId(parseInt(e.target.value))}>
        <option value={0}>Add to wedding...</option>
        {weddings.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>
      <button className="btn btn-t btn-sm" onClick={() => selectedId && onUse(libId, selectedId)} style={{ width: '100%' }}>
        <i className="ti ti-plus" /> Use in Wedding
      </button>
    </div>
  );
}
