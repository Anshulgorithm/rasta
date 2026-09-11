import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Mountain, LogOut } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { base44 } from '@/api/base44Client';

const navLinkClass = ({ isActive }) =>
  `text-sm transition-colors ${isActive ? 'text-pine font-medium' : 'text-ink/60 hover:text-ink'}`;

export default function Layout() {
  const { user, refresh } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await base44.auth.logout();
    await refresh();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-pine" strokeWidth={1.75} />
            <span className="font-display text-xl text-pine">Rasta</span>
          </Link>

          <nav className="flex items-center gap-6">
            <NavLink to="/" end className={navLinkClass}>Trails</NavLink>
            {user && (
              <NavLink to="/bookings" className={navLinkClass}>My bookings</NavLink>
            )}
            {(user?.role === 'guide' || user?.role === 'admin') && (
              <NavLink to="/guide" className={navLinkClass}>Guide dashboard</NavLink>
            )}
            {user?.role === 'tourist' && (
              <NavLink to="/guide" className={navLinkClass}>Become a guide</NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Log out
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-sm bg-pine px-4 py-1.5 text-sm text-paper hover:bg-pine-dark transition-colors"
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-paper py-8">
        <div className="mx-auto max-w-6xl px-6 text-sm text-ink/50">
          Rasta — trails across Himachal Pradesh, tracked by season.
        </div>
      </footer>
    </div>
  );
}
