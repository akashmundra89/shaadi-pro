export interface Wedding {
  id?: number;
  name: string;
  date: string;
  venue: string;
  city: string;
  totalBudget?: number;
}

export interface Ceremony {
  id?: number;
  weddingId: number;
  name: string;
  date: string;
  time: string;
  location: string;
  guests: number;
  side: string;
  status: 'active' | 'upcoming' | 'soon' | 'done';
}

export interface Vendor {
  id?: number;
  weddingId: number;
  name: string;
  category: string;
  city: string;
  amount: number;
  payStatus: 'pending' | 'advance' | 'paid';
  phone: string;
  detail: string;
}

export interface Guest {
  id?: number;
  weddingId: number;
  name: string;
  side: 'Bride' | 'Groom' | 'Both';
  relation: string;
  ceremonies: string;
  rsvp: 'Yes' | 'No' | 'Awaited';
  transport: string;
  food: string;
  phone?: string;
  roomNumber?: string;
  checkedIn?: boolean;
}

export interface BudgetCategory {
  id?: number;
  weddingId: number;
  category: string;
  spent: number;
  total: number;
}

export interface Task {
  id?: number;
  weddingId: number;
  type: 'pre' | 'day';
  label: string;
  who: string;
  done: boolean;
}

export interface VendorLib {
  id?: number;
  name: string;
  category: string;
  city: string;
  phone: string;
  detail: string;
  rating: number;
  usedIn: string[];
}

export interface TimelineItem {
  id?: number;
  weddingId: number;
  day: 'main' | 'pre';
  time: string;
  text: string;
  sub: string;
  color: string;
  sortOrder: number;
}

export type Page = 'dash' | 'ceremonies' | 'vendors' | 'guests' | 'budget' | 'timeline' | 'checklist' | 'vlibrary';
