import { supabase } from './supabaseClient';

// Same function names as before (isAuthenticated, me, register, login,
// logout, updateMe) — now backed by real Supabase Auth instead of
// localStorage. No page or component needs to change.

async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw new Error(error.message);
  return data;
}

export const auth = {
  async isAuthenticated() {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  },

  async me() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error('Not authenticated');
    return fetchProfile(data.user.id);
  },

  async register({ email, password, full_name }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Check your email to confirm your account before logging in.');
    // The profiles row is created automatically by a database trigger.
    return fetchProfile(data.user.id);
  },

  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return fetchProfile(data.user.id);
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async updateMe(data) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('Not authenticated');
    // role / approved are intentionally not accepted here — the database
    // trigger also blocks a user from changing their own role as a second
    // line of defense, but we keep the client from even attempting it.
    const { role, approved, ...safe } = data;
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(safe)
      .eq('id', userData.user.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated;
  },
};
