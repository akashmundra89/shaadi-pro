import { useRef } from 'react';
import { db } from '../db';
import { useToast } from '../context/ToastContext';
import type { Ceremony, Vendor, Guest, BudgetCategory, VendorLib, TimelineItem } from '../types';

// ─── SHELL ───────────────────────────────────────────────────────────────────

export function ModalShell({ title, onClose, children, footer }: {
  title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode;
}) {
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

// ─── WEDDING ─────────────────────────────────────────────────────────────────

export function AddWeddingModal({ onClose, onRefresh, onSelect }: {
  onClose: () => void; onRefresh: () => void; onSelect: (id: number) => void;
}) {
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const venueRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);

  async function save() {
    const name = nameRef.current?.value.trim() || '';
    if (!name) { toast('Enter wedding name'); return; }
    const id = await db.weddings.add({
      name, date: dateRef.current?.value || '',
      venue: venueRef.current?.value.trim() || '',
      city: cityRef.current?.value.trim() || '',
    });
    onClose(); onRefresh(); onSelect(id as number);
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

// ─── CEREMONY ────────────────────────────────────────────────────────────────

export function CeremonyModal({ onClose, onRefresh, weddingId, editItem }: {
  onClose: () => void; onRefresh: () => void;
  weddingId: number | null; editItem?: Ceremony;
}) {
  const isEdit = !!editItem;
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
    const data = {
      weddingId, name,
      date: dateRef.current?.value || '',
      time: timeRef.current?.value || '',
      location: locRef.current?.value || '',
      guests: parseInt(guestsRef.current?.value || '0') || 0,
      side: sideRef.current?.value || 'Both sides',
      status: (statusRef.current?.value as Ceremony['status']) || 'upcoming',
    };
    if (isEdit && editItem.id) {
      await db.ceremonies.update(editItem.id, data);
      toast('✓ Ceremony updated');
    } else {
      await db.ceremonies.add(data);
      toast('✓ Ceremony added');
    }
    onClose(); onRefresh();
  }

  return (
    <ModalShell title={isEdit ? 'Edit Ceremony' : 'Add Ceremony'} onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-p" onClick={save}><i className="ti ti-check" /> {isEdit ? 'Save Changes' : 'Add Ceremony'}</button>
    </>}>
      <div className="form-grid">
        <div className="form-row"><label>Ceremony Name</label>
          <input className="inp" ref={nameRef} defaultValue={editItem?.name} placeholder="e.g. Sangeet Night" /></div>
        <div className="form-row"><label>Date</label>
          <input className="inp" ref={dateRef} defaultValue={editItem?.date} placeholder="e.g. 14 Feb" /></div>
        <div className="form-row"><label>Time</label>
          <input className="inp" ref={timeRef} defaultValue={editItem?.time} placeholder="e.g. 7:00 PM" /></div>
        <div className="form-row"><label>Location</label>
          <input className="inp" ref={locRef} defaultValue={editItem?.location} placeholder="Venue name or address" /></div>
        <div className="form-row"><label>Expected Guests</label>
          <input className="inp" type="number" ref={guestsRef} defaultValue={editItem?.guests} placeholder="e.g. 200" /></div>
        <div className="form-row"><label>Side</label>
          <select className="sel" ref={sideRef} defaultValue={editItem?.side || 'Both sides'}>
            <option>Both sides</option><option>Bride's side</option><option>Groom's side</option>
          </select>
        </div>
      </div>
      <div className="form-row"><label>Status</label>
        <select className="sel" ref={statusRef} defaultValue={editItem?.status || 'upcoming'}>
          <option value="upcoming">Upcoming</option>
          <option value="active">Active</option>
          <option value="soon">Soon</option>
          <option value="done">Done</option>
        </select>
      </div>
    </ModalShell>
  );
}

// ─── VENDOR ──────────────────────────────────────────────────────────────────

