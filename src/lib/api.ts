import { supabase } from './supabase'
import type { Wedding, Ceremony, Vendor, Guest, BudgetCategory, Task, VendorLib, TimelineItem } from '../types'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function getUserId(): Promise<string | undefined> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id
}

// Map snake_case DB rows → camelCase TS types

function toWedding(r: Record<string, unknown>): Wedding {
  return {
    id: r.id as number,
    name: r.name as string,
    date: r.date as string,
    venue: r.venue as string,
    city: r.city as string,
    totalBudget: r.total_budget as number | undefined,
  }
}

function toCeremony(r: Record<string, unknown>): Ceremony {
  return {
    id: r.id as number,
    weddingId: r.wedding_id as number,
    name: r.name as string,
    date: r.date as string,
    time: r.time as string,
    location: r.location as string,
    guests: r.guests as number,
    side: r.side as string,
    status: r.status as Ceremony['status'],
  }
}

function toVendor(r: Record<string, unknown>): Vendor {
  return {
    id: r.id as number,
    weddingId: r.wedding_id as number,
    name: r.name as string,
    category: r.category as string,
    city: r.city as string,
    amount: r.amount as number,
    payStatus: r.pay_status as Vendor['payStatus'],
    phone: r.phone as string,
    detail: r.detail as string,
  }
}

function toGuest(r: Record<string, unknown>): Guest {
  return {
    id: r.id as number,
    weddingId: r.wedding_id as number,
    name: r.name as string,
    side: r.side as Guest['side'],
    relation: r.relation as string,
    ceremonies: r.ceremonies as string,
    rsvp: r.rsvp as Guest['rsvp'],
    transport: r.transport as string,
    food: r.food as string,
    phone: r.phone as string | undefined,
    roomNumber: r.room_number as string | undefined,
    checkedIn: r.checked_in as boolean | undefined,
  }
}

function toBudgetCategory(r: Record<string, unknown>): BudgetCategory {
  return {
    id: r.id as number,
    weddingId: r.wedding_id as number,
    category: r.category as string,
    spent: r.spent as number,
    total: r.total as number,
  }
}

function toTask(r: Record<string, unknown>): Task {
  return {
    id: r.id as number,
    weddingId: r.wedding_id as number,
    type: r.type as Task['type'],
    label: r.label as string,
    who: r.who as string,
    done: r.done as boolean,
  }
}

function toVendorLib(r: Record<string, unknown>): VendorLib {
  return {
    id: r.id as number,
    name: r.name as string,
    category: r.category as string,
    city: r.city as string,
    phone: r.phone as string,
    detail: r.detail as string,
    rating: r.rating as number,
    usedIn: (r.used_in as string[]) ?? [],
  }
}

function toTimelineItem(r: Record<string, unknown>): TimelineItem {
  return {
    id: r.id as number,
    weddingId: r.wedding_id as number,
    day: r.day as TimelineItem['day'],
    time: r.time as string,
    text: r.text as string,
    sub: r.sub as string,
    color: r.color as string,
    sortOrder: r.sort_order as number,
  }
}

// ─── WEDDINGS ─────────────────────────────────────────────────────────────────

export async function getWeddings(): Promise<Wedding[]> {
  const { data, error } = await supabase
    .from('weddings')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => toWedding(r as Record<string, unknown>))
}

export async function getWedding(id: number): Promise<Wedding | null> {
  const { data, error } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return toWedding(data as Record<string, unknown>)
}

export async function addWedding(data: Omit<Wedding, 'id'>): Promise<number> {
  const userId = await getUserId()
  const { data: row, error } = await supabase
    .from('weddings')
    .insert({
      user_id: userId,
      name: data.name,
      date: data.date,
      venue: data.venue,
      city: data.city,
      total_budget: data.totalBudget ?? null,
    })
    .select('id')
    .single()
  if (error) throw error
  return (row as { id: number }).id
}

