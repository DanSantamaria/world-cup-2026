import { db } from '../client';
import { matches } from '../schema';
import { ne, asc } from 'drizzle-orm';
import type { Match } from '@/domain/types';

export async function getAllKnockoutMatches(): Promise<Match[]> {
  return db
    .select()
    .from(matches)
    .where(ne(matches.round, 'group'))
    .orderBy(asc(matches.matchNumber));
}
