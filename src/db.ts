import Dexie, { type Table } from 'dexie';
import type { Wedding, Ceremony, Vendor, Guest, BudgetCategory, Task, VendorLib, TimelineItem } from './types';

export class ShaadiProDB extends Dexie {
  weddings!: Table<Wedding, number>;
  ceremonies!: Table<Ceremony, number>;
  vendors!: Table<Vendor, number>;
  guests!: Table<Guest, number>;
  budget!: Table<BudgetCategory, number>;
  tasks!: Table<Task, number>;
  vendorLib!: Table<VendorLib, number>;
  timeline!: Table<TimelineItem, number>;

  constructor() {
    super('ShaadiPro');
    this.version(2).stores({
      weddings: '++id,name,date,venue,city',
      ceremonies: '++id,weddingId,name,date,time,location,guests,side,status',
      vendors: '++id,weddingId,name,category,city,amount,payStatus,phone,detail',
      guests: '++id,weddingId,name,side,relation,ceremonies,rsvp,transport,food',
      budget: '++id,weddingId,category,spent,total',
      tasks: '++id,weddingId,type,label,who,done',
      vendorLib: '++id,name,category,city,phone,detail,rating,usedIn',
    });
    this.version(3).stores({
      weddings: '++id,name,date,venue,city',
      ceremonies: '++id,weddingId,name,date,time,location,guests,side,status',
      vendors: '++id,weddingId,name,category,city,amount,payStatus,phone,detail',
      guests: '++id,weddingId,name,side,relation,ceremonies,rsvp,transport,food',
      budget: '++id,weddingId,category,spent,total',
      tasks: '++id,weddingId,type,label,who,done',
      vendorLib: '++id,name,category,city,phone,detail,rating,usedIn',
      timeline: '++id,weddingId,day,sortOrder',
    });
  }
}

export const db = new ShaadiProDB();

