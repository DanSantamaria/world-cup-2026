import type { Team, Match, Score, Standing } from './types';

function headToHead(
  a: Standing,
  b: Standing,
  matches: Match[],
  scoresMap: Map<number, Score>,
): number {
  let aH2hPts = 0;
  let bH2hPts = 0;

  for (const m of matches) {
    const isAHome = m.homeTeamId === a.team.id && m.awayTeamId === b.team.id;
    const isBHome = m.homeTeamId === b.team.id && m.awayTeamId === a.team.id;
    if (!isAHome && !isBHome) continue;

    const score = scoresMap.get(m.id);
    if (!score) continue;

    if (isAHome) {
      if (score.homeGoals > score.awayGoals) aH2hPts += 3;
      else if (score.homeGoals === score.awayGoals) { aH2hPts += 1; bH2hPts += 1; }
      else bH2hPts += 3;
    } else {
      if (score.awayGoals > score.homeGoals) aH2hPts += 3;
      else if (score.awayGoals === score.homeGoals) { aH2hPts += 1; bH2hPts += 1; }
      else bH2hPts += 3;
    }
  }

  return bH2hPts - aH2hPts;
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
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    });
  }

  for (const match of groupMatches) {
    const score = scoresMap.get(match.id);
    if (!score || match.homeTeamId === null || match.awayTeamId === null) continue;

    const home = byId.get(match.homeTeamId);
    const away = byId.get(match.awayTeamId);
    if (!home || !away) continue;

    home.played++; away.played++;
    home.goalsFor += score.homeGoals; home.goalsAgainst += score.awayGoals;
    away.goalsFor += score.awayGoals; away.goalsAgainst += score.homeGoals;

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

  return Array.from(byId.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return headToHead(a, b, groupMatches, scoresMap);
  });
}
