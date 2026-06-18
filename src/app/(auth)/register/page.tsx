'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from './actions';

export default function RegisterPage(): React.ReactElement {
  const [state, action, pending] = useActionState(registerAction, {});

  return (
    <div className="bg-white border border-amber-200 rounded-lg p-8 shadow-sm">
      <h2 className="text-xl font-bold font-mono text-amber-900 mb-6">Create account</h2>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-mono font-medium text-amber-800 mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full px-3 py-2 border border-amber-300 rounded-md font-mono text-sm text-amber-900 bg-amber-50 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-mono font-medium text-amber-800 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full px-3 py-2 border border-amber-300 rounded-md font-mono text-sm text-amber-900 bg-amber-50 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-mono font-medium text-amber-800 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className="w-full px-3 py-2 border border-amber-300 rounded-md font-mono text-sm text-amber-900 bg-amber-50 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Min. 8 characters"
          />
        </div>

        {state?.error && (
          <p className="text-sm font-mono text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-mono font-semibold rounded-md transition-colors text-sm"
        >
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm font-mono text-amber-700">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-amber-900 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