export async function seedIfEmpty() {
  const count = await db.weddings.count();
  if (count > 0) return;

  const wId = await db.weddings.add({ name: 'Sharma × Agarwal', date: '2025-02-14', venue: 'Jai Mahal Palace', city: 'Jaipur' });

  await db.ceremonies.bulkAdd([
    { weddingId: wId, name: 'Mehendi Ceremony', date: '12 Feb', time: '4:00 PM', location: "Bride's residence", guests: 80, side: "Bride's side", status: 'active' },
    { weddingId: wId, name: 'Sangeet Night', date: '13 Feb', time: '7:00 PM', location: 'Jai Mahal Palace Lawns', guests: 220, side: 'Both sides', status: 'upcoming' },
    { weddingId: wId, name: 'Baraat Procession', date: '14 Feb', time: '10:00 AM', location: "Groom's house → Venue", guests: 150, side: "Groom's side", status: 'upcoming' },
    { weddingId: wId, name: 'Pheras (Main Ceremony)', date: '14 Feb', time: '12:00 PM', location: 'Mandap, Jai Mahal Palace', guests: 347, side: 'Both sides', status: 'upcoming' },
    { weddingId: wId, name: 'Vidaai', date: '14 Feb', time: '5:30 PM', location: 'Main Gate', guests: 347, side: 'Both sides', status: 'upcoming' },
    { weddingId: wId, name: 'Reception', date: '14 Feb', time: '7:00 PM', location: 'Banquet Hall', guests: 347, side: 'Both sides', status: 'upcoming' },
  ]);

  await db.vendors.bulkAdd([
    { weddingId: wId, name: 'Jai Mahal Palace', category: 'Venue', city: 'Jaipur', amount: 650000, payStatus: 'paid', phone: '9876543210', detail: 'Venue & Mandap' },
    { weddingId: wId, name: 'Regal Caterers', category: 'Catering', city: 'Jaipur', amount: 820000, payStatus: 'advance', phone: '9001234567', detail: '350 pax · Veg+Jain' },
    { weddingId: wId, name: 'Kapoor Clicks', category: 'Photography', city: 'Jaipur', amount: 250000, payStatus: 'advance', phone: '9812345678', detail: 'Photo + Cinematic Video' },
    { weddingId: wId, name: 'Pushp Shajar', category: 'Décor', city: 'Jaipur', amount: 180000, payStatus: 'pending', phone: '', detail: 'Flowers & Theme Décor' },
    { weddingId: wId, name: 'Dhol Wale Ustaad', category: 'Music', city: 'Jaipur', amount: 45000, payStatus: 'paid', phone: '9988776655', detail: 'Dhol + Brass Band' },
    { weddingId: wId, name: 'Pandit Rameshwar', category: 'Pandit', city: 'Jaipur', amount: 21000, payStatus: 'paid', phone: '', detail: 'Pheras & all rituals' },
    { weddingId: wId, name: 'Shruti Makeovers', category: 'Makeup', city: 'Jaipur', amount: 55000, payStatus: 'advance', phone: '9876501234', detail: 'Bridal Makeup + Hair' },
    { weddingId: wId, name: 'Royal Travels', category: 'Transport', city: 'Jaipur', amount: 80000, payStatus: 'pending', phone: '9111222333', detail: '4 coaches booked' },
  ]);

  await db.guests.bulkAdd([
    { weddingId: wId, name: 'Rajesh Agarwal', side: 'Groom', relation: 'Chacha ji', ceremonies: 'All', rsvp: 'Yes', transport: 'Self', food: 'Jain', phone: '9876500001', roomNumber: '101', checkedIn: true },
    { weddingId: wId, name: 'Sunita Sharma', side: 'Bride', relation: 'Mausi ji', ceremonies: 'Sangeet, Pheras', rsvp: 'Yes', transport: 'Coach A', food: 'Veg', phone: '9876500002', roomNumber: '102', checkedIn: true },
    { weddingId: wId, name: 'Vikram Verma', side: 'Groom', relation: 'College friend', ceremonies: 'Baraat, Sangeet', rsvp: 'Awaited', transport: '—', food: 'Veg', phone: '9876500003' },
    { weddingId: wId, name: 'Priya Gupta', side: 'Bride', relation: 'Best friend', ceremonies: 'Mehendi, Sangeet', rsvp: 'Yes', transport: 'Self', food: 'Veg', phone: '9876500004', roomNumber: '205', checkedIn: true },
    { weddingId: wId, name: 'Mohanlal Jain', side: 'Both', relation: 'Parivar mitra', ceremonies: 'Pheras, Reception', rsvp: 'No', transport: '—', food: 'Jain', phone: '' },
    { weddingId: wId, name: 'Kavita Patel', side: 'Groom', relation: 'Bua ji', ceremonies: 'All', rsvp: 'Yes', transport: 'Coach B', food: 'Veg', phone: '9876500006' },
    { weddingId: wId, name: 'Deepak Sharma', side: 'Bride', relation: 'Bhaiya', ceremonies: 'All', rsvp: 'Yes', transport: 'Self', food: 'Veg', phone: '9876500007', roomNumber: '310', checkedIn: true },
    { weddingId: wId, name: 'Anita Mehta', side: 'Bride', relation: 'Padosan', ceremonies: 'Mehendi, Reception', rsvp: 'Awaited', transport: '—', food: 'Veg', phone: '9876500008' },
  ]);

  await db.budget.bulkAdd([
    { weddingId: wId, category: '🍽️ Catering', spent: 820000, total: 900000 },
    { weddingId: wId, category: '🎪 Venue & Mandap', spent: 650000, total: 700000 },
    { weddingId: wId, category: '👗 Bridal Trousseau', spent: 420000, total: 500000 },
    { weddingId: wId, category: '💍 Jewellery & Gifts', spent: 300000, total: 400000 },
    { weddingId: wId, category: '📸 Photography & Video', spent: 250000, total: 300000 },
    { weddingId: wId, category: '🌸 Flowers & Décor', spent: 180000, total: 200000 },
    { weddingId: wId, category: '🎵 Music & DJ & Band', spent: 140000, total: 150000 },
    { weddingId: wId, category: '🚌 Guest Transport', spent: 80000, total: 100000 },
    { weddingId: wId, category: '🛍️ Return Gifts', spent: 87500, total: 100000 },
    { weddingId: wId, category: '💄 Makeup & Misc', spent: 112500, total: 150000 },
  ]);

  await db.tasks.bulkAdd([
    { weddingId: wId, type: 'pre', label: 'Book venue & confirm dates', who: 'Manager', done: true },
    { weddingId: wId, type: 'pre', label: 'Confirm pandit & muhurat', who: 'Family', done: true },
    { weddingId: wId, type: 'pre', label: 'Book photography team', who: 'Manager', done: true },
    { weddingId: wId, type: 'pre', label: 'Finalise caterer & menu', who: 'Manager', done: true },
    { weddingId: wId, type: 'pre', label: 'Book Dhol wala for baraat', who: 'Manager', done: true },
    { weddingId: wId, type: 'pre', label: 'Print & distribute invites', who: 'Family', done: true },
    { weddingId: wId, type: 'pre', label: 'Pay Pushp Shajar ₹50K advance', who: 'Manager', done: false },
    { weddingId: wId, type: 'pre', label: 'Arrange 4 guest coaches', who: 'Rohit', done: false },
    { weddingId: wId, type: 'pre', label: 'Send digital invites to pending guests', who: 'Priya', done: false },
    { weddingId: wId, type: 'day', label: 'Verify mandap & décor by 7 AM', who: 'Manager', done: false },
    { weddingId: wId, type: 'day', label: 'Brief catering team on Jain section', who: 'Manager', done: false },
    { weddingId: wId, type: 'day', label: 'Receive baraat at main gate', who: 'Suresh', done: false },
    { weddingId: wId, type: 'day', label: 'Coordinate Jaimala photo positions', who: 'Manager', done: false },
    { weddingId: wId, type: 'day', label: 'Manage Pheras timing with pandit', who: 'Manager', done: false },
  ]);

  await db.timeline.bulkAdd([
    { weddingId: wId, day: 'main', time: '7:00 AM', text: 'Mandap & venue setup check', sub: 'Manager arrives · Verify décor, sound, seating', color: 'var(--teal)', sortOrder: 1 },
    { weddingId: wId, day: 'main', time: '8:30 AM', text: 'Bridal makeup begins', sub: "Bridal team · Bride's room", color: 'var(--amber)', sortOrder: 2 },
    { weddingId: wId, day: 'main', time: '10:00 AM', text: 'Baraat starts 🐎', sub: "Dhol band + Ghodi · Groom's house", color: 'var(--amber)', sortOrder: 3 },
    { weddingId: wId, day: 'main', time: '11:00 AM', text: 'Baraat arrives at venue', sub: 'Welcome with tika, flowers', color: 'var(--coral)', sortOrder: 4 },
    { weddingId: wId, day: 'main', time: '11:30 AM', text: 'Jaimala & Milni 🌸', sub: 'Main entrance · Garland exchange · Photo session', color: 'var(--pink)', sortOrder: 5 },
    { weddingId: wId, day: 'main', time: '12:00 PM', text: 'Pheras begin 🔥', sub: 'Pandit · Mandap · ~2.5 hrs', color: 'var(--purple)', sortOrder: 6 },
    { weddingId: wId, day: 'main', time: '1:30 PM', text: 'Lunch buffet opens', sub: 'Caterers · All guests', color: 'var(--amber)', sortOrder: 7 },
    { weddingId: wId, day: 'main', time: '2:30 PM', text: 'Pheras conclude · Sindoor', sub: 'Saptapadi complete · Family blessings', color: 'var(--purple)', sortOrder: 8 },
    { weddingId: wId, day: 'main', time: '5:30 PM', text: 'Vidaai 🚪', sub: 'Emotional farewell · Decorated car', color: 'var(--pink)', sortOrder: 9 },
    { weddingId: wId, day: 'main', time: '7:00 PM', text: 'Reception begins 🎉', sub: 'Banquet Hall · DJ · Dinner', color: 'var(--teal)', sortOrder: 10 },
    { weddingId: wId, day: 'pre', time: '12 Feb · 4:00 PM', text: 'Mehendi Ceremony 🌿', sub: "~80 guests · Bride's side", color: 'var(--teal)', sortOrder: 1 },
    { weddingId: wId, day: 'pre', time: '12 Feb · 8:00 PM', text: 'Mehendi dinner', sub: 'Family gathering', color: 'var(--teal)', sortOrder: 2 },
    { weddingId: wId, day: 'pre', time: '13 Feb · 2:00 PM', text: "Haldi — Bride's side 🌸", sub: 'Intimate · Family only', color: 'var(--purple)', sortOrder: 3 },
    { weddingId: wId, day: 'pre', time: '13 Feb · 3:00 PM', text: "Haldi — Groom's side 🌸", sub: "Groom's house · Friends + family", color: 'var(--amber)', sortOrder: 4 },
    { weddingId: wId, day: 'pre', time: '13 Feb · 7:00 PM', text: 'Sangeet Night 🎵', sub: 'Lawns · DJ · ~220 guests', color: 'var(--pink)', sortOrder: 5 },
  ]);

  await db.vendorLib.bulkAdd([
    { name: 'Jai Mahal Palace', category: 'Venue', city: 'Jaipur', phone: '9876543210', detail: 'Luxury heritage venue', rating: 5, usedIn: ['Sharma × Agarwal'] },
    { name: 'Regal Caterers', category: 'Catering', city: 'Jaipur', phone: '9001234567', detail: 'Veg+Jain · 350+ pax', rating: 4, usedIn: ['Sharma × Agarwal'] },
    { name: 'Kapoor Clicks', category: 'Photography', city: 'Jaipur', phone: '9812345678', detail: 'Photo + Cinematic Video', rating: 5, usedIn: ['Sharma × Agarwal'] },
    { name: 'Pushp Shajar', category: 'Décor', city: 'Jaipur', phone: '', detail: 'Flowers & Theme Décor', rating: 4, usedIn: ['Sharma × Agarwal'] },
    { name: 'Dhol Wale Ustaad', category: 'Music', city: 'Jaipur', phone: '9988776655', detail: 'Dhol + Brass Band for baraat', rating: 5, usedIn: ['Sharma × Agarwal'] },
    { name: 'Fateh Prakash Palace', category: 'Venue', city: 'Udaipur', phone: '9887766554', detail: 'Lakeside royal venue', rating: 5, usedIn: [] },
    { name: 'Lake City Caterers', category: 'Catering', city: 'Udaipur', phone: '9877654321', detail: 'Multi-cuisine 500+ pax', rating: 4, usedIn: [] },
    { name: 'Royal Film Studio', category: 'Photography', city: 'Udaipur', phone: '9765432198', detail: 'Drone + photo + video', rating: 5, usedIn: [] },
    { name: 'Mumbai Moments', category: 'Photography', city: 'Mumbai', phone: '9654321087', detail: 'Candid & cinematic', rating: 5, usedIn: [] },
    { name: 'Grand Hyatt Banquet', category: 'Venue', city: 'Mumbai', phone: '9543210976', detail: 'Premium ballroom', rating: 5, usedIn: [] },
    { name: 'Kota Shaadi Caterers', category: 'Catering', city: 'Kota', phone: '9432109865', detail: 'Rajasthani thali specialists', rating: 4, usedIn: [] },
    { name: 'Rajput Décor Kota', category: 'Décor', city: 'Kota', phone: '', detail: 'Traditional & modern décor', rating: 4, usedIn: [] },
  ]);
}
