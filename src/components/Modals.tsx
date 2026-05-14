import { useRef } from 'react';
import { db } from '../db';
import { useToast } from '../context/ToastContext';
import type { Wedding } from '../types';

interface BaseModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

function ModalShell({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-hd">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-ft">{footer}</div>
      </div>
    </div>
  );
}

export function AddWeddingModal({ onClose, onRefresh, onSelect }: BaseModalProps & { onSelect: (id: number) => void }) {
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const venueRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);

  async function save() {
    const name = nameRef.current?.value.trim() || '';
    if (!name) { toast('Enter wedding name'); return; }
    const id = await db.weddings.add({
      name,
      date: dateRef.current?.value || '',
      venue: venueRef.current?.value.trim() || '',
      city: cityRef.current?.value.trim() || '',
    });
    onClose();
    onRefresh();
    onSelect(id as number);
    toast('✓ Wedding created: ' + name);
  }

  return (
    <ModalShell title="New Wedding" onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-p" onClick={save}><i className="ti ti-check" /> Create Wedding</button>
    </>}>
      <div className="form-grid">
        <div className="form-row"><label>Wedding Name (e.g. Sharma × Patel)</label><input className="inp" ref={nameRef} placeholder="Bride × Groom" /></div>
        <div className="form-row"><label>Wedding Date</label><input className="inp" type="date" ref={dateRef} /></div>
        <div className="form-row"><label>Venue</label><input className="inp" ref={venueRef} placeholder="e.g. Taj Hotel" /></div>
        <div className="form-row"><label>City</label><input className="inp" ref={cityRef} placeholder="e.g. Jaipur" /></div>
      </div>
    </ModalShell>
  );
}

export function AddCeremonyModal({ onClose, onRefresh, weddingId }: BaseModalProps & { weddingId: number | null }) {
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const locRef = useRef<HTMLInputElement>(null);
  const guestsRef = useRef<HTMLInputElement>(null);
  const sideRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  async function save() {
    if (!weddingId) { toast('Select a wedding first'); return; }
    const name = nameRef.current?.value.trim() || '';
    if (!name) { toast('Enter ceremony name'); return; }
    await db.ceremonies.add({
      weddingId, name,
      date: dateRef.current?.value || '',
      time: timeRef.current?.value || '',
      location: locRef.current?.value || '',
      guests: parseInt(guestsRef.current?.value || '0') || 0,
      side: sideRef.current?.value || 'Both sides',
      status: (statusRef.current?.value as 'upcoming') || 'upcoming',
    });
    onClose(); onRefresh();
    toast('✓ Ceremony added');
  }

  return (
    <ModalShell title="Add Ceremony" onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-p" onClick={save}><i className="ti ti-check" /> Add Ceremony</button>
    </>}>
      <div className="form-grid">
        <div className="form-row"><label>Ceremony Name</label><input className="inp" ref={nameRef} placeholder="e.g. Sangeet Night" /></div>
        <div className="form-row"><label>Date</label><input className="inp" ref={dateRef} placeholder="e.g. 14 Feb" /></div>
        <div className="form-row"><label>Time</label><input className="inp" ref={timeRef} placeholder="e.g. 7:00 PM" /></div>
        <div className="form-row"><label>Location</label><input className="inp" ref={locRef} placeholder="Venue name or address" /></div>
        <div className="form-row"><label>Expected Guests</label><input className="inp" type="number" ref={guestsRef} placeholder="e.g. 200" /></div>
        <div className="form-row"><label>Side</label>
          <select className="sel" ref={sideRef}><option>Both sides</option><option>Bride's side</option><option>Groom's side</option></select>
        </div>
      </div>
      <div className="form-row"><label>Status</label>
        <select className="sel" ref={statusRef}><option value="upcoming">Upcoming</option><option value="active">Active</option><option value="done">Done</option></select>
      </div>
    </ModalShell>
  );
}

