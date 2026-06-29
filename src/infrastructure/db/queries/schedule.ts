import { db } from '../client';
import { groups, teams, matches, scores } from '../schema';
import { eq, asc } from 'drizzle-orm';
import type { Team } from '@/domain/types';

export interface ScheduleMatchRow {
  matchId: number;
  matchNumber: number;
  round: string;
  groupName: string | null;
  matchDateUtc: Date | null;
  venue: string | null;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeSlot: string | null;
  awaySlot: string | null;
  score: { homeGoals: number; awayGoals: number; homePenalties: number | null; awayPenalties: number | null } | null;
}

export async function getScheduleMatches(userId: number): Promise<ScheduleMatchRow[]> {
  const [allMatches, allTeams, allGroups, userScores] = await Promise.all([
    db.select().from(matches).orderBy(asc(matches.matchDate), asc(matches.matchNumber)),
    db.select().from(teams),
    db.select().from(groups),
    db.select().from(scores).where(eq(scores.userId, userId)),
  ]);

  const teamsById = new Map(allTeams.map((t) => [t.id, t]));
  const groupsById = new Map(allGroups.map((g) => [g.id, g]));
  const scoresByMatchId = new Map(userScores.map((s) => [s.matchId, s]));

  return allMatches.map((m) => {
    const score = scoresByMatchId.get(m.id);
    return {
      matchId: m.id,
      matchNumber: m.matchNumber,
      round: m.round,
      groupName: m.groupId ? (groupsById.get(m.groupId)?.name ?? null) : null,
      matchDateUtc: m.matchDate,
      venue: m.venue,
      homeTeam: m.homeTeamId ? (teamsById.get(m.homeTeamId) ?? null) : null,
      awayTeam: m.awayTeamId ? (teamsById.get(m.awayTeamId) ?? null) : null,
      homeSlot: m.homeSlot,
      awaySlot: m.awaySlot,
      score: score
        ? {
            homeGoals: score.homeGoals,
            awayGoals: score.awayGoals,
            homePenalties: score.homePenalties,
            awayPenalties: score.awayPenalties,
          }
        : null,
    };
  });
}
