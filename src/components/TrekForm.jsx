import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { uploadImagesToCloudinary } from '@/api/cloudinary';
import { useUser } from '@/hooks/useUser';
import { getEmbedUrl } from '@/lib/videoEmbed';

const empty = {
  category: '',
  name: '', district_name: '', season: 'summer', status: 'on-season',
  difficulty: 'moderate', duration_days: '', distance_km: '', elevation_m: '',
  price: '', off_season_price: '', slots: '', description: '', image_url: '', start_point: '', end_point: '',
  peak_name: '', max_altitude_m: '', permit_required: false, vehicle_type: '',
};

// Create/edit form for guides; loads districts for the dropdown.
export default function TrekForm({ trek, onSaved, onCancel }) {
  const { user } = useUser();
  const [districts, setDistricts] = useState([]);
  const [form, setForm] = useState(trek ? { ...empty, ...trek } : empty);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoLinksText, setVideoLinksText] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.entities.District.list('sort_order', 50).then(setDistricts);
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.category) {
      setError('Please choose what you are creating: Peak, Expedition, Trek, or Roadtrip.');
      return;
    }
    if (!form.name || !form.district_name || !form.season || !form.status) {
      setError('Name, district, season and status are required.');
      return;
    }

    // Split the video links textarea into one link per line, ignoring blank lines.
    const videoLinks = videoLinksText.split('\n').map((l) => l.trim()).filter(Boolean);
    const invalidLinks = videoLinks.filter((link) => !getEmbedUrl(link));
    if (invalidLinks.length > 0) {
      setError(`These don't look like YouTube or Vimeo links: ${invalidLinks.join(', ')}`);
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
        off_season_price: form.off_season_price === '' ? null : Number(form.off_season_price),
        slots: Number(form.slots) || 0,
        // Only keep the fields that actually belong to the chosen category —
        // clears out anything left over from switching categories mid-edit.
        peak_name: form.category === 'peak' ? form.peak_name || null : null,
        max_altitude_m: form.category === 'expedition' ? (Number(form.max_altitude_m) || null) : null,
        permit_required: form.category === 'expedition' ? !!form.permit_required : null,
        vehicle_type: form.category === 'roadtrip' ? form.vehicle_type || null : null,
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

      // Save any video links the same way, as their own trek_media rows.
      if (videoLinks.length > 0) {
        for (let i = 0; i < videoLinks.length; i++) {
          await base44.entities.TrekMedia.create({
            trek_id: savedTrek.id,
            media_type: 'video',
            url: videoLinks[i],
            sort_order: i,
          });
        }
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

      <div>
        <label className={labelClass}>What are you creating?</label>
        <select className={inputClass} value={form.category} onChange={(e) => set({ category: e.target.value })}>
          <option value="">Select type</option>
          <option value="peak">Peak</option>
          <option value="expedition">Expedition</option>
          <option value="trek">Trek</option>
          <option value="roadtrip">Roadtrip</option>
        </select>
      </div>

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
          <label className={labelClass}>Start point</label>
          <input className={inputClass} value={form.start_point} onChange={(e) => set({ start_point: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>End point</label>
          <input className={inputClass} value={form.end_point} onChange={(e) => set({ end_point: e.target.value })} />
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
          <label className={labelClass}>Off-season price per person (₹)</label>
          <input
            type="number"
            className={inputClass}
            value={form.off_season_price}
            onChange={(e) => set({ off_season_price: e.target.value })}
            placeholder="Leave blank to keep this trek unbookable off-season"
          />
          <p className="text-xs text-ink/40 mt-1">
            Charged instead of the normal price when this trek's status is set to Off season. If left blank, the trek stays unbookable while off-season.
          </p>
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

      {form.category === 'peak' && (
        <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
          <div>
            <label className={labelClass}>Peak name</label>
            <input className={inputClass} value={form.peak_name} onChange={(e) => set({ peak_name: e.target.value })} placeholder="e.g. Mount Kailash" />
          </div>
        </div>
      )}

      {form.category === 'expedition' && (
        <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
          <div>
            <label className={labelClass}>Max altitude reached (m)</label>
            <input type="number" className={inputClass} value={form.max_altitude_m} onChange={(e) => set({ max_altitude_m: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Permit required?</label>
            <select
              className={inputClass}
              value={form.permit_required ? 'yes' : 'no'}
              onChange={(e) => set({ permit_required: e.target.value === 'yes' })}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>
      )}

      {form.category === 'roadtrip' && (
        <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
          <div>
            <label className={labelClass}>Vehicle type</label>
            <input className={inputClass} value={form.vehicle_type} onChange={(e) => set({ vehicle_type: e.target.value })} placeholder="e.g. Car, Bike" />
          </div>
        </div>
      )}

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

      <div>
        <label className={labelClass}>Video links (YouTube or Vimeo — one per line)</label>
        <textarea
          rows={3}
          className={inputClass}
          value={videoLinksText}
          onChange={(e) => setVideoLinksText(e.target.value)}
          placeholder={'https://youtube.com/watch?v=...\nhttps://vimeo.com/...'}
        />
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
