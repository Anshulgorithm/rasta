import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/hooks/useUser';

export default function Bookings() {
  const { user, loading: userLoading } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      base44.entities.Booking.filter({ tourist_id: user.id }, '-created_date', 200)
        .then(setBookings)
        .finally(() => setLoading(false));
    }
  }, [user]);

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
          {bookings.map((b) => (
            <Link
              key={b.id}
              to={`/trek/${b.trek_id}`}
              className="flex items-center justify-between py-4 hover:bg-mist -mx-2 px-2"
            >
              <div>
                <p className="font-medium text-ink">{b.trek_name}</p>
                <p className="text-xs text-ink/50">{b.date} · {b.group_size} {b.group_size === 1 ? 'person' : 'people'}</p>
              </div>
              <span className={`text-xs rounded-sm px-2.5 py-1 ${b.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-amber/15 text-amber-dark'}`}>
                {b.status === 'reserved' ? 'Reserved — pay later' : b.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
