'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface EventRSVPProps {
  eventId: string;
  userId: string;
  currentRSVP?: { status: 'attending' | 'maybe' | 'declined' } | null;
  maxAttendees?: number | null;
  currentAttendees: number;
}

export default function EventRSVP({
  eventId,
  userId,
  currentRSVP,
  maxAttendees,
  currentAttendees
}: EventRSVPProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const [selectedStatus, setSelectedStatus] = useState<'attending' | 'maybe' | 'declined'>(
    currentRSVP?.status || 'attending'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRSVP = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check capacity if max attendees is set
      if (maxAttendees && selectedStatus === 'attending' && !currentRSVP && currentAttendees >= maxAttendees) {
        throw new Error('This event is at capacity');
      }

      const { error: rsvpError } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: userId,
          status: selectedStatus,
          updated_at: new Date().toISOString(),
        });

      if (rsvpError) throw rsvpError;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        window.location.reload(); // Refresh to show updated RSVP
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isAtCapacity = maxAttendees ? currentAttendees >= maxAttendees : false;
  const canAttend = !isAtCapacity || currentRSVP?.status === 'attending';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Your RSVP</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">RSVP updated successfully!</p>
        </div>
      )}

      {currentRSVP ? (
        <div className="mb-4">
          <p className="text-gray-600 text-sm mb-2">Current response:</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentRSVP.status === 'attending' ? 'bg-green-100 text-green-800' :
            currentRSVP.status === 'maybe' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {currentRSVP.status === 'attending' ? '✅ Attending' :
             currentRSVP.status === 'maybe' ? '🤔 Maybe' :
             '❌ Not attending'}
          </span>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-gray-600 text-sm">You haven't responded yet</p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Will you attend?
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="rsvp"
                value="attending"
                checked={selectedStatus === 'attending'}
                onChange={(e) => setSelectedStatus(e.target.value as 'attending')}
                className="text-green-600 focus:ring-green-500"
                disabled={!canAttend}
              />
              <span className={`ml-2 ${!canAttend ? 'text-gray-400' : 'text-gray-900'}`}>
                ✅ Yes, I'll attend
                {!canAttend && ' (Event at capacity)'}
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="rsvp"
                value="maybe"
                checked={selectedStatus === 'maybe'}
                onChange={(e) => setSelectedStatus(e.target.value as 'maybe')}
                className="text-yellow-600 focus:ring-yellow-500"
              />
              <span className="ml-2 text-gray-900">🤔 Maybe</span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="rsvp"
                value="declined"
                checked={selectedStatus === 'declined'}
                onChange={(e) => setSelectedStatus(e.target.value as 'declined')}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-gray-900">❌ No, I can't attend</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleRSVP}
          disabled={loading || (selectedStatus === 'attending' && !canAttend)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update RSVP'}
        </button>
      </div>

      {maxAttendees && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Capacity:</span>
            <span className={isAtCapacity ? 'text-red-600 font-medium' : ''}>
              {currentAttendees} / {maxAttendees}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${isAtCapacity ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}