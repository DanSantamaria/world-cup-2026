import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/infrastructure/auth';
import { signOutAction } from '@/app/dashboard/actions';
import { getScheduleMatches } from '@/infrastructure/db/queries/schedule';
import type { ScheduleMatchRow } from '@/infrastructure/db/queries/schedule';
import { formatDayHeader, formatRoundLabel, toMadridTime } from '@/lib/timezone';
import { Footer } from '@/ui/components/Footer';
import { JumpToTodayButton } from '@/ui/components/JumpToTodayButton';

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
    <div className="px-4 py-2.5 bg-white border-b border-ink/6">
      {/* Meta: match number + round + optional time */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-bold text-gold bg-gold/10 border border-gold/20 rounded px-1.5 py-0.5 shrink-0 font-display">
            M{match.matchNumber}
          </span>
          <span className="text-[11px] text-gold/80 truncate">{roundLabel}</span>
        </div>
        {madridTime && (
          <span className="text-[10px] text-gold/70 shrink-0 ml-2">
            {madridTime} CET
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center justify-end gap-1 min-w-0">
          <span className="text-sm text-ink truncate">{homeName}</span>
          {homeFlag && <span className="text-base leading-none shrink-0">{homeFlag}</span>}
        </div>

        <div className="shrink-0 w-12 text-center font-bold text-sm">
          {match.score !== null ? (
            <span className="text-ink">
              {match.score.homeGoals}–{match.score.awayGoals}
            </span>
          ) : (
            <span className="text-ink/20 font-normal text-xs">vs</span>
          )}
        </div>

        <div className="flex-1 flex items-center gap-1 min-w-0">
          {awayFlag && <span className="text-base leading-none shrink-0">{awayFlag}</span>}
          <span className="text-sm text-ink truncate">{awayName}</span>
        </div>
      </div>

      {match.venue && (
        <div className="mt-1 text-[10px] text-ink/35 text-center truncate">
          {match.venue}
        </div>
      )}
    </div>
  );
}

export default async function MatchesPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = parseInt(session.user.id);

  const rows = await getScheduleMatches(userId);

  const byDate = new Map<string, ScheduleMatchRow[]>();
  for (const row of rows) {
    const key = row.matchDateUtc
      ? row.matchDateUtc.toISOString().slice(0, 10)
      : 'tbd';
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(row);
  }
  const days = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* Non-sticky page header */}
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
            className="flex-1 py-3 text-center font-display text-[13px] tracking-wide text-white/85 bg-gold-dark"
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
            className="flex-1 py-3 text-center font-display text-[13px] tracking-wide text-white bg-gold"
          >
            Matches
          </Link>
        </div>
      </nav>

      {/* Jump button */}
      <div className="flex justify-center md:justify-end px-4 py-3">
        <JumpToTodayButton dateKeys={days.map(([dateKey]) => dateKey)} />
      </div>

      {/* Day sections */}
      <div className="pb-12">
        {days.map(([dateKey, dayMatches]) => (
          <section key={dateKey} id={`day-${dateKey}`} className="scroll-mt-[52px]">
            <div className="sticky top-[52px] z-30 bg-paper/95 backdrop-blur-sm border-y border-gold/20 px-4 py-2">
              <h2 className="font-display text-[11px] text-gold tracking-widest uppercase">
                {dateKey === 'tbd' ? 'Date TBD' : formatDayHeader(dateKey)}
              </h2>
            </div>
            <div className="mx-4 bg-white rounded-lg overflow-hidden border border-ink/8 mb-3 mt-2">
              {dayMatches.map((match) => (
                <MatchCard key={match.matchId} match={match} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </div>
  );
}
