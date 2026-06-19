import type { RankedThird } from '@/domain/types';

interface Props {
  rankedThirds: RankedThird[];
}

export function ThirdPlaceTable({ rankedThirds }: Props): React.ReactElement {
  const qualifying = rankedThirds.filter((t) => t.qualifies);
  const eliminated = rankedThirds.filter((t) => !t.qualifies);

  return (
    <div className="bg-white border border-amber-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-amber-600 px-4 py-2 flex items-center justify-between">
        <h2 className="font-mono font-bold text-white text-sm tracking-wider">
          BEST THIRD-PLACED TEAMS
        </h2>
        <span className="font-mono text-amber-200 text-xs">Top 8 of 12 advance</span>
      </div>

      <div className="px-4 pt-3 pb-3 overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-amber-200 text-amber-600">
              <th className="text-center pb-1 pr-1 font-medium w-6">#</th>
              <th className="text-center pb-1 px-1 font-medium w-8">Grp</th>
              <th className="text-left pb-1 pr-2 font-medium">Team</th>
              <th className="text-center pb-1 px-1 font-medium">P</th>
              <th className="text-center pb-1 px-1 font-medium">W</th>
              <th className="text-center pb-1 px-1 font-medium">D</th>
              <th className="text-center pb-1 px-1 font-medium">L</th>
              <th className="text-center pb-1 px-1 font-medium hidden sm:table-cell">GF</th>
              <th className="text-center pb-1 px-1 font-medium hidden sm:table-cell">GA</th>
              <th className="text-center pb-1 px-1 font-medium">GD</th>
              <th className="text-center pb-1 pl-1 font-medium text-amber-900">Pts</th>
            </tr>
          </thead>
          <tbody>
            {qualifying.map((t, i) => (
              <ThirdRow key={t.standing.team.id} rank={i + 1} third={t} />
            ))}

            {/* Divider between advancing and eliminated */}
            {eliminated.length > 0 && (
              <tr>
                <td colSpan={11} className="py-0.5">
                  <div className="border-t border-dashed border-amber-300" />
                </td>
              </tr>
            )}

            {eliminated.map((t, i) => (
              <ThirdRow key={t.standing.team.id} rank={qualifying.length + i + 1} third={t} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 pb-3 flex items-center gap-4 text-[10px] font-mono text-amber-500">
        <span className="flex items-center gap-1">
          <span className="w-1 h-3 bg-blue-400 rounded-full inline-block" />
          Advancing to R32
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1 h-3 bg-amber-200 rounded-full inline-block" />
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
  const rowBg = qualifies ? 'bg-blue-50' : '';

  return (
    <tr className={`border-b border-amber-100 last:border-0 ${rowBg}`}>
      <td className="text-center py-1 pr-1 text-amber-400 font-medium">{rank}</td>
      <td className="text-center py-1 px-1">
        <span className={`font-bold ${qualifies ? 'text-blue-700' : 'text-amber-400'}`}>
          {groupName}
        </span>
      </td>
      <td className="py-1 pr-2">
        <div className="flex items-center gap-1 min-w-0">
          {qualifies && (
            <span className="shrink-0 w-1 h-4 bg-blue-400 rounded-full mr-0.5" />
          )}
          <span className="text-base leading-none">{s.team.flagEmoji}</span>
          <span className="truncate text-amber-900 font-medium">{s.team.countryCode}</span>
        </div>
      </td>
      <td className="text-center py-1 px-1 text-amber-700">{s.played}</td>
      <td className="text-center py-1 px-1 text-amber-700">{s.won}</td>
      <td className="text-center py-1 px-1 text-amber-700">{s.drawn}</td>
      <td className="text-center py-1 px-1 text-amber-700">{s.lost}</td>
      <td className="text-center py-1 px-1 text-amber-700 hidden sm:table-cell">{s.goalsFor}</td>
      <td className="text-center py-1 px-1 text-amber-700 hidden sm:table-cell">{s.goalsAgainst}</td>
      <td className="text-center py-1 px-1 text-amber-700">
        {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
      </td>
      <td className="text-center py-1 pl-1 font-bold text-amber-900">{s.points}</td>
    </tr>
  );
}
