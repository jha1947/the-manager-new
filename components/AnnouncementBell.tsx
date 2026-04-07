'use client';

import { useState, useEffect } from 'react';
import { useAnnouncementUpdates } from '@/hooks/useAnnouncementUpdates';

interface AnnouncementBellProps {
  societyId: string | null;
}

export function AnnouncementBell({ societyId }: AnnouncementBellProps) {
  const { announcements, unreadCount, removeNotification } = useAnnouncementUpdates(societyId);
  const [isOpen, setIsOpen] = useState(false);
  const [displayedAnnouncements, setDisplayedAnnouncements] = useState<string[]>([]);

  // Auto-dismiss toasts after 6 seconds
  useEffect(() => {
    announcements.forEach(announcement => {
      if (!displayedAnnouncements.includes(announcement.id)) {
        setDisplayedAnnouncements(prev => [...prev, announcement.id]);

        const timeout = setTimeout(() => {
          removeNotification(announcement.id);
        }, 6000);

        return () => clearTimeout(timeout);
      }
    });
  }, [announcements, displayedAnnouncements, removeNotification]);

  const categoryEmojis: Record<string, string> = {
    maintenance: '🔧',
    event: '🎉',
    urgent: '🚨',
    general: '📢',
  };

  const categoryColors: Record<string, string> = {
    maintenance: 'from-blue-50 to-blue-100 border-l-4 border-blue-400',
    event: 'from-purple-50 to-purple-100 border-l-4 border-purple-400',
    urgent: 'from-red-50 to-red-100 border-l-4 border-red-400',
    general: 'from-green-50 to-green-100 border-l-4 border-green-400',
  };

  return (
    <>
      {/* Bell Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition"
          aria-label="Announcements"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5.882V19.24a1.961 1.961 0 01-2.051 1.969c-.168 0-.336-.079-.484-.23L5.5 15M19 13a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4"
            />
          </svg>

          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-purple-600 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Announcements</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-600 mt-1">{unreadCount} new announcement{unreadCount > 1 ? 's' : ''}</p>
              )}
            </div>

            {announcements.length > 0 ? (
              <div className="divide-y divide-gray-200 p-2">
                {announcements.map(announcement => (
                  <div
                    key={announcement.id}
                    className={`bg-gradient-to-r ${categoryColors[announcement.category] || categoryColors.general} rounded-lg p-3 hover:shadow-md transition mb-2`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{categoryEmojis[announcement.category] || '📢'}</span>
                          <p className="font-medium text-gray-900 text-sm">{announcement.title}</p>
                        </div>
                        <p className="text-gray-700 text-xs mt-1">
                          {new Date(announcement.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeNotification(announcement.id)}
                        className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No new announcements
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-40">
        {announcements.slice(0, 2).map(announcement => (
          displayedAnnouncements.includes(announcement.id) && (
            <div
              key={announcement.id}
              className={`bg-gradient-to-r ${categoryColors[announcement.category] || categoryColors.general} rounded-lg shadow-lg p-4 max-w-sm animate-slide-up`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{categoryEmojis[announcement.category] || '📢'}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{announcement.title}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Just now
                  </p>
                </div>
                <button
                  onClick={() => removeNotification(announcement.id)}
                  className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </>
  );
}
