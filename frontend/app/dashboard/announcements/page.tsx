import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AnnouncementForm from '@/components/AnnouncementForm';
import { getSocietyAnnouncements, getPinnedAnnouncements, getAnnouncementStats } from '@/lib/announcementsData';

export default async function AnnouncementsPage() {
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

  // Get announcements and stats
  const [allAnnouncements, pinnedAnnouncements, stats] = await Promise.all([
    getSocietyAnnouncements(userProfile.society_id, 100),
    getPinnedAnnouncements(userProfile.society_id),
    getAnnouncementStats(userProfile.society_id),
  ]);

  const canCreateAnnouncements = ['admin', 'sub_admin', 'manager'].includes(userProfile.role);

  const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
    maintenance: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '🔧' },
    event: { bg: 'bg-purple-50', text: 'text-purple-700', icon: '🎉' },
    urgent: { bg: 'bg-red-50', text: 'text-red-700', icon: '🚨' },
    general: { bg: 'bg-green-50', text: 'text-green-700', icon: '📢' },
  };

  const categoryBadgeColors: Record<string, string> = {
    maintenance: 'bg-blue-100 text-blue-800',
    event: 'bg-purple-100 text-purple-800',
    urgent: 'bg-red-100 text-red-800',
    general: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600 mt-2">Stay updated with society news and important notices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Announcements</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <span className="text-2xl">📢</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Urgent</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.urgent}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <span className="text-2xl">🚨</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Events</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.events}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <span className="text-2xl">🎉</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Announcement - Admin Only */}
      {canCreateAnnouncements && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AnnouncementForm societyId={userProfile.society_id} userId={user.id} />
          </div>

          {/* Quick Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-3">📝 Announcement Tips</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Use clear, concise titles</li>
              <li>✓ Include dates for events</li>
              <li>✓ Mark urgent items appropriately</li>
              <li>✓ Pin important announcements</li>
              <li>✓ Set expiry dates to auto-remove old content</li>
            </ul>
          </div>
        </div>
      )}

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            📌 Pinned Announcements
          </h2>
          <div className="space-y-3">
            {pinnedAnnouncements.map(announcement => {
              const colors = categoryColors[announcement.category];
              const badgeColor = categoryBadgeColors[announcement.category];
              return (
                <div
                  key={announcement.id}
                  className={`${colors.bg} border-l-4 border-yellow-400 rounded-lg p-4`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📌</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900">{announcement.title}</h3>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${badgeColor}`}>
                          {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{announcement.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>By {announcement.users?.full_name || 'Admin'}</span>
                        <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Announcements */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">All Announcements</h2>
        {allAnnouncements.length > 0 ? (
          <div className="space-y-3">
            {allAnnouncements.map(announcement => {
              const colors = categoryColors[announcement.category];
              const badgeColor = categoryBadgeColors[announcement.category];
              return (
                <div
                  key={announcement.id}
                  className={`${colors.bg} rounded-lg p-4 hover:shadow-md transition border border-transparent`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{categoryColors[announcement.category]?.icon || '📢'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.is_pinned && <span>📌</span>}
                        <h3 className="font-bold text-gray-900">{announcement.title}</h3>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${badgeColor}`}>
                          {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{announcement.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>By {announcement.users?.full_name || 'Admin'}</span>
                        <div className="flex gap-4">
                          <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                          {announcement.expires_at && (
                            <span className="text-orange-600 font-medium">
                              Expires: {new Date(announcement.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-gray-600 font-medium">No announcements yet</p>
            {canCreateAnnouncements && (
              <p className="text-gray-500 text-sm mt-1">Create the first announcement above</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