export async function updateWedding(id: number, data: Partial<Wedding>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (data.name !== undefined) patch.name = data.name
  if (data.date !== undefined) patch.date = data.date
  if (data.venue !== undefined) patch.venue = data.venue
  if (data.city !== undefined) patch.city = data.city
  if (data.totalBudget !== undefined)
    patch.total_budget = data.totalBudget
  const { error } = await supabase.from('weddings').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteWedding(id: number): Promise<void> {
  const { error } = await supabase.from('weddings').delete().eq('id', id)
  if (error) throw error
}

// ─── CEREMONIES ───────────────────────────────────────────────────────────────

export async function getCeremonies(weddingId: number): Promise<Ceremony[]> {
  const { data, error } = await supabase
    .from('ceremonies')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => toCeremony(r as Record<string, unknown>))
}

export async function addCeremony(data: Omit<Ceremony, 'id'>): Promise<number> {
  const userId = await getUserId()
  const { data: row, error } = await supabase
    .from('ceremonies')
    .insert({
      user_id: userId,
      wedding_id: data.weddingId,
      name: data.name,
      date: data.date,
      time: data.time,
      location: data.location,
      guests: data.guests,
      side: data.side,
      status: data.status,
    })
    .select('id')
    .single()
  if (error) throw error
  return (row as { id: number }).id
}

export async function updateCeremony(id: number, data: Partial<Ceremony>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (data.name !== undefined) patch.name = data.name
  if (data.date !== undefined) patch.date = data.date
  if (data.time !== undefined) patch.time = data.time
  if (data.location !== undefined) patch.location = data.location
  if (data.guests !== undefined) patch.guests = data.guests
  if (data.side !== undefined) patch.side = data.side
  if (data.status !== undefined) patch.status = data.status
  if (data.weddingId !== undefined) patch.wedding_id = data.weddingId
  const { error } = await supabase.from('ceremonies').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteCeremony(id: number): Promise<void> {
  const { error } = await supabase.from('ceremonies').delete().eq('id', id)
  if (error) throw error
}

// ─── VENDORS ──────────────────────────────────────────────────────────────────

export async function getVendors(weddingId: number): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => toVendor(r as Record<string, unknown>))
}

export async function addVendor(data: Omit<Vendor, 'id'>): Promise<number> {
  const userId = await getUserId()
  const { data: row, error } = await supabase
    .from('vendors')
    .insert({
      user_id: userId,
      wedding_id: data.weddingId,
      name: data.name,
      category: data.category,
      city: data.city,
      amount: data.amount,
      pay_status: data.payStatus,
      phone: data.phone,
      detail: data.detail,
    })
    .select('id')
    .single()
  if (error) throw error
  return (row as { id: number }).id
}

export async function updateVendor(id: number, data: Partial<Vendor>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (data.name !== undefined) patch.name = data.name
  if (data.category !== undefined) patch.category = data.category
  if (data.city !== undefined) patch.city = data.city
  if (data.amount !== undefined) patch.amount = data.amount
  if (data.payStatus !== undefined) patch.pay_status = data.payStatus
  if (data.phone !== undefined) patch.phone = data.phone
  if (data.detail !== undefined) patch.detail = data.detail
  if (data.weddingId !== undefined) patch.wedding_id = data.weddingId
  const { error } = await supabase.from('vendors').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteVendor(id: number): Promise<void> {
  const { error } = await supabase.from('vendors').delete().eq('id', id)
  if (error) throw error
}

// ─── GUESTS ───────────────────────────────────────────────────────────────────

export async function getGuests(weddingId: number): Promise<Guest[]> {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => toGuest(r as Record<string, unknown>))
}

export async function addGuest(data: Omit<Guest, 'id'>): Promise<number> {
  const userId = await getUserId()
  const { data: row, error } = await supabase
    .from('guests')
    .insert({
      user_id: userId,
      wedding_id: data.weddingId,
      name: data.name,
      side: data.side,
      relation: data.relation,
      ceremonies: data.ceremonies,
      rsvp: data.rsvp,
      transport: data.transport,
      food: data.food,
      phone: data.phone ?? '',
      room_number: data.roomNumber ?? '',
      checked_in: data.checkedIn ?? false,
    })
    .select('id')
    .single()
  if (error) throw error
  return (row as { id: number }).id
}

