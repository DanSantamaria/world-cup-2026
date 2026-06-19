'use client';

import { useState, useCallback } from 'react';
import { GroupTable } from './GroupTable';
import { ScoreModal } from './ScoreModal';
import { ThirdPlaceTable } from './ThirdPlaceTable';
import type { GroupData, MatchWithTeams, RankedThird } from '@/domain/types';

interface Props {
  groupsData: GroupData[];
  rankedThirds: RankedThird[];
  qualifyingThirdTeamIds: number[];
}

export function GroupsPageClient({ groupsData, rankedThirds, qualifyingThirdTeamIds }: Props): React.ReactElement {
  const [activeMatch, setActiveMatch] = useState<MatchWithTeams | null>(null);
  const handleClose = useCallback(() => setActiveMatch(null), []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 pb-4">
        {groupsData.map(({ group, standings, matches }) => (
          <GroupCard
            key={group.id}
            groupName={group.name}
            standings={standings}
            matches={matches}
            onMatchClick={setActiveMatch}
            qualifyingThirdTeamIds={qualifyingThirdTeamIds}
          />
        ))}
      </div>

      {/* Best third-placed teams table */}
      <div className="px-4 pb-16">
        <ThirdPlaceTable rankedThirds={rankedThirds} />
      </div>

      {activeMatch && (
        <ScoreModal match={activeMatch} onClose={handleClose} />
      )}
    </>
  );
}

interface GroupCardProps {
  groupName: string;
  standings: GroupData['standings'];
  matches: GroupData['matches'];
  onMatchClick: (match: MatchWithTeams) => void;
  qualifyingThirdTeamIds: number[];
}

function GroupCard({ groupName, standings, matches, onMatchClick, qualifyingThirdTeamIds }: GroupCardProps): React.ReactElement {
  return (
    <div className="bg-white border border-amber-200 rounded-lg overflow-hidden">
      {/* Group header */}
      <div className="bg-amber-600 px-4 py-2 flex items-center justify-between">
        <h2 className="font-mono font-bold text-white text-sm tracking-wider">
          GROUP {groupName}
        </h2>
        <span className="font-mono text-amber-200 text-xs">
          {matches.filter((m) => m.score !== undefined).length}/{matches.length} played
        </span>
      </div>

      {/* Standings table */}
      <div className="px-4 pt-3 pb-2">
        <GroupTable standings={standings} qualifyingThirdTeamIds={qualifyingThirdTeamIds} />
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-dashed border-amber-200 my-2" />

      {/* Matches */}
      <div className="px-3 pb-3 space-y-1">
        {matches.map((match) => (
          <MatchRow key={match.id} match={match} onClick={() => onMatchClick(match)} />
        ))}
      </div>
    </div>
  );
}

interface MatchRowProps {
  match: MatchWithTeams;
  onClick: () => void;
}

function MatchRow({ match, onClick }: MatchRowProps): React.ReactElement {
  const hasScore = match.score !== undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-md px-2 py-1.5 hover:bg-amber-50 active:bg-amber-100 transition-colors group"
    >
      <div className="flex items-center gap-1 min-w-0">
        {/* Match number + date */}
        <span className="shrink-0 font-mono text-[10px] text-amber-400 w-12">
          {match.matchDate ?? `#${match.matchNumber}`}
        </span>

        {/* Home team */}
        <span className="font-mono text-xs text-amber-900 truncate flex-1 text-right">
          {match.homeTeam.flagEmoji} {match.homeTeam.countryCode}
        </span>

        {/* Score or dash */}
        <span className={`shrink-0 font-mono text-xs font-bold w-12 text-center ${hasScore ? 'text-amber-900' : 'text-amber-300'}`}>
          {hasScore
            ? `${match.score!.homeGoals} – ${match.score!.awayGoals}`
            : '· – ·'}
        </span>

        {/* Away team */}
        <span className="font-mono text-xs text-amber-900 truncate flex-1">
          {match.awayTeam.countryCode} {match.awayTeam.flagEmoji}
        </span>

        {/* Edit hint */}
        <span className="shrink-0 text-amber-300 group-hover:text-amber-500 text-xs ml-1">✏</span>
      </div>
    </button>
  );
}
