import { resolveThirdPlaceSlot } from './determineAdvancing';
import type { Match, Score, Team, BracketMatchData, ResolvedSlot } from '@/domain/types';

function fmt(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function resolveSlot(
  label: string,
  slotMap: Map<string, Team>,
  byMatchNum: Map<number, BracketMatchData>,
): ResolvedSlot {
  // Winner of a previous knockout match: "WM73"
  if (label.startsWith('WM')) {
    const mn = parseInt(label.slice(2));
    const prev = byMatchNum.get(mn);
    if (prev?.winnerId !== undefined) {
      const team = prev.home.team?.id === prev.winnerId ? prev.home.team : prev.away.team;
      return { label, team };
    }
    return { label };
  }

  // Loser of a previous knockout match (3rd-place match): "LM101"
  if (label.startsWith('LM')) {
    const mn = parseInt(label.slice(2));
    const prev = byMatchNum.get(mn);
    if (prev?.loserId !== undefined) {
      const team = prev.home.team?.id === prev.loserId ? prev.home.team : prev.away.team;
      return { label, team };
    }
    return { label };
  }

  // Composite 3rd-place slot: "3ABCDF", "3CDFGH", etc.
  if (label.startsWith('3') && label.length > 2) {
    const team = resolveThirdPlaceSlot(label, slotMap);
    return { label, team };
  }

  // Simple group slot: "1A", "2B", "T1"–"T12"
  return { label, team: slotMap.get(label) };
}

export function buildBracket(
  knockoutMatches: Match[],
  scoresMap: Map<number, Score>,
  slotMap: Map<string, Team>,
): BracketMatchData[] {
  // Process in match-number order so WM/LM refs resolve correctly
  const sorted = [...knockoutMatches].sort((a, b) => a.matchNumber - b.matchNumber);
  const byMatchNum = new Map<number, BracketMatchData>();
  const result: BracketMatchData[] = [];

  for (const match of sorted) {
    const home = resolveSlot(match.homeSlot ?? '', slotMap, byMatchNum);
    const away = resolveSlot(match.awaySlot ?? '', slotMap, byMatchNum);

    const score = scoresMap.get(match.id);
    let winnerId: number | undefined;
    let loserId: number | undefined;

    if (score && home.team && away.team) {
      if (score.homeGoals > score.awayGoals) {
        winnerId = home.team.id;
        loserId = away.team.id;
      } else if (score.awayGoals > score.homeGoals) {
        winnerId = away.team.id;
        loserId = home.team.id;
      }
      // Draw in knockout → neither advances (user must fix)
    }

    const bm: BracketMatchData = {
      id: match.id,
      matchNumber: match.matchNumber,
      round: match.round,
      matchDate: match.matchDate ? fmt(match.matchDate) : null,
      venue: match.venue,
      home,
      away,
      score: score ? { homeGoals: score.homeGoals, awayGoals: score.awayGoals } : undefined,
      winnerId,
      loserId,
    };

    byMatchNum.set(match.matchNumber, bm);
    result.push(bm);
  }

  return result;
}
