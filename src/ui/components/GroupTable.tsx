import type { Standing } from '@/domain/types';

interface Props {
  standings: Standing[];
  qualifyingThirdTeamIds: number[];
}

export function GroupTable({ standings, qualifyingThirdTeamIds }: Props): React.ReactElement {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          {/* Solid gold line separates header from body */}
          <tr className="border-b border-gold/50">
            <th className="text-left pb-1.5 pr-2 font-semibold w-[44%] text-gold/80">Team</th>
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
          {standings.map((s, idx) => {
            const isDirect = idx < 2;
            const isQualifyingThird = idx === 2 && qualifyingThirdTeamIds.includes(s.team.id);
            const barColor = isDirect ? 'bg-green-500' : 'bg-blue-400';
            const showBar = isDirect || isQualifyingThird;

            return (
              /* Dashed lines between data rows (no bg color) */
              <tr key={s.team.id} className="border-b border-dashed border-ink/10 last:border-0">
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-1 min-w-0">
                    {/* Colored bar — only for qualifying positions */}
                    {showBar ? (
                      <span className={`shrink-0 w-[3px] h-[14px] ${barColor} rounded-full mr-0.5`} />
                    ) : (
                      <span className="shrink-0 w-[3px] mr-0.5" />
                    )}
                    <span className="text-sm leading-none shrink-0">{s.team.flagEmoji}</span>
                    <span className="truncate text-ink text-[12px] ml-0.5">{s.team.name}</span>
                  </div>
                </td>
                <td className="text-center py-1.5 px-1 text-ink/55 tabular-nums">{s.played}</td>
                <td className="text-center py-1.5 px-1 text-ink/55 tabular-nums">{s.won}</td>
                <td className="text-center py-1.5 px-1 text-ink/55 tabular-nums">{s.drawn}</td>
                <td className="text-center py-1.5 px-1 text-ink/55 tabular-nums">{s.lost}</td>
                <td className="text-center py-1.5 px-1 text-ink/55 tabular-nums hidden sm:table-cell">{s.goalsFor}</td>
                <td className="text-center py-1.5 px-1 text-ink/55 tabular-nums hidden sm:table-cell">{s.goalsAgainst}</td>
                <td className="text-center py-1.5 px-1 text-ink/55 tabular-nums">
                  {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                </td>
                <td className="text-center py-1.5 pl-1 font-bold text-ink tabular-nums">{s.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
