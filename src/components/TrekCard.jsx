import { Link } from 'react-router-dom';
import { Mountain, Clock, Route } from 'lucide-react';

const difficultyColor = {
  easy: 'border-l-pine-light',
  moderate: 'border-l-amber',
  difficult: 'border-l-dusk',
};

const difficultyLabel = {
  easy: 'Easy',
  moderate: 'Moderate',
  difficult: 'Difficult',
};

// Compact trek card: image placeholder, name, difficulty, stats
export default function TrekCard({ trek }) {
  return (
    <Link
      to={`/trek/${trek.id}`}
      className={`ledger-row block bg-paper border border-line ${difficultyColor[trek.difficulty] || difficultyColor.moderate} pl-4 pr-4 py-4 hover:bg-mist`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-display text-lg text-ink">{trek.name}</h4>
          <p className="text-xs text-ink/50 mt-0.5">{trek.district_name}</p>
        </div>
        <span
          className={`shrink-0 rounded-sm px-2 py-0.5 text-xs ${
            trek.status === 'on-season' ? 'bg-amber/15 text-amber-dark' : 'bg-slate2/15 text-slate2-dark'
          }`}
        >
          {trek.status === 'on-season' ? 'On season' : 'Off season'}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-ink/60">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
          {trek.duration_days}d
        </span>
        <span className="flex items-center gap-1">
          <Route className="h-3.5 w-3.5" strokeWidth={1.75} />
          {trek.distance_km}km
        </span>
        <span className="flex items-center gap-1">
          <Mountain className="h-3.5 w-3.5" strokeWidth={1.75} />
          {trek.elevation_m}m
        </span>
        <span className="ml-auto text-sm font-medium text-ink">₹{trek.price?.toLocaleString('en-IN')}</span>
      </div>

      <div className="mt-2 text-[11px] text-ink/40">{difficultyLabel[trek.difficulty]}</div>
    </Link>
  );
}
