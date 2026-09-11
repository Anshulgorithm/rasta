import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <Compass className="h-8 w-8 text-ink/30 mx-auto mb-4" strokeWidth={1.5} />
      <h1 className="font-display text-3xl text-ink mb-2">Off the trail</h1>
      <p className="text-ink/50 mb-6">This page doesn't exist.</p>
      <Link to="/" className="text-sm text-pine underline underline-offset-2">Back to Rasta</Link>
    </div>
  );
}
