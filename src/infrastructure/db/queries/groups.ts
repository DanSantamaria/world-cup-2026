import { db } from '../client';
import { groups, teams, matches } from '../schema';
import { eq, asc } from 'drizzle-orm';
import type { Group, Team, Match } from '@/domain/types';

export async function getAllGroupStageData(): Promise<{
  groups: Group[];
  teams: Team[];
  matches: Match[];
}> {
  const [allGroups, allTeams, allMatches] = await Promise.all([
    db.select().from(groups).orderBy(asc(groups.name)),
    db.select().from(teams).orderBy(asc(teams.id)),
    db.select().from(matches).where(eq(matches.round, 'group')).orderBy(asc(matches.matchNumber)),
  ]);
  return { groups: allGroups, teams: allTeams, matches: allMatches };
}
