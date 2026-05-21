export function fmt(n: number): string {
  if (n >= 100000) return (n / 100000).toFixed(n % 100000 === 0 ? 0 : 1) + 'L';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return (n || 0).toString();
}

export function fmtDate(d: string): string {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
}

export function capStatus(s: string): string {
  if (s === 'active') return 'Active';
  if (s === 'done') return 'Done';
  if (s === 'soon') return '2 days';
  return 'Upcoming';
}

export function stars(n: number): string {
  return '★'.repeat(n || 0) + '☆'.repeat(5 - (n || 0));
}

export const CAT_ICO: Record<string, string> = {
  Venue: '🎪', Catering: '🍽️', Photography: '📸', Décor: '🌸',
  Music: '🥁', Pandit: '🕉️', Makeup: '💄', Transport: '🚌',
  Mehendi: '🌿', Baraat: '🐎', Gifts: '🛍️',
};

export const CAT_BG: Record<string, string> = {
  Venue: 'var(--amber-l)', Catering: 'var(--pink-l)', Photography: 'var(--teal-l)',
  Décor: 'var(--purple-l)', Music: 'var(--amber-l)', Pandit: 'var(--purple-l)',
  Makeup: 'var(--pink-l)', Transport: 'var(--coral-l)',
};

export const CEREMONY_ICO: Record<string, string> = {
  Mehendi: '🌿', Sangeet: '🎵', Baraat: '🐎', Pheras: '🔥',
  Vidaai: '🚪', Reception: '🎉', Haldi: '🌸',
};

export function getCeremonyIcon(name: string): string {
  const entry = Object.entries(CEREMONY_ICO).find(([k]) => name.includes(k));
  return entry ? entry[1] : '🎊';
}

export function daysUntil(date: string): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}
