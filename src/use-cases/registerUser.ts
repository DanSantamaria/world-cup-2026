import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from '@/infrastructure/db/queries/users';
import type { User } from '@/domain/types';

export type RegisterResult =
  | { success: true; user: User }
  | { success: false; error: string };

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  const existing = await getUserByEmail(data.email);
  if (existing) return { success: false, error: 'Email already in use.' };

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await createUser({ name: data.name, email: data.email, passwordHash });
  return { success: true, user };
}
