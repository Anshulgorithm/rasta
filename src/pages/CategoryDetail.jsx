import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getSeason } from '@/lib/seasons';
import { getCategory } from '@/lib/categories';
import Filters from '@/components/Filters';
import TrekCard from '@/components/TrekCard';

// Same job SeasonDetail.jsx used to do directly — now scoped to one
// season AND one category (Peaks/Expeditions/Treks/Roadtrips).
export default function CategoryDetail() {
  const { season: seasonKey, category: categoryKey } = useParams();
  const season = getSeason(seasonKey);
  const category = getCategory(categoryKey);
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('on-season');
  const [filters, setFilters] = useState({ difficulty: null, maxDuration: null, maxDistance: null });

  useEffect(() => {
    setLoading(true);
    base44.entities.Trek.filter({ season: seasonKey, category: categoryKey }, '-created_date', 200)
      .then(setTreks)
      .finally(() => setLoading(false));
  }, [seasonKey, categoryKey]);

  const filtered = useMemo(() => {
    return treks
      .filter((t) => t.status === tab)
      .filter((t) => !filters.difficulty || t.difficulty === filters.difficulty)
      .filter((t) => !filters.maxDuration || t.duration_days <= filters.maxDuration)
      .filter((t) => !filters.maxDistance || t.distance_km <= filters.maxDistance);
  }, [treks, tab, filters]);

  const DISTRICT_ORDER = ['Kinnaur', 'Chamba', 'Spiti'];

  const byDistrict = useMemo(() => {
    const groups = {};
    filtered.forEach((t) => {
      groups[t.district_name] = groups[t.district_name] || [];
      groups[t.district_name].push(t);
    });
    const ordered = {};
    DISTRICT_ORDER.forEach((d) => {
      if (groups[d]) ordered[d] = groups[d];
    });
    return ordered;
  }, [filtered]);

  if (!season || !category) {
    return <div className="mx-auto max-w-6xl px-6 py-20">Unknown season or category.</div>;
  }

  return (
    <div className={`${season.gradientClass} relative overflow-hidden`}>
      <div className="contour-texture" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-14 text-paper">
        <Link to={`/season/${seasonKey}`} className="inline-flex items-center gap-1 text-sm text-paper/80 hover:text-paper mb-4">
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} /> Back to {season.label}
        </Link>
        <h1 className="font-display text-4xl">{season.label} {category.label}</h1>
        <p className="text-paper/80 mt-1">{season.months} · {category.blurb}</p>
      </div>

      <div className="relative z-10 bg-mist rounded-t-[24px]">
        <div className="mx-auto max-w-6xl px-6 pt-8">
          <div className="flex gap-2 border-b border-line">
            <button
              onClick={() => setTab('on-season')}
              className={`px-4 py-2 text-sm rounded-t-sm ${tab === 'on-season' ? 'bg-amber text-paper' : 'text-ink/60 hover:text-ink'}`}
            >
              On season
            </button>
            <button
              onClick={() => setTab('off-season')}
              className={`px-4 py-2 text-sm rounded-t-sm ${tab === 'off-season' ? 'bg-slate2 text-paper' : 'text-ink/60 hover:text-ink'}`}
            >
              Off season
            </button>
          </div>

          <Filters value={filters} onChange={setFilters} />
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-20">
          {loading ? (
            <p className="text-sm text-ink/50 py-8">Loading treks…</p>
          ) : Object.keys(byDistrict).length === 0 ? (
            <p className="text-sm text-ink/50 py-8">No {category.label.toLowerCase()} match these filters yet.</p>
          ) : (
            Object.entries(byDistrict).map(([district, list]) => (
              <div key={district} className="mb-8">
                <h3 className="font-display text-xl text-ink mb-3">{district}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {list.map((trek) => <TrekCard key={trek.id} trek={trek} />)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
