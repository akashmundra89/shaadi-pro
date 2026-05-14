interface TlItem { t: string; tx: string; sub: string; c: string }

const MAIN_TL: TlItem[] = [
  { t: '7:00 AM', tx: 'Mandap & venue setup check', sub: 'Manager arrives · Verify décor, sound, seating', c: 'var(--teal)' },
  { t: '8:30 AM', tx: 'Bridal makeup begins', sub: "Bridal team · Bride's room", c: 'var(--amber)' },
  { t: '10:00 AM', tx: 'Baraat starts 🐎', sub: "Dhol band + Ghodi · Groom's house", c: 'var(--amber)' },
  { t: '11:00 AM', tx: 'Baraat arrives at venue', sub: 'Welcome with tika, flowers', c: 'var(--coral)' },
  { t: '11:30 AM', tx: 'Jaimala & Milni 🌸', sub: 'Main entrance · Garland exchange · Photo session', c: 'var(--pink)' },
  { t: '12:00 PM', tx: 'Pheras begin 🔥', sub: 'Pandit · Mandap · ~2.5 hrs', c: 'var(--purple)' },
  { t: '1:30 PM', tx: 'Lunch buffet opens', sub: 'Caterers · All guests', c: 'var(--amber)' },
  { t: '2:30 PM', tx: 'Pheras conclude · Sindoor', sub: 'Saptapadi complete · Family blessings', c: 'var(--purple)' },
  { t: '5:30 PM', tx: 'Vidaai 🚪', sub: 'Emotional farewell · Decorated car', c: 'var(--pink)' },
  { t: '7:00 PM', tx: 'Reception begins 🎉', sub: 'Banquet Hall · DJ · Dinner', c: 'var(--teal)' },
];

const PRE_TL: TlItem[] = [
  { t: '12 Feb · 4:00 PM', tx: 'Mehendi Ceremony 🌿', sub: "~80 guests · Bride's side", c: 'var(--teal)' },
  { t: '12 Feb · 8:00 PM', tx: 'Mehendi dinner', sub: 'Family gathering', c: 'var(--teal)' },
  { t: "13 Feb · 2:00 PM", tx: "Haldi — Bride's side 🌸", sub: 'Intimate · Family only', c: 'var(--purple)' },
  { t: "13 Feb · 3:00 PM", tx: "Haldi — Groom's side 🌸", sub: "Groom's house · Friends + family", c: 'var(--amber)' },
  { t: '13 Feb · 7:00 PM', tx: 'Sangeet Night 🎵', sub: 'Lawns · DJ · ~220 guests', c: 'var(--pink)' },
];

function Timeline({ items }: { items: TlItem[] }) {
  return (
    <div className="tl">
      <div className="tl-line" />
      {items.map((item, i) => (
        <div className="tl-item" key={i}>
          <div className="tl-dot" style={{ background: item.c }} />
          <div className="tl-t">{item.t}</div>
          <div className="tl-tx">{item.tx}</div>
          <div className="tl-sub">{item.sub}</div>
        </div>
      ))}
    </div>
  );
}

export default function TimelinePage() {
  return (
    <div className="page">
      <div className="g2">
        <div className="card">
          <div className="card-hd"><div className="card-hd-l"><i className="ti ti-calendar-time" style={{ color: 'var(--pink)' }} /> Wedding Day</div></div>
          <Timeline items={MAIN_TL} />
        </div>
        <div className="card">
          <div className="card-hd"><div className="card-hd-l"><i className="ti ti-calendar-event" style={{ color: 'var(--teal)' }} /> Pre-Wedding Days</div></div>
          <Timeline items={PRE_TL} />
        </div>
      </div>
    </div>
  );
}
