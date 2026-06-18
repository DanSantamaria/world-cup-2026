import type { Standing, Team } from '@/domain/types';

interface GroupResult {
  groupName: string; // "A"–"L"
  standings: Standing[];
}

// Returns a map of slot label → Team for every resolvable slot:
//   "1A" → winner of group A
//   "2A" → runner-up of group A
//   "T1"–"T12" → 3rd-place teams ranked Pts→GD→GF
// Slots for 3rd-place teams in R32 (e.g. "3ABCDF") are resolved in buildBracket
// using this T-ranked map, so they don't appear here directly.
export function determineAdvancing(groups: GroupResult[]): Map<string, Team> {
  const slotMap = new Map<string, Team>();
  const thirdPlacers: { standing: Standing; groupName: string }[] = [];

  for (const { groupName, standings } of groups) {
    if (standings[0]) slotMap.set(`1${groupName}`, standings[0].team);
    if (standings[1]) slotMap.set(`2${groupName}`, standings[1].team);
    if (standings[2]) thirdPlacers.push({ standing: standings[2], groupName });
  }

  // Rank all 12 third-place finishers: Pts → GD → GF → Disciplinary (fewer = better)
  thirdPlacers.sort((a, b) => {
    const sa = a.standing;
    const sb = b.standing;
    if (sb.points !== sa.points) return sb.points - sa.points;
    if (sb.goalDifference !== sa.goalDifference) return sb.goalDifference - sa.goalDifference;
    if (sb.goalsFor !== sa.goalsFor) return sb.goalsFor - sa.goalsFor;
    return sa.disciplinaryPoints - sb.disciplinaryPoints;
  });

  // T1 = best 3rd place, T12 = worst; T1–T8 qualify for R32
  thirdPlacers.forEach(({ standing, groupName }, i) => {
    const rank = i + 1;
    slotMap.set(`T${rank}`, standing.team);
    // Also index by group letter so buildBracket can resolve "3ABCDF"-style slots
    slotMap.set(`3rd_${groupName}`, standing.team);
  });

  return slotMap;
}

// Resolves a composite 3rd-place slot label like "3ABCDF" to a team.
// Picks the highest-ranked qualifying (T1–T8) 3rd-place team whose group
// letter appears in the slot label.
export function resolveThirdPlaceSlot(
  slotLabel: string, // e.g. "3ABCDF"
  slotMap: Map<string, Team>,
): Team | undefined {
  const eligibleGroups = slotLabel.slice(1).split(''); // ["A","B","C","D","F"]

  // Walk T1→T8 in rank order; first match wins
  for (let rank = 1; rank <= 8; rank++) {
    // Find which group this rank's team came from
    const teamAtRank = slotMap.get(`T${rank}`);
    if (!teamAtRank) continue;
    // Find their group letter
    const groupEntry = [...slotMap.entries()].find(
      ([key, team]) => key.startsWith('3rd_') && team.id === teamAtRank.id,
    );
    if (!groupEntry) continue;
    const groupLetter = groupEntry[0].replace('3rd_', '');
    if (eligibleGroups.includes(groupLetter)) return teamAtRank;
  }
  return undefined;
}
