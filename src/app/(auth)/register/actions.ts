'use server';

import { registerUser } from '@/use-cases/registerUser';
import { signIn } from '@/infrastructure/auth';

export type RegisterFormState = {
  error?: string;
};

export async function registerAction(
  _prev: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const name = (formData.get('name') as string | null)?.trim() ?? '';
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  if (!name || !email || !password) {
    return { error: 'All fields are required.' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const result = await registerUser({ name, email, password });
  if (!result.success) return { error: result.error };

  await signIn('credentials', { email, password, redirectTo: '/dashboard' });
  return {};
}
