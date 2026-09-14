import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Compass } from 'lucide-react';
import { base44 } from '@/api/base44Client';
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

  const loadTreks = async (uid) => {
    setLoading(true);
    const mine = await base44.entities.Trek.filter({ created_by_id: uid }, '-created_date', 200);
    setTreks(mine);
    setLoading(false);
  };

  useEffect(() => {
    if (user && (user.role === 'guide' || user.role === 'admin')) {
      loadTreks(user.id);
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
    loadTreks(user.id);
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
    </div>
  );
}
