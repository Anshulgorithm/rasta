import { X } from 'lucide-react';

// Difficulty / max duration / max distance controls
export default function Filters({ value, onChange }) {
  const update = (patch) => onChange({ ...value, ...patch });
  const hasFilters = value.difficulty || value.maxDuration || value.maxDistance;

  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      <select
        value={value.difficulty || ''}
        onChange={(e) => update({ difficulty: e.target.value || null })}
        className="border border-line bg-paper rounded-sm px-3 py-1.5 text-sm text-ink"
      >
        <option value="">Any difficulty</option>
        <option value="easy">Easy</option>
        <option value="moderate">Moderate</option>
        <option value="difficult">Difficult</option>
      </select>

      <label className="flex items-center gap-2 text-sm text-ink/70">
        Max duration
        <input
          type="number"
          min="1"
          placeholder="days"
          value={value.maxDuration || ''}
          onChange={(e) => update({ maxDuration: e.target.value ? Number(e.target.value) : null })}
          className="w-20 border border-line bg-paper rounded-sm px-2 py-1.5 text-sm"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-ink/70">
        Max distance
        <input
          type="number"
          min="1"
          placeholder="km"
          value={value.maxDistance || ''}
          onChange={(e) => update({ maxDistance: e.target.value ? Number(e.target.value) : null })}
          className="w-20 border border-line bg-paper rounded-sm px-2 py-1.5 text-sm"
        />
      </label>

      {hasFilters && (
        <button
          onClick={() => onChange({ difficulty: null, maxDuration: null, maxDistance: null })}
          className="flex items-center gap-1 text-sm text-ink/50 hover:text-ink"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
          Clear
        </button>
      )}
    </div>
  );
}
