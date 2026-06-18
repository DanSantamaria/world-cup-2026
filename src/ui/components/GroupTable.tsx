import type { Standing } from '@/domain/types';

interface Props {
  standings: Standing[];
}

export function GroupTable({ standings }: Props): React.ReactElement {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-amber-200 text-amber-600">
            <th className="text-left pb-1 pr-2 font-medium w-[40%]">Team</th>
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
          {standings.map((s, idx) => (
            <tr
              key={s.team.id}
              className={`border-b border-amber-100 last:border-0 ${
                idx < 2 ? 'bg-green-50' : ''
              }`}
            >
              <td className="py-1 pr-2">
                <div className="flex items-center gap-1 min-w-0">
                  {idx < 2 && (
                    <span className="shrink-0 w-1 h-4 bg-green-400 rounded-full mr-0.5" />
                  )}
                  <span className="text-base leading-none">{s.team.flagEmoji}</span>
                  <span className="truncate text-amber-900 font-medium">
                    {s.team.countryCode}
                  </span>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
