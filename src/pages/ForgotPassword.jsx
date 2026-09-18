import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mountain } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // No redirectTo needed here — the email template now sends a 6-digit
    // code ({{ .Token }}) instead of a clickable link, so there's no
    // browser redirect step, and no risk of an email scanner "using up"
    // the code before the person clicks it themselves.
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());

    setLoading(false);

    if (resetError) {
      setError('Something went wrong sending the reset code. Please try again in a moment.');
      return;
    }

    // Carry the email forward so ResetPassword.jsx doesn't have to ask
    // for it again — verifyOtp needs both the email and the code.
    navigate('/reset-password', { state: { email: email.trim() } });
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <Link to="/" className="flex items-center gap-2 justify-center mb-8">
        <Mountain className="h-5 w-5 text-pine" strokeWidth={1.75} />
        <span className="font-display text-xl text-pine">Rasta</span>
      </Link>

      <h1 className="font-display text-2xl text-ink text-center mb-6">Reset your password</h1>

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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pine text-paper py-2.5 rounded-sm text-sm hover:bg-pine-dark disabled:opacity-60"
        >
          {loading ? 'Sending…' : 'Send reset code'}
        </button>
      </form>

      <p className="text-sm text-ink/50 text-center mt-6">
        <Link to="/login" className="text-pine hover:underline">Back to log in</Link>
      </p>
    </div>
  );
}
