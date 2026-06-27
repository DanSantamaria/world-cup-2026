import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/infrastructure/auth';
import { signOutAction } from '@/app/dashboard/actions';
import { getAllGroupStageData } from '@/infrastructure/db/queries/groups';
import { getUserScoresForMatches } from '@/infrastructure/db/queries/scores';
import { calculateStandings } from '@/use-cases/calculateStandings';
import { rankThirdPlacers } from '@/use-cases/determineAdvancing';
import { GroupsPageClient } from '@/ui/components/GroupsPageClient';
import { Footer } from '@/ui/components/Footer';
import { isUserOutOfSync } from '@/infrastructure/db/queries/scores';
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
  const [userScores, outOfSync] = await Promise.all([
    getUserScoresForMatches(userId, matchIds),
    isUserOutOfSync(userId),
  ]);
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

  const rankedThirds: RankedThird[] = rankThirdPlacers(
    groupsData.map((gd) => ({ groupName: gd.group.name, standings: gd.standings })),
  );
  const qualifyingThirdTeamIds = rankedThirds
    .filter((t) => t.qualifies)
    .map((t) => t.standing.team.id);

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

      {/* Sticky 3-tab navigation */}
      <nav className="sticky top-0 z-40">
        <div className="flex">
          <Link
            href="/groups"
            className="flex-1 py-3 text-center font-display text-[13px] tracking-wide text-white bg-gold"
          >
            Group Stage
          </Link>
          <Link
            href="/bracket"
            className="flex-1 py-3 text-center font-display text-[13px] tracking-wide text-white/85 bg-gold-dark"
          >
            Brackets
          </Link>
          <Link
            href="/matches"
            className="flex-1 py-3 text-center font-display text-[13px] tracking-wide text-white/85 bg-gold-dark"
          >
            Matches
          </Link>
        </div>
      </nav>

      <GroupsPageClient
        groupsData={groupsData}
        rankedThirds={rankedThirds}
        qualifyingThirdTeamIds={qualifyingThirdTeamIds}
        isOutOfSync={outOfSync}
      />
      <Footer />
    </div>
  );
}