export function AddVendorModal({ onClose, onRefresh, weddingId }: BaseModalProps & { weddingId: number | null }) {
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);
  const catRef = useRef<HTMLSelectElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const payRef = useRef<HTMLSelectElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);
  const libRef = useRef<HTMLInputElement>(null);

  async function save() {
    if (!weddingId) { toast('Select a wedding first'); return; }
    const name = nameRef.current?.value.trim() || '';
    if (!name) { toast('Enter vendor name'); return; }
    const cat = catRef.current?.value || 'Other';
    const city = cityRef.current?.value.trim() || '';
    const detail = detailRef.current?.value.trim() || '';
    const phone = phoneRef.current?.value.trim() || '';
    await db.vendors.add({
      weddingId, name, category: cat, city, phone,
      amount: parseInt(amountRef.current?.value || '0') || 0,
      payStatus: (payRef.current?.value as 'pending') || 'pending',
      detail,
    });
    if (libRef.current?.checked) {
      await db.vendorLib.add({ name, category: cat, city, phone, detail, rating: 4, usedIn: [] });
    }
    onClose(); onRefresh();
    toast('✓ Vendor added');
  }

  return (
    <ModalShell title="Add Vendor to Wedding" onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-p" onClick={save}><i className="ti ti-check" /> Add Vendor</button>
    </>}>
      <div className="form-grid">
        <div className="form-row"><label>Vendor Name</label><input className="inp" ref={nameRef} placeholder="e.g. Kapoor Clicks" /></div>
        <div className="form-row"><label>Category</label>
          <select className="sel" ref={catRef}><option>Venue</option><option>Catering</option><option>Photography</option><option>Décor</option><option>Music</option><option>Pandit</option><option>Makeup</option><option>Transport</option><option>Mehendi</option><option>Gifts</option><option>Other</option></select>
        </div>
        <div className="form-row"><label>City</label><input className="inp" ref={cityRef} placeholder="e.g. Jaipur" /></div>
        <div className="form-row"><label>Phone</label><input className="inp" ref={phoneRef} placeholder="10-digit number" /></div>
        <div className="form-row"><label>Amount (₹)</label><input className="inp" type="number" ref={amountRef} placeholder="e.g. 250000" /></div>
        <div className="form-row"><label>Payment Status</label>
          <select className="sel" ref={payRef}><option value="pending">Pending</option><option value="advance">Advance Paid</option><option value="paid">Fully Paid</option></select>
        </div>
      </div>
      <div className="form-row"><label>Details / Notes</label><input className="inp" ref={detailRef} placeholder="e.g. 350 pax · Veg+Jain menu" style={{ width: '100%' }} /></div>
      <div className="form-row" style={{ marginBottom: 0 }}><label><input type="checkbox" ref={libRef} /> Also add to Vendor Library</label></div>
    </ModalShell>
  );
}

export function AddGuestModal({ onClose, onRefresh, weddingId }: BaseModalProps & { weddingId: number | null }) {
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);
  const sideRef = useRef<HTMLSelectElement>(null);
  const relRef = useRef<HTMLInputElement>(null);
  const foodRef = useRef<HTMLSelectElement>(null);
  const rsvpRef = useRef<HTMLSelectElement>(null);
  const transportRef = useRef<HTMLInputElement>(null);
  const cerRef = useRef<HTMLInputElement>(null);

  async function save() {
    if (!weddingId) { toast('Select a wedding first'); return; }
    const name = nameRef.current?.value.trim() || '';
    if (!name) { toast('Enter guest name'); return; }
    await db.guests.add({
      weddingId, name,
      side: (sideRef.current?.value as 'Bride') || 'Bride',
      relation: relRef.current?.value.trim() || '',
      ceremonies: cerRef.current?.value.trim() || 'All',
      rsvp: (rsvpRef.current?.value as 'Awaited') || 'Awaited',
      transport: transportRef.current?.value.trim() || '—',
      food: foodRef.current?.value || 'Veg',
    });
    onClose(); onRefresh();
    toast('✓ Guest added');
  }

  return (
    <ModalShell title="Add Guest" onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-p" onClick={save}><i className="ti ti-check" /> Add Guest</button>
    </>}>
      <div className="form-grid">
        <div className="form-row"><label>Full Name</label><input className="inp" ref={nameRef} placeholder="e.g. Rajesh Sharma" /></div>
        <div className="form-row"><label>Side</label>
          <select className="sel" ref={sideRef}><option>Bride</option><option>Groom</option><option>Both</option></select>
        </div>
        <div className="form-row"><label>Relation</label><input className="inp" ref={relRef} placeholder="e.g. Mama ji, Best friend" /></div>
        <div className="form-row"><label>Food Preference</label>
          <select className="sel" ref={foodRef}><option>Veg</option><option>Jain</option><option>Non-Veg</option></select>
        </div>
        <div className="form-row"><label>RSVP</label>
          <select className="sel" ref={rsvpRef}><option>Awaited</option><option>Yes</option><option>No</option></select>
        </div>
        <div className="form-row"><label>Transport</label><input className="inp" ref={transportRef} placeholder="e.g. Self, Coach A" /></div>
      </div>
      <div className="form-row"><label>Ceremonies Attending</label><input className="inp" ref={cerRef} placeholder="e.g. All, Mehendi, Sangeet, Pheras" style={{ width: '100%' }} /></div>
    </ModalShell>
  );
}

