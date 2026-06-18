'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/infrastructure/auth';
import { upsertScore } from '@/infrastructure/db/queries/scores';

export type ScoreActionState = { error?: string; success?: boolean };

export async function upsertScoreAction(
  _prev: ScoreActionState,
  formData: FormData,
): Promise<ScoreActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not authenticated.' };

  const userId = parseInt(session.user.id);
  const matchId = parseInt(formData.get('matchId') as string);
  const homeGoals = parseInt(formData.get('homeGoals') as string);
  const awayGoals = parseInt(formData.get('awayGoals') as string);

  if (isNaN(matchId) || isNaN(homeGoals) || isNaN(awayGoals)) {
    return { error: 'Invalid score data.' };
  }
  if (homeGoals < 0 || awayGoals < 0 || homeGoals > 30 || awayGoals > 30) {
    return { error: 'Goals must be between 0 and 30.' };
  }

  const isKnockout = formData.get('isKnockout') === 'true';
  if (isKnockout && homeGoals === awayGoals) {
    return { error: 'Knockout matches must have a winner — enter the score after extra time / penalties.' };
  }

  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, isNaN(v) ? 0 : v));
  const homeYellowCards = clamp(parseInt(formData.get('homeYellowCards') as string), 20);
  const awayYellowCards = clamp(parseInt(formData.get('awayYellowCards') as string), 20);
  const homeRedCards = clamp(parseInt(formData.get('homeRedCards') as string), 11);
  const awayRedCards = clamp(parseInt(formData.get('awayRedCards') as string), 11);

  await upsertScore(userId, matchId, homeGoals, awayGoals, homeYellowCards, awayYellowCards, homeRedCards, awayRedCards);
  revalidatePath('/groups');
  revalidatePath('/bracket');
  return { success: true };
}
