import { getCollection, setCollection, nextId } from './localStore';

const DISTRICTS = [
  { name: 'Kinnaur', region: 'Eastern Himachal' },
  { name: 'Chamba', region: 'Western Himachal' },
  { name: 'Spiti', region: 'Trans-Himalaya' },
];

const TREKS = [
  { name: 'Kinner Kailash Winter Circuit', district_name: 'Kinnaur', season: 'winter', status: 'on-season', difficulty: 'difficult', duration_days: 6, distance_km: 40, elevation_m: 4200, price: 12500, slots: 8, description: 'A snowbound circuit around the sacred Kinner Kailash range, apple orchards giving way to deep snow.' },
  { name: 'Kalpa Valley Trail', district_name: 'Kinnaur', season: 'summer', status: 'on-season', difficulty: 'easy', duration_days: 3, distance_km: 16, elevation_m: 2960, price: 3400, slots: 15, description: 'Orchard villages and pine forest beneath the Kinner Kailash face, an easy summer walk.' },
  { name: 'Charang Ghati Pass', district_name: 'Kinnaur', season: 'summer', status: 'off-season', difficulty: 'difficult', duration_days: 9, distance_km: 78, elevation_m: 5266, price: 19500, slots: 6, description: 'A remote high-altitude crossing linking Kinnaur to Spiti through wild, little-visited terrain.' },

  { name: 'Kalicho Pass Trek', district_name: 'Chamba', season: 'summer', status: 'on-season', difficulty: 'moderate', duration_days: 5, distance_km: 34, elevation_m: 4200, price: 6800, slots: 12, description: 'A quiet pass crossing linking Chamba and Pangi, through alpine meadow and cedar forest.' },
  { name: 'Manimahesh Kailash Yatra', district_name: 'Chamba', season: 'monsoon', status: 'on-season', difficulty: 'moderate', duration_days: 3, distance_km: 26, elevation_m: 4080, price: 2900, slots: 20, description: 'A pilgrim trail to the sacred Manimahesh Lake beneath its namesake peak.' },
  { name: 'Sach Pass Winter Trail', district_name: 'Chamba', season: 'winter', status: 'off-season', difficulty: 'difficult', duration_days: 4, distance_km: 22, elevation_m: 4414, price: 8200, slots: 8, description: 'A snowbound approach to one of the highest motorable passes in the region.' },

  { name: 'Chadar Trek', district_name: 'Spiti', season: 'winter', status: 'on-season', difficulty: 'difficult', duration_days: 8, distance_km: 62, elevation_m: 3400, price: 18500, slots: 8, description: 'Walking on the frozen Zanskar river itself — one of the most extreme treks in the Himalaya.' },
  { name: 'Spiti Winter Village Trail', district_name: 'Spiti', season: 'winter', status: 'off-season', difficulty: 'moderate', duration_days: 5, distance_km: 30, elevation_m: 3800, price: 9800, slots: 10, description: 'A cold-desert village-to-village walk through snow-dusted Spiti, staying in local homes.' },
  { name: 'Kanamo Peak Trek', district_name: 'Spiti', season: 'summer', status: 'on-season', difficulty: 'moderate', duration_days: 4, distance_km: 20, elevation_m: 5964, price: 7200, slots: 10, description: 'An accessible trekking peak above Kibber village with sweeping views over the Spiti valley.' },
];

export function ensureSeeded() {
  const seeded = localStorage.getItem('rasta_seeded_v2');
  if (seeded) return;

  const now = new Date().toISOString();

  const districts = DISTRICTS.map((d) => ({
    id: nextId(),
    created_date: now,
    updated_date: now,
    created_by_id: null,
    ...d,
  }));
  setCollection('District', districts);

  const treks = TREKS.map((t) => ({
    id: nextId(),
    created_date: now,
    updated_date: now,
    created_by_id: 'seed_guide',
    image_url: '',
    ...t,
  }));
  setCollection('Trek', treks);

  setCollection('Booking', getCollection('Booking'));
  setCollection('User', getCollection('User'));

  localStorage.setItem('rasta_seeded_v2', '1');
}