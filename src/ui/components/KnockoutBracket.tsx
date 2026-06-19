'use client';

import { useState, useCallback } from 'react';
import { ScoreModal } from './ScoreModal';
import type { BracketMatchData, MatchWithTeams } from '@/domain/types';

// ── Layout constants (px) ────────────────────────────────────────────────
const SLOT_H = 80;    // vertical space allocated per R32 slot
const CARD_H = 64;    // total card height  (12 header + 25 home + 1 sep + 26 away)
const CARD_W = 152;   // card + column width
const HEADER_H = 36;  // round-label row height above cards
const CONN_W = 18;    // SVG connector width between columns
const COL_H = HEADER_H + 8 * SLOT_H; // 676

// Vertical center of a card at `slotPos` in `roundIdx` (0=R32, 1=R16, 2=QF, 3=SF)
function cy(ri: number, pos: number): number {
  return HEADER_H + (pos + 0.5) * Math.pow(2, ri) * SLOT_H;
}
function cardTop(ri: number, pos: number): number {
  return Math.round(cy(ri, pos) - CARD_H / 2);
}

// ── Official FIFA 2026 bracket order (top→bottom per column) ─────────────
// Left half: R32→R16→QF→SF converging to the Final at center
const L_R32 = [74, 77, 73, 75, 83, 84, 81, 82];
const L_R16 = [89, 90, 93, 94];
const L_QF  = [97, 98];
const L_SF  = [101];

// Right half: SF→QF→R16→R32 mirrored from center outward
const R_SF  = [102];
const R_QF  = [99, 100];
const R_R16 = [91, 92, 95, 96];
const R_R32 = [76, 78, 79, 80, 86, 88, 85, 87];

const FINAL = 104;
const THIRD = 103;

// ── Format a raw DB slot label for display ───────────────────────────────
// "WM74"  → "W74"     (winner of match 74)
// "LM101" → "L101"    (loser of match 101)
// "3ABCDF"→ "3rd"     (best qualifying 3rd from those groups)
// "1E"    → "1E"       (group position labels unchanged)
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
      <div className="overflow-x-auto pb-6 select-none">
        <div className="flex items-start min-w-max px-3 pb-4 pt-1">

          {/* ── Left half ─────────────────────────────────────────── */}
          <RoundCol label="R32"   nums={L_R32} ri={0} byNum={byNum} onOpen={open} />
          <Conn parentRi={0} n={8} dir="right" />
          <RoundCol label="R16"   nums={L_R16} ri={1} byNum={byNum} onOpen={open} />
          <Conn parentRi={1} n={4} dir="right" />
          <RoundCol label="QF"    nums={L_QF}  ri={2} byNum={byNum} onOpen={open} />
          <Conn parentRi={2} n={2} dir="right" />
          <RoundCol label="SF"    nums={L_SF}  ri={3} byNum={byNum} onOpen={open} />
          <SFLine />

          {/* ── Center: Final + 3rd place ─────────────────────────── */}
          <CenterCol finalM={byNum.get(FINAL)} thirdM={byNum.get(THIRD)} onOpen={open} />

          {/* ── Right half ────────────────────────────────────────── */}
          <SFLine />
          <RoundCol label="SF"    nums={R_SF}  ri={3} byNum={byNum} onOpen={open} />
          <Conn parentRi={2} n={2} dir="left" />
          <RoundCol label="QF"    nums={R_QF}  ri={2} byNum={byNum} onOpen={open} />
          <Conn parentRi={1} n={4} dir="left" />
          <RoundCol label="R16"   nums={R_R16} ri={1} byNum={byNum} onOpen={open} />
          <Conn parentRi={0} n={8} dir="left" />
          <RoundCol label="R32"   nums={R_R32} ri={0} byNum={byNum} onOpen={open} />

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
          <div
            key={n}
            style={{ position: 'absolute', top: cardTop(ri, pos), left: 0, right: 0 }}
          >
            <MatchCard match={m} onOpen={onOpen} />
          </div>
        );
      })}
    </div>
  );
}

