import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface ComplaintNotification {
  id: string;
  type: 'new' | 'updated' | 'resolved';
  title: string;
  message: string;
  timestamp: Date;
}

export function useComplaintNotifications(societyId: string | null, userId: string | null) {
  const [notifications, setNotifications] = useState<ComplaintNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    if (!societyId || !userId) return;

    // Subscribe to changes on the complaints table
    const channel = supabase
      .channel(`complaints-${societyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `society_id=eq.${societyId}`
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newComplaint = payload.new;
            const notification: ComplaintNotification = {
              id: newComplaint.id,
              type: 'new',
              title: 'New Complaint',
              message: `New complaint filed: "${newComplaint.title}"`,
              timestamp: new Date()
            };

            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
          } else if (payload.eventType === 'UPDATE') {
            const updatedComplaint = payload.new;
            const oldStatus = payload.old.status;

            if (oldStatus !== updatedComplaint.status) {
              const notification: ComplaintNotification = {
                id: updatedComplaint.id,
                type: 'updated',
                title: 'Complaint Updated',
                message: `Complaint status changed to: ${updatedComplaint.status}`,
                timestamp: new Date()
              };

              setNotifications(prev => [notification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [societyId, userId, supabase]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  return {
    notifications,
    unreadCount,
    clearNotifications,
    removeNotification
  };
}
