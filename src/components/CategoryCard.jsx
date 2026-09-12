import { Link } from 'react-router-dom';

// Compact card shown on a season's page, one per category (Peaks/Expeditions/Treks/Roadtrips).
export default function CategoryCard({ season, category, onCount, offCount }) {
  return (
    <Link
      to={`/season/${season}/${category.key}`}
      className="block border border-line bg-paper rounded-sm p-6 hover:bg-mist transition-colors"
    >
      <h3 className="font-display text-xl text-ink mb-1">{category.label}</h3>
      <p className="text-xs text-ink/50 mb-4">{category.blurb}</p>
      <div className="flex gap-4 text-xs text-ink/60">
        <span>{onCount} on season</span>
        <span>{offCount} off season</span>
      </div>
    </Link>
  );
}
