// Lightweight localStorage-backed persistence layer used by the mock SDK.
const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

let counter = read('rasta_id_counter', 1);

export function nextId() {
  counter += 1;
  write('rasta_id_counter', counter);
  return `id_${counter.toString(36)}`;
}

export function getCollection(name) {
  return read(`rasta_${name}`, []);
}

export function setCollection(name, records) {
  write(`rasta_${name}`, records);
}

export function getSession() {
  return read('rasta_session', null);
}

export function setSession(session) {
  write('rasta_session', session);
}