export function VendorModal({ onClose, onRefresh, weddingId, editItem }: {
  onClose: () => void; onRefresh: () => void;
  weddingId: number | null; editItem?: Vendor;
}) {
  const isEdit = !!editItem;
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
    const phone = phoneRef.current?.value.trim() || '';
    const detail = detailRef.current?.value.trim() || '';
    const data = {
      weddingId, name, category: cat, city, phone, detail,
      amount: parseInt(amountRef.current?.value || '0') || 0,
      payStatus: (payRef.current?.value as Vendor['payStatus']) || 'pending',
    };
    if (isEdit && editItem.id) {
      await db.vendors.update(editItem.id, data);
      toast('✓ Vendor updated');
    } else {
      await db.vendors.add(data);
      if (libRef.current?.checked) {
        await db.vendorLib.add({ name, category: cat, city, phone, detail, rating: 4, usedIn: [] });
      }
      toast('✓ Vendor added');
    }
    onClose(); onRefresh();
  }

  const CATS = ['Venue','Catering','Photography','Décor','Music','Pandit','Makeup','Transport','Mehendi','Gifts','Other'];

  return (
    <ModalShell title={isEdit ? 'Edit Vendor' : 'Add Vendor'} onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-p" onClick={save}><i className="ti ti-check" /> {isEdit ? 'Save Changes' : 'Add Vendor'}</button>
    </>}>
      <div className="form-grid">
        <div className="form-row"><label>Vendor Name</label>
          <input className="inp" ref={nameRef} defaultValue={editItem?.name} placeholder="e.g. Kapoor Clicks" /></div>
        <div className="form-row"><label>Category</label>
          <select className="sel" ref={catRef} defaultValue={editItem?.category || 'Venue'}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-row"><label>City</label>
          <input className="inp" ref={cityRef} defaultValue={editItem?.city} placeholder="e.g. Jaipur" /></div>
        <div className="form-row"><label>Phone</label>
          <input className="inp" ref={phoneRef} defaultValue={editItem?.phone} placeholder="10-digit number" /></div>
        <div className="form-row"><label>Amount (₹)</label>
          <input className="inp" type="number" ref={amountRef} defaultValue={editItem?.amount} placeholder="e.g. 250000" /></div>
        <div className="form-row"><label>Payment Status</label>
          <select className="sel" ref={payRef} defaultValue={editItem?.payStatus || 'pending'}>
            <option value="pending">Pending</option>
            <option value="advance">Advance Paid</option>
            <option value="paid">Fully Paid</option>
          </select>
        </div>
      </div>
      <div className="form-row"><label>Details / Notes</label>
        <input className="inp" ref={detailRef} defaultValue={editItem?.detail} placeholder="e.g. 350 pax · Veg+Jain menu" style={{ width: '100%' }} /></div>
      {!isEdit && (
        <div className="form-row" style={{ marginBottom: 0 }}>
          <label><input type="checkbox" ref={libRef} /> Also add to Vendor Library</label>
        </div>
      )}
    </ModalShell>
  );
}

// ─── GUEST ───────────────────────────────────────────────────────────────────

export function GuestModal({ onClose, onRefresh, weddingId, editItem }: {
  onClose: () => void; onRefresh: () => void;
  weddingId: number | null; editItem?: Guest;
}) {
  const isEdit = !!editItem;
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
    const data = {
      weddingId, name,
      side: (sideRef.current?.value as Guest['side']) || 'Bride',
      relation: relRef.current?.value.trim() || '',
      ceremonies: cerRef.current?.value.trim() || 'All',
      rsvp: (rsvpRef.current?.value as Guest['rsvp']) || 'Awaited',
      transport: transportRef.current?.value.trim() || '—',
      food: foodRef.current?.value || 'Veg',
      phone: phoneRef.current?.value.trim() || '',
    };
    if (isEdit && editItem.id) {
      await db.guests.update(editItem.id, data);
      toast('✓ Guest updated');
    } else {
      await db.guests.add(data);
      toast('✓ Guest added');
    }
    onClose(); onRefresh();
  }

  const phoneRef = useRef<HTMLInputElement>(null);

  return (
    <ModalShell title={isEdit ? 'Edit Guest' : 'Add Guest'} onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-p" onClick={save}><i className="ti ti-check" /> {isEdit ? 'Save Changes' : 'Add Guest'}</button>
    </>}>
      <div className="form-grid">
        <div className="form-row"><label>Full Name</label>
          <input className="inp" ref={nameRef} defaultValue={editItem?.name} placeholder="e.g. Rajesh Sharma" /></div>
        <div className="form-row"><label>Phone</label>
          <input className="inp" ref={phoneRef} defaultValue={editItem?.phone} placeholder="10-digit mobile number" /></div>
        <div className="form-row"><label>Side</label>
          <select className="sel" ref={sideRef} defaultValue={editItem?.side || 'Bride'}>
            <option>Bride</option><option>Groom</option><option>Both</option>
          </select>
        </div>
        <div className="form-row"><label>Relation</label>
          <input className="inp" ref={relRef} defaultValue={editItem?.relation} placeholder="e.g. Mama ji, Best friend" /></div>
        <div className="form-row"><label>Food Preference</label>
          <select className="sel" ref={foodRef} defaultValue={editItem?.food || 'Veg'}>
            <option>Veg</option><option>Jain</option><option>Non-Veg</option>
          </select>
        </div>
        <div className="form-row"><label>RSVP</label>
          <select className="sel" ref={rsvpRef} defaultValue={editItem?.rsvp || 'Awaited'}>
            <option>Awaited</option><option>Yes</option><option>No</option>
          </select>
        </div>
        <div className="form-row"><label>Transport</label>
          <input className="inp" ref={transportRef} defaultValue={editItem?.transport} placeholder="e.g. Self, Coach A" /></div>
      </div>
      <div className="form-row"><label>Ceremonies Attending</label>
        <input className="inp" ref={cerRef} defaultValue={editItem?.ceremonies} placeholder="e.g. All, Mehendi, Sangeet, Pheras" style={{ width: '100%' }} /></div>
    </ModalShell>
  );
}

