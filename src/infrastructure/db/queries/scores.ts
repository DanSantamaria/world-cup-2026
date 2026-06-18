import { db } from '../client';
import { scores } from '../schema';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { Score } from '@/domain/types';

export async function getUserScoresForMatches(
  userId: number,
  matchIds: number[],
): Promise<Score[]> {
  if (matchIds.length === 0) return [];
  return db
    .select()
    .from(scores)
    .where(and(eq(scores.userId, userId), inArray(scores.matchId, matchIds)));
}

export async function upsertScore(
  userId: number,
  matchId: number,
  homeGoals: number,
  awayGoals: number,
): Promise<void> {
  await db
    .insert(scores)
    .values({ userId, matchId, homeGoals, awayGoals })
    .onConflictDoUpdate({
      target: [scores.userId, scores.matchId],
      set: { homeGoals, awayGoals, updatedAt: sql`now()` },
    });
}
