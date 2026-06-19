'use client';

import { useActionState, useEffect, useRef } from 'react';
import { upsertScoreAction } from '@/app/groups/actions';
import type { MatchWithTeams } from '@/domain/types';

interface Props {
  match: MatchWithTeams;
  onClose: () => void;
  isKnockout?: boolean;
}

export function ScoreModal({ match, onClose, isKnockout = false }: Props): React.ReactElement {
  const [state, action, pending] = useActionState(upsertScoreAction, {});
  const homeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    homeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full sm:max-w-sm bg-amber-50 border border-amber-200 rounded-t-2xl sm:rounded-2xl shadow-xl p-6">
        {/* Match header */}
        <div className="text-center mb-5">
          <p className="text-xs font-mono text-amber-600 mb-1">
            Match {match.matchNumber}
            {match.matchDate ? ` · ${match.matchDate}` : ''}
          </p>
          {match.venue && (
            <p className="text-xs font-mono text-amber-500 mb-3 truncate">{match.venue}</p>
          )}
          <div className="flex items-center justify-center gap-3">
            <div className="text-center flex-1">
              <div className="text-3xl mb-1">{match.homeTeam.flagEmoji}</div>
              <div className="text-xs font-mono font-bold text-amber-900 truncate">
                {match.homeTeam.name}
              </div>
            </div>
            <div className="text-lg font-mono font-bold text-amber-400">vs</div>
            <div className="text-center flex-1">
              <div className="text-3xl mb-1">{match.awayTeam.flagEmoji}</div>
              <div className="text-xs font-mono font-bold text-amber-900 truncate">
                {match.awayTeam.name}
              </div>
            </div>
          </div>
        </div>

        {/* Score entry form */}
        <form action={action} className="space-y-4">
          <input type="hidden" name="matchId" value={match.id} />
          {isKnockout && <input type="hidden" name="isKnockout" value="true" />}

          <div className="flex items-center gap-3">
            <input
              ref={homeRef}
              name="homeGoals"
              type="number"
              inputMode="numeric"
              min={0}
              max={30}
              defaultValue={match.score?.homeGoals ?? ''}
              placeholder="–"
              className="flex-1 h-16 text-3xl font-mono font-bold text-center text-amber-900 bg-white border-2 border-amber-300 rounded-xl focus:outline-none focus:border-amber-500"
            />
            <span className="text-2xl font-mono font-bold text-amber-400">–</span>
            <input
              name="awayGoals"
              type="number"
              inputMode="numeric"
              min={0}
              max={30}
              defaultValue={match.score?.awayGoals ?? ''}
              placeholder="–"
              className="flex-1 h-16 text-3xl font-mono font-bold text-center text-amber-900 bg-white border-2 border-amber-300 rounded-xl focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Card inputs — group stage only (used for disciplinary tiebreaker) */}
          {!isKnockout && (
            <div className="border border-amber-200 rounded-xl px-3 py-2.5 bg-white/60">
              <p className="text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-2">
                Cards · Y=1pt · Direct red=3pts · Y+R=3pts
              </p>
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-1.5 items-center text-xs font-mono">
                {/* Header row */}
                <span />
                <span className="text-[10px] text-amber-400 text-center w-10">Home</span>
                <span className="text-[10px] text-amber-400 text-center w-10">Away</span>
                {/* Yellow cards */}
                <span className="text-amber-700">🟨 Yellow</span>
                <input
                  name="homeYellowCards"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={20}
                  defaultValue={match.score?.homeYellowCards ?? 0}
                  className="w-10 h-8 text-sm font-mono font-bold text-center text-amber-900 bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
                <input
                  name="awayYellowCards"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={20}
                  defaultValue={match.score?.awayYellowCards ?? 0}
                  className="w-10 h-8 text-sm font-mono font-bold text-center text-amber-900 bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
                {/* Red cards */}
                <span className="text-amber-700">🟥 Red</span>
                <input
                  name="homeRedCards"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={11}
                  defaultValue={match.score?.homeRedCards ?? 0}
                  className="w-10 h-8 text-sm font-mono font-bold text-center text-amber-900 bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
                <input
                  name="awayRedCards"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={11}
                  defaultValue={match.score?.awayRedCards ?? 0}
                  className="w-10 h-8 text-sm font-mono font-bold text-center text-amber-900 bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {state.error && (
            <p className="text-sm font-mono text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 text-center">
              {state.error}
            </p>
          )}

          <p className="text-[10px] font-mono text-amber-400 text-center -mt-1">
            Leave both scores empty to clear a result.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 font-mono font-semibold text-sm text-amber-700 border border-amber-300 rounded-xl hover:bg-amber-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-3 font-mono font-semibold text-sm text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 rounded-xl transition-colors"
            >
              {pending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
