import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface Event {
  id: string;
  society_id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  organizer_id: string;
  category: 'social' | 'maintenance' | 'meeting' | 'celebration' | 'other';
  max_attendees?: number;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
  users?: { name: string; role: string };
  rsvp_count?: number;
  user_rsvp?: { status: 'attending' | 'maybe' | 'declined' };
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: 'attending' | 'maybe' | 'declined';
  created_at: string;
  updated_at: string;
}

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (e) {}
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete(name);
          } catch (e) {}
        },
      },
    }
  );
}

export async function getSocietyEvents(societyId: string, includePast: boolean = false) {
  const supabase = await getSupabaseClient();

  let query = supabase
    .from('events')
    .select(`
      *,
      users!organizer_id(name, role),
      event_rsvps(count)
    `)
    .eq('society_id', societyId)
    .eq('is_cancelled', false)
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true });

  if (!includePast) {
    const today = new Date().toISOString().split('T')[0];
    query = query.gte('event_date', today);
  }

  const { data } = await query;
  return (data as Event[]) || [];
}

export async function getEventById(id: string, userId?: string) {
  const supabase = await getSupabaseClient();

  let query = supabase
    .from('events')
    .select(`
      *,
      users!organizer_id(name, role),
      event_rsvps(count)
    `)
    .eq('id', id)
    .single();

  const { data: eventData } = await query;

  if (!eventData) return null;

  // Get user's RSVP if userId provided
  let userRsvp = null;
  if (userId) {
    const { data: rsvpData } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', id)
      .eq('user_id', userId)
      .single();

    userRsvp = rsvpData;
  }

  // Get all RSVPs for the event
  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select(`
      *,
      users!user_id(name)
    `)
    .eq('event_id', id);

  return {
    ...eventData,
    user_rsvp: userRsvp,
    rsvps: rsvps || [],
  } as Event & { rsvps: Array<EventRSVP & { users: { name: string } }> };
}

export async function getUpcomingEvents(societyId: string, limit: number = 5) {
  const supabase = await getSupabaseClient();

  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('events')
    .select(`
      *,
      users!organizer_id(name, role),
      event_rsvps(count)
    `)
    .eq('society_id', societyId)
    .eq('is_cancelled', false)
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })
    .limit(limit);

  return (data as Event[]) || [];
}

export async function getEventStats(societyId: string) {
  const supabase = await getSupabaseClient();

  const today = new Date().toISOString().split('T')[0];

  const [{ count: totalCount }, { count: upcomingCount }] = await Promise.all([
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('society_id', societyId)
      .eq('is_cancelled', false),
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('society_id', societyId)
      .eq('is_cancelled', false)
      .gte('event_date', today),
  ]);

  return {
    total: totalCount || 0,
    upcoming: upcomingCount || 0,
  };
}

export async function createEvent(eventData: {
  society_id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  organizer_id: string;
  category: 'social' | 'maintenance' | 'meeting' | 'celebration' | 'other';
  max_attendees?: number;
}) {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function updateEventRSVP(eventId: string, userId: string, status: 'attending' | 'maybe' | 'declined') {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from('event_rsvps')
    .upsert({
      event_id: eventId,
      user_id: userId,
      status,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as EventRSVP;
}

export async function cancelEvent(eventId: string) {
  const supabase = await getSupabaseClient();

  const { error } = await supabase
    .from('events')
    .update({ is_cancelled: true, updated_at: new Date().toISOString() })
    .eq('id', eventId);

  if (error) throw error;
}