export function AddBudgetModal({ onClose, onRefresh, weddingId }: BaseModalProps & { weddingId: number | null }) {
  const { toast } = useToast();
  const catRef = useRef<HTMLInputElement>(null);
  const spentRef = useRef<HTMLInputElement>(null);
  const totalRef = useRef<HTMLInputElement>(null);

  async function save() {
    if (!weddingId) { toast('Select a wedding first'); return; }
    const category = catRef.current?.value.trim() || '';
    if (!category) { toast('Enter category name'); return; }
    await db.budget.add({
      weddingId, category,
      spent: parseInt(spentRef.current?.value || '0') || 0,
      total: parseInt(totalRef.current?.value || '0') || 0,
    });
    onClose(); onRefresh();
    toast('✓ Budget category added');
  }

  return (
    <ModalShell title="Add Budget Category" onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-p" onClick={save}><i className="ti ti-check" /> Add Category</button>
    </>}>
      <div className="form-row"><label>Category Name (use emoji if you like)</label><input className="inp" ref={catRef} placeholder="e.g. 🎆 Fireworks" style={{ width: '100%' }} /></div>
      <div className="form-grid">
        <div className="form-row"><label>Amount Spent (₹)</label><input className="inp" type="number" ref={spentRef} placeholder="0" /></div>
        <div className="form-row"><label>Total Budget (₹)</label><input className="inp" type="number" ref={totalRef} placeholder="0" /></div>
      </div>
    </ModalShell>
  );
}

export function AddLibVendorModal({ onClose, onRefresh }: BaseModalProps) {
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);
  const catRef = useRef<HTMLSelectElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const ratingRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);

  async function save() {
    const name = nameRef.current?.value.trim() || '';
    if (!name) { toast('Enter vendor name'); return; }
    await db.vendorLib.add({
      name,
      category: catRef.current?.value || 'Venue',
      city: cityRef.current?.value.trim() || '',
      phone: phoneRef.current?.value.trim() || '',
      detail: detailRef.current?.value.trim() || '',
      rating: parseInt(ratingRef.current?.value || '4') || 4,
      usedIn: [],
    });
    onClose(); onRefresh();
    toast('✓ Added to Vendor Library');
  }

  return (
    <ModalShell title="Add to Vendor Library" onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-p" onClick={save}><i className="ti ti-check" /> Add to Library</button>
    </>}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>Vendors in the library can be reused across any wedding — filtered by city.</div>
      <div className="form-grid">
        <div className="form-row"><label>Vendor Name</label><input className="inp" ref={nameRef} placeholder="e.g. Fateh Prakash Palace" /></div>
        <div className="form-row"><label>Category</label>
          <select className="sel" ref={catRef}><option>Venue</option><option>Catering</option><option>Photography</option><option>Décor</option><option>Music</option><option>Pandit</option><option>Makeup</option><option>Transport</option><option>Mehendi</option><option>Other</option></select>
        </div>
        <div className="form-row"><label>City / Location</label><input className="inp" ref={cityRef} placeholder="e.g. Udaipur" /></div>
        <div className="form-row"><label>Phone</label><input className="inp" ref={phoneRef} placeholder="10-digit number" /></div>
        <div className="form-row"><label>Rating (1-5)</label><input className="inp" type="number" min={1} max={5} ref={ratingRef} defaultValue={4} /></div>
      </div>
      <div className="form-row"><label>Details / Speciality</label><input className="inp" ref={detailRef} placeholder="e.g. Lakeside royal venue · 500 pax" style={{ width: '100%' }} /></div>
    </ModalShell>
  );
}

export type ModalType = 'add-wedding' | 'add-ceremony' | 'add-vendor' | 'add-guest' | 'add-budget' | 'add-lib-vendor' | null;

interface ModalManagerProps {
  modal: ModalType;
  weddingId: number | null;
  onClose: () => void;
  onRefresh: () => void;
  onWeddingSelect: (id: number) => void;
  weddings: Wedding[];
}

export function ModalManager({ modal, weddingId, onClose, onRefresh, onWeddingSelect }: ModalManagerProps) {
  if (!modal) return null;
  if (modal === 'add-wedding') return <AddWeddingModal onClose={onClose} onRefresh={onRefresh} onSelect={onWeddingSelect} />;
  if (modal === 'add-ceremony') return <AddCeremonyModal onClose={onClose} onRefresh={onRefresh} weddingId={weddingId} />;
  if (modal === 'add-vendor') return <AddVendorModal onClose={onClose} onRefresh={onRefresh} weddingId={weddingId} />;
  if (modal === 'add-guest') return <AddGuestModal onClose={onClose} onRefresh={onRefresh} weddingId={weddingId} />;
  if (modal === 'add-budget') return <AddBudgetModal onClose={onClose} onRefresh={onRefresh} weddingId={weddingId} />;
  if (modal === 'add-lib-vendor') return <AddLibVendorModal onClose={onClose} onRefresh={onRefresh} />;
  return null;
}
