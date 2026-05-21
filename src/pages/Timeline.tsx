import { useEffect, useState, useMemo } from 'react';
import * as api from '../lib/api';
import { useToast } from '../context/ToastContext';
import { TimelineModal } from '../components/Modals';
import type { TimelineItem } from '../types';

interface Props {
  weddingId: number | null;
  refreshKey: number;
  onRefresh: () => void;
}

const SEED_MAIN: Omit<TimelineItem, 'id' | 'weddingId'>[] = [
  { day: 'main', time: '7:00 AM', text: 'Mandap & venue setup check', sub: 'Manager arrives · Verify décor, sound, seating', color: 'var(--teal)', sortOrder: 1 },
  { day: 'main', time: '8:30 AM', text: 'Bridal makeup begins', sub: "Bridal team · Bride's room", color: 'var(--amber)', sortOrder: 2 },
  { day: 'main', time: '10:00 AM', text: 'Baraat starts 🐎', sub: "Dhol band + Ghodi · Groom's house", color: 'var(--amber)', sortOrder: 3 },
  { day: 'main', time: '11:00 AM', text: 'Baraat arrives at venue', sub: 'Welcome with tika · Flower shower', color: 'var(--coral)', sortOrder: 4 },
  { day: 'main', time: '11:30 AM', text: 'Jaimala & Milni 🌸', sub: 'Main entrance · Garland exchange · Photo session', color: 'var(--pink)', sortOrder: 5 },
  { day: 'main', time: '12:00 PM', text: 'Pheras begin 🔥', sub: 'Pandit ji · Mandap · ~2.5 hours', color: 'var(--purple)', sortOrder: 6 },
  { day: 'main', time: '1:30 PM', text: 'Lunch buffet opens', sub: 'Caterers · All guests invited to dining area', color: 'var(--amber)', sortOrder: 7 },
  { day: 'main', time: '2:30 PM', text: 'Pheras conclude · Sindoor 💞', sub: 'Saptapadi complete · Family blessings', color: 'var(--purple)', sortOrder: 8 },
  { day: 'main', time: '5:30 PM', text: 'Vidaai 🚪', sub: 'Emotional farewell · Decorated car · Bride departs', color: 'var(--pink)', sortOrder: 9 },
  { day: 'main', time: '7:00 PM', text: 'Reception begins 🎉', sub: 'Banquet Hall · DJ night · Dinner for all', color: 'var(--teal)', sortOrder: 10 },
];

const SEED_PRE: Omit<TimelineItem, 'id' | 'weddingId'>[] = [
  { day: 'pre', time: '12 Jun · 4:00 PM', text: 'Mehendi Ceremony 🌿', sub: "~80 guests · Bride's side · Mehendi artists booked", color: 'var(--teal)', sortOrder: 1 },
  { day: 'pre', time: '12 Jun · 8:00 PM', text: 'Mehendi dinner', sub: 'Family gathering · Light dinner at residence', color: 'var(--teal)', sortOrder: 2 },
  { day: 'pre', time: '13 Jun · 2:00 PM', text: "Haldi — Bride's side 🌸", sub: 'Intimate ceremony · Immediate family only', color: 'var(--purple)', sortOrder: 3 },
  { day: 'pre', time: '13 Jun · 3:00 PM', text: "Haldi — Groom's side 🌸", sub: "Groom's house · Friends + family · DJ", color: 'var(--amber)', sortOrder: 4 },
  { day: 'pre', time: '13 Jun · 7:00 PM', text: 'Sangeet Night 🎵', sub: 'Jai Mahal Palace Lawns · DJ · ~220 guests', color: 'var(--pink)', sortOrder: 5 },
];

