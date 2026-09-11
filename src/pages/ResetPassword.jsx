import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mountain } from 'lucide-react';

// Boilerplate stub for the built-in reset-password flow.
export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <Link to="/" className="flex items-center gap-2 justify-center mb-8">
        <Mountain className="h-5 w-5 text-pine" strokeWidth={1.75} />
        <span className="font-display text-xl text-pine">Rasta</span>
      </Link>

      <h1 className="font-display text-2xl text-ink text-center mb-6">Set a new password</h1>

      {done ? (
        <p className="text-sm text-ink/60 text-center">Password updated. Redirecting to log in…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-ink/60 mb-1 block">New password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="w-full bg-pine text-paper py-2.5 rounded-sm text-sm hover:bg-pine-dark">
            Update password
          </button>
        </form>
      )}
    </div>
  );
}