// ── Center column (Final + 3rd) ───────────────────────────────────────────
function CenterCol({
  finalM, thirdM, onOpen,
}: {
  finalM?: BracketMatchData;
  thirdM?: BracketMatchData;
  onOpen: (m: BracketMatchData) => void;
}): React.ReactElement {
  const top = cardTop(3, 0); // align Final vertically with SF
  const thirdTop = top + CARD_H + 20;

  return (
    <div style={{ width: CARD_W + 16, height: COL_H, position: 'relative', flexShrink: 0 }}>
      {/* "Final" label */}
      <div
        style={{ position: 'absolute', top: top - 20, left: 0, right: 0 }}
        className="text-center text-[10px] font-mono font-bold text-amber-600 uppercase tracking-widest"
      >
        Final
      </div>

      {finalM && (
        <div style={{ position: 'absolute', top, left: 8, right: 8 }}>
          <MatchCard match={finalM} onOpen={onOpen} highlight />
        </div>
      )}

      {/* "3rd place" label */}
      <div
        style={{ position: 'absolute', top: thirdTop - 16, left: 0, right: 0 }}
        className="text-center text-[9px] font-mono text-amber-400 uppercase tracking-wider"
      >
        3rd-place play-off
      </div>

      {thirdM && (
        <div style={{ position: 'absolute', top: thirdTop, left: 8, right: 8 }}>
          <MatchCard match={thirdM} onOpen={onOpen} />
        </div>
      )}
    </div>
  );
}

