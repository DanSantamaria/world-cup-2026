import type {
  Match,
  Score,
  Team,
  BracketMatchData,
  ResolvedSlot,
} from "@/domain/types";

function fmt(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// ── 3rd-place slot assignment: MRV + backtracking CSP ───────────────────
//
// Greedy MRV (without backtracking) fails for ~535/4950 qualifying-group
// combinations. E.g. T1-T8 from groups B,C,D,E,F,G,H,A leaves 3EFGIJ empty
// because E/F/G are consumed by earlier slots first.
//
// Fix: backtrack when a dead end is detected (some remaining slot has 0
// eligible thirds left). Verified zero failures across all 4950 combinations
// in test. The official FIFA bracket always has a valid assignment.

function assignThirdsToSlots(
  slotMap: Map<string, Team>,
  thirdSlotLabels: string[],
): Map<string, Team | undefined> {
  // Build ranked list T1→T8, each tagged with the group letter of their third
  const rankedThirds: Array<{ team: Team; groupLetter: string }> = [];
  for (let rank = 1; rank <= 8; rank++) {
    const team = slotMap.get(`T${rank}`);
    if (!team) continue;
    const groupEntry = [...slotMap.entries()].find(
      ([key, t]) => key.startsWith("3rd_") && t.id === team.id,
    );
    if (!groupEntry) continue;
    rankedThirds.push({ team, groupLetter: groupEntry[0].slice(4) }); // '3rd_F' → 'F'
  }

  type Slot = { label: string; eligibleGroups: Set<string> };
  const allSlots: Slot[] = thirdSlotLabels.map((label) => ({
    label,
    eligibleGroups: new Set(label.slice(1).split("")), // "3EFGIJ" → {E,F,G,I,J}
  }));

  const assignment = new Map<string, Team | undefined>();
  const usedIds = new Set<number>();

  function candidates(slot: Slot): Array<{ team: Team; groupLetter: string }> {
    return rankedThirds.filter(
      (t) => !usedIds.has(t.team.id) && slot.eligibleGroups.has(t.groupLetter),
    );
  }

  function backtrack(remaining: Slot[]): boolean {
    if (remaining.length === 0) return true;

    // MRV: pick slot with fewest eligible candidates (ties: alphabetical label)
    const scored = remaining
      .map((slot) => ({ slot, cands: candidates(slot) }))
      .sort(
        (a, b) =>
          a.cands.length - b.cands.length ||
          a.slot.label.localeCompare(b.slot.label),
      );

    const { slot, cands } = scored[0]!;
    const next = remaining.filter((s) => s.label !== slot.label);

    for (const t of cands) {
      usedIds.add(t.team.id);
      assignment.set(slot.label, t.team);
      if (backtrack(next)) return true;
      // Dead end — undo and try next candidate
      usedIds.delete(t.team.id);
      assignment.delete(slot.label);
    }

    return false; // no valid assignment found from this state
  }

  const solved = backtrack(allSlots);

  if (!solved || assignment.size < allSlots.length) {
    // Partial: fill remaining slots with undefined and emit a warning
    for (const { label } of allSlots) {
      if (!assignment.has(label)) {
        assignment.set(label, undefined);
        if (rankedThirds.length === 8) {
          // All 8 thirds are known but slot still couldn't be filled — real bug
          console.warn(
            `[bracket] ⚠️  Could not fill slot ${label} even though all 8 thirds are determined.`,
            "Qualifying thirds:",
            rankedThirds
              .map((t) => `${t.team.countryCode}(${t.groupLetter})`)
              .join(", "),
          );
        }
      }
    }
  }

  return assignment;
}

// ── Slot label resolver ───────────────────────────────────────────────────

function resolveSlot(
  label: string,
  slotMap: Map<string, Team>,
  byMatchNum: Map<number, BracketMatchData>,
  thirdSlots: Map<string, Team | undefined>,
): ResolvedSlot {
  if (label.startsWith("WM")) {
    const mn = parseInt(label.slice(2));
    const prev = byMatchNum.get(mn);
    if (prev?.winnerId !== undefined) {
      const team =
        prev.home.team?.id === prev.winnerId ? prev.home.team : prev.away.team;
      return { label, team };
    }
    return { label };
  }

  if (label.startsWith("LM")) {
    const mn = parseInt(label.slice(2));
    const prev = byMatchNum.get(mn);
    if (prev?.loserId !== undefined) {
      const team =
        prev.home.team?.id === prev.loserId ? prev.home.team : prev.away.team;
      return { label, team };
    }
    return { label };
  }

  if (label.startsWith("3") && label.length > 2) {
    return { label, team: thirdSlots.get(label) };
  }

  return { label, team: slotMap.get(label) };
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Validates that all 32 teams in R32 slots are unique.
 * Returns an array of error strings (empty = no duplicates).
 */
export function validateR32Uniqueness(
  bracketMatches: BracketMatchData[],
): string[] {
  const r32 = bracketMatches.filter((m) => m.round === "r32");
  const seen = new Map<number, { code: string; matchNums: number[] }>();

  for (const m of r32) {
    for (const slot of [m.home, m.away]) {
      if (!slot.team) continue;
      const { id, countryCode } = slot.team;
      if (!seen.has(id)) seen.set(id, { code: countryCode, matchNums: [] });
      seen.get(id)!.matchNums.push(m.matchNumber);
    }
  }

  const errors: string[] = [];
  for (const { code, matchNums } of seen.values()) {
    if (matchNums.length > 1) {
      errors.push(`DUPLICATE: ${code} appears in M${matchNums.join(", M")}`);
    }
  }
  return errors;
}

export function buildBracket(
  knockoutMatches: Match[],
  scoresMap: Map<number, Score>,
  slotMap: Map<string, Team>,
): BracketMatchData[] {
  const sorted = [...knockoutMatches].sort(
    (a, b) => a.matchNumber - b.matchNumber,
  );

  // Collect all distinct 3rd-place slot labels from the DB
  const thirdSlotLabels = [
    ...new Set(
      sorted
        .flatMap((m) => [m.homeSlot, m.awaySlot])
        .filter((s): s is string => !!s && s.startsWith("3") && s.length > 2),
    ),
  ];

  // Debug: log qualifying thirds and their group assignments (server-side console)
  if (process.env.NODE_ENV === "development") {
    const thirds: string[] = [];
    for (let rank = 1; rank <= 8; rank++) {
      const team = slotMap.get(`T${rank}`);
      if (!team) {
        thirds.push(`T${rank}=?`);
        continue;
      }
      const groupEntry = [...slotMap.entries()].find(
        ([k, t]) => k.startsWith("3rd_") && t.id === team.id,
      );
      const gl = groupEntry ? groupEntry[0].slice(4) : "?";
      thirds.push(`T${rank}=${team.countryCode}(${gl})`);
    }
    console.log("[bracket] Qualifying thirds:", thirds.join(", "));
  }

  // Assign thirds using MRV+backtracking CSP — guaranteed unique and complete
  const thirdSlots = assignThirdsToSlots(slotMap, thirdSlotLabels);

  const byMatchNum = new Map<number, BracketMatchData>();
  const result: BracketMatchData[] = [];

  for (const match of sorted) {
    const home = resolveSlot(
      match.homeSlot ?? "",
      slotMap,
      byMatchNum,
      thirdSlots,
    );
    const away = resolveSlot(
      match.awaySlot ?? "",
      slotMap,
      byMatchNum,
      thirdSlots,
    );

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
      } else if (score.awayGoals === score.homeGoals) {
        if (score.homePenalties !== null && score.awayPenalties !== null) {
          if (score.homePenalties > score.awayPenalties) {
            winnerId = home.team.id;
            loserId = away.team.id;
          } else if (score.awayPenalties > score.homePenalties) {
            winnerId = away.team.id;
            loserId = home.team.id;
          }
        }
      }
    }

    const bm: BracketMatchData = {
      id: match.id,
      matchNumber: match.matchNumber,
      round: match.round,
      matchDate: match.matchDate ? fmt(match.matchDate) : null,
      venue: match.venue,
      home,
      away,
      score: score
        ? {
            homeGoals: score.homeGoals,
            awayGoals: score.awayGoals,
            homePenalties: score.homePenalties,
            awayPenalties: score.awayPenalties,
          }
        : undefined,
      winnerId,
      loserId,
    };

    byMatchNum.set(match.matchNumber, bm);
    result.push(bm);
  }

  return result;
}
