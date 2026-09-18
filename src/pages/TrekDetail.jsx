import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Mountain, Clock, Route, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';
import { useUser } from '@/hooks/useUser';
import { getEmbedUrl } from '@/lib/videoEmbed';

const categoryLabel = {
  peak: 'Peak',
  expedition: 'Expedition',
  trek: 'Trek',
  roadtrip: 'Roadtrip',
};

export default function TrekDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: userLoading, refresh } = useUser();
  const [trek, setTrek] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [groupSize, setGroupSize] = useState(1);
  const [phone, setPhone] = useState('');
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    base44.entities.Trek.get(id)
      .then(setTrek)
      .catch(() => setTrek(null))
      .finally(() => setLoading(false));

    base44.entities.TrekMedia.filter({ trek_id: id, media_type: 'image' }, 'sort_order')
      .then(setPhotos)
      .catch(() => setPhotos([]));

    base44.entities.TrekMedia.filter({ trek_id: id, media_type: 'video' }, 'sort_order')
      .then(setVideos)
      .catch(() => setVideos([]));
  }, [id]);

  useEffect(() => {
    if (user?.phone_number) setPhone(user.phone_number);
  }, [user]);

  const handleReserve = async (e) => {
    e.preventDefault();
    setError('');

    if (userLoading) return;
    if (!user) {
      navigate('/login', { state: { from: `/trek/${id}` } });
      return;
    }
    if (!date) {
      setError('Pick a date for your trek.');
      return;
    }
    if (!phone.trim()) {
      setError('Add a phone number so your guide can reach you.');
      return;
    }
    const size = parseInt(groupSize, 10);
    if (!Number.isInteger(size) || size < 1) {
      setError('Group size must be a whole number of at least 1.');
      return;
    }

    setBooking(true);
    try {
      if (phone.trim() !== (user.phone_number || '')) {
        await base44.auth.updateMe({ phone_number: phone.trim() });
        await refresh();
      }

      // Atomic on the server: locks the (trek, date) row, checks real
      // remaining capacity, and only then creates the booking — so two
      // tourists racing for the last slot can't both get confirmed.
      const { error: rpcError } = await supabase.rpc('reserve_trek', {
        p_trek_id: trek.id,
        p_date: date,
        p_group_size: size,
      });

      if (rpcError) throw new Error(rpcError.message);
      setConfirmed(true);
    } catch (err) {
      // Postgres RAISE EXCEPTION messages arrive as-is and are already
      // written to be shown to the tourist (e.g. "Only 2 seat(s) left...").
      setError(err.message || 'Could not reserve this trek.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-6xl px-6 py-20 text-ink/50">Loading…</div>;
  if (!trek) return <div className="mx-auto max-w-6xl px-6 py-20">Trek not found.</div>;

  const badgeClass = 'rounded-sm px-2.5 py-1 text-xs border border-line text-ink/70';

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link to={`/season/${trek.season}`} className="inline-flex items-center gap-1 text-sm text-ink/50 hover:text-ink mb-6">
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} /> Back to {trek.season}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {photos.map((photo) => (
                <a
                  key={photo.id}
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-[4/3] overflow-hidden rounded-sm border border-line"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || trek.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </a>
              ))}
            </div>
          )}

          {videos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {videos.map((video) => {
                const embedUrl = getEmbedUrl(video.url);
                if (!embedUrl) return null;
                return (
                  <div key={video.id} className="aspect-video overflow-hidden rounded-sm border border-line">
                    <iframe
                      src={embedUrl}
                      title={video.caption || `${trek.name} video`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {categoryLabel[trek.category] && <span className={badgeClass}>{categoryLabel[trek.category]}</span>}
            <span className={badgeClass}>{trek.difficulty}</span>
            <span className={badgeClass}>{trek.district_name}</span>
            <span className={`${badgeClass} ${trek.status === 'on-season' ? 'bg-amber/15 text-amber-dark border-transparent' : 'bg-slate2/15 text-slate2-dark border-transparent'}`}>
              {trek.status === 'on-season' ? 'On season' : 'Off season'}
            </span>
          </div>

          <h1 className="font-display text-4xl text-ink mb-2">{trek.name}</h1>
          {(trek.start_point || trek.end_point) && (
            <p className="text-sm text-ink/50 mb-2">
              {trek.start_point || '?'} → {trek.end_point || '?'}
            </p>
          )}

          {trek.category === 'peak' && trek.peak_name && (
            <p className="text-sm text-ink/60 mb-4">Peak: {trek.peak_name}</p>
          )}
          {trek.category === 'expedition' && (
            <p className="text-sm text-ink/60 mb-4">
              {trek.max_altitude_m ? `Max altitude: ${trek.max_altitude_m}m` : ''}
              {trek.max_altitude_m && (trek.permit_required !== null && trek.permit_required !== undefined) ? ' · ' : ''}
              {trek.permit_required !== null && trek.permit_required !== undefined
                ? (trek.permit_required ? 'Permit required' : 'No permit required')
                : ''}
            </p>
          )}
          {trek.category === 'roadtrip' && trek.vehicle_type && (
            <p className="text-sm text-ink/60 mb-4">Vehicle: {trek.vehicle_type}</p>
          )}

          <p className="text-ink/70 leading-relaxed max-w-2xl">{trek.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 max-w-xl">
            <Stat icon={Clock} label="Duration" value={`${trek.duration_days} days`} />
            <Stat icon={Route} label="Distance" value={`${trek.distance_km} km`} />
            <Stat icon={Mountain} label="Elevation" value={`${trek.elevation_m} m`} />
            <Stat icon={Users} label="Slots" value={trek.slots} />
          </div>
        </div>

        <aside className="border border-line bg-paper rounded-sm p-6 h-fit">
          {confirmed ? (
            <div>
              <h3 className="font-display text-xl text-pine mb-2">Reserved — pay later</h3>
              <p className="text-sm text-ink/60 mb-4">
                Your spot on {trek.name} is held. Payment is settled with your guide before departure.
              </p>
              <Link to="/bookings" className="text-sm text-pine underline underline-offset-2">
                View my bookings
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReserve}>
              <p className="text-sm text-ink/50">Price per person</p>
              <p className="font-display text-3xl text-ink mb-4">₹{trek.price?.toLocaleString('en-IN')}</p>

              {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-3">{error}</p>}

              <label className="text-xs text-ink/60 mb-1 block">Trek date</label>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm mb-3"
              />

              <label className="text-xs text-ink/60 mb-1 block">Group size</label>
              <p className="text-xs text-ink/40 mb-1">{trek.slots || 0} slot{trek.slots === 1 ? '' : 's'} available</p>
              <input
                type="number"
                min="1"
                value={groupSize}
                onChange={(e) => setGroupSize(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm mb-3"
              />

              <label className="text-xs text-ink/60 mb-1 block">Your phone number</label>
              <input
                type="tel"
                placeholder="e.g. 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm mb-4"
              />
              <p className="text-xs text-ink/40 -mt-3 mb-4">
                Shared with your guide only after they accept your booking.
              </p>

              <button
                type="submit"
                disabled={booking}
                className="w-full bg-amber text-paper py-2.5 rounded-sm text-sm hover:bg-amber-dark disabled:opacity-50"
              >
                {booking ? 'Reserving…' : 'Reserve (pay later)'}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div>
      <Icon className="h-4 w-4 text-ink/40 mb-1" strokeWidth={1.75} />
      <p className="text-sm text-ink font-medium">{value}</p>
      <p className="text-xs text-ink/40">{label}</p>
    </div>
  );
}
