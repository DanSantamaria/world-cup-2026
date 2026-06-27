import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/infrastructure/auth';
import { signOutAction } from '@/app/dashboard/actions';
import { getAllGroupStageData } from '@/infrastructure/db/queries/groups';
import { getAllKnockoutMatches } from '@/infrastructure/db/queries/knockout';
import { getUserScoresForMatches } from '@/infrastructure/db/queries/scores';
import { calculateStandings } from '@/use-cases/calculateStandings';
import { determineAdvancing } from '@/use-cases/determineAdvancing';
import { buildBracket, validateR32Uniqueness } from '@/use-cases/buildBracket';
import { KnockoutBracket } from '@/ui/components/KnockoutBracket';
import { Footer } from '@/ui/components/Footer';

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

  if (process.env.NODE_ENV === 'development') {
    const dupes = validateR32Uniqueness(bracketMatches);
    if (dupes.length > 0) console.warn('[bracket] R32 uniqueness violations:', dupes);
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* Non-sticky page header: logo + sign out */}
      <header className="bg-paper pt-5 pb-3 px-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 max-w-5xl mx-auto">
          <div />
          <img
            src="/scores-cup-logo.svg?v=2"
            alt="Scores Cup 26"
            className="h-20 w-auto"
            draggable={false}
          />
          <div className="flex justify-end pt-1">
            <form action={signOutAction}>
              <button type="submit" className="text-xs text-gold font-semibold hover:text-gold-dark transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Sticky 3-tab navigation — Brackets is active */}
      <nav className="sticky top-0 z-40">
        <div className="flex">
          <Link href="/groups" className="flex-1 py-3 text-center font-display text-[13px] tracking-wide text-white/85 bg-gold-dark">
            Group Stage
          </Link>
          <Link href="/bracket" className="flex-1 py-3 text-center font-display text-[13px] tracking-wide text-white bg-gold">
            Brackets
          </Link>
          <Link href="/matches" className="flex-1 py-3 text-center font-display text-[13px] tracking-wide text-white/85 bg-gold-dark">
            Matches
          </Link>
        </div>
      </nav>

     

      {/* Bracket (horizontally scrollable on mobile) */}
      <KnockoutBracket matches={bracketMatches} />
      <Footer />
    </div>
  );
}