export async function updateGuest(id: number, data: Partial<Guest>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (data.name !== undefined) patch.name = data.name
  if (data.side !== undefined) patch.side = data.side
  if (data.relation !== undefined) patch.relation = data.relation
  if (data.ceremonies !== undefined) patch.ceremonies = data.ceremonies
  if (data.rsvp !== undefined) patch.rsvp = data.rsvp
  if (data.transport !== undefined) patch.transport = data.transport
  if (data.food !== undefined) patch.food = data.food
  if (data.phone !== undefined) patch.phone = data.phone
  if (data.roomNumber !== undefined) patch.room_number = data.roomNumber
  if (data.checkedIn !== undefined) patch.checked_in = data.checkedIn
  if (data.weddingId !== undefined) patch.wedding_id = data.weddingId
  const { error } = await supabase.from('guests').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteGuest(id: number): Promise<void> {
  const { error } = await supabase.from('guests').delete().eq('id', id)
  if (error) throw error
}

export async function bulkAddGuests(guests: Omit<Guest, 'id'>[]): Promise<void> {
  const userId = await getUserId()
  const rows = guests.map(data => ({
    user_id: userId,
    wedding_id: data.weddingId,
    name: data.name,
    side: data.side,
    relation: data.relation,
    ceremonies: data.ceremonies,
    rsvp: data.rsvp,
    transport: data.transport,
    food: data.food,
    phone: data.phone ?? '',
    room_number: data.roomNumber ?? '',
    checked_in: data.checkedIn ?? false,
  }))
  const { error } = await supabase.from('guests').insert(rows)
  if (error) throw error
}

// ─── BUDGET ───────────────────────────────────────────────────────────────────

export async function getBudget(weddingId: number): Promise<BudgetCategory[]> {
  const { data, error } = await supabase
    .from('budget_categories')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => toBudgetCategory(r as Record<string, unknown>))
}

export async function addBudgetCategory(data: Omit<BudgetCategory, 'id'>): Promise<number> {
  const userId = await getUserId()
  const { data: row, error } = await supabase
    .from('budget_categories')
    .insert({
      user_id: userId,
      wedding_id: data.weddingId,
      category: data.category,
      spent: data.spent,
      total: data.total,
    })
    .select('id')
    .single()
  if (error) throw error
  return (row as { id: number }).id
}

export async function updateBudgetCategory(id: number, data: Partial<BudgetCategory>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (data.category !== undefined) patch.category = data.category
  if (data.spent !== undefined) patch.spent = data.spent
  if (data.total !== undefined) patch.total = data.total
  if (data.weddingId !== undefined) patch.wedding_id = data.weddingId
  const { error } = await supabase.from('budget_categories').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteBudgetCategory(id: number): Promise<void> {
  const { error } = await supabase.from('budget_categories').delete().eq('id', id)
  if (error) throw error
}

// ─── TASKS ────────────────────────────────────────────────────────────────────

export async function getTasks(weddingId: number): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => toTask(r as Record<string, unknown>))
}

export async function addTask(data: Omit<Task, 'id'>): Promise<number> {
  const userId = await getUserId()
  const { data: row, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      wedding_id: data.weddingId,
      type: data.type,
      label: data.label,
      who: data.who,
      done: data.done,
    })
    .select('id')
    .single()
  if (error) throw error
  return (row as { id: number }).id
}

export async function updateTask(id: number, data: Partial<Task>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (data.type !== undefined) patch.type = data.type
  if (data.label !== undefined) patch.label = data.label
  if (data.who !== undefined) patch.who = data.who
  if (data.done !== undefined) patch.done = data.done
  if (data.weddingId !== undefined) patch.wedding_id = data.weddingId
  const { error } = await supabase.from('tasks').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: number): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function bulkAddTasks(tasks: Omit<Task, 'id'>[]): Promise<void> {
  const userId = await getUserId()
  const rows = tasks.map(data => ({
    user_id: userId,
    wedding_id: data.weddingId,
    type: data.type,
    label: data.label,
    who: data.who,
    done: data.done,
  }))
  const { error } = await supabase.from('tasks').insert(rows)
  if (error) throw error
}

