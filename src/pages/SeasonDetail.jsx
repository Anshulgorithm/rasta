import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getSeason } from '@/lib/seasons';
import { CATEGORIES } from '@/lib/categories';
import CategoryCard from '@/components/CategoryCard';

export default function SeasonDetail() {
  const { season: seasonKey } = useParams();
  const season = getSeason(seasonKey);
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    base44.entities.Trek.filter({ season: seasonKey }, '-created_date', 200)
      .then(setTreks)
      .finally(() => setLoading(false));
  }, [seasonKey]);

  const countFor = (categoryKey, status) =>
    treks.filter((t) => t.category === categoryKey && t.status === status).length;

  if (!season) {
    return <div className="mx-auto max-w-6xl px-6 py-20">Unknown season.</div>;
  }

  return (
    <div className={`${season.gradientClass} relative overflow-hidden`}>
      <div className="contour-texture" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-14 text-paper">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-paper/80 hover:text-paper mb-4">
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} /> All seasons
        </Link>
        <h1 className="font-display text-4xl">{season.label} treks</h1>
        <p className="text-paper/80 mt-1">{season.months} · {season.blurb}</p>
      </div>

      <div className="relative z-10 bg-mist rounded-t-[24px]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="font-display text-2xl text-ink mb-4">What are you looking for?</h2>
          {loading ? (
            <p className="text-sm text-ink/50 py-8">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CATEGORIES.map((category) => (
                <CategoryCard
                  key={category.key}
                  season={seasonKey}
                  category={category}
                  onCount={countFor(category.key, 'on-season')}
                  offCount={countFor(category.key, 'off-season')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