// ─── BUDGET ──────────────────────────────────────────────────────────────────

export function BudgetModal({ onClose, onRefresh, weddingId, editItem }: {
  onClose: () => void; onRefresh: () => void;
  weddingId: number | null; editItem?: BudgetCategory;
}) {
  const isEdit = !!editItem;
  const { toast } = useToast();
  const catRef = useRef<HTMLInputElement>(null);
  const spentRef = useRef<HTMLInputElement>(null);
  const totalRef = useRef<HTMLInputElement>(null);

  async function save() {
    if (!weddingId) { toast('Select a wedding first'); return; }
    const category = catRef.current?.value.trim() || '';
    if (!category) { toast('Enter category name'); return; }
    const data = {
      weddingId, category,
      spent: parseInt(spentRef.current?.value || '0') || 0,
      total: parseInt(totalRef.current?.value || '0') || 0,
    };
    if (isEdit && editItem.id) {
      await db.budget.update(editItem.id, data);
      toast('✓ Budget category updated');
    } else {
      await db.budget.add(data);
      toast('✓ Budget category added');
    }
    onClose(); onRefresh();
  }

  return (
    <ModalShell title={isEdit ? 'Edit Budget Category' : 'Add Budget Category'} onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-p" onClick={save}><i className="ti ti-check" /> {isEdit ? 'Save Changes' : 'Add Category'}</button>
    </>}>
      <div className="form-row"><label>Category Name (use emoji if you like)</label>
        <input className="inp" ref={catRef} defaultValue={editItem?.category} placeholder="e.g. 🎆 Fireworks" style={{ width: '100%' }} /></div>
      <div className="form-grid">
        <div className="form-row"><label>Amount Spent (₹)</label>
          <input className="inp" type="number" ref={spentRef} defaultValue={editItem?.spent} placeholder="0" /></div>
        <div className="form-row"><label>Total Budget (₹)</label>
          <input className="inp" type="number" ref={totalRef} defaultValue={editItem?.total} placeholder="0" /></div>
      </div>
    </ModalShell>
  );
}

// ─── VENDOR LIBRARY ──────────────────────────────────────────────────────────

