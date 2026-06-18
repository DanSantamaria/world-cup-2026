import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/infrastructure/auth';
import { signOutAction } from '@/app/dashboard/actions';
import { getAllGroupStageData } from '@/infrastructure/db/queries/groups';
import { getAllKnockoutMatches } from '@/infrastructure/db/queries/knockout';
import { getUserScoresForMatches } from '@/infrastructure/db/queries/scores';
import { calculateStandings } from '@/use-cases/calculateStandings';
import { determineAdvancing } from '@/use-cases/determineAdvancing';
import { buildBracket } from '@/use-cases/buildBracket';
import { KnockoutBracket } from '@/ui/components/KnockoutBracket';

export default async function BracketPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = parseInt(session.user.id);

  // Fetch all data in parallel
  const [{ groups, teams, matches: groupMatches }, knockoutMatches] = await Promise.all([
    getAllGroupStageData(),
    getAllKnockoutMatches(),
  ]);

  const allMatchIds = [...groupMatches, ...knockoutMatches].map((m) => m.id);
  const allScores = await getUserScoresForMatches(userId, allMatchIds);

  const groupScoresMap = new Map(
    allScores
      .filter((s) => groupMatches.some((m) => m.id === s.matchId))
      .map((s) => [s.matchId, s]),
  );
  const knockoutScoresMap = new Map(
    allScores
      .filter((s) => knockoutMatches.some((m) => m.id === s.matchId))
      .map((s) => [s.matchId, s]),
  );

  // Build group standings
  const groupResults = groups.map((group) => {
    const groupTeams = teams.filter((t) => t.groupId === group.id);
    const gMatches = groupMatches.filter((m) => m.groupId === group.id);
    const gScores = allScores.filter((s) => gMatches.some((m) => m.id === s.matchId));
    return {
      groupName: group.name,
      standings: calculateStandings(groupTeams, gMatches, gScores),
    };
  });

  const groupScoredCount = groupMatches.filter((m) => groupScoresMap.has(m.id)).length;
  const groupComplete = groupScoredCount === 72;

  // Resolve bracket slots
  const slotMap = determineAdvancing(groupResults);
  const bracketMatches = buildBracket(knockoutMatches, knockoutScoresMap, slotMap);

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-amber-200 bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">⚽</span>
          <span className="font-mono font-bold text-amber-900 text-sm">World Cup 2026</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/groups" className="font-mono text-xs text-amber-700 hover:text-amber-900 hover:underline">
            ← Groups
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="font-mono text-xs text-amber-500 hover:text-amber-700">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Page title */}
      <div className="px-4 pt-5 pb-2">
        <h1 className="font-mono font-bold text-lg text-amber-900">Knockout Bracket</h1>
        {!groupComplete && (
          <p className="font-mono text-xs text-amber-500 mt-0.5">
            {groupScoredCount}/72 group matches scored — slots fill as you enter scores.
          </p>
        )}
        <p className="font-mono text-xs text-amber-600 mt-0.5">
          Tap any match with known teams to enter a score.
        </p>
      </div>

      {/* Bracket (horizontally scrollable on mobile) */}
      <KnockoutBracket matches={bracketMatches} />
    </div>
  );
}
