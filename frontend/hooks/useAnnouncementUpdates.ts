import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface AnnouncementNotification {
  id: string;
  title: string;
  category: 'maintenance' | 'event' | 'urgent' | 'general';
  timestamp: Date;
}

export function useAnnouncementUpdates(societyId: string | null) {
  const [announcements, setAnnouncements] = useState<AnnouncementNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    if (!societyId) return;

    // Subscribe to new announcements
    const channel = supabase
      .channel(`announcements-${societyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
          filter: `society_id=eq.${societyId}`,
        },
        (payload: any) => {
          const newAnnouncement: AnnouncementNotification = {
            id: payload.new.id,
            title: payload.new.title,
            category: payload.new.category,
            timestamp: new Date(),
          };

          setAnnouncements(prev => [newAnnouncement, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [societyId, supabase]);

  const clearNotifications = useCallback(() => {
    setAnnouncements([]);
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  return {
    announcements,
    unreadCount,
    clearNotifications,
    removeNotification,
  };
}
