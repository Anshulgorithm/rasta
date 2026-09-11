import { getCollection, setCollection, nextId, getSession } from './localStore';

// Minimal matcher used by filter() - supports equality on top-level fields.
function matches(record, query) {
  return Object.entries(query).every(([key, value]) => record[key] === value);
}

function sortRecords(records, sortKey) {
  if (!sortKey) return records;
  const desc = sortKey.startsWith('-');
  const key = desc ? sortKey.slice(1) : sortKey;
  const sorted = [...records].sort((a, b) => {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  });
  return desc ? sorted.reverse() : sorted;
}

// Creates an entity client with the same shape as base44.entities.<Name>
export function createEntity(name) {
  return {
    async list(sortKey = '-created_date', limit = 200) {
      const all = getCollection(name);
      return sortRecords(all, sortKey).slice(0, limit);
    },
    async filter(query = {}, sortKey = '-created_date', limit = 200) {
      const all = getCollection(name).filter((r) => matches(r, query));
      return sortRecords(all, sortKey).slice(0, limit);
    },
    async get(id) {
      const all = getCollection(name);
      const record = all.find((r) => r.id === id);
      if (!record) throw new Error(`${name} ${id} not found`);
      return record;
    },
    async create(data) {
      const all = getCollection(name);
      const session = getSession();
      const now = new Date().toISOString();
      const record = {
        id: nextId(),
        created_date: now,
        updated_date: now,
        created_by_id: session?.id ?? null,
        ...data,
      };
      all.push(record);
      setCollection(name, all);
      return record;
    },
    async update(id, data) {
      const all = getCollection(name);
      const idx = all.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error(`${name} ${id} not found`);
      all[idx] = { ...all[idx], ...data, updated_date: new Date().toISOString() };
      setCollection(name, all);
      return all[idx];
    },
    async delete(id) {
      const all = getCollection(name).filter((r) => r.id !== id);
      setCollection(name, all);
      return true;
    },
  };
}
