import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mountain } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/hooks/useUser';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await base44.auth.login({ email, password });
      await refresh();
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.message || 'Could not log in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <Link to="/" className="flex items-center gap-2 justify-center mb-8">
        <Mountain className="h-5 w-5 text-pine" strokeWidth={1.75} />
        <span className="font-display text-xl text-pine">Rasta</span>
      </Link>

      <h1 className="font-display text-2xl text-ink text-center mb-6">Log in</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">{error}</p>}

        <div>
          <label className="text-xs text-ink/60 mb-1 block">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-ink/60">Password</label>
            <Link to="/forgot-password" className="text-xs text-pine hover:underline">Forgot?</Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-pine text-paper py-2.5 rounded-sm text-sm hover:bg-pine-dark disabled:opacity-50"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-ink/50 text-center mt-6">
        New to Rasta? <Link to="/register" className="text-pine hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
