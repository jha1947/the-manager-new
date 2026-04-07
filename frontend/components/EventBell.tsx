'use client';

import { useState, useEffect } from 'react';
import { useEventUpdates } from '@/hooks/useEventUpdates';

interface EventBellProps {
  societyId: string | null;
}

export function EventBell({ societyId }: EventBellProps) {
  const { events, unreadCount, removeNotification } = useEventUpdates(societyId);
  const [isOpen, setIsOpen] = useState(false);
  const [displayedEvents, setDisplayedEvents] = useState<string[]>([]);

  // Auto-dismiss toasts after 6 seconds
  useEffect(() => {
    events.forEach(event => {
      if (!displayedEvents.includes(event.id)) {
        setDisplayedEvents(prev => [...prev, event.id]);

        const timeout = setTimeout(() => {
          removeNotification(event.id);
        }, 6000);

        return () => clearTimeout(timeout);
      }
    });
  }, [events, displayedEvents, removeNotification]);

  const categoryEmojis: Record<string, string> = {
    social: '🎉',
    maintenance: '🔧',
    meeting: '👥',
    celebration: '🎊',
    other: '📅',
  };

  const categoryColors: Record<string, string> = {
    social: 'from-pink-50 to-pink-100 border-l-4 border-pink-400',
    maintenance: 'from-blue-50 to-blue-100 border-l-4 border-blue-400',
    meeting: 'from-green-50 to-green-100 border-l-4 border-green-400',
    celebration: 'from-purple-50 to-purple-100 border-l-4 border-purple-400',
    other: 'from-gray-50 to-gray-100 border-l-4 border-gray-400',
  };

  return (
    <>
      {/* Bell Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-5-5V7a3 3 0 00-6 0v5l-5 5h5m0 0v1a3 3 0 006 0v-1m-6 0h6"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">New Events</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No new events
              </div>
            ) : (
              events.map(event => (
                <div
                  key={event.id}
                  className={`p-4 border-b border-gray-100 last:border-b-0 bg-gradient-to-r ${categoryColors[event.category]}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{categoryEmojis[event.category]}</span>
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          {event.category}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {event.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeNotification(event.id)}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-200">
            <a
              href="/dashboard/events"
              className="block w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              View All Events →
            </a>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {events.slice(0, 3).map(event => (
          <div
            key={`toast-${event.id}`}
            className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 transform transition-all duration-300 ease-in-out bg-gradient-to-r ${categoryColors[event.category]}`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{categoryEmojis[event.category]}</span>
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New Event: {event.category}
                  </p>
                  <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                    {event.title}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => removeNotification(event.id)}
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}