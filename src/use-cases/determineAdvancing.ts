import type { Standing, Team, RankedThird } from '@/domain/types';

interface GroupResult {
  groupName: string; // "A"–"L"
  standings: Standing[];
}

function compareThirds(a: Standing, b: Standing): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.disciplinaryPoints - b.disciplinaryPoints; // fewer = better
}

/**
 * Ranks all third-place teams across all groups.
 * Returns them sorted best→worst with `qualifies: true` for the top 8.
 * Criteria: Pts → GD → GF → Disciplinary (→ FIFA ranking, not tracked).
 */
export function rankThirdPlacers(groups: GroupResult[]): RankedThird[] {
  const thirds = groups
    .filter(({ standings }) => standings.length >= 3)
    .map(({ groupName, standings }) => ({ standing: standings[2]!, groupName }));

  thirds.sort((a, b) => compareThirds(a.standing, b.standing));

  return thirds.map(({ standing, groupName }, i) => ({
    standing,
    groupName,
    qualifies: i < 8,
  }));
}

/**
 * Returns a map of slot label → Team for every resolvable slot:
 *   "1A" → winner of group A
 *   "2A" → runner-up of group A
 *   "T1"–"T12" → 3rd-place teams ranked best→worst
 *   "3rd_A" → group A's 3rd-place team (used by buildBracket for "3ABCDF"-style slots)
 */
export function determineAdvancing(groups: GroupResult[]): Map<string, Team> {
  const slotMap = new Map<string, Team>();

  for (const { groupName, standings } of groups) {
    if (standings[0]) slotMap.set(`1${groupName}`, standings[0].team);
    if (standings[1]) slotMap.set(`2${groupName}`, standings[1].team);
  }

  const ranked = rankThirdPlacers(groups);
  ranked.forEach(({ standing, groupName }, i) => {
    slotMap.set(`T${i + 1}`, standing.team);
    slotMap.set(`3rd_${groupName}`, standing.team);
  });

  return slotMap;
}

/**
 * Resolves a composite 3rd-place slot label like "3ABCDF" to a team.
 * Picks the highest-ranked qualifying (T1–T8) 3rd-place team whose group
 * letter appears in the slot label.
 */
/**
 * Resolves a "3ABCDF"-style slot to a team.
 * Pass `usedTeamIds` when resolving multiple slots sequentially to avoid
 * assigning the same team to more than one bracket slot.
 */
export function resolveThirdPlaceSlot(
  slotLabel: string,
  slotMap: Map<string, Team>,
  usedTeamIds?: Set<number>,
): Team | undefined {
  const eligibleGroups = slotLabel.slice(1).split('');

  for (let rank = 1; rank <= 8; rank++) {
    const teamAtRank = slotMap.get(`T${rank}`);
    if (!teamAtRank) continue;
    if (usedTeamIds?.has(teamAtRank.id)) continue; // already placed elsewhere
    const groupEntry = [...slotMap.entries()].find(
      ([key, team]) => key.startsWith('3rd_') && team.id === teamAtRank.id,
    );
    if (!groupEntry) continue;
    const groupLetter = groupEntry[0].replace('3rd_', '');
    if (eligibleGroups.includes(groupLetter)) return teamAtRank;
  }
  return undefined;
}
