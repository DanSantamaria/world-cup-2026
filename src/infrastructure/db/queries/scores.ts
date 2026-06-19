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

export async function deleteScore(userId: number, matchId: number): Promise<void> {
  await db.delete(scores).where(and(eq(scores.userId, userId), eq(scores.matchId, matchId)));
}

export async function upsertScore(
  userId: number,
  matchId: number,
  homeGoals: number,
  awayGoals: number,
  homeYellowCards: number,
  awayYellowCards: number,
  homeRedCards: number,
  awayRedCards: number,
): Promise<void> {
  await db
    .insert(scores)
    .values({ userId, matchId, homeGoals, awayGoals, homeYellowCards, awayYellowCards, homeRedCards, awayRedCards })
    .onConflictDoUpdate({
      target: [scores.userId, scores.matchId],
      set: { homeGoals, awayGoals, homeYellowCards, awayYellowCards, homeRedCards, awayRedCards, updatedAt: sql`now()` },
    });
}
