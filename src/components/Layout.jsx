import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Mountain, LogOut, Menu, X } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { base44 } from '@/api/base44Client';

const navLinkClass = ({ isActive }) =>
  `text-sm transition-colors ${isActive ? 'text-pine font-medium' : 'text-ink/60 hover:text-ink'}`;

const mobileNavLinkClass = ({ isActive }) =>
  `block py-2.5 text-base transition-colors ${isActive ? 'text-pine font-medium' : 'text-ink/70 hover:text-ink'}`;

export default function Layout() {
  const { user, refresh } = useUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await base44.auth.logout();
    await refresh();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-paper relative">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <Mountain className="h-5 w-5 text-pine" strokeWidth={1.75} />
            <span className="font-display text-xl text-pine">Rasta</span>
          </Link>

          {/* Desktop nav — unchanged from before, just hidden below md */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={navLinkClass}>Trails</NavLink>
            {user && <NavLink to="/bookings" className={navLinkClass}>My bookings</NavLink>}
            {(user?.role === 'guide' || user?.role === 'admin') && (
              <NavLink to="/guide" className={navLinkClass}>Guide dashboard</NavLink>
            )}
            {user?.role === 'tourist' && (
              <NavLink to="/guide" className={navLinkClass}>Become a guide</NavLink>
            )}
            {user?.role === 'admin' && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}

            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink transition-colors">
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Log out
              </button>
            ) : (
              <Link to="/login" className="rounded-sm bg-pine px-4 py-1.5 text-sm text-paper hover:bg-pine-dark transition-colors">
                Log in
              </Link>
            )}
          </nav>

          {/* Mobile hamburger toggle — only visible below md */}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="md:hidden p-2 -mr-2 text-ink/70 hover:text-ink"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" strokeWidth={1.75} /> : <Menu className="h-6 w-6" strokeWidth={1.75} />}
          </button>
        </div>

        {/* Mobile dropdown — only rendered while open */}
        {menuOpen && (
          <nav className="md:hidden border-t border-line bg-paper px-6 py-3">
            <NavLink to="/" end className={mobileNavLinkClass} onClick={closeMenu}>Trails</NavLink>
            {user && <NavLink to="/bookings" className={mobileNavLinkClass} onClick={closeMenu}>My bookings</NavLink>}
            {(user?.role === 'guide' || user?.role === 'admin') && (
              <NavLink to="/guide" className={mobileNavLinkClass} onClick={closeMenu}>Guide dashboard</NavLink>
            )}
            {user?.role === 'tourist' && (
              <NavLink to="/guide" className={mobileNavLinkClass} onClick={closeMenu}>Become a guide</NavLink>
            )}
            {user?.role === 'admin' && <NavLink to="/admin" className={mobileNavLinkClass} onClick={closeMenu}>Admin</NavLink>}

            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-1.5 py-2.5 text-base text-ink/70 hover:text-ink transition-colors">
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Log out
              </button>
            ) : (
              <Link to="/login" onClick={closeMenu} className="inline-block mt-1 rounded-sm bg-pine px-4 py-2 text-sm text-paper hover:bg-pine-dark transition-colors">
                Log in
              </Link>
            )}
          </nav>
        )}
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
