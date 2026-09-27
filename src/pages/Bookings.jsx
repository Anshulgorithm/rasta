import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Phone, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';
import { useUser } from '@/hooks/useUser';

const decisionLabel = {
  pending: { text: 'Awaiting guide', className: 'bg-amber/15 text-amber-dark' },
  accepted: { text: 'Accepted', className: 'bg-pine/10 text-pine' },
  rejected: { text: 'Declined', className: 'bg-red-50 text-red-700' },
};

// today's date as YYYY-MM-DD, for comparing against booking.date strings
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Bookings() {
  const { user, loading: userLoading } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    if (user) {
      base44.entities.Booking.filter({ tourist_id: user.id }, '-created_date', 200)
        .then(async (mine) => {
          const withGuide = await Promise.all(
            mine.map(async (b) => {
              if (b.guide_decision === 'accepted') {
                try {
                  const trek = await base44.entities.Trek.get(b.trek_id);
                  const guide = await base44.entities.User.get(trek.created_by_id);
                  return { ...b, guide_phone: guide.phone_number, guide_email: guide.email };
                } catch {
                  return b;
                }
              }
              return b;
            })
          );
          setBookings(withGuide);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  async function handleCancel(booking) {
    setCancelError('');
    setCancellingId(booking.id);
    try {
      const { error: releaseError } = await supabase.rpc('release_trek_seats', {
        p_booking_id: booking.id,
      });
      if (releaseError) throw new Error(releaseError.message);

      const updated = await base44.entities.Booking.update(booking.id, {
        status: 'cancelled',
      });

      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, ...updated } : b)));
      setConfirmingId(null);
    } catch (err) {
      setCancelError(err.message || 'Could not cancel this booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  }

  if (userLoading || loading) {
    return <div className="mx-auto max-w-6xl px-6 py-20 text-ink/50">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-3xl text-ink mb-6">My bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="h-8 w-8 text-ink/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-ink/50 mb-4">No treks reserved yet.</p>
          <Link to="/" className="text-sm text-pine underline underline-offset-2">Browse trails</Link>
        </div>
      ) : (
        <div className="divide-y divide-line border-t border-line">
          {bookings.map((b) => {
            const decision = decisionLabel[b.guide_decision] || decisionLabel.pending;
            const isCancelled = b.status === 'cancelled';
            const isPast = b.date < todayStr();
            const canCancel = b.status === 'reserved' && !isPast;
            const isConfirming = confirmingId === b.id;
            const isCancelling = cancellingId === b.id;

            return (
              <div key={b.id} className="py-4">
                <Link to={`/trek/${b.trek_id}`} className="flex items-center justify-between hover:bg-mist -mx-2 px-2 py-1 rounded-sm">
                  <div>
                    <p className="font-medium text-ink">{b.trek_name}</p>
                    <p className="text-xs text-ink/50">{b.date} · {b.group_size} {b.group_size === 1 ? 'person' : 'people'}</p>
                  </div>
                  <span className={`text-xs rounded-sm px-2.5 py-1 ${isCancelled ? 'bg-ink/10 text-ink/50' : decision.className}`}>
                    {isCancelled ? 'Cancelled' : decision.text}
                  </span>
                </Link>

                {b.guide_decision === 'accepted' && !isCancelled && (b.guide_phone || b.guide_email) && (
                  <div className="mt-2 px-2 flex flex-wrap gap-4 text-xs text-ink/60">
                    {b.guide_phone && (
                      <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" strokeWidth={1.75} /> {b.guide_phone}</span>
                    )}
                    {b.guide_email && (
                      <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" strokeWidth={1.75} /> {b.guide_email}</span>
                    )}
                  </div>
                )}

                {b.guide_decision === 'rejected' && b.guide_rejection_reason && (
                  <p className="mt-2 px-2 text-xs text-ink/50">Reason: {b.guide_rejection_reason}</p>
                )}

                {canCancel && (
                  <div className="mt-2 px-2">
                    {isConfirming ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs text-ink/70">Cancel this booking?</span>
                        <button
                          type="button"
                          onClick={() => handleCancel(b)}
                          disabled={isCancelling}
                          className="text-xs font-medium text-red-700 underline underline-offset-2 disabled:opacity-50"
                        >
                          {isCancelling ? 'Cancelling…' : 'Yes, cancel it'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          disabled={isCancelling}
                          className="text-xs text-ink/50 underline underline-offset-2 disabled:opacity-50"
                        >
                          Never mind
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setCancelError(''); setConfirmingId(b.id); }}
                        className="text-xs text-red-700 underline underline-offset-2"
                      >
                        Cancel booking
                      </button>
                    )}
                    {isConfirming && cancelError && (
                      <p className="mt-1 text-xs text-red-700">{cancelError}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
