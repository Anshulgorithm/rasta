import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mountain } from 'lucide-react';

// Boilerplate stub — in a real deployment this would trigger base44's
// built-in password-reset email flow.
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <Link to="/" className="flex items-center gap-2 justify-center mb-8">
        <Mountain className="h-5 w-5 text-pine" strokeWidth={1.75} />
        <span className="font-display text-xl text-pine">Rasta</span>
      </Link>

      <h1 className="font-display text-2xl text-ink text-center mb-6">Reset your password</h1>

      {sent ? (
        <p className="text-sm text-ink/60 text-center">
          If an account exists for {email}, a reset link is on its way.
        </p>
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
          <button type="submit" className="w-full bg-pine text-paper py-2.5 rounded-sm text-sm hover:bg-pine-dark">
            Send reset link
          </button>
        </form>
      )}

      <p className="text-sm text-ink/50 text-center mt-6">
        <Link to="/login" className="text-pine hover:underline">Back to log in</Link>
      </p>
    </div>
  );
}
