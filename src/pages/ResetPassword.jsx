import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mountain } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromPrevStep = location.state?.email || '';

  const [email, setEmail] = useState(emailFromPrevStep);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Step 1: verify the 6-digit code against the email. On success this
    // establishes a real (short-lived) session for this user, which is
    // what lets us call updateUser() next.
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'recovery',
    });

    if (verifyError) {
      setLoading(false);
      setError('That code is invalid or has expired. Double-check it or request a new one.');
      return;
    }

    // Step 2: now that we have a session, actually set the new password.
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <Link to="/" className="flex items-center gap-2 justify-center mb-8">
        <Mountain className="h-5 w-5 text-pine" strokeWidth={1.75} />
        <span className="font-display text-xl text-pine">Rasta</span>
      </Link>

      <h1 className="font-display text-2xl text-ink text-center mb-6">Enter your reset code</h1>

      {done ? (
        <p className="text-sm text-ink/60 text-center">Password updated. Redirecting to log in…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-xs text-ink/60 mb-1 block">Reset code</label>
            <input
              type="text"
              required
              inputMode="numeric"
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-line rounded-sm px-3 py-2 text-sm tracking-widest"
            />
          </div>
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
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pine text-paper py-2.5 rounded-sm text-sm hover:bg-pine-dark disabled:opacity-60"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}

      <p className="text-sm text-ink/50 text-center mt-6">
        Didn't get a code? <Link to="/forgot-password" className="text-pine hover:underline">Request a new one</Link>
      </p>
    </div>
  );
}
