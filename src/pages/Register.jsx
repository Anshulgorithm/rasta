import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mountain } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/hooks/useUser';

export default function Register() {
  const navigate = useNavigate();
  const { refresh } = useUser();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await base44.auth.register({ email, password, full_name: fullName });
      await refresh();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Could not create your account.');
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

      <h1 className="font-display text-2xl text-ink text-center mb-6">Create an account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">{error}</p>}

        <div>
          <label className="text-xs text-ink/60 mb-1 block">Full name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm"
          />
        </div>

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
          <label className="text-xs text-ink/60 mb-1 block">Password</label>
          <input
            type="password"
            required
            minLength={6}
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
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-ink/50 text-center mt-6">
        Already have an account? <Link to="/login" className="text-pine hover:underline">Log in</Link>
      </p>
    </div>
  );
}
