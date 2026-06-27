'use client';

import { useState, useCallback } from 'react';
import { ScoreModal } from './ScoreModal';
import type { BracketMatchData, MatchWithTeams } from '@/domain/types';

// ── Layout constants (px) ────────────────────────────────────────────────
const SLOT_H   = 80;   // vertical space per R32 slot
const CARD_H   = 64;   // card height
const CARD_W   = 118;  // reduced from 152 so the full bracket fits a 13" screen
const HEADER_H = 36;   // round-label row above cards
const CONN_W   = 12;   // connector SVG width between columns
const COL_H    = HEADER_H + 8 * SLOT_H;

// Brand colors used in SVG (Tailwind can't reach inside SVG attributes)
const GOLD = '#B3944D';

// Vertical center of a card
function cy(ri: number, pos: number): number {
  return HEADER_H + (pos + 0.5) * Math.pow(2, ri) * SLOT_H;
}
function cardTop(ri: number, pos: number): number {
  return Math.round(cy(ri, pos) - CARD_H / 2);
}

// ── Official FIFA 2026 bracket order ─────────────────────────────────────
const L_R32 = [74, 77, 73, 75, 83, 84, 81, 82];
const L_R16 = [89, 90, 93, 94];
const L_QF  = [97, 98];
const L_SF  = [101];

const R_SF  = [102];
const R_QF  = [99, 100];
const R_R16 = [91, 92, 95, 96];
const R_R32 = [76, 78, 79, 80, 86, 88, 85, 87];

const FINAL = 104;
const THIRD = 103;

function fmtLabel(raw: string): string {
  if (raw.startsWith('WM')) return `W${raw.slice(2)}`;
  if (raw.startsWith('LM')) return `L${raw.slice(2)}`;
  if (raw.startsWith('3') && raw.length > 2) return '3rd';
  return raw;
}

interface Props { matches: BracketMatchData[] }

