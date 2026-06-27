import type { RankedThird } from '@/domain/types';

interface Props {
  rankedThirds: RankedThird[];
}

export function ThirdPlaceTable({ rankedThirds }: Props): React.ReactElement {
  const qualifying = rankedThirds.filter((t) => t.qualifies);
  const eliminated = rankedThirds.filter((t) => !t.qualifies);

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-ink/8">
      {/* Gold header — white text */}
      <div className="bg-gold px-4 py-2.5 flex items-center justify-between">
        <h2 className="font-display text-[15px] text-white tracking-wide">
          Best Third-Placed Teams
        </h2>
        <span className="text-[11px] text-white/65">Top 8 of 12 advance</span>
      </div>

      <div className="px-4 pt-3 pb-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            {/* Solid gold line separates header from body */}
            <tr className="border-b border-gold/50">
              <th className="text-center pb-1.5 pr-1 font-semibold w-6 text-gold/80">#</th>
              <th className="text-center pb-1.5 px-1 font-semibold w-8 text-gold/80">Grp</th>
              <th className="text-left pb-1.5 pr-2 font-semibold text-gold/80">Team</th>
              <th className="text-center pb-1.5 px-1 font-semibold text-gold/80">P</th>
              <th className="text-center pb-1.5 px-1 font-semibold text-gold/80">W</th>
              <th className="text-center pb-1.5 px-1 font-semibold text-gold/80">D</th>
              <th className="text-center pb-1.5 px-1 font-semibold text-gold/80">L</th>
              <th className="text-center pb-1.5 px-1 font-semibold text-gold/80 hidden sm:table-cell">GF</th>
              <th className="text-center pb-1.5 px-1 font-semibold text-gold/80 hidden sm:table-cell">GA</th>
              <th className="text-center pb-1.5 px-1 font-semibold text-gold/80">GD</th>
              <th className="text-center pb-1.5 pl-1 font-bold text-ink">Pts</th>
            </tr>
          </thead>
          <tbody>
            {qualifying.map((t, i) => (
              <ThirdRow key={t.standing.team.id} rank={i + 1} third={t} />
            ))}

            {eliminated.length > 0 && (
              <tr>
                <td colSpan={11} className="py-0.4">
                  <div className="" />
                </td>
              </tr>
            )}

            {eliminated.map((t, i) => (
              <ThirdRow key={t.standing.team.id} rank={qualifying.length + i + 1} third={t} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 pb-3 flex items-center gap-4 text-[10px] text-ink/45">
        <span className="flex items-center gap-1.5">
          <span className="w-[3px] h-3 bg-blue-400 rounded-full inline-block" />
          Advancing to R32
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-[3px] h-3 bg-ink/20 rounded-full inline-block" />
          Eliminated
        </span>
      </div>
    </div>
  );
}

function ThirdRow({
  rank,
  third,
}: {
  rank: number;
  third: RankedThird;
}): React.ReactElement {
  const { standing: s, groupName, qualifies } = third;

  return (
    /* Dashed lines between data rows (no bg color) */
    <tr className="border-b border-dashed border-ink/10 last:border-0 [&:nth-child(8)]:border-gold/70">
      <td className="text-center py-1 pr-1 text-ink/35 tabular-nums">{rank}</td>
      <td className="text-center py-1 px-1">
        <span className={`font-semibold tabular-nums ${qualifies ? 'text-blue-500' : 'text-ink/35'}`}>
          {groupName}
        </span>
      </td>
      <td className="py-1 pr-2">
        <div className="flex items-center gap-1 min-w-0">
          {qualifies ? (
            <span className="shrink-0 w-[3px] h-[14px] bg-blue-400 rounded-full mr-0.5" />
          ) : (
            <span className="shrink-0 w-[3px] mr-0.5" />
          )}
          <span className="text-sm leading-none shrink-0">{s.team.flagEmoji}</span>
          <span className="truncate text-ink text-[12px] ml-0.5">{s.team.name}</span>
        </div>
      </td>
      <td className="text-center py-1 px-1 text-ink/55 tabular-nums">{s.played}</td>
      <td className="text-center py-1 px-1 text-ink/55 tabular-nums">{s.won}</td>
      <td className="text-center py-1 px-1 text-ink/55 tabular-nums">{s.drawn}</td>
      <td className="text-center py-1 px-1 text-ink/55 tabular-nums">{s.lost}</td>
      <td className="text-center py-1 px-1 text-ink/55 tabular-nums hidden sm:table-cell">{s.goalsFor}</td>
      <td className="text-center py-1 px-1 text-ink/55 tabular-nums hidden sm:table-cell">{s.goalsAgainst}</td>
      <td className="text-center py-1 px-1 text-ink/55 tabular-nums">
        {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
      </td>
      <td className="text-center py-1 pl-1 font-bold text-ink tabular-nums">{s.points}</td>
    </tr>
  );
}
