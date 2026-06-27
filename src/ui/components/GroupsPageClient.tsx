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
  const played = matches.filter((m) => m.score !== undefined).length;

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-ink/8">
      {/* Gold header — white text */}
      <div className="bg-gold px-4 py-2.5 flex items-center justify-between">
        <h2 className="font-display text-[15px] text-white tracking-wide">
          Group {groupName}
        </h2>
        <span className="text-[11px] text-white/65">
          {played}/{matches.length} Played
        </span>
      </div>

      {/* Standings */}
      <div className="px-4 pt-3 pb-2">
        <GroupTable standings={standings} qualifyingThirdTeamIds={qualifyingThirdTeamIds} />
      </div>

      {/* Divider */}
      <div className="mx-4 my-1 border-t border-dashed border-gold-dark/50" />

      {/* Matches */}
      <div className="px-2 pb-3 space-y-0">
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

function PencilIcon({ className = '' }: { className?: string }): React.ReactElement {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" />
      <path d="M7 3L9 5" />
    </svg>
  );
}

function MatchRow({ match, onClick }: MatchRowProps): React.ReactElement {
  const hasScore = match.score !== undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded px-2 py-1.5 hover:bg-ink/4 active:bg-ink/8 transition-colors group"
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Date — gold auxiliary text */}
        <span className="shrink-0 text-[10px] text-gold w-12 tabular-nums font-medium">
          {match.matchDate ?? `#${match.matchNumber}`}
        </span>

        {/* Home team */}
        <span className="text-[11px] text-ink/75 truncate flex-1 text-right">
          {match.homeTeam.flagEmoji} {match.homeTeam.countryCode}
        </span>

        {/* Score */}
        <span className={`shrink-0 text-[11px] font-bold w-12 text-center tabular-nums ${hasScore ? 'text-ink' : 'text-ink/20'}`}>
          {hasScore
            ? `${match.score!.homeGoals} – ${match.score!.awayGoals}`
            : '· – ·'}
        </span>

        {/* Away team */}
        <span className="text-[11px] text-ink/75 truncate flex-1">
          {match.awayTeam.countryCode} {match.awayTeam.flagEmoji}
        </span>

        {/* Pencil icon — always gold tint, brightens on hover */}
        <PencilIcon className="shrink-0 text-gold/50 group-hover:text-gold transition-colors ml-1" />
      </div>
    </button>
  );
}