export function LibVendorModal({ onClose, onRefresh, editItem }: {
  onClose: () => void; onRefresh: () => void; editItem?: VendorLib;
}) {
  const isEdit = !!editItem;
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);
  const catRef = useRef<HTMLSelectElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const ratingRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);

  const CATS = ['Venue','Catering','Photography','Décor','Music','Pandit','Makeup','Transport','Mehendi','Other'];

  async function save() {
    const name = nameRef.current?.value.trim() || '';
    if (!name) { toast('Enter vendor name'); return; }
    const data = {
      name,
      category: catRef.current?.value || 'Venue',
      city: cityRef.current?.value.trim() || '',
      phone: phoneRef.current?.value.trim() || '',
      detail: detailRef.current?.value.trim() || '',
      rating: parseInt(ratingRef.current?.value || '4') || 4,
    };
    if (isEdit && editItem.id) {
      await db.vendorLib.update(editItem.id, data);
      toast('✓ Vendor Library entry updated');
    } else {
      await db.vendorLib.add({ ...data, usedIn: [] });
      toast('✓ Added to Vendor Library');
    }
    onClose(); onRefresh();
  }

  return (
    <ModalShell title={isEdit ? 'Edit Library Vendor' : 'Add to Vendor Library'} onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-p" onClick={save}><i className="ti ti-check" /> {isEdit ? 'Save Changes' : 'Add to Library'}</button>
    </>}>
      {!isEdit && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>Vendors in the library can be reused across any wedding — filtered by city.</div>}
      <div className="form-grid">
        <div className="form-row"><label>Vendor Name</label>
          <input className="inp" ref={nameRef} defaultValue={editItem?.name} placeholder="e.g. Fateh Prakash Palace" /></div>
        <div className="form-row"><label>Category</label>
          <select className="sel" ref={catRef} defaultValue={editItem?.category || 'Venue'}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-row"><label>City / Location</label>
          <input className="inp" ref={cityRef} defaultValue={editItem?.city} placeholder="e.g. Udaipur" /></div>
        <div className="form-row"><label>Phone</label>
          <input className="inp" ref={phoneRef} defaultValue={editItem?.phone} placeholder="10-digit number" /></div>
        <div className="form-row"><label>Rating (1-5)</label>
          <input className="inp" type="number" min={1} max={5} ref={ratingRef} defaultValue={editItem?.rating ?? 4} /></div>
      </div>
      <div className="form-row"><label>Details / Speciality</label>
        <input className="inp" ref={detailRef} defaultValue={editItem?.detail} placeholder="e.g. Lakeside royal venue · 500 pax" style={{ width: '100%' }} /></div>
    </ModalShell>
  );
}

// ─── TIMELINE ITEM ───────────────────────────────────────────────────────────

export function TimelineModal({ onClose, onRefresh, weddingId, editItem }: {
  onClose: () => void; onRefresh: () => void;
  weddingId: number | null; editItem?: TimelineItem;
}) {
  const isEdit = !!editItem;
  const { toast } = useToast();
  const dayRef = useRef<HTMLSelectElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const subRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLSelectElement>(null);

  const COLORS = [
    { label: 'Teal', value: 'var(--teal)' },
    { label: 'Amber', value: 'var(--amber)' },
    { label: 'Pink', value: 'var(--pink)' },
    { label: 'Purple', value: 'var(--purple)' },
    { label: 'Coral', value: 'var(--coral)' },
  ];

  async function save() {
    if (!weddingId) { toast('Select a wedding first'); return; }
    const text = textRef.current?.value.trim() || '';
    if (!text) { toast('Enter event description'); return; }
    const data = {
      weddingId,
      day: (dayRef.current?.value as TimelineItem['day']) || 'main',
      time: timeRef.current?.value.trim() || '',
      text,
      sub: subRef.current?.value.trim() || '',
      color: colorRef.current?.value || 'var(--teal)',
      sortOrder: isEdit ? editItem.sortOrder : 999,
    };
    if (isEdit && editItem.id) {
      await db.timeline.update(editItem.id, data);
      toast('✓ Timeline item updated');
    } else {
      const count = await db.timeline.where('weddingId').equals(weddingId).count();
      await db.timeline.add({ ...data, sortOrder: count + 1 });
      toast('✓ Timeline item added');
    }
    onClose(); onRefresh();
  }

  return (
    <ModalShell title={isEdit ? 'Edit Timeline Item' : 'Add Timeline Item'} onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-p" onClick={save}><i className="ti ti-check" /> {isEdit ? 'Save Changes' : 'Add Item'}</button>
    </>}>
      <div className="form-grid">
        <div className="form-row"><label>Day</label>
          <select className="sel" ref={dayRef} defaultValue={editItem?.day || 'main'}>
            <option value="main">Wedding Day</option>
            <option value="pre">Pre-Wedding</option>
          </select>
        </div>
        <div className="form-row"><label>Time</label>
          <input className="inp" ref={timeRef} defaultValue={editItem?.time} placeholder="e.g. 7:00 AM" /></div>
        <div className="form-row"><label>Color</label>
          <select className="sel" ref={colorRef} defaultValue={editItem?.color || 'var(--teal)'}>
            {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row"><label>Event</label>
        <input className="inp" ref={textRef} defaultValue={editItem?.text} placeholder="e.g. Pheras begin 🔥" style={{ width: '100%' }} /></div>
      <div className="form-row"><label>Details / Sub-text</label>
        <input className="inp" ref={subRef} defaultValue={editItem?.sub} placeholder="e.g. Pandit · Mandap · ~2.5 hrs" style={{ width: '100%' }} /></div>
    </ModalShell>
  );
}

