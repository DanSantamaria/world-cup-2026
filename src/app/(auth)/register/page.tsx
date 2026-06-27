'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from './actions';

export default function RegisterPage(): React.ReactElement {
  const [state, action, pending] = useActionState(registerAction, {});

  return (
    <div className="bg-white border border-ink/8 rounded-lg p-8">
      <h2 className="font-display text-xl text-ink mb-6 tracking-wide">Create account</h2>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm text-ink/60 mb-1.5">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            className="w-full px-3 py-2.5 border border-dashed border-ink/25 rounded-lg text-sm text-ink bg-white placeholder-ink/25 focus:outline-none focus:border-solid focus:border-gold transition-colors"
          />
        </div>

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
            autoComplete="new-password"
            minLength={8}
            placeholder="Min. 8 characters"
            className="w-full px-3 py-2.5 border border-dashed border-ink/25 rounded-lg text-sm text-ink bg-white placeholder-ink/25 focus:outline-none focus:border-solid focus:border-gold transition-colors"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 px-4 bg-gold hover:bg-gold/90 disabled:bg-gold/40 text-white font-display text-sm tracking-wide rounded-lg transition-colors"
        >
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/50">
        Already have an account?{' '}
        <Link href="/login" className="text-gold font-semibold hover:text-gold-dark transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
