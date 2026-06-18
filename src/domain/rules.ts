import type { Team, Match, Score, Standing } from './types';

interface H2HStats {
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

/**
 * Computes head-to-head stats for each team in `group`, counting only
 * matches played between members of that group.
 */
function computeH2HStats(
  group: Standing[],
  matches: Match[],
  scoresMap: Map<number, Score>,
): Map<number, H2HStats> {
  const teamIds = new Set(group.map((s) => s.team.id));
  const stats = new Map<number, H2HStats>();

  for (const s of group) {
    stats.set(s.team.id, { points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 });
  }

  for (const m of matches) {
    if (!m.homeTeamId || !m.awayTeamId) continue;
    if (!teamIds.has(m.homeTeamId) || !teamIds.has(m.awayTeamId)) continue;

    const score = scoresMap.get(m.id);
    if (!score) continue;

    const homeH2H = stats.get(m.homeTeamId)!;
    const awayH2H = stats.get(m.awayTeamId)!;

    homeH2H.goalsFor += score.homeGoals;
    homeH2H.goalsAgainst += score.awayGoals;
    awayH2H.goalsFor += score.awayGoals;
    awayH2H.goalsAgainst += score.homeGoals;

    if (score.homeGoals > score.awayGoals) {
      homeH2H.points += 3;
    } else if (score.homeGoals < score.awayGoals) {
      awayH2H.points += 3;
    } else {
      homeH2H.points += 1;
      awayH2H.points += 1;
    }
  }

  for (const s of stats.values()) {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  }

  return stats;
}

/**
 * Sorts a group of teams that are already level on overall points.
 *
 * FIFA 2026 tiebreaker order:
 *   1. H2H points (among tied teams only)
 *   2. H2H goal difference
 *   3. H2H goals scored
 *   4. Overall goal difference
 *   5. Overall goals scored
 *   6. Disciplinary points (fewer = better; yellow=1, red=3)
 *   7. FIFA ranking (not tracked — results in stable tie)
 */
function sortTiedGroup(
  tied: Standing[],
  matches: Match[],
  scoresMap: Map<number, Score>,
): Standing[] {
  if (tied.length === 1) return tied;

  const h2h = computeH2HStats(tied, matches, scoresMap);

  return [...tied].sort((a, b) => {
    const ah2h = h2h.get(a.team.id)!;
    const bh2h = h2h.get(b.team.id)!;

    if (bh2h.points !== ah2h.points) return bh2h.points - ah2h.points;
    if (bh2h.goalDifference !== ah2h.goalDifference) return bh2h.goalDifference - ah2h.goalDifference;
    if (bh2h.goalsFor !== ah2h.goalsFor) return bh2h.goalsFor - ah2h.goalsFor;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    if (a.disciplinaryPoints !== b.disciplinaryPoints) return a.disciplinaryPoints - b.disciplinaryPoints;
    return 0;
  });
}

export function calculateGroupStandings(
  groupTeams: Team[],
  groupMatches: Match[],
  scoresMap: Map<number, Score>,
): Standing[] {
  const byId = new Map<number, Standing>();

  for (const team of groupTeams) {
    byId.set(team.id, {
      team,
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
      points: 0, disciplinaryPoints: 0,
    });
  }

  for (const match of groupMatches) {
    const score = scoresMap.get(match.id);
    if (!score || !match.homeTeamId || !match.awayTeamId) continue;

    const home = byId.get(match.homeTeamId);
    const away = byId.get(match.awayTeamId);
    if (!home || !away) continue;

    home.played++; away.played++;
    home.goalsFor += score.homeGoals; home.goalsAgainst += score.awayGoals;
    away.goalsFor += score.awayGoals; away.goalsAgainst += score.homeGoals;

    home.disciplinaryPoints += score.homeYellowCards + score.homeRedCards * 3;
    away.disciplinaryPoints += score.awayYellowCards + score.awayRedCards * 3;

    if (score.homeGoals > score.awayGoals) {
      home.won++; home.points += 3; away.lost++;
    } else if (score.homeGoals < score.awayGoals) {
      away.won++; away.points += 3; home.lost++;
    } else {
      home.drawn++; home.points++;
      away.drawn++; away.points++;
    }
  }

  for (const s of byId.values()) {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  }

  // Group teams by their overall points total
  const byPoints = new Map<number, Standing[]>();
  for (const s of byId.values()) {
    if (!byPoints.has(s.points)) byPoints.set(s.points, []);
    byPoints.get(s.points)!.push(s);
  }

  // For each points level: single team → insert directly; tied group → apply H2H first
  const result: Standing[] = [];
  for (const pts of [...byPoints.keys()].sort((a, b) => b - a)) {
    const group = byPoints.get(pts)!;
    result.push(...sortTiedGroup(group, groupMatches, scoresMap));
  }

  return result;
}
