import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Compass, Check, X, Phone, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';
import { useUser } from '@/hooks/useUser';
import TrekForm from '@/components/TrekForm';

export default function GuideDashboard() {
  const { user, loading: userLoading, refresh } = useUser();
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyPhone, setApplyPhone] = useState('');
  const [applyError, setApplyError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actingId, setActingId] = useState(null);

  const loadTreks = async (uid) => {
    setLoading(true);
    const mine = await base44.entities.Trek.filter({ created_by_id: uid }, '-created_date', 200);
    setTreks(mine);
    setLoading(false);
    return mine;
  };

  const loadBookings = async (myTreks) => {
    setBookingsLoading(true);
    const trekIds = new Set(myTreks.map((t) => t.id));
    const all = await base44.entities.Booking.list('-created_date', 500);
    // Exclude cancelled bookings entirely — otherwise a booking the
    // tourist cancelled before you'd acted on it still shows up here
    // with live Accept/Reject buttons, and rejecting it would release
    // seats a second time (they were already freed on cancellation).
    const mine = all.filter((b) => trekIds.has(b.trek_id) && b.status !== 'cancelled');

    const withContact = await Promise.all(
      mine.map(async (b) => {
        if (b.guide_decision === 'accepted') {
          try {
            const tourist = await base44.entities.User.get(b.tourist_id);
            return { ...b, tourist_phone: tourist.phone_number, tourist_email: tourist.email };
          } catch {
            return b;
          }
        }
        return b;
      })
    );

    setBookings(withContact);
    setBookingsLoading(false);
  };

  useEffect(() => {
    if (user && (user.role === 'guide' || user.role === 'admin')) {
      loadTreks(user.id).then((mine) => loadBookings(mine));
    }
  }, [user]);

  const handleApply = async () => {
    if (!applyPhone.trim()) {
      setApplyError('Add a phone number so tourists can reach you once you\'re approved.');
      return;
    }
    setApplyError('');
    setApplying(true);
    await base44.auth.updateMe({ phone_number: applyPhone.trim(), requested_role: 'guide' });
    await refresh();
    setApplying(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this trek listing?')) return;
    try {
      await base44.entities.Trek.delete(id);
      loadTreks(user.id);
    } catch (err) {
      if (err.message?.includes('bookings_trek_id_fkey')) {
        alert('This trek can\'t be deleted because it already has one or more bookings against it. Cancel or resolve those bookings first, then try again.');
      } else {
        alert('Could not delete this trek: ' + (err.message || 'unknown error.'));
      }
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    loadTreks(user.id).then((mine) => loadBookings(mine));
  };

  const handleAccept = async (booking) => {
    const trek = treks.find((t) => t.id === booking.trek_id);
    if (!trek) return;

    setActingId(booking.id);
    try {
      // Capacity for this booking was already reserved atomically when
      // the tourist booked (reserve_trek). Accepting just confirms it —
      // it must NOT touch trek.slots again, or seats get double-counted.
      // Note: status stays 'reserved' here — the bookings_status_check
      // constraint doesn't allow 'confirmed' yet. Cleaning up the status
      // lifecycle properly is a Phase 3 item (audit §3.12).
      await base44.entities.Booking.update(booking.id, { guide_decision: 'accepted' });
      const mine = await loadTreks(user.id);
      await loadBookings(mine);
    } catch (err) {
      alert('Could not accept this booking: ' + (err.message || 'unknown error.'));
    } finally {
      setActingId(null);
    }
  };

  const handleRejectConfirm = async (booking) => {
    if (!rejectReason.trim()) {
      alert('Please add a short reason for rejecting this booking.');
      return;
    }
    setActingId(booking.id);
    try {
      const { error: releaseError } = await supabase.rpc('release_trek_seats', {
        p_booking_id: booking.id,
      });
      if (releaseError) throw new Error(releaseError.message);

      await base44.entities.Booking.update(booking.id, {
        guide_decision: 'rejected',
        guide_rejection_reason: rejectReason.trim(),
        status: 'cancelled',
      });
      setRejectingId(null);
      setRejectReason('');
      const mine = await loadTreks(user.id);
      await loadBookings(mine);
    } catch (err) {
      alert('Could not reject this booking: ' + (err.message || 'unknown error.'));
    } finally {
      setActingId(null);
    }
  };

  if (userLoading) {
    return <div className="mx-auto max-w-6xl px-6 py-20 text-ink/50">Loading…</div>;
  }

  if (user.role === 'tourist') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <Compass className="h-8 w-8 text-pine mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="font-display text-3xl text-ink mb-3">Guide your own treks</h1>
        {user.requested_role === 'guide' ? (
          <p className="text-ink/60">
            Your request is in with an admin. You'll see the guide dashboard here once it's approved.
          </p>
        ) : (
          <>
            <p className="text-ink/60 mb-6">
              List your own trails, manage bookings, and reach tourists planning trips across Himachal.
              An admin reviews every request before it's approved.
            </p>

            {applyError && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-3 max-w-xs mx-auto">{applyError}</p>}

            <label className="text-xs text-ink/60 mb-1 block text-left max-w-xs mx-auto">Your phone number</label>
            <input
              type="tel"
              placeholder="e.g. 98765 43210"
              value={applyPhone}
              onChange={(e) => setApplyPhone(e.target.value)}
              className="w-full max-w-xs border border-line rounded-sm px-3 py-2 text-sm mb-4"
            />

            <button
              onClick={handleApply}
              disabled={applying}
              className="bg-pine text-paper px-5 py-2.5 rounded-sm text-sm hover:bg-pine-dark disabled:opacity-50"
            >
              {applying ? 'Sending request…' : 'Apply to be a guide'}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-ink">Your treks</h1>
        {!showForm && (
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-1.5 bg-pine text-paper px-4 py-2 rounded-sm text-sm hover:bg-pine-dark"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} /> New trek
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <TrekForm
            trek={editing}
            onSaved={handleSaved}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink/50">Loading your treks…</p>
      ) : treks.length === 0 ? (
        <p className="text-sm text-ink/50">You haven't listed any treks yet.</p>
      ) : (
        <div className="divide-y divide-line border-t border-line">
          {treks.map((trek) => (
            <div key={trek.id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-ink">{trek.name}</p>
                <p className="text-xs text-ink/50">
                  {trek.district_name} · {trek.season} · {trek.status === 'on-season' ? 'On season' : 'Off season'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(trek); setShowForm(true); }}
                  className="p-2 text-ink/50 hover:text-ink"
                  aria-label="Edit trek"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => handleDelete(trek.id)}
                  className="p-2 text-ink/50 hover:text-red-700"
                  aria-label="Delete trek"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 mt-12">
        <h1 className="font-display text-3xl text-ink">Bookings for your treks</h1>
      </div>

      {bookingsLoading ? (
        <p className="text-sm text-ink/50">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-ink/50">No bookings yet.</p>
      ) : (
        <div className="divide-y divide-line border-t border-line">
          {bookings.map((b) => (
            <div key={b.id} className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-medium text-ink">{b.trek_name}</p>
                  <p className="text-xs text-ink/50">
                    {b.tourist_name} · {b.date} · {b.group_size} {b.group_size === 1 ? 'person' : 'people'}
                    {b.price_per_person != null && (
                      <>
                        {' · '}
                        {b.group_size > 1
                          ? `₹${(b.price_per_person * b.group_size).toLocaleString('en-IN')} total (₹${b.price_per_person.toLocaleString('en-IN')}/person)`
                          : `₹${b.price_per_person.toLocaleString('en-IN')}`}
                      </>
                    )}
                  </p>
                </div>

                {b.guide_decision === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(b)}
                      disabled={actingId === b.id}
                      className="flex items-center gap-1.5 bg-pine text-paper px-3 py-1.5 rounded-sm text-sm hover:bg-pine-dark disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" strokeWidth={1.75} /> Accept
                    </button>
                    <button
                      onClick={() => { setRejectingId(rejectingId === b.id ? null : b.id); setRejectReason(''); }}
                      disabled={actingId === b.id}
                      className="flex items-center gap-1.5 border border-line text-ink/70 px-3 py-1.5 rounded-sm text-sm hover:text-red-700 hover:border-red-200 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" strokeWidth={1.75} /> Reject
                    </button>
                  </div>
                )}

                {b.guide_decision === 'accepted' && (
                  <span className="text-xs rounded-sm px-2.5 py-1 bg-pine/10 text-pine">Accepted</span>
                )}
                {b.guide_decision === 'rejected' && (
                  <span className="text-xs rounded-sm px-2.5 py-1 bg-red-50 text-red-700">Rejected</span>
                )}
              </div>

              {rejectingId === b.id && (
                <div className="mt-3 pl-0 max-w-md">
                  <label className="text-xs text-ink/60 mb-1 block">Reason for rejecting</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                    className="w-full border border-line rounded-sm px-3 py-2 text-sm mb-2"
                    placeholder="e.g. Fully booked for that date"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRejectConfirm(b)}
                      disabled={actingId === b.id}
                      className="bg-red-700 text-paper px-3 py-1.5 rounded-sm text-sm hover:bg-red-800 disabled:opacity-50"
                    >
                      Confirm reject
                    </button>
                    <button
                      onClick={() => { setRejectingId(null); setRejectReason(''); }}
                      className="text-ink/50 px-3 py-1.5 rounded-sm text-sm hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {b.guide_decision === 'accepted' && (b.tourist_phone || b.tourist_email) && (
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink/60">
                  {b.tourist_phone && (
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" strokeWidth={1.75} /> {b.tourist_phone}</span>
                  )}
                  {b.tourist_email && (
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" strokeWidth={1.75} /> {b.tourist_email}</span>
                  )}
                </div>
              )}

              {b.guide_decision === 'rejected' && b.guide_rejection_reason && (
                <p className="mt-2 text-xs text-ink/50">Reason: {b.guide_rejection_reason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
