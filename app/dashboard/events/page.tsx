import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import EventForm from '@/components/EventForm';
import { getSocietyEvents, getUpcomingEvents, getEventStats } from '@/lib/eventsData';

export default async function EventsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
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

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userProfile) redirect('/login');

  // Get events and stats
  const [upcomingEvents, allEvents, stats] = await Promise.all([
    getUpcomingEvents(userProfile.society_id, 10),
    getSocietyEvents(userProfile.society_id, true),
    getEventStats(userProfile.society_id),
  ]);

  const canCreateEvents = ['admin', 'sub_admin', 'manager'].includes(userProfile.role);

  const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
    social: { bg: 'bg-pink-50', text: 'text-pink-700', icon: '🎉' },
    maintenance: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '🔧' },
    meeting: { bg: 'bg-green-50', text: 'text-green-700', icon: '👥' },
    celebration: { bg: 'bg-purple-50', text: 'text-purple-700', icon: '🎊' },
    other: { bg: 'bg-gray-50', text: 'text-gray-700', icon: '📅' },
  };

  const categoryBadgeColors: Record<string, string> = {
    social: 'bg-pink-100 text-pink-800',
    maintenance: 'bg-blue-100 text-blue-800',
    meeting: 'bg-green-100 text-green-800',
    celebration: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-600 mt-2">Stay connected with society events and gatherings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Upcoming Events</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.upcoming}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event - Admin Only */}
      {canCreateEvents && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EventForm societyId={userProfile.society_id} userId={user.id} />
          </div>

          {/* Quick Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-3">📅 Event Planning Tips</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Set clear dates and times</li>
              <li>✓ Include location details</li>
              <li>✓ Add descriptions for better attendance</li>
              <li>✓ Set max attendees if needed</li>
              <li>✓ Choose appropriate categories</li>
            </ul>
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
            <p className="text-gray-600">Check back later for new events in your society.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map(event => {
              const colors = categoryColors[event.category];
              const badgeColor = categoryBadgeColors[event.category];
              return (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                      {colors.icon} {event.category}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.event_date).toLocaleDateString()}
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>

                  {event.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>👤</span>
                      <span>{event.users?.name}</span>
                    </div>
                    {event.event_time && (
                      <div className="flex items-center gap-1">
                        <span>🕐</span>
                        <span>{event.event_time}</span>
                      </div>
                    )}
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                      <span>📍</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* All Events */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">All Events</h2>
        <div className="space-y-3">
          {allEvents.map(event => {
            const colors = categoryColors[event.category];
            const badgeColor = categoryBadgeColors[event.category];
            const isPast = new Date(event.event_date) < new Date();
            const isCancelled = event.is_cancelled;

            return (
              <div
                key={event.id}
                className={`rounded-lg p-4 border-l-4 ${
                  isCancelled
                    ? 'bg-gray-50 border-gray-300'
                    : isPast
                    ? 'bg-white border-gray-300'
                    : 'bg-white border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                        {colors.icon} {event.category}
                      </div>
                      {isCancelled && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          Cancelled
                        </span>
                      )}
                      {isPast && !isCancelled && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                          Past Event
                        </span>
                      )}
                    </div>

                    <h3 className={`font-bold mb-1 ${isCancelled ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                      </div>
                      {event.event_time && (
                        <div className="flex items-center gap-1">
                          <span>🕐</span>
                          <span>{event.event_time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span>👤</span>
                        <span>{event.users?.name}</span>
                      </div>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}