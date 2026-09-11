import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// One hook every page imports instead of re-implementing auth checks.
export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) {
        setUser(null);
        return;
      }
      const me = await base44.auth.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, loading, refresh, setUser };
}
