import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface EventNotification {
  id: string;
  title: string;
  category: 'social' | 'maintenance' | 'meeting' | 'celebration' | 'other';
  timestamp: Date;
}

export function useEventUpdates(societyId: string | null) {
  const [events, setEvents] = useState<EventNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const removeNotification = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    if (!societyId) return;

    // Subscribe to new events
    const channel = supabase
      .channel(`events-${societyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `society_id=eq.${societyId}`,
        },
        (payload: any) => {
          const newEvent: EventNotification = {
            id: payload.new.id,
            title: payload.new.title,
            category: payload.new.category,
            timestamp: new Date(),
          };

          setEvents(prev => [newEvent, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [societyId]);

  return {
    events,
    unreadCount,
    removeNotification,
  };
}