import { getCollection, setCollection, nextId, getSession, setSession } from './localStore';

const USERS = 'User';

function findUserByEmail(email) {
  return getCollection(USERS).find((u) => u.email === email);
}

export const auth = {
  async isAuthenticated() {
    return !!getSession();
  },

  async me() {
    const session = getSession();
    if (!session) throw new Error('Not authenticated');
    const user = getCollection(USERS).find((u) => u.id === session.id);
    if (!user) throw new Error('Not authenticated');
    return user;
  },

  async register({ email, password, full_name }) {
    if (findUserByEmail(email)) {
      throw new Error('An account with that email already exists.');
    }
    const now = new Date().toISOString();
    const user = {
      id: nextId(),
      email,
      password, // demo-only; never do this in a real backend
      full_name: full_name || email.split('@')[0],
      role: 'tourist',
      requested_role: null,
      approved: false,
      created_date: now,
      updated_date: now,
    };
    const all = getCollection(USERS);
    all.push(user);
    setCollection(USERS, all);
    setSession({ id: user.id });
    return user;
  },

  async login({ email, password }) {
    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      throw new Error('Incorrect email or password.');
    }
    setSession({ id: user.id });
    return user;
  },

  async logout() {
    setSession(null);
  },

  async updateMe(data) {
    const session = getSession();
    if (!session) throw new Error('Not authenticated');
    // Guard: role is not self-editable, only admins can change it via User.update
    const { role, approved, ...safe } = data;
    const all = getCollection(USERS);
    const idx = all.findIndex((u) => u.id === session.id);
    if (idx === -1) throw new Error('Not authenticated');
    all[idx] = { ...all[idx], ...safe, updated_date: new Date().toISOString() };
    setCollection(USERS, all);
    return all[idx];
  },
};