// ── Connector SVG between adjacent round columns ──────────────────────────
// parentRi: roundIdx of the denser (more-R32-ward) round
// n:        number of parent cards
// dir:      which side of the SVG the parent cards connect to
//   "right" → parents exit from the right edge (left-half bracket, L_R32→L_R16→…)
//   "left"  → parents exit from the left edge  (right-half bracket, R_R32→R_R16→…)
function Conn({
  parentRi, n, dir,
}: {
  parentRi: number;
  n: number;
  dir: 'left' | 'right';
}): React.ReactElement {
  const childRi = parentRi + 1;
  const childCount = n / 2;
  const mx = CONN_W / 2;

  const paths: React.ReactElement[] = [];
  for (let i = 0; i < childCount; i++) {
    const p1 = cy(parentRi, i * 2);
    const p2 = cy(parentRi, i * 2 + 1);
    const c  = cy(childRi, i);

    if (dir === 'right') {
      // Parents exit from the RIGHT edge of the SVG (left-half bracket)
      // Right edge → midpoint (bracket elbow) → left edge (to child)
      paths.push(
        <g key={i} stroke="#d97706" strokeWidth={1} fill="none" opacity={0.6}>
          <line x1={CONN_W} y1={p1} x2={mx} y2={p1} />
          <line x1={CONN_W} y1={p2} x2={mx} y2={p2} />
          <line x1={mx} y1={p1} x2={mx} y2={p2} />
          <line x1={mx} y1={c}  x2={0}  y2={c} />
        </g>,
      );
    } else {
      // Parents exit from the LEFT edge of the SVG (right-half bracket)
      // Left edge → midpoint (bracket elbow) → right edge (to child)
      paths.push(
        <g key={i} stroke="#d97706" strokeWidth={1} fill="none" opacity={0.6}>
          <line x1={0}     y1={p1} x2={mx} y2={p1} />
          <line x1={0}     y1={p2} x2={mx} y2={p2} />
          <line x1={mx}    y1={p1} x2={mx} y2={p2} />
          <line x1={mx}    y1={c}  x2={CONN_W} y2={c} />
        </g>,
      );
    }
  }

  return (
    <svg
      width={CONN_W}
      height={COL_H}
      style={{ flexShrink: 0, display: 'block' }}
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}

// ── Simple horizontal line connecting SF to the Final center column ────────
function SFLine(): React.ReactElement {
  const y = cy(3, 0); // same y as the SF card center
  return (
    <svg
      width={CONN_W}
      height={COL_H}
      style={{ flexShrink: 0, display: 'block' }}
      aria-hidden="true"
    >
      <line x1={0} y1={y} x2={CONN_W} y2={y} stroke="#d97706" strokeWidth={1} opacity={0.6} />
    </svg>
  );
}

// ── Round column header ───────────────────────────────────────────────────
function RoundHeader({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div
      style={{ height: HEADER_H }}
      className="flex items-center justify-center text-[9px] font-mono font-bold uppercase tracking-widest text-amber-500 border-b border-amber-200"
    >
      {children}
    </div>
  );
}

// ── Match card ────────────────────────────────────────────────────────────
function MatchCard({
  match, onOpen, highlight = false,
}: {
  match: BracketMatchData;
  onOpen: (m: BracketMatchData) => void;
  highlight?: boolean;
}): React.ReactElement {
  const canClick = !!match.home.team && !!match.away.team;
  const homeWon = match.winnerId !== undefined && match.winnerId === match.home.team?.id;
  const awayWon = match.winnerId !== undefined && match.winnerId === match.away.team?.id;

  return (
    <div
      role={canClick ? 'button' : undefined}
      tabIndex={canClick ? 0 : undefined}
      onClick={canClick ? () => onOpen(match) : undefined}
      onKeyDown={canClick ? (e) => e.key === 'Enter' && onOpen(match) : undefined}
      style={{ height: CARD_H }}
      className={[
        'relative flex flex-col rounded border overflow-hidden font-mono text-xs',
        highlight ? 'border-amber-500 shadow shadow-amber-100' : 'border-amber-200',
        canClick
          ? 'cursor-pointer hover:border-amber-400 hover:shadow-sm'
          : 'cursor-default',
      ].join(' ')}
    >
      {/* Card header: match code + date */}
      <div className="flex items-center justify-between px-1.5 bg-amber-50 border-b border-amber-100"
        style={{ height: 13 }}>
        <span className={`text-[9px] font-bold tracking-wide ${highlight ? 'text-amber-600' : 'text-amber-400'}`}>
          M{match.matchNumber}
        </span>
        {match.matchDate && (
          <span className="text-[8px] text-amber-300 font-normal">{match.matchDate}</span>
        )}
      </div>

      {/* Home team row */}
      <TeamRow slot={match.home} goals={match.score?.homeGoals} won={homeWon} />

      {/* Divider */}
      <div className="border-t border-amber-100 shrink-0" />

      {/* Away team row */}
      <TeamRow slot={match.away} goals={match.score?.awayGoals} won={awayWon} />
    </div>
  );
}

// ── Team row inside a card ────────────────────────────────────────────────
function TeamRow({
  slot, goals, won,
}: {
  slot: BracketMatchData['home'];
  goals: number | undefined;
  won: boolean;
}): React.ReactElement {
  return (
    <div
      className={`flex items-center gap-1 px-1.5 flex-1 ${won ? 'bg-green-50' : ''}`}
    >
      {slot.team ? (
        <>
          <span className="text-sm leading-none shrink-0">{slot.team.flagEmoji}</span>
          <span
            className={`flex-1 truncate text-[11px] leading-none ${
              won ? 'font-bold text-green-800' : 'text-amber-900'
            }`}
          >
            {slot.team.countryCode}
          </span>
        </>
      ) : (
        <>
          <span className="text-[11px] leading-none shrink-0 text-amber-200">—</span>
          <span className="flex-1 truncate text-[10px] leading-none text-amber-300 italic">
            {slot.label ? fmtLabel(slot.label) : '?'}
          </span>
        </>
      )}

      {goals !== undefined && (
        <span
          className={`shrink-0 font-bold text-[11px] leading-none w-4 text-center ${
            won ? 'text-green-700' : 'text-amber-600'
          }`}
        >
          {goals}
        </span>
      )}
    </div>
  );
}