export function KnockoutBracket({ matches }: Props): React.ReactElement {
  const [active, setActive] = useState<MatchWithTeams | null>(null);
  const close = useCallback(() => setActive(null), []);
  const byNum = new Map(matches.map((m) => [m.matchNumber, m]));

  function open(bm: BracketMatchData): void {
    if (!bm.home.team || !bm.away.team) return;
    setActive({
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
      <div className="overflow-x-auto pb-6 select-none pt-4">
        <div className="flex items-start w-fit mx-auto px-2 pb-4 pt-1">

          {/* ── Left half ─────────────────────────────────────────── */}
          <RoundCol label="R32" nums={L_R32} ri={0} byNum={byNum} onOpen={open} />
          <Conn parentRi={0} n={8} dir="right" />
          <RoundCol label="R16" nums={L_R16} ri={1} byNum={byNum} onOpen={open} />
          <Conn parentRi={1} n={4} dir="right" />
          <RoundCol label="QF"  nums={L_QF}  ri={2} byNum={byNum} onOpen={open} />
          <Conn parentRi={2} n={2} dir="right" />
          <RoundCol label="SF"  nums={L_SF}  ri={3} byNum={byNum} onOpen={open} />
          <SFLine />

          {/* ── Center: Final + 3rd place ─────────────────────────── */}
          <CenterCol finalM={byNum.get(FINAL)} thirdM={byNum.get(THIRD)} onOpen={open} />

          {/* ── Right half ────────────────────────────────────────── */}
          <SFLine />
          <RoundCol label="SF"  nums={R_SF}  ri={3} byNum={byNum} onOpen={open} />
          <Conn parentRi={2} n={2} dir="left" />
          <RoundCol label="QF"  nums={R_QF}  ri={2} byNum={byNum} onOpen={open} />
          <Conn parentRi={1} n={4} dir="left" />
          <RoundCol label="R16" nums={R_R16} ri={1} byNum={byNum} onOpen={open} />
          <Conn parentRi={0} n={8} dir="left" />
          <RoundCol label="R32" nums={R_R32} ri={0} byNum={byNum} onOpen={open} />

        </div>
      </div>

      {active && <ScoreModal match={active} onClose={close} isKnockout />}
    </>
  );
}

// ── Round column ──────────────────────────────────────────────────────────
function RoundCol({
  label, nums, ri, byNum, onOpen,
}: {
  label: string;
  nums: number[];
  ri: number;
  byNum: Map<number, BracketMatchData>;
  onOpen: (m: BracketMatchData) => void;
}): React.ReactElement {
  return (
    <div style={{ width: CARD_W, height: COL_H, position: 'relative', flexShrink: 0 }}>
      <RoundHeader>{label}</RoundHeader>
      {nums.map((n, pos) => {
        const m = byNum.get(n);
        if (!m) return null;
        return (
          <div key={n} style={{ position: 'absolute', top: cardTop(ri, pos), left: 0, right: 0 }}>
            <MatchCard match={m} onOpen={onOpen} />
          </div>
        );
      })}
    </div>
  );
}

// ── Center column (Final + 3rd place) ────────────────────────────────────
function CenterCol({
  finalM, thirdM, onOpen,
}: {
  finalM?: BracketMatchData;
  thirdM?: BracketMatchData;
  onOpen: (m: BracketMatchData) => void;
}): React.ReactElement {
  const top      = cardTop(3, 0);
  const thirdTop = top + CARD_H + 44; // extra gap between Final and 3rd place

  return (
    <div style={{ width: CARD_W + 16, height: COL_H, position: 'relative', flexShrink: 0 }}>
      {/* Final label */}
      <div
        style={{ position: 'absolute', top: top - 18, left: 0, right: 0 }}
        className="text-center text-[9px] font-display text-gold-dark uppercase tracking-widest"
      >
        Final
      </div>

      {finalM && (
        <div style={{ position: 'absolute', top, left: 8, right: 8 }}>
          <MatchCard match={finalM} onOpen={onOpen} variant="final" />
        </div>
      )}

      {/* 3rd-place label */}
      <div
        style={{ position: 'absolute', top: thirdTop - 16, left: 0, right: 0 }}
        className="text-center text-[9px] font-display text-gold uppercase tracking-wider"
      >
        3rd place
      </div>

      {thirdM && (
        <div style={{ position: 'absolute', top: thirdTop, left: 8, right: 8 }}>
          <MatchCard match={thirdM} onOpen={onOpen} variant="third" />
        </div>
      )}
    </div>
  );
}

// ── Connector SVG ─────────────────────────────────────────────────────────
function Conn({ parentRi, n, dir }: {
  parentRi: number;
  n: number;
  dir: 'left' | 'right';
}): React.ReactElement {
  const childRi    = parentRi + 1;
  const childCount = n / 2;
  const mx         = CONN_W / 2;

  const paths: React.ReactElement[] = [];
  for (let i = 0; i < childCount; i++) {
    const p1 = cy(parentRi, i * 2);
    const p2 = cy(parentRi, i * 2 + 1);
    const c  = cy(childRi, i);

    if (dir === 'right') {
      paths.push(
        <g key={i} stroke={GOLD} strokeWidth={1} fill="none" opacity={0.7}>
          <line x1={0}      y1={p1} x2={mx}     y2={p1} />
          <line x1={0}      y1={p2} x2={mx}     y2={p2} />
          <line x1={mx}     y1={p1} x2={mx}     y2={p2} />
          <line x1={mx}     y1={c}  x2={CONN_W} y2={c}  />
        </g>,
      );
    } else {
      paths.push(
        <g key={i} stroke={GOLD} strokeWidth={1} fill="none" opacity={0.7}>
          <line x1={CONN_W} y1={p1} x2={mx} y2={p1} />
          <line x1={CONN_W} y1={p2} x2={mx} y2={p2} />
          <line x1={mx}     y1={p1} x2={mx} y2={p2} />
          <line x1={mx}     y1={c}  x2={0}  y2={c}  />
        </g>,
      );
    }
  }

  return (
    <svg width={CONN_W} height={COL_H} style={{ flexShrink: 0, display: 'block' }} aria-hidden="true">
      {paths}
    </svg>
  );
}

// ── SF → Final horizontal line ────────────────────────────────────────────
function SFLine(): React.ReactElement {
  const y = cy(3, 0);
  return (
    <svg width={CONN_W} height={COL_H} style={{ flexShrink: 0, display: 'block' }} aria-hidden="true">
      <line x1={0} y1={y} x2={CONN_W} y2={y} stroke={GOLD} strokeWidth={1} opacity={0.7} />
    </svg>
  );
}

// ── Round column header ───────────────────────────────────────────────────
function RoundHeader({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div
      style={{ height: HEADER_H }}
      className="flex items-center justify-center text-[9px] font-display uppercase tracking-widest text-gold-dark border-b border-gold/25"
    >
      {children}
    </div>
  );
}

// ── Match card ────────────────────────────────────────────────────────────
type CardVariant = 'default' | 'final' | 'third';

function MatchCard({
  match, onOpen, variant = 'default',
}: {
  match: BracketMatchData;
  onOpen: (m: BracketMatchData) => void;
  variant?: CardVariant;
}): React.ReactElement {
  const canClick = !!match.home.team && !!match.away.team;
  const homeWon  = match.winnerId !== undefined && match.winnerId === match.home.team?.id;
  const awayWon  = match.winnerId !== undefined && match.winnerId === match.away.team?.id;

  const borderClass: Record<CardVariant, string> = {
    default: 'border border-ink/10',
    final:   'border border-gold-dark',
    third:   'border border-gold',
  };

  return (
    <div
      role={canClick ? 'button' : undefined}
      tabIndex={canClick ? 0 : undefined}
      onClick={canClick ? () => onOpen(match) : undefined}
      onKeyDown={canClick ? (e) => e.key === 'Enter' && onOpen(match) : undefined}
      style={{ height: CARD_H }}
      className={[
        'relative flex flex-col rounded overflow-hidden bg-white',
        borderClass[variant],
        canClick ? 'cursor-pointer hover:border-gold/60 transition-colors' : 'cursor-default',
      ].join(' ')}
    >
      {/* Gold header: match number + date */}
      <div
        className="flex items-center justify-between px-1.5 bg-gold shrink-0"
        style={{ height: 14 }}
      >
        <span className="text-[9px] font-bold tracking-wide text-white">
          M{match.matchNumber}
        </span>
        {match.matchDate && (
          <span className="text-[8px] text-white/65">{match.matchDate}</span>
        )}
      </div>

      <TeamRow slot={match.home} goals={match.score?.homeGoals} penalties={match.score?.homePenalties} won={homeWon} />
      <div className="border-t border-ink/8 shrink-0" />
      <TeamRow slot={match.away} goals={match.score?.awayGoals} penalties={match.score?.awayPenalties} won={awayWon} />
    </div>
  );
}

// ── Team row ──────────────────────────────────────────────────────────────
function TeamRow({
  slot, goals, penalties, won,
}: {
  slot: BracketMatchData['home'];
  goals: number | undefined;
  penalties: number | null | undefined;
  won: boolean;
}): React.ReactElement {
  return (
    <div className={`flex items-center gap-1 px-1.5 flex-1 ${won ? 'bg-green-50' : ''}`}>
      {slot.team ? (
        <>
          <span className="text-sm leading-none shrink-0">{slot.team.flagEmoji}</span>
          <span className={`flex-1 truncate text-[11px] leading-none ${won ? 'font-bold text-green-800' : 'text-ink'}`}>
            {slot.team.countryCode}
          </span>
        </>
      ) : (
        <>
          <span className="text-[11px] leading-none shrink-0 text-ink/20">—</span>
          <span className="flex-1 truncate text-[10px] leading-none text-ink/30 italic">
            {slot.label ? fmtLabel(slot.label) : '?'}
          </span>
        </>
      )}

      <div className="shrink-0 flex items-baseline gap-0.5">
        {goals !== undefined ? (
          <>
            <span className={`font-bold text-[11px] leading-none w-4 text-center ${won ? 'text-green-700' : 'text-ink/70'}`}>
              {goals}
            </span>
            {penalties != null && (
              <span className={`text-[8px] leading-none ${won ? 'text-green-600' : 'text-ink/40'}`}>
                ({penalties})
              </span>
            )}
          </>
        ) : (
          // Placeholder when no score has been entered yet
          <span className="text-[11px] leading-none w-4 text-center text-ink/20">–</span>
        )}
      </div>
    </div>
  );
}
