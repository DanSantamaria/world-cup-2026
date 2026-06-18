import { db } from '../client';
import { users } from '../schema';
import { eq } from 'drizzle-orm';
import type { User } from '@/domain/types';

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  const result = await db.insert(users).values(data).returning();
  return result[0];
}
