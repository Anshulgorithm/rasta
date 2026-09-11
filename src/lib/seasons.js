// Shared season config so Home and SeasonDetail never duplicate order or styling.
export const SEASONS = [
  {
    key: 'summer',
    label: 'Summer',
    months: 'Apr — Jun',
    gradientClass: 'season-gradient-summer',
    blurb: 'Snowlines retreat and high passes open — the widest window of the year.',
  },
  {
    key: 'monsoon',
    label: 'Monsoon',
    months: 'Jul — Sep',
    gradientClass: 'season-gradient-monsoon',
    blurb: 'Rain-fed valleys and forest trails, best kept to lower, sheltered routes.',
  },
  {
    key: 'winter',
    label: 'Winter',
    months: 'Dec — Feb',
    gradientClass: 'season-gradient-winter',
    blurb: 'Snow treks and frozen rivers for those prepared for the cold routes.',
  },
];

export function getSeason(key) {
  return SEASONS.find((s) => s.key === key);
}
