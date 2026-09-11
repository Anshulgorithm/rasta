import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { SEASONS } from '@/lib/seasons';
import SeasonCard from '@/components/SeasonCard';
import TrekCard from '@/components/TrekCard';

export default function Home() {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Trek.list('-created_date', 200)
      .then(setTreks)
      .finally(() => setLoading(false));
  }, []);

  const countFor = (seasonKey, status) =>
    treks.filter((t) => t.season === seasonKey && t.status === status).length;

  return (
    <div>
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h1 className="font-display text-5xl leading-tight text-pine max-w-2xl">
            Himachal's trails, tracked by season.
          </h1>
          <p className="mt-4 text-ink/60 max-w-xl">
            Every trek in the state, sorted by when the mountain actually lets you walk it —
            not just when it looks nice in a photo.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SEASONS.map((season) => (
            <SeasonCard
              key={season.key}
              season={season}
              onCount={countFor(season.key, 'on-season')}
              offCount={countFor(season.key, 'off-season')}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="font-display text-2xl text-ink mb-4">Featured treks</h2>
        {loading ? (
          <p className="text-sm text-ink/50">Loading treks…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {treks.slice(0, 3).map((trek) => (
              <TrekCard key={trek.id} trek={trek} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
