import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/hooks/useUser';

export default function AdminPanel() {
  const { user, loading: userLoading } = useUser();
  const [tab, setTab] = useState('requests');
  const [users, setUsers] = useState([]);
  const [treks, setTreks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    const [u, t, b] = await Promise.all([
      base44.entities.User.list('-created_date', 500),
      base44.entities.Trek.list('-created_date', 500),
      base44.entities.Booking.list('-created_date', 500),
    ]);
    setUsers(u);
    setTreks(t);
    setBookings(b);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'admin') loadAll();
  }, [user]);

  const handleApprove = async (id) => {
    await base44.entities.User.update(id, { role: 'guide', approved: true, requested_role: null });
    loadAll();
  };

  if (userLoading || loading) {
    return <div className="mx-auto max-w-6xl px-6 py-20 text-ink/50">Loading…</div>;
  }

  if (user?.role !== 'admin') {
    return <div className="mx-auto max-w-6xl px-6 py-20">You don't have access to this page.</div>;
  }

  const pending = users.filter((u) => u.requested_role === 'guide' && u.role !== 'guide');
  const activeGuides = users.filter((u) => u.role === 'guide');

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-5 w-5 text-pine" strokeWidth={1.75} />
        <h1 className="font-display text-3xl text-ink">Admin</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 max-w-xl">
        <StatCard label="Pending requests" value={pending.length} />
        <StatCard label="Active guides" value={activeGuides.length} />
        <StatCard label="Total treks" value={treks.length} />
      </div>

      <div className="flex gap-2 border-b border-line mb-6">
        {[
          ['requests', 'Guide requests'],
          ['treks', 'All treks'],
          ['bookings', 'Bookings'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm ${tab === key ? 'text-pine border-b-2 border-pine font-medium' : 'text-ink/50 hover:text-ink'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        pending.length === 0 ? (
          <p className="text-sm text-ink/50">No pending guide requests.</p>
        ) : (
          <div className="divide-y divide-line border-t border-line">
            {pending.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-ink">{u.full_name}</p>
                  <p className="text-xs text-ink/50">{u.email}</p>
                </div>
                <button
                  onClick={() => handleApprove(u.id)}
                  className="bg-pine text-paper px-4 py-1.5 rounded-sm text-sm hover:bg-pine-dark"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'treks' && (
        <div className="divide-y divide-line border-t border-line">
          {treks.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-ink">{t.name}</span>
              <span className="text-ink/50">{t.district_name} · {t.season} · {t.status}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'bookings' && (
        bookings.length === 0 ? (
          <p className="text-sm text-ink/50">No bookings yet.</p>
        ) : (
          <div className="divide-y divide-line border-t border-line">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-ink">{b.trek_name}</span>
                <span className="text-ink/50">{b.tourist_name} · {b.date} · {b.group_size} people · {b.status}</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="border border-line bg-paper rounded-sm p-4">
      <p className="font-display text-3xl text-pine">{value}</p>
      <p className="text-xs text-ink/50 mt-1">{label}</p>
    </div>
  );
}
