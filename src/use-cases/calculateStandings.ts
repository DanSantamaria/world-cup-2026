import { calculateGroupStandings } from '@/domain/rules';
import type { Team, Match, Score, Standing } from '@/domain/types';

export function calculateStandings(
  groupTeams: Team[],
  groupMatches: Match[],
  scores: Score[],
): Standing[] {
  const scoresMap = new Map(scores.map((s) => [s.matchId, s]));
  return calculateGroupStandings(groupTeams, groupMatches, scoresMap);
}
