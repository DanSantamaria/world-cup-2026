import { db } from '../client';
import { scores, users } from '../schema';
import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
import type { Score } from '@/domain/types';

const REFERENCE_EMAIL = 'daniel@test.com';

// Returns true if the reference user has scores the current user is missing
export async function isUserOutOfSync(userId: number): Promise<boolean> {
  const ref = await db.select({ id: users.id }).from(users).where(eq(users.email, REFERENCE_EMAIL)).limit(1);
  if (!ref[0]) return false;
  const refId = ref[0].id;
  if (refId === userId) return false;

  const refScores = await db.select({ matchId: scores.matchId }).from(scores).where(eq(scores.userId, refId));
  if (refScores.length === 0) return false;

  const refMatchIds = refScores.map((s) => s.matchId);
  const userScores = await db.select({ matchId: scores.matchId }).from(scores)
    .where(and(eq(scores.userId, userId), inArray(scores.matchId, refMatchIds)));

  return userScores.length < refScores.length;
}

// Fetches all scores from the reference user to copy to another user
export async function getReferenceScores(): Promise<Score[]> {
  const ref = await db.select({ id: users.id }).from(users).where(eq(users.email, REFERENCE_EMAIL)).limit(1);
  if (!ref[0]) return [];
  return db.select().from(scores).where(eq(scores.userId, ref[0].id));
}

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
  homePenalties: number | null,
  awayPenalties: number | null,
  homeYellowCards: number,
  awayYellowCards: number,
  homeRedCards: number,
  awayRedCards: number,
): Promise<void> {
  await db
    .insert(scores)
    .values({ userId, matchId, homeGoals, awayGoals, homePenalties, awayPenalties, homeYellowCards, awayYellowCards, homeRedCards, awayRedCards })
    .onConflictDoUpdate({
      target: [scores.userId, scores.matchId],
      set: { homeGoals, awayGoals, homePenalties, awayPenalties, homeYellowCards, awayYellowCards, homeRedCards, awayRedCards, updatedAt: sql`now()` },
    });
}
