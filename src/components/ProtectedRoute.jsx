import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { Compass } from 'lucide-react';

// Gates authenticated routes; renders <Outlet/> or redirects to /login.
export default function ProtectedRoute() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate2">
        <Compass className="h-6 w-6 animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
