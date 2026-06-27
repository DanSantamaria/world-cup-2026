'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const result = await signIn('credentials', {
      email: form.get('email') as string,
      password: form.get('password') as string,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError('Invalid email or password.');
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="bg-white border border-ink/8 rounded-lg p-8">
      <h2 className="font-display text-xl text-ink mb-6 tracking-wide">Sign in</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-ink/60 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 border border-dashed border-ink/25 rounded-lg text-sm text-ink bg-white placeholder-ink/25 focus:outline-none focus:border-solid focus:border-gold transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-ink/60 mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full px-3 py-2.5 border border-dashed border-ink/25 rounded-lg text-sm text-ink bg-white placeholder-ink/25 focus:outline-none focus:border-solid focus:border-gold transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 px-4 bg-gold hover:bg-gold/90 disabled:bg-gold/40 text-white font-display text-sm tracking-wide rounded-lg transition-colors"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/50">
        No account?{' '}
        <Link href="/register" className="text-gold font-semibold hover:text-gold-dark transition-colors">
          Register
        </Link>
      </p>
    </div>
  );
}
