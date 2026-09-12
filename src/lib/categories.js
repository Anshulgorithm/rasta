// Config for the 4 destination categories, same pattern as seasons.js.
export const CATEGORIES = [
  { key: 'peak', label: 'Peaks', blurb: 'Summit attempts and high-altitude climbs' },
  { key: 'expedition', label: 'Expeditions', blurb: 'Multi-day high-altitude journeys' },
  { key: 'trek', label: 'Treks', blurb: 'Classic day and multi-day trails' },
  { key: 'roadtrip', label: 'Roadtrips', blurb: 'Scenic drives and rides through the hills' },
];

export function getCategory(key) {
  return CATEGORIES.find((c) => c.key === key) || null;
}
