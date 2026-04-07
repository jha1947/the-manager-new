import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import EventRSVP from '@/components/EventRSVP';
import { getEventById } from '@/lib/eventsData';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EventDetailPage({ params }: PageProps) {
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

  // Get event details
  const event = await getEventById(params.id, user.id);

  if (!event) {
    notFound();
  }

  // Check if user has access to this event
  if (event.society_id !== userProfile.society_id) {
    notFound();
  }

  const canManageEvent = ['admin', 'sub_admin', 'manager'].includes(userProfile.role) ||
                        event.organizer_id === user.id;

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

  const colors = categoryColors[event.category];
  const badgeColor = categoryBadgeColors[event.category];

  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const isToday = eventDate.toDateString() === new Date().toDateString();

  // Calculate RSVP stats
  const rsvpStats = {
    attending: event.rsvps?.filter(rsvp => rsvp.status === 'attending').length || 0,
    maybe: event.rsvps?.filter(rsvp => rsvp.status === 'maybe').length || 0,
    declined: event.rsvps?.filter(rsvp => rsvp.status === 'declined').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/events"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 inline-block"
          >
            ← Back to Events
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor}`}>
              {colors.icon} {event.category}
            </span>
            {event.is_cancelled && (
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                Cancelled
              </span>
            )}
            {isToday && !event.is_cancelled && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Today
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {event.description && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About This Event</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Event Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Event Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">📅</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {eventDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {event.event_time && (
                    <p className="text-gray-600 text-sm">
                      {new Date(`2000-01-01T${event.event_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  )}
                </div>
              </div>

              {event.location && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">📍</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">👤</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Organizer</p>
                  <p className="text-gray-600">{event.users?.name}</p>
                </div>
              </div>

              {event.max_attendees && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600">👥</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Capacity</p>
                    <p className="text-gray-600">{rsvpStats.attending} / {event.max_attendees} attending</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RSVPs */}
          {event.rsvps && event.rsvps.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Attendees ({event.rsvps.length})</h2>
              <div className="space-y-3">
                {event.rsvps.map(rsvp => (
                  <div key={rsvp.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {rsvp.users?.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{rsvp.users?.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rsvp.status === 'attending' ? 'bg-green-100 text-green-800' :
                      rsvp.status === 'maybe' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {rsvp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RSVP Section */}
        <div className="space-y-6">
          {/* RSVP Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">RSVP Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-green-600 font-medium">Attending</span>
                <span className="font-bold text-lg">{rsvpStats.attending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-600 font-medium">Maybe</span>
                <span className="font-bold text-lg">{rsvpStats.maybe}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-600 font-medium">Declined</span>
                <span className="font-bold text-lg">{rsvpStats.declined}</span>
              </div>
            </div>
          </div>

          {/* RSVP Form */}
          {!event.is_cancelled && !isPast && (
            <EventRSVP
              eventId={event.id}
              userId={user.id}
              currentRSVP={event.user_rsvp}
              maxAttendees={event.max_attendees}
              currentAttendees={rsvpStats.attending}
            />
          )}

          {/* Management Actions */}
          {canManageEvent && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Event</h3>
              <div className="space-y-3">
                {!event.is_cancelled && (
                  <button
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    onClick={() => {
                      // This would need to be implemented as a client component
                      alert('Cancel event functionality would be implemented here');
                    }}
                  >
                    Cancel Event
                  </button>
                )}
                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    // This would need to be implemented as a client component
                    alert('Edit event functionality would be implemented here');
                  }}
                >
                  Edit Event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}