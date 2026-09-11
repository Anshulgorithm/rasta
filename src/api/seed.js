import { getCollection, setCollection, nextId } from './localStore';

const DISTRICTS = [
  { name: 'Kullu', region: 'Central Himachal' },
  { name: 'Kangra', region: 'Western Himachal' },
  { name: 'Chamba', region: 'Western Himachal' },
  { name: 'Lahaul & Spiti', region: 'Trans-Himalaya' },
  { name: 'Kinnaur', region: 'Eastern Himachal' },
  { name: 'Shimla', region: 'Central Himachal' },
  { name: 'Mandi', region: 'Central Himachal' },
  { name: 'Sirmaur', region: 'Southern Himachal' },
];

const TREKS = [
  { name: 'Hampta Pass', district_name: 'Kullu', season: 'summer', status: 'on-season', difficulty: 'moderate', duration_days: 5, distance_km: 26, elevation_m: 4270, price: 6500, slots: 12, description: 'A dramatic crossover trek from the green Kullu valley to the stark Lahaul landscape, through a narrow pass flanked by cliffs.' },
  { name: 'Beas Kund', district_name: 'Kullu', season: 'summer', status: 'on-season', difficulty: 'easy', duration_days: 3, distance_km: 15, elevation_m: 3650, price: 3200, slots: 15, description: 'A short, glacier-fed lake trek near Solang, ideal for first-timers wanting big views without big mileage.' },
  { name: 'Bhrigu Lake', district_name: 'Kullu', season: 'summer', status: 'on-season', difficulty: 'moderate', duration_days: 4, distance_km: 22, elevation_m: 4300, price: 5200, slots: 12, description: 'Alpine meadows open onto a high-altitude lake said to be named after the sage Bhrigu.' },
  { name: 'Triund', district_name: 'Kangra', season: 'summer', status: 'on-season', difficulty: 'easy', duration_days: 2, distance_km: 9, elevation_m: 2828, price: 1800, slots: 20, description: 'A weekend classic above McLeod Ganj with a front-row view of the Dhauladhar ridge.' },
  { name: 'Kareri Lake', district_name: 'Kangra', season: 'summer', status: 'off-season', difficulty: 'moderate', duration_days: 3, distance_km: 18, elevation_m: 3100, price: 3600, slots: 14, description: 'A quiet forest and meadow trail to a glacial lake below the Dhauladhar peaks.' },
  { name: 'Kheerganga', district_name: 'Kullu', season: 'monsoon', status: 'on-season', difficulty: 'easy', duration_days: 2, distance_km: 12, elevation_m: 2960, price: 1500, slots: 18, description: 'A monsoon-friendly forest climb from Barshaini ending at natural hot springs.' },
  { name: 'Chandrakhani Pass', district_name: 'Kullu', season: 'monsoon', status: 'on-season', difficulty: 'moderate', duration_days: 4, distance_km: 22, elevation_m: 3660, price: 4800, slots: 10, description: 'Rhododendron forest and pastureland lead to a pass with views across the Kullu and Malana valleys.' },
  { name: 'Prashar Lake', district_name: 'Mandi', season: 'monsoon', status: 'on-season', difficulty: 'easy', duration_days: 2, distance_km: 14, elevation_m: 2730, price: 2100, slots: 16, description: 'A short trek to a floating-island lake with a three-tiered pagoda temple on its bank.' },
  { name: 'Churdhar Trek', district_name: 'Sirmaur', season: 'monsoon', status: 'off-season', difficulty: 'moderate', duration_days: 2, distance_km: 18, elevation_m: 3647, price: 2800, slots: 12, description: 'The highest peak in the outer Himalayas of Sirmaur, thick with oak and fir forest.' },
  { name: 'Chadar Trek', district_name: 'Lahaul & Spiti', season: 'winter', status: 'on-season', difficulty: 'difficult', duration_days: 8, distance_km: 62, elevation_m: 3400, price: 18500, slots: 8, description: 'Walking on the frozen Zanskar river itself — one of the most extreme treks in the Himalaya.' },
  { name: 'Kinner Kailash Winter Circuit', district_name: 'Kinnaur', season: 'winter', status: 'on-season', difficulty: 'difficult', duration_days: 6, distance_km: 40, elevation_m: 4200, price: 12500, slots: 8, description: 'A snowbound circuit around the sacred Kinner Kailash range, apple orchards giving way to deep snow.' },
  { name: 'Spiti Winter Village Trail', district_name: 'Lahaul & Spiti', season: 'winter', status: 'off-season', difficulty: 'moderate', duration_days: 5, distance_km: 30, elevation_m: 3800, price: 9800, slots: 10, description: 'A cold-desert village-to-village walk through snow-dusted Spiti, staying in local homes.' },
  { name: 'Pin Parvati Pass', district_name: 'Kullu', season: 'summer', status: 'off-season', difficulty: 'difficult', duration_days: 11, distance_km: 110, elevation_m: 5319, price: 24500, slots: 6, description: 'A high, technical crossing linking the lush Parvati valley to the arid Pin valley of Spiti.' },
  { name: 'Sar Pass', district_name: 'Kullu', season: 'winter', status: 'on-season', difficulty: 'moderate', duration_days: 5, distance_km: 48, elevation_m: 4220, price: 7200, slots: 14, description: 'A snow-slide finale makes this one of the most popular winter treks out of Kasol.' },
];

export function ensureSeeded() {
  const seeded = localStorage.getItem('rasta_seeded');
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

  localStorage.setItem('rasta_seeded', '1');
}
