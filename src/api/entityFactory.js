import { supabase } from './supabaseClient';

// Maps the app's entity names to their actual Supabase table names.
const TABLES = {
  User: 'profiles',
  District: 'districts',
  Trek: 'treks',
  Booking: 'bookings',
  TrekMedia: 'trek_media',
};

// The app calls sort keys like '-created_date'; the real columns are
// 'created_at' / 'updated_at'. Translate so no page code has to change.
function translateSortKey(sortKey) {
  if (!sortKey) return null;
  const desc = sortKey.startsWith('-');
  let key = desc ? sortKey.slice(1) : sortKey;
  if (key === 'created_date') key = 'created_at';
  if (key === 'updated_date') key = 'updated_at';
  return { key, ascending: !desc };
}

function handle({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

// Creates an entity client with the same shape the app already uses:
// list / filter / get / create / update / delete — now backed by Supabase.
export function createEntity(name) {
  const table = TABLES[name];

  return {
    async list(sortKey = '-created_date', limit = 200) {
      let query = supabase.from(table).select('*').limit(limit);
      const sort = translateSortKey(sortKey);
      if (sort) query = query.order(sort.key, { ascending: sort.ascending });
      return handle(await query);
    },

    async filter(filters = {}, sortKey = '-created_date', limit = 200) {
      let query = supabase.from(table).select('*').limit(limit);
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const sort = translateSortKey(sortKey);
      if (sort) query = query.order(sort.key, { ascending: sort.ascending });
      return handle(await query);
    },

    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    },

    async create(payload) {
      const { data, error } = await supabase.from(table).insert(payload).select().single();
      if (error) throw new Error(error.message);
      return data;
    },

    async update(id, payload) {
      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw new Error(error.message);
      return true;
    },
  };
}
