'use server';

import { signOut } from '@/infrastructure/auth';

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/login' });
}
