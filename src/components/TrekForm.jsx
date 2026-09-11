import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { uploadImagesToCloudinary } from '@/api/cloudinary';
import { useUser } from '@/hooks/useUser';

const empty = {
  name: '', district_name: '', season: 'summer', status: 'on-season',
  difficulty: 'moderate', duration_days: '', distance_km: '', elevation_m: '',
  price: '', slots: '', description: '', image_url: '',
};

// Create/edit form for guides; loads districts for the dropdown.
export default function TrekForm({ trek, onSaved, onCancel }) {
  const { user } = useUser();
  const [districts, setDistricts] = useState([]);
  const [form, setForm] = useState(trek ? { ...empty, ...trek } : empty);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.entities.District.list('name', 50).then(setDistricts);
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.district_name || !form.season || !form.status) {
      setError('Name, district, season and status are required.');
      return;
    }
    setSaving(true);
    try {
            const payload = {
        ...form,
        duration_days: Number(form.duration_days) || 0,
        distance_km: Number(form.distance_km) || 0,
        elevation_m: Number(form.elevation_m) || 0,
        price: Number(form.price) || 0,
        slots: Number(form.slots) || 0,
      };
      if (!trek?.id) {
        payload.created_by_id = user?.id;
      }

      let savedTrek;
      if (trek?.id) {
        savedTrek = await base44.entities.Trek.update(trek.id, payload);
      } else {
        savedTrek = await base44.entities.Trek.create(payload);
      }

      // If the guide picked any photos, upload them now that we have a trek id.
      if (photoFiles.length > 0) {
        setUploading(true);
        const urls = await uploadImagesToCloudinary(photoFiles);
        for (let i = 0; i < urls.length; i++) {
          await base44.entities.TrekMedia.create({
            trek_id: savedTrek.id,
            media_type: 'image',
            url: urls[i],
            sort_order: i,
          });
        }
        setUploading(false);
      }

      onSaved();
    } catch (err) {
      setError(err.message || 'Could not save this trek.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const inputClass = 'w-full border border-line bg-paper rounded-sm px-3 py-2 text-sm';
  const labelClass = 'text-xs text-ink/60 mb-1 block';

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-paper p-6 rounded-sm space-y-4">
      <h3 className="font-display text-xl">{trek?.id ? 'Edit trek' : 'New trek'}</h3>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Trek name</label>
          <input className={inputClass} value={form.name} onChange={(e) => set({ name: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>District</label>
          <select className={inputClass} value={form.district_name} onChange={(e) => set({ district_name: e.target.value })}>
            <option value="">Select district</option>
            {districts.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Season</label>
          <select className={inputClass} value={form.season} onChange={(e) => set({ season: e.target.value })}>
            <option value="summer">Summer</option>
            <option value="monsoon">Monsoon</option>
            <option value="winter">Winter</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status} onChange={(e) => set({ status: e.target.value })}>
            <option value="on-season">On season</option>
            <option value="off-season">Off season</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Difficulty</label>
          <select className={inputClass} value={form.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="difficult">Difficult</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Price per person (₹)</label>
          <input type="number" className={inputClass} value={form.price} onChange={(e) => set({ price: e.target.value })} />
        </div>

        <div>
          <label className={labelClass}>Duration (days)</label>
          <input type="number" className={inputClass} value={form.duration_days} onChange={(e) => set({ duration_days: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Distance (km)</label>
          <input type="number" className={inputClass} value={form.distance_km} onChange={(e) => set({ distance_km: e.target.value })} />
        </div>

        <div>
          <label className={labelClass}>Elevation (m)</label>
          <input type="number" className={inputClass} value={form.elevation_m} onChange={(e) => set({ elevation_m: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Slots</label>
          <input type="number" className={inputClass} value={form.slots} onChange={(e) => set({ slots: e.target.value })} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea rows={4} className={inputClass} value={form.description} onChange={(e) => set({ description: e.target.value })} />
      </div>

      <div>
        <label className={labelClass}>Trek photos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotoFiles(Array.from(e.target.files))}
          className={inputClass}
        />
        {photoFiles.length > 0 && (
          <p className="text-xs text-ink/60 mt-1">
            {photoFiles.length} photo{photoFiles.length > 1 ? 's' : ''} selected — they'll upload when you save.
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="bg-pine text-paper px-4 py-2 rounded-sm text-sm hover:bg-pine-dark disabled:opacity-50">
          {saving ? (uploading ? 'Uploading photos…' : 'Saving…') : 'Save trek'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-sm text-sm text-ink/60 hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}