function parseTimeToMinutes(timeStr: string): number {
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 9999;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
  else if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

const COLOR_NAMES: Record<string, string> = {
  'var(--teal)': 'Teal',
  'var(--amber)': 'Amber',
  'var(--pink)': 'Pink',
  'var(--purple)': 'Purple',
  'var(--coral)': 'Coral',
};

export default function TimelinePage({ weddingId, refreshKey, onRefresh }: Props) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [tab, setTab] = useState<'main' | 'pre'>('main');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<TimelineItem | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    if (!weddingId) { setItems([]); return; }
    api.getTimeline(weddingId).then(async existing => {
      if (existing.length === 0) {
        const seeds = [
          ...SEED_MAIN.map(s => ({ ...s, weddingId: weddingId! })),
          ...SEED_PRE.map(s => ({ ...s, weddingId: weddingId! })),
        ];
        await api.bulkAddTimeline(seeds);
        const seeded = await api.getTimeline(weddingId);
        setItems(seeded);
      } else {
        setItems(existing);
      }
    });
  }, [weddingId, refreshKey]);

  function openAdd() { setEditItem(undefined); setShowModal(true); }
  function openEdit(item: TimelineItem) { setEditItem(item); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditItem(undefined); }

  async function deleteItem(id: number) {
    if (!confirm('Delete this timeline item?')) return;
    await api.deleteTimelineItem(id);
    onRefresh();
    toast('Timeline item deleted');
  }

  const filtered = useMemo(() =>
    items
      .filter(i => i.day === tab)
      .map(i => ({ item: i, mins: parseTimeToMinutes(i.time) }))
      .sort((a, b) => a.mins - b.mins || a.item.sortOrder - b.item.sortOrder)
      .map(({ item }) => item),
  [items, tab]);

  return (
    <>
      <div className="page">
        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700 }}>Day Timeline</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Plan every moment of your wedding day</div>
          </div>
          <button className="btn btn-p btn-sm" onClick={openAdd}><i className="ti ti-plus" /> Add Event</button>
        </div>

        {/* Tabs */}
        <div className="fbar">
          <button className={`fb ${tab === 'main' ? 'on' : ''}`} onClick={() => setTab('main')}>
            <i className="ti ti-sun" /> Wedding Day
          </button>
          <button className={`fb ${tab === 'pre' ? 'on' : ''}`} onClick={() => setTab('pre')}>
            <i className="ti ti-calendar-event" /> Pre-Wedding Days
          </button>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Timeline card */}
        <div className="card" style={{ padding: '18px 18px 10px' }}>
          <div className="card-hd">
            <div className="card-hd-l">
              {tab === 'main'
                ? <><i className="ti ti-calendar-time" style={{ color: 'var(--pink)' }} /> Wedding Day Schedule</>
                : <><i className="ti ti-calendar-event" style={{ color: 'var(--teal)' }} /> Pre-Wedding Events</>
              }
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty"><i className="ti ti-clock" />No events yet. Click "Add Event" to get started!</div>
          ) : (
            <div className="tl-wrap">
              <div className="tl-spine" />
              {filtered.map(item => (
                <div
                  key={item.id}
                  className="tl-card"
                  style={{ borderLeftColor: item.color }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: -16,
                      top: 14,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: item.color,
                      border: '2.5px solid var(--surface)',
                      boxShadow: '0 0 0 2px ' + item.color + '40',
                      flexShrink: 0,
                    }}
                  />
                  <div className="tl-card-hd">
                    <div className="tl-time-badge">
                      <i className="ti ti-clock" style={{ fontSize: 11 }} />
                      {item.time}
                    </div>
                    <div className="tl-actions">
                      <button className="btn btn-sm" onClick={() => openEdit(item)} title="Edit" style={{ padding: '2px 7px' }}>
                        <i className="ti ti-pencil" />
                      </button>
                      <button className="btn btn-sm" onClick={() => item.id && deleteItem(item.id)} style={{ color: 'var(--coral)', borderColor: 'var(--coral-l)', padding: '2px 7px' }} title="Delete">
                        <i className="ti ti-trash" />
                      </button>
                    </div>
                  </div>
                  <div className="tl-event">{item.text}</div>
                  {item.sub && <div className="tl-detail">{item.sub}</div>}
                  <div style={{ marginTop: 6, display: 'flex', gap: 5 }}>
                    <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: item.color + '18', color: item.color, fontWeight: 700, border: '1px solid ' + item.color + '30' }}>
                      {COLOR_NAMES[item.color] || 'Color'}
                    </span>
                    <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: 'var(--purple-l)', color: 'var(--purple)', fontWeight: 700 }}>
                      {item.day === 'main' ? 'Wedding Day' : 'Pre-Wedding'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <TimelineModal
          weddingId={weddingId}
          editItem={editItem}
          onClose={closeModal}
          onRefresh={() => { closeModal(); onRefresh(); }}
        />
      )}
    </>
  );
}
