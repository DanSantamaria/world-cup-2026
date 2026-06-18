export interface Group {
  id: number;
  name: string; // A–L
}

export interface Team {
  id: number;
  name: string;
  countryCode: string;
  flagEmoji: string;
  groupId: number;
}

export interface Match {
  id: number;
  groupId: number | null;
  round: string;
  matchNumber: number;
  homeTeamId: number | null;
  awayTeamId: number | null;
  matchDate: Date | null;
  venue: string | null;
  homeSlot: string | null;
  awaySlot: string | null;
}

export interface Score {
  id: number;
  userId: number;
  matchId: number;
  homeGoals: number;
  awayGoals: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string | null;
  provider: string | null;
  createdAt: Date | null;
}

export interface Standing {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

// View-layer composites (serialisable, passed server → client)
export interface MatchWithTeams {
  id: number;
  matchNumber: number;
  homeTeam: Team;
  awayTeam: Team;
  matchDate: string | null; // pre-formatted "Jun 11" server-side
  venue: string | null;
  score?: { homeGoals: number; awayGoals: number };
}

export interface GroupData {
  group: Group;
  standings: Standing[];
  matches: MatchWithTeams[];
}