// ─── HOTEL CHECK-IN ──────────────────────────────────────────────────────────

export function CheckInModal({ guest, onClose, onRefresh }: {
  guest: Guest; onClose: () => void; onRefresh: () => void;
}) {
  const { toast } = useToast();
  const roomRef = useRef<HTMLInputElement>(null);

  async function save() {
    const roomNumber = roomRef.current?.value.trim() || '';
    if (!roomNumber) { toast('Enter room number'); return; }
    await db.guests.update(guest.id!, { roomNumber, checkedIn: true });
    toast(`✓ ${guest.name} checked in — Room ${roomNumber}`);
    onClose(); onRefresh();
  }

  async function checkOut() {
    await db.guests.update(guest.id!, { checkedIn: false, roomNumber: '' });
    toast(`✓ ${guest.name} checked out`);
    onClose(); onRefresh();
  }

  return (
    <ModalShell title="Hotel Check-In" onClose={onClose} footer={<>
      {guest.checkedIn && (
        <button className="btn" style={{ color: 'var(--coral)', borderColor: 'var(--coral-l)' }} onClick={checkOut}>
          <i className="ti ti-logout" /> Check Out
        </button>
      )}
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn btn-p" onClick={save}><i className="ti ti-check" /> {guest.checkedIn ? 'Update Room' : 'Check In'}</button>
    </>}>
      <div style={{ marginBottom: 14, padding: '10px 12px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 600 }}>{guest.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{guest.relation} · {guest.side}'s side</div>
      </div>
      <div className="form-row"><label>Room Number</label>
        <input className="inp" ref={roomRef} defaultValue={guest.roomNumber} placeholder="e.g. 204" style={{ width: '100%' }} autoFocus /></div>
    </ModalShell>
  );
}

// ─── NOTIFY HOTEL GUESTS ─────────────────────────────────────────────────────

export function NotifyGuestsModal({ ceremony, checkedInGuests, onClose }: {
  ceremony: Ceremony; checkedInGuests: Guest[]; onClose: () => void;
}) {
  const { toast } = useToast();

  function buildMsg(guest: Guest) {
    return `Namaste ${guest.name} ji 🙏\n\nThis is a reminder that the *${ceremony.name}* ceremony is starting soon.\n📅 ${ceremony.date} at ${ceremony.time}\n📍 ${ceremony.location}\n\nPlease make your way to the venue. Looking forward to seeing you! 🌸`;
  }

  async function copyAll() {
    const lines = checkedInGuests.map(g => `${g.name} (Room ${g.roomNumber}):\n${buildMsg(g)}`).join('\n\n---\n\n');
    await navigator.clipboard.writeText(lines);
    toast('✓ All messages copied to clipboard');
  }

  return (
    <ModalShell title={`Notify Hotel Guests — ${ceremony.name}`} onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Close</button>
      {checkedInGuests.length > 0 && (
        <button className="btn btn-t" onClick={copyAll}><i className="ti ti-copy" /> Copy All</button>
      )}
    </>}>
      {checkedInGuests.length === 0 ? (
        <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px 0', fontSize: 13 }}>
          No guests are currently checked in at the hotel.
        </div>
      ) : (
        <>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
            {checkedInGuests.length} guest(s) checked in · tap WhatsApp to send individual messages
          </div>
          {checkedInGuests.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{g.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  Room {g.roomNumber || '—'}{g.phone ? ` · ${g.phone}` : ' · No phone'}
                </div>
              </div>
              {g.phone ? (
                <a
                  href={`https://wa.me/91${g.phone}?text=${encodeURIComponent(buildMsg(g))}`}
                  target="_blank" rel="noreferrer"
                  className="btn btn-sm"
                  style={{ background: '#25D366', color: '#fff', border: 'none', textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  <i className="ti ti-brand-whatsapp" /> WhatsApp
                </a>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>No phone</span>
              )}
            </div>
          ))}
        </>
      )}
    </ModalShell>
  );
}

// ─── MODAL MANAGER (App-level — wedding only) ────────────────────────────────

export function ModalManager({ show, onClose, onRefresh, onWeddingSelect }: {
  show: boolean; onClose: () => void; onRefresh: () => void; onWeddingSelect: (id: number) => void;
}) {
  if (!show) return null;
  return <AddWeddingModal onClose={onClose} onRefresh={onRefresh} onSelect={onWeddingSelect} />;
}
