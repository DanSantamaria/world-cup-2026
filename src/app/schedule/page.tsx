import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/infrastructure/auth';
import { signOutAction } from '@/app/dashboard/actions';
import { getScheduleMatches } from '@/infrastructure/db/queries/schedule';
import type { ScheduleMatchRow } from '@/infrastructure/db/queries/schedule';
import { formatDayHeader, formatRoundLabel, toMadridTime } from '@/lib/timezone';

function fmtSlot(raw: string): string {
  if (raw.startsWith('WM')) return `W${raw.slice(2)}`;
  if (raw.startsWith('LM')) return `L${raw.slice(2)}`;
  if (raw.startsWith('3') && raw.length > 2) return '3rd';
  return raw;
}

function MatchCard({ match }: { match: ScheduleMatchRow }): React.ReactElement {
  const roundLabel = formatRoundLabel(match.round, match.groupName);
  const madridTime = match.matchDateUtc ? toMadridTime(match.matchDateUtc) : null;

  const homeName = match.homeTeam?.name ?? (match.homeSlot ? fmtSlot(match.homeSlot) : '?');
  const homeFlag = match.homeTeam?.flagEmoji ?? null;
  const awayName = match.awayTeam?.name ?? (match.awaySlot ? fmtSlot(match.awaySlot) : '?');
  const awayFlag = match.awayTeam?.flagEmoji ?? null;

  return (
    <div className="px-4 py-2.5 bg-white border-b border-amber-100">
      {/* Meta: match code + round + optional time */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 shrink-0">
            M{match.matchNumber}
          </span>
          <span className="font-mono text-[11px] text-amber-600 truncate">{roundLabel}</span>
        </div>
        {madridTime && (
          <span className="font-mono text-[10px] text-amber-500 shrink-0 ml-2">
            {madridTime} Madrid
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-2">
        {/* Home team (right-aligned: name then flag) */}
        <div className="flex-1 flex items-center justify-end gap-1 min-w-0">
          <span className="font-mono text-sm text-amber-900 truncate">{homeName}</span>
          {homeFlag && <span className="text-base leading-none shrink-0">{homeFlag}</span>}
        </div>

        {/* Score or vs */}
        <div className="shrink-0 w-12 text-center font-mono font-bold text-sm">
          {match.score !== null ? (
            <span className="text-amber-900">
              {match.score.homeGoals}–{match.score.awayGoals}
            </span>
          ) : (
            <span className="text-amber-200 font-normal text-xs">vs</span>
          )}
        </div>

        {/* Away team (left-aligned: flag then name) */}
        <div className="flex-1 flex items-center gap-1 min-w-0">
          {awayFlag && <span className="text-base leading-none shrink-0">{awayFlag}</span>}
          <span className="font-mono text-sm text-amber-900 truncate">{awayName}</span>
        </div>
      </div>

      {/* Venue */}
      {match.venue && (
        <div className="mt-1 font-mono text-[10px] text-amber-400 text-center truncate">
          {match.venue}
        </div>
      )}
    </div>
  );
}

export default async function SchedulePage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = parseInt(session.user.id);

  const rows = await getScheduleMatches(userId);

  // Group matches by UTC date key ("2026-06-11")
  const byDate = new Map<string, ScheduleMatchRow[]>();
  for (const row of rows) {
    const key = row.matchDateUtc
      ? row.matchDateUtc.toISOString().slice(0, 10)
      : 'tbd';
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(row);
  }
  const days = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));

  const scored = rows.filter((r) => r.score !== null).length;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Sticky nav header */}
      <header className="sticky top-0 z-40 border-b border-amber-200 bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">⚽</span>
          <span className="font-mono font-bold text-amber-900 text-sm truncate">World Cup 2026</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-xs text-amber-600 hidden sm:block">
            {scored}/104 scored
          </span>
          <Link href="/groups" className="font-mono text-xs text-amber-700 hover:text-amber-900 hover:underline">
            Groups
          </Link>
          <Link href="/bracket" className="font-mono text-xs text-amber-700 hover:text-amber-900 hover:underline">
            Bracket
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="font-mono text-xs text-amber-500 hover:text-amber-700">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Page heading */}
      <div className="px-4 pt-5 pb-2">
        <h1 className="font-mono font-bold text-lg text-amber-900">Schedule</h1>
        <p className="font-mono text-xs text-amber-600 mt-0.5">
          All 104 matches · June 11 – July 19, 2026
        </p>
      </div>

      {/* Day sections with sticky date headers */}
      <div className="pb-12">
        {days.map(([dateKey, dayMatches]) => (
          <section key={dateKey}>
            <div className="sticky top-[52px] z-30 bg-amber-100/95 backdrop-blur-sm border-y border-amber-200 px-4 py-2">
              <h2 className="font-mono font-semibold text-xs text-amber-700 uppercase tracking-wide">
                {dateKey === 'tbd' ? 'Date TBD' : formatDayHeader(dateKey)}
              </h2>
            </div>
            <div>
              {dayMatches.map((match) => (
                <MatchCard key={match.matchId} match={match} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