// ─── VENDOR LIBRARY ───────────────────────────────────────────────────────────

export async function getVendorLib(): Promise<VendorLib[]> {
  const { data, error } = await supabase
    .from('vendor_library')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => toVendorLib(r as Record<string, unknown>))
}

export async function addVendorLib(data: Omit<VendorLib, 'id'>): Promise<number> {
  const userId = await getUserId()
  const { data: row, error } = await supabase
    .from('vendor_library')
    .insert({
      user_id: userId,
      name: data.name,
      category: data.category,
      city: data.city,
      phone: data.phone,
      detail: data.detail,
      rating: data.rating,
      used_in: data.usedIn ?? [],
    })
    .select('id')
    .single()
  if (error) throw error
  return (row as { id: number }).id
}

export async function updateVendorLib(id: number, data: Partial<VendorLib>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (data.name !== undefined) patch.name = data.name
  if (data.category !== undefined) patch.category = data.category
  if (data.city !== undefined) patch.city = data.city
  if (data.phone !== undefined) patch.phone = data.phone
  if (data.detail !== undefined) patch.detail = data.detail
  if (data.rating !== undefined) patch.rating = data.rating
  if (data.usedIn !== undefined) patch.used_in = data.usedIn
  const { error } = await supabase.from('vendor_library').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteVendorLib(id: number): Promise<void> {
  const { error } = await supabase.from('vendor_library').delete().eq('id', id)
  if (error) throw error
}

export async function countVendorLib(): Promise<number> {
  const { count, error } = await supabase
    .from('vendor_library')
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

// ─── TIMELINE ─────────────────────────────────────────────────────────────────

export async function getTimeline(weddingId: number): Promise<TimelineItem[]> {
  const { data, error } = await supabase
    .from('timeline')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => toTimelineItem(r as Record<string, unknown>))
}

export async function addTimelineItem(data: Omit<TimelineItem, 'id'>): Promise<number> {
  const userId = await getUserId()
  const { data: row, error } = await supabase
    .from('timeline')
    .insert({
      user_id: userId,
      wedding_id: data.weddingId,
      day: data.day,
      time: data.time,
      text: data.text,
      sub: data.sub,
      color: data.color,
      sort_order: data.sortOrder,
    })
    .select('id')
    .single()
  if (error) throw error
  return (row as { id: number }).id
}

export async function updateTimelineItem(id: number, data: Partial<TimelineItem>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (data.day !== undefined) patch.day = data.day
  if (data.time !== undefined) patch.time = data.time
  if (data.text !== undefined) patch.text = data.text
  if (data.sub !== undefined) patch.sub = data.sub
  if (data.color !== undefined) patch.color = data.color
  if (data.sortOrder !== undefined) patch.sort_order = data.sortOrder
  if (data.weddingId !== undefined) patch.wedding_id = data.weddingId
  const { error } = await supabase.from('timeline').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteTimelineItem(id: number): Promise<void> {
  const { error } = await supabase.from('timeline').delete().eq('id', id)
  if (error) throw error
}

export async function bulkAddTimeline(items: Omit<TimelineItem, 'id'>[]): Promise<void> {
  const userId = await getUserId()
  const rows = items.map(data => ({
    user_id: userId,
    wedding_id: data.weddingId,
    day: data.day,
    time: data.time,
    text: data.text,
    sub: data.sub,
    color: data.color,
    sort_order: data.sortOrder,
  }))
  const { error } = await supabase.from('timeline').insert(rows)
  if (error) throw error
}

export async function countTimeline(weddingId: number): Promise<number> {
  const { count, error } = await supabase
    .from('timeline')
    .select('*', { count: 'exact', head: true })
    .eq('wedding_id', weddingId)
  if (error) throw error
  return count ?? 0
}

// ─── SEED ─────────────────────────────────────────────────────────────────────

export async function seedIfEmpty(): Promise<Wedding[]> {
  const ws = await getWeddings()
  if (ws.length > 0) return ws

  const wId = await addWedding({ name: 'Sharma × Agarwal', date: '2025-06-14', venue: 'Jai Mahal Palace', city: 'Jaipur' })

  const userId = await getUserId()

  const ceremonies = [
    { user_id: userId, wedding_id: wId, name: 'Mehendi Ceremony', date: '12 Jun', time: '4:00 PM', location: "Bride's residence", guests: 80, side: "Bride's side", status: 'upcoming' },
    { user_id: userId, wedding_id: wId, name: 'Sangeet Night', date: '13 Jun', time: '7:00 PM', location: 'Jai Mahal Palace Lawns', guests: 220, side: 'Both sides', status: 'upcoming' },
    { user_id: userId, wedding_id: wId, name: 'Baraat Procession', date: '14 Jun', time: '10:00 AM', location: "Groom's house → Venue", guests: 150, side: "Groom's side", status: 'upcoming' },
    { user_id: userId, wedding_id: wId, name: 'Pheras (Main Ceremony)', date: '14 Jun', time: '12:00 PM', location: 'Mandap, Jai Mahal Palace', guests: 347, side: 'Both sides', status: 'upcoming' },
    { user_id: userId, wedding_id: wId, name: 'Vidaai', date: '14 Jun', time: '5:30 PM', location: 'Main Gate', guests: 347, side: 'Both sides', status: 'upcoming' },
    { user_id: userId, wedding_id: wId, name: 'Reception', date: '14 Jun', time: '7:00 PM', location: 'Banquet Hall', guests: 347, side: 'Both sides', status: 'upcoming' },
  ]
  const vendors = [
    { user_id: userId, wedding_id: wId, name: 'Jai Mahal Palace', category: 'Venue', city: 'Jaipur', amount: 650000, pay_status: 'paid', phone: '9876543210', detail: 'Venue & Mandap' },
    { user_id: userId, wedding_id: wId, name: 'Regal Caterers', category: 'Catering', city: 'Jaipur', amount: 820000, pay_status: 'advance', phone: '9001234567', detail: '350 pax · Veg+Jain' },
    { user_id: userId, wedding_id: wId, name: 'Kapoor Clicks', category: 'Photography', city: 'Jaipur', amount: 250000, pay_status: 'advance', phone: '9812345678', detail: 'Photo + Cinematic Video' },
    { user_id: userId, wedding_id: wId, name: 'Pushp Shajar', category: 'Décor', city: 'Jaipur', amount: 180000, pay_status: 'pending', phone: '', detail: 'Flowers & Theme Décor' },
    { user_id: userId, wedding_id: wId, name: 'Dhol Wale Ustaad', category: 'Music', city: 'Jaipur', amount: 45000, pay_status: 'paid', phone: '9988776655', detail: 'Dhol + Brass Band' },
    { user_id: userId, wedding_id: wId, name: 'Pandit Rameshwar', category: 'Pandit', city: 'Jaipur', amount: 21000, pay_status: 'paid', phone: '', detail: 'Pheras & all rituals' },
    { user_id: userId, wedding_id: wId, name: 'Shruti Makeovers', category: 'Makeup', city: 'Jaipur', amount: 55000, pay_status: 'advance', phone: '9876501234', detail: 'Bridal Makeup + Hair' },
    { user_id: userId, wedding_id: wId, name: 'Royal Travels', category: 'Transport', city: 'Jaipur', amount: 80000, pay_status: 'pending', phone: '9111222333', detail: '4 coaches booked' },
  ]
  const guests = [
    { user_id: userId, wedding_id: wId, name: 'Rajesh Agarwal', side: 'Groom', relation: 'Chacha ji', ceremonies: 'All', rsvp: 'Yes', transport: 'Self', food: 'Jain', phone: '9876500001', room_number: '101', checked_in: true },
    { user_id: userId, wedding_id: wId, name: 'Sunita Sharma', side: 'Bride', relation: 'Mausi ji', ceremonies: 'Sangeet, Pheras', rsvp: 'Yes', transport: 'Coach A', food: 'Veg', phone: '9876500002', room_number: '102', checked_in: true },
    { user_id: userId, wedding_id: wId, name: 'Vikram Verma', side: 'Groom', relation: 'College friend', ceremonies: 'Baraat, Sangeet', rsvp: 'Awaited', transport: '—', food: 'Veg', phone: '9876500003', room_number: '', checked_in: false },
    { user_id: userId, wedding_id: wId, name: 'Priya Gupta', side: 'Bride', relation: 'Best friend', ceremonies: 'Mehendi, Sangeet', rsvp: 'Yes', transport: 'Self', food: 'Veg', phone: '9876500004', room_number: '205', checked_in: true },
    { user_id: userId, wedding_id: wId, name: 'Mohanlal Jain', side: 'Both', relation: 'Parivar mitra', ceremonies: 'Pheras, Reception', rsvp: 'No', transport: '—', food: 'Jain', phone: '', room_number: '', checked_in: false },
    { user_id: userId, wedding_id: wId, name: 'Kavita Patel', side: 'Groom', relation: 'Bua ji', ceremonies: 'All', rsvp: 'Yes', transport: 'Coach B', food: 'Veg', phone: '9876500006', room_number: '', checked_in: false },
    { user_id: userId, wedding_id: wId, name: 'Deepak Sharma', side: 'Bride', relation: 'Bhaiya', ceremonies: 'All', rsvp: 'Yes', transport: 'Self', food: 'Veg', phone: '9876500007', room_number: '310', checked_in: true },
    { user_id: userId, wedding_id: wId, name: 'Anita Mehta', side: 'Bride', relation: 'Padosan', ceremonies: 'Mehendi, Reception', rsvp: 'Awaited', transport: '—', food: 'Veg', phone: '9876500008', room_number: '', checked_in: false },
  ]
  const budget = [
    { user_id: userId, wedding_id: wId, category: '🍽️ Catering', spent: 820000, total: 900000 },
    { user_id: userId, wedding_id: wId, category: '🎪 Venue & Mandap', spent: 650000, total: 700000 },
    { user_id: userId, wedding_id: wId, category: '👗 Bridal Trousseau', spent: 420000, total: 500000 },
    { user_id: userId, wedding_id: wId, category: '💍 Jewellery & Gifts', spent: 300000, total: 400000 },
    { user_id: userId, wedding_id: wId, category: '📸 Photography & Video', spent: 250000, total: 300000 },
    { user_id: userId, wedding_id: wId, category: '🌸 Flowers & Décor', spent: 180000, total: 200000 },
    { user_id: userId, wedding_id: wId, category: '🎵 Music & DJ & Band', spent: 140000, total: 150000 },
    { user_id: userId, wedding_id: wId, category: '🚌 Guest Transport', spent: 80000, total: 100000 },
    { user_id: userId, wedding_id: wId, category: '🛍️ Return Gifts', spent: 87500, total: 100000 },
    { user_id: userId, wedding_id: wId, category: '💄 Makeup & Misc', spent: 112500, total: 150000 },
  ]
  const tasks = [
    { user_id: userId, wedding_id: wId, type: 'pre', label: 'Book venue & confirm dates', who: 'Manager', done: true },
    { user_id: userId, wedding_id: wId, type: 'pre', label: 'Confirm pandit & muhurat', who: 'Family', done: true },
    { user_id: userId, wedding_id: wId, type: 'pre', label: 'Book photography team', who: 'Manager', done: true },
    { user_id: userId, wedding_id: wId, type: 'pre', label: 'Finalise caterer & menu', who: 'Manager', done: true },
    { user_id: userId, wedding_id: wId, type: 'pre', label: 'Book Dhol wala for baraat', who: 'Manager', done: true },
    { user_id: userId, wedding_id: wId, type: 'pre', label: 'Print & distribute invites', who: 'Family', done: true },
    { user_id: userId, wedding_id: wId, type: 'pre', label: 'Pay Pushp Shajar ₹50K advance', who: 'Manager', done: false },
    { user_id: userId, wedding_id: wId, type: 'pre', label: 'Arrange 4 guest coaches', who: 'Rohit', done: false },
    { user_id: userId, wedding_id: wId, type: 'pre', label: 'Send digital invites to pending guests', who: 'Priya', done: false },
    { user_id: userId, wedding_id: wId, type: 'day', label: 'Verify mandap & décor by 7 AM', who: 'Manager', done: false },
    { user_id: userId, wedding_id: wId, type: 'day', label: 'Brief catering team on Jain section', who: 'Manager', done: false },
    { user_id: userId, wedding_id: wId, type: 'day', label: 'Receive baraat at main gate', who: 'Suresh', done: false },
    { user_id: userId, wedding_id: wId, type: 'day', label: 'Coordinate Jaimala photo positions', who: 'Manager', done: false },
    { user_id: userId, wedding_id: wId, type: 'day', label: 'Manage Pheras timing with pandit', who: 'Manager', done: false },
  ]
  const timeline = [
    { user_id: userId, wedding_id: wId, day: 'main', time: '7:00 AM', text: 'Mandap & venue setup check', sub: 'Manager arrives · Verify décor, sound, seating', color: 'var(--teal)', sort_order: 1 },
    { user_id: userId, wedding_id: wId, day: 'main', time: '8:30 AM', text: 'Bridal makeup begins', sub: "Bridal team · Bride's room", color: 'var(--amber)', sort_order: 2 },
    { user_id: userId, wedding_id: wId, day: 'main', time: '10:00 AM', text: 'Baraat starts 🐎', sub: "Dhol band + Ghodi · Groom's house", color: 'var(--amber)', sort_order: 3 },
    { user_id: userId, wedding_id: wId, day: 'main', time: '11:00 AM', text: 'Baraat arrives at venue', sub: 'Welcome with tika · Flower shower', color: 'var(--coral)', sort_order: 4 },
    { user_id: userId, wedding_id: wId, day: 'main', time: '11:30 AM', text: 'Jaimala & Milni 🌸', sub: 'Main entrance · Garland exchange · Photo session', color: 'var(--pink)', sort_order: 5 },
    { user_id: userId, wedding_id: wId, day: 'main', time: '12:00 PM', text: 'Pheras begin 🔥', sub: 'Pandit ji · Mandap · ~2.5 hours', color: 'var(--purple)', sort_order: 6 },
    { user_id: userId, wedding_id: wId, day: 'main', time: '1:30 PM', text: 'Lunch buffet opens', sub: 'Caterers · All guests invited to dining area', color: 'var(--amber)', sort_order: 7 },
    { user_id: userId, wedding_id: wId, day: 'main', time: '2:30 PM', text: 'Pheras conclude · Sindoor 💞', sub: 'Saptapadi complete · Family blessings', color: 'var(--purple)', sort_order: 8 },
    { user_id: userId, wedding_id: wId, day: 'main', time: '5:30 PM', text: 'Vidaai 🚪', sub: 'Emotional farewell · Decorated car · Bride departs', color: 'var(--pink)', sort_order: 9 },
    { user_id: userId, wedding_id: wId, day: 'main', time: '7:00 PM', text: 'Reception begins 🎉', sub: 'Banquet Hall · DJ night · Dinner for all', color: 'var(--teal)', sort_order: 10 },
    { user_id: userId, wedding_id: wId, day: 'pre', time: '12 Jun · 4:00 PM', text: 'Mehendi Ceremony 🌿', sub: "~80 guests · Bride's side · Mehendi artists booked", color: 'var(--teal)', sort_order: 1 },
    { user_id: userId, wedding_id: wId, day: 'pre', time: '12 Jun · 8:00 PM', text: 'Mehendi dinner', sub: 'Family gathering · Light dinner at residence', color: 'var(--teal)', sort_order: 2 },
    { user_id: userId, wedding_id: wId, day: 'pre', time: '13 Jun · 2:00 PM', text: "Haldi — Bride's side 🌸", sub: 'Intimate ceremony · Immediate family only', color: 'var(--purple)', sort_order: 3 },
    { user_id: userId, wedding_id: wId, day: 'pre', time: '13 Jun · 3:00 PM', text: "Haldi — Groom's side 🌸", sub: "Groom's house · Friends + family · DJ", color: 'var(--amber)', sort_order: 4 },
    { user_id: userId, wedding_id: wId, day: 'pre', time: '13 Jun · 7:00 PM', text: 'Sangeet Night 🎵', sub: 'Jai Mahal Palace Lawns · DJ · ~220 guests', color: 'var(--pink)', sort_order: 5 },
  ]
  const vendorLib = [
    { user_id: userId, name: 'Jai Mahal Palace', category: 'Venue', city: 'Jaipur', phone: '9876543210', detail: 'Luxury heritage venue', rating: 5, used_in: ['Sharma × Agarwal'] },
    { user_id: userId, name: 'Regal Caterers', category: 'Catering', city: 'Jaipur', phone: '9001234567', detail: 'Veg+Jain · 350+ pax', rating: 4, used_in: ['Sharma × Agarwal'] },
    { user_id: userId, name: 'Kapoor Clicks', category: 'Photography', city: 'Jaipur', phone: '9812345678', detail: 'Photo + Cinematic Video', rating: 5, used_in: ['Sharma × Agarwal'] },
    { user_id: userId, name: 'Pushp Shajar', category: 'Décor', city: 'Jaipur', phone: '', detail: 'Flowers & Theme Décor', rating: 4, used_in: ['Sharma × Agarwal'] },
    { user_id: userId, name: 'Dhol Wale Ustaad', category: 'Music', city: 'Jaipur', phone: '9988776655', detail: 'Dhol + Brass Band for baraat', rating: 5, used_in: ['Sharma × Agarwal'] },
    { user_id: userId, name: 'Fateh Prakash Palace', category: 'Venue', city: 'Udaipur', phone: '9887766554', detail: 'Lakeside royal venue', rating: 5, used_in: [] },
    { user_id: userId, name: 'Lake City Caterers', category: 'Catering', city: 'Udaipur', phone: '9877654321', detail: 'Multi-cuisine 500+ pax', rating: 4, used_in: [] },
    { user_id: userId, name: 'Royal Film Studio', category: 'Photography', city: 'Udaipur', phone: '9765432198', detail: 'Drone + photo + video', rating: 5, used_in: [] },
    { user_id: userId, name: 'Mumbai Moments', category: 'Photography', city: 'Mumbai', phone: '9654321087', detail: 'Candid & cinematic', rating: 5, used_in: [] },
    { user_id: userId, name: 'Grand Hyatt Banquet', category: 'Venue', city: 'Mumbai', phone: '9543210976', detail: 'Premium ballroom', rating: 5, used_in: [] },
    { user_id: userId, name: 'Kota Shaadi Caterers', category: 'Catering', city: 'Kota', phone: '9432109865', detail: 'Rajasthani thali specialists', rating: 4, used_in: [] },
    { user_id: userId, name: 'Rajput Décor Kota', category: 'Décor', city: 'Kota', phone: '', detail: 'Traditional & modern décor', rating: 4, used_in: [] },
  ]

  await Promise.all([
    supabase.from('ceremonies').insert(ceremonies),
    supabase.from('vendors').insert(vendors),
    supabase.from('guests').insert(guests),
    supabase.from('budget_categories').insert(budget),
    supabase.from('tasks').insert(tasks),
    supabase.from('timeline').insert(timeline),
    supabase.from('vendor_library').insert(vendorLib),
  ])

  return await getWeddings()
}
