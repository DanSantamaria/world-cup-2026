import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/infrastructure/auth';
import { signOutAction } from '@/app/dashboard/actions';
import { getAllGroupStageData } from '@/infrastructure/db/queries/groups';
import { getUserScoresForMatches } from '@/infrastructure/db/queries/scores';
import { calculateStandings } from '@/use-cases/calculateStandings';
import { rankThirdPlacers } from '@/use-cases/determineAdvancing';
import { GroupsPageClient } from '@/ui/components/GroupsPageClient';
import type { GroupData, MatchWithTeams, RankedThird } from '@/domain/types';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function GroupsPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = parseInt(session.user.id);
  const { groups, teams, matches } = await getAllGroupStageData();

  const matchIds = matches.map((m) => m.id);
  const userScores = await getUserScoresForMatches(userId, matchIds);
  const scoresMap = new Map(userScores.map((s) => [s.matchId, s]));
  const teamsMap = new Map(teams.map((t) => [t.id, t]));

  const groupsData: GroupData[] = groups.map((group) => {
    const groupTeams = teams.filter((t) => t.groupId === group.id);
    const groupMatches = matches.filter((m) => m.groupId === group.id);
    const groupMatchIds = new Set(groupMatches.map((m) => m.id));
    const groupScores = userScores.filter((s) => groupMatchIds.has(s.matchId));

    const standings = calculateStandings(groupTeams, groupMatches, groupScores);

    const matchesWithTeams: MatchWithTeams[] = groupMatches.map((m) => ({
      id: m.id,
      matchNumber: m.matchNumber,
      homeTeam: teamsMap.get(m.homeTeamId!)!,
      awayTeam: teamsMap.get(m.awayTeamId!)!,
      matchDate: m.matchDate ? formatDate(m.matchDate) : null,
      venue: m.venue,
      score: scoresMap.has(m.id)
        ? {
            homeGoals: scoresMap.get(m.id)!.homeGoals,
            awayGoals: scoresMap.get(m.id)!.awayGoals,
            homePenalties: scoresMap.get(m.id)!.homePenalties,
            awayPenalties: scoresMap.get(m.id)!.awayPenalties,
            homeYellowCards: scoresMap.get(m.id)!.homeYellowCards,
            awayYellowCards: scoresMap.get(m.id)!.awayYellowCards,
            homeRedCards: scoresMap.get(m.id)!.homeRedCards,
            awayRedCards: scoresMap.get(m.id)!.awayRedCards,
          }
        : undefined,
    }));

    return { group, standings, matches: matchesWithTeams };
  });

  // Rank all 12 third-place teams for the qualifying table + color coding
  const rankedThirds: RankedThird[] = rankThirdPlacers(
    groupsData.map((gd) => ({ groupName: gd.group.name, standings: gd.standings })),
  );
  const qualifyingThirdTeamIds = rankedThirds
    .filter((t) => t.qualifies)
    .map((t) => t.standing.team.id);

  const totalPlayed = userScores.length;
  const totalMatches = 72;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-amber-200 bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">⚽</span>
          <span className="font-mono font-bold text-amber-900 text-sm truncate">
            World Cup 2026
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-xs text-amber-600 hidden sm:block">
            {totalPlayed}/{totalMatches} scored
          </span>
          <Link
            href="/schedule"
            className="font-mono text-xs text-amber-700 hover:text-amber-900 hover:underline"
          >
            Schedule
          </Link>
          <Link
            href="/bracket"
            className="font-mono text-xs text-amber-700 hover:text-amber-900 hover:underline"
          >
            Bracket →
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="font-mono text-xs text-amber-500 hover:text-amber-700"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Page title */}
      <div className="px-4 pt-5 pb-1">
        <h1 className="font-mono font-bold text-lg text-amber-900">Group Stage</h1>
        <p className="font-mono text-xs text-amber-600 mt-0.5">
          Tap any match to enter a score. Top 2 per group + best 8 thirds advance.
        </p>
      </div>

      <GroupsPageClient
        groupsData={groupsData}
        rankedThirds={rankedThirds}
        qualifyingThirdTeamIds={qualifyingThirdTeamIds}
      />
    </div>
  );
}
