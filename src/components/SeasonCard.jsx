import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

// Gradient season card with on/off counts, links to /season/:key
export default function SeasonCard({ season, onCount, offCount }) {
  return (
    <Link
      to={`/season/${season.key}`}
      className={`group relative overflow-hidden rounded-sm ${season.gradientClass} p-6 h-56 flex flex-col justify-between text-paper`}
    >
      <div className="contour-texture" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h3 className="font-display text-3xl">{season.label}</h3>
          <p className="text-sm text-paper/75 mt-1">{season.months}</p>
        </div>
        <ArrowUpRight className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
      </div>

      <div className="relative z-10">
        <p className="text-sm text-paper/85 mb-3 max-w-[36ch]">{season.blurb}</p>
        <div className="flex gap-4 text-sm">
          <span><strong className="font-medium">{onCount}</strong> on-season</span>
          <span className="text-paper/60">·</span>
          <span><strong className="font-medium">{offCount}</strong> off-season</span>
        </div>
      </div>
    </Link>
  );
}
