import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface Announcement {
  id: string;
  society_id: string;
  title: string;
  content: string;
  category: 'maintenance' | 'event' | 'urgent' | 'general';
  created_by: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  expires_at?: string;
  users?: { full_name: string; role: string };
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

export async function getSocietyAnnouncements(
  societyId: string,
  limit: number = 50,
  includeExpired: boolean = false
) {
  const supabase = await getSupabaseClient();

  let query = supabase
    .from('announcements')
    .select('*, users!created_by(full_name, role)')
    .eq('society_id', societyId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!includeExpired) {
    const now = new Date().toISOString();
    query = query.or(`expires_at.is.null,expires_at.gt.${now}`);
  }

  const { data } = await query;
  return (data as Announcement[]) || [];
}

export async function getPinnedAnnouncements(societyId: string) {
  const supabase = await getSupabaseClient();

  const now = new Date().toISOString();
  const { data } = await supabase
    .from('announcements')
    .select('*, users!created_by(full_name, role)')
    .eq('society_id', societyId)
    .eq('is_pinned', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false });

  return (data as Announcement[]) || [];
}

export async function getAnnouncementsByCategory(
  societyId: string,
  category: 'maintenance' | 'event' | 'urgent' | 'general'
) {
  const supabase = await getSupabaseClient();

  const now = new Date().toISOString();
  const { data } = await supabase
    .from('announcements')
    .select('*, users!created_by(full_name, role)')
    .eq('society_id', societyId)
    .eq('category', category)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  return (data as Announcement[]) || [];
}

export async function getAnnouncementById(id: string) {
  const supabase = await getSupabaseClient();

  const { data } = await supabase
    .from('announcements')
    .select('*, users!created_by(full_name, role)')
    .eq('id', id)
    .single();

  return (data as Announcement) || null;
}

export async function getAnnouncementStats(societyId: string) {
  const supabase = await getSupabaseClient();

  const now = new Date().toISOString();

  const [{ count: totalCount }, { count: urgentCount }, { count: eventCount }] =
    await Promise.all([
      supabase
        .from('announcements')
        .select('id', { count: 'exact', head: true })
        .eq('society_id', societyId)
        .or(`expires_at.is.null,expires_at.gt.${now}`),
      supabase
        .from('announcements')
        .select('id', { count: 'exact', head: true })
        .eq('society_id', societyId)
        .eq('category', 'urgent')
        .or(`expires_at.is.null,expires_at.gt.${now}`),
      supabase
        .from('announcements')
        .select('id', { count: 'exact', head: true })
        .eq('society_id', societyId)
        .eq('category', 'event')
        .or(`expires_at.is.null,expires_at.gt.${now}`),
    ]);

  return {
    total: totalCount || 0,
    urgent: urgentCount || 0,
    events: eventCount || 0,
  };
}
