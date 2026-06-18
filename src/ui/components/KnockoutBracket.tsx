'use client';

import { useState, useCallback } from 'react';
import { ScoreModal } from './ScoreModal';
import type { BracketMatchData, MatchWithTeams } from '@/domain/types';

// ── Round definitions (ordered left→right for display) ───────────────────
const ROUND_LABELS: Record<string, string> = {
  r32: 'R32',
  r16: 'R16',
  qf: 'QF',
  sf: 'SF',
  final: 'Final',
  '3rd': '3rd',
};

// The two bracket halves share the same column structure; we show them
// stacked (upper half, then lower half) within each round column so that
// winners naturally "fall into" the next round.
//
// Upper half R32 matches: 73,75 | 74,77 | 83,84 | 81,82
// Lower half R32 matches: 76,78 | 79,80 | 86,88 | 85,87
//
// We define the bracket tree by the order of matches within each round.
// The visual alignment relies on justify-around + equal flex-1 containers.
const ROUND_ORDER = ['r32', 'r16', 'qf', 'sf', 'final'] as const;

interface Props {
  matches: BracketMatchData[];
}

export function KnockoutBracket({ matches }: Props): React.ReactElement {
  const [activeMatch, setActiveMatch] = useState<MatchWithTeams | null>(null);
  const handleClose = useCallback(() => setActiveMatch(null), []);

  const byRound = new Map<string, BracketMatchData[]>();
  for (const m of matches) {
    if (!byRound.has(m.round)) byRound.set(m.round, []);
    byRound.get(m.round)!.push(m);
  }

  // Separate 3rd-place from final so it renders below the Final column
  const thirdPlace = byRound.get('3rd')?.[0];
  const finalMatch = byRound.get('final')?.[0];

  function openModal(bm: BracketMatchData): void {
    if (!bm.home.team || !bm.away.team) return;
    setActiveMatch({
      id: bm.id,
      matchNumber: bm.matchNumber,
      homeTeam: bm.home.team,
      awayTeam: bm.away.team,
      matchDate: bm.matchDate,
      venue: bm.venue,
      score: bm.score,
    });
  }

  return (
    <>
      <div className="overflow-x-auto pb-4 select-none">
        <div className="flex gap-1.5 min-w-max px-4 pt-2 items-stretch">
          {/* Main rounds: R32 → SF */}
          {ROUND_ORDER.filter((r) => r !== 'final').map((round) => {
            const roundMatches = byRound.get(round) ?? [];
            return (
              <RoundColumn
                key={round}
                label={ROUND_LABELS[round]}
                matches={roundMatches}
                onMatchClick={openModal}
              />
            );
          })}

          {/* Final + 3rd place stacked */}
          <div className="w-44 flex flex-col gap-2 shrink-0">
            <div className="text-center text-[10px] font-mono font-semibold text-amber-500 uppercase tracking-widest pb-1 border-b border-amber-200">
              Final
            </div>
            <div className="flex-1 flex flex-col justify-center gap-3">
              {finalMatch && (
                <MatchCard match={finalMatch} onClick={() => openModal(finalMatch)} highlight />
              )}
              {thirdPlace && (
                <div>
                  <p className="text-center text-[9px] font-mono text-amber-400 mb-1 uppercase tracking-wider">
                    3rd place
                  </p>
                  <MatchCard match={thirdPlace} onClick={() => openModal(thirdPlace)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {activeMatch && (
        <ScoreModal match={activeMatch} onClose={handleClose} isKnockout />
      )}
    </>
  );
}

// ── Round column ──────────────────────────────────────────────────────────
function RoundColumn({
  label,
  matches,
  onMatchClick,
}: {
  label: string;
  matches: BracketMatchData[];
  onMatchClick: (m: BracketMatchData) => void;
}): React.ReactElement {
  return (
    <div className="w-44 shrink-0 flex flex-col gap-2">
      <div className="text-center text-[10px] font-mono font-semibold text-amber-500 uppercase tracking-widest pb-1 border-b border-amber-200">
        {label}
      </div>
      <div className="flex-1 flex flex-col justify-around gap-1">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} onClick={() => onMatchClick(m)} />
        ))}
      </div>
    </div>
  );
}

// ── Individual match card ─────────────────────────────────────────────────
function MatchCard({
  match,
  onClick,
  highlight = false,
}: {
  match: BracketMatchData;
  onClick: () => void;
  highlight?: boolean;
}): React.ReactElement {
  const canClick = !!match.home.team && !!match.away.team;
  const homeWon = match.winnerId !== undefined && match.winnerId === match.home.team?.id;
  const awayWon = match.winnerId !== undefined && match.winnerId === match.away.team?.id;
  const isDraw = !!match.score && match.winnerId === undefined;

  return (
    <div
      role={canClick ? 'button' : undefined}
      tabIndex={canClick ? 0 : undefined}
      onClick={canClick ? onClick : undefined}
      onKeyDown={canClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={[
        'relative rounded border overflow-hidden font-mono text-xs',
        highlight ? 'border-amber-400 shadow-sm' : 'border-amber-200',
        canClick ? 'cursor-pointer hover:border-amber-500 hover:shadow-sm' : 'cursor-default',
      ].join(' ')}
    >
      {/* Home slot */}
      <SlotRow
        slot={match.home}
        goals={match.score?.homeGoals}
        won={homeWon}
      />
      <div className="border-t border-amber-100" />
      {/* Away slot */}
      <SlotRow
        slot={match.away}
        goals={match.score?.awayGoals}
        won={awayWon}
      />

      {/* Draw warning badge */}
      {isDraw && (
        <div className="absolute inset-x-0 bottom-0 bg-orange-100 text-orange-600 text-[9px] text-center py-0.5 border-t border-orange-200 font-semibold uppercase tracking-wide">
          Draw — re-enter score
        </div>
      )}

      {/* Match number badge */}
      <span className="absolute top-0.5 right-1 text-[8px] text-amber-300 leading-none">
        #{match.matchNumber}
      </span>
    </div>
  );
}

function SlotRow({
  slot,
  goals,
  won,
}: {
  slot: BracketMatchData['home'];
  goals: number | undefined;
  won: boolean;
}): React.ReactElement {
  const hasTeam = !!slot.team;
  return (
    <div
      className={[
        'flex items-center gap-1 px-1.5 py-1.5',
        won ? 'bg-green-50' : '',
      ].join(' ')}
    >
      {hasTeam ? (
        <>
          <span className="text-base leading-none shrink-0">{slot.team!.flagEmoji}</span>
          <span className={`flex-1 truncate ${won ? 'font-bold text-green-800' : 'text-amber-900'}`}>
            {slot.team!.name}
          </span>
        </>
      ) : (
        <>
          <span className="text-base leading-none shrink-0 opacity-30">🏳</span>
          <span className="flex-1 truncate text-amber-400 italic text-[10px]">{slot.label}</span>
        </>
      )}
      {goals !== undefined && (
        <span className={`shrink-0 font-bold w-4 text-center ${won ? 'text-green-700' : 'text-amber-600'}`}>
          {goals}
        </span>
      )}
    </div>
  );
}
