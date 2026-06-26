'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
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

  // Controlled values needed to derive penalty-section visibility in real time
  const [homeStr, setHomeStr] = useState(match.score?.homeGoals?.toString() ?? '');
  const [awayStr, setAwayStr] = useState(match.score?.awayGoals?.toString() ?? '');

  const homeNum = parseInt(homeStr);
  const awayNum = parseInt(awayStr);
  const showPenalties =
    isKnockout &&
    homeStr !== '' && awayStr !== '' &&
    !isNaN(homeNum) && !isNaN(awayNum) &&
    homeNum === awayNum;

  useEffect(() => {
    homeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  const savedHomePen = match.score?.homePenalties;
  const savedAwayPen = match.score?.awayPenalties;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full sm:max-w-sm bg-paper border border-ink/15 rounded-t-2xl sm:rounded-2xl shadow-xl p-6">
        {/* Match header */}
        <div className="text-center mb-5">
          <p className="text-xs text-ink/50 mb-1">
            Match {match.matchNumber}
            {match.matchDate ? ` · ${match.matchDate}` : ''}
          </p>
          {match.venue && (
            <p className="text-xs text-ink/35 mb-3 truncate">{match.venue}</p>
          )}
          <div className="flex items-center justify-center gap-3">
            <div className="text-center flex-1">
              <div className="text-3xl mb-1">{match.homeTeam.flagEmoji}</div>
              <div className="text-xs font-semibold text-ink truncate">
                {match.homeTeam.name}
              </div>
            </div>
            <div className="text-base font-semibold text-ink/25">vs</div>
            <div className="text-center flex-1">
              <div className="text-3xl mb-1">{match.awayTeam.flagEmoji}</div>
              <div className="text-xs font-semibold text-ink truncate">
                {match.awayTeam.name}
              </div>
            </div>
          </div>
        </div>

        {/* Score entry form */}
        <form action={action} className="space-y-4">
          <input type="hidden" name="matchId" value={match.id} />
          {isKnockout && <input type="hidden" name="isKnockout" value="true" />}

          {/* Goals (90 min + ET) */}
          <div className="flex items-center gap-3">
            <input
              ref={homeRef}
              name="homeGoals"
              type="number"
              inputMode="numeric"
              min={0}
              max={30}
              value={homeStr}
              onChange={(e) => setHomeStr(e.target.value)}
              placeholder="–"
              className="flex-1 h-16 text-3xl font-semibold text-center text-ink bg-white border border-dashed border-ink/25 rounded-xl focus:outline-none focus:border-solid focus:border-gold transition-colors"
            />
            <span className="text-2xl font-light text-ink/25">–</span>
            <input
              name="awayGoals"
              type="number"
              inputMode="numeric"
              min={0}
              max={30}
              value={awayStr}
              onChange={(e) => setAwayStr(e.target.value)}
              placeholder="–"
              className="flex-1 h-16 text-3xl font-semibold text-center text-ink bg-white border border-dashed border-ink/25 rounded-xl focus:outline-none focus:border-solid focus:border-gold transition-colors"
            />
          </div>

          {/* Penalty shootout — appears only when knockout goals are tied */}
          {showPenalties && (
            <div className="border border-dashed border-ink/20 rounded-xl px-4 py-3 bg-white/50">
              <p className="text-[10px] text-ink/45 uppercase tracking-wider mb-3 text-center">
                Penalty shootout
              </p>
              <div className="flex items-center gap-3">
                <input
                  name="homePenalties"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={20}
                  defaultValue={savedHomePen ?? ''}
                  placeholder="–"
                  className="flex-1 h-12 text-2xl font-semibold text-center text-ink bg-white border border-dashed border-ink/25 rounded-xl focus:outline-none focus:border-solid focus:border-gold transition-colors"
                />
                <span className="text-lg font-semibold text-ink/25 shrink-0">P</span>
                <input
                  name="awayPenalties"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={20}
                  defaultValue={savedAwayPen ?? ''}
                  placeholder="–"
                  className="flex-1 h-12 text-2xl font-semibold text-center text-ink bg-white border border-dashed border-ink/25 rounded-xl focus:outline-none focus:border-solid focus:border-gold transition-colors"
                />
              </div>
              <p className="text-[10px] text-ink/35 text-center mt-2">
                Leave empty to save as pending.
              </p>
            </div>
          )}

          {/* Card inputs — group stage only (used for disciplinary tiebreaker) */}
          {!isKnockout && (
            <div className="border border-ink/10 rounded-xl px-3 py-2.5 bg-white/50">
              <p className="text-[10px] text-ink/40 uppercase tracking-wider mb-2">
                Cards · Y=1pt · Direct red=3pts · Y+R=3pts
              </p>
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-1.5 items-center text-xs">
                {/* Header row */}
                <span />
                <span className="text-[10px] text-ink/35 text-center w-10">Home</span>
                <span className="text-[10px] text-ink/35 text-center w-10">Away</span>
                {/* Yellow cards */}
                <span className="text-ink/65">🟨 Yellow</span>
                <input
                  name="homeYellowCards"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={20}
                  defaultValue={match.score?.homeYellowCards ?? 0}
                  className="w-10 h-8 text-sm text-center text-ink bg-white border border-dashed border-ink/20 rounded-lg focus:outline-none focus:border-solid focus:border-gold transition-colors"
                />
                <input
                  name="awayYellowCards"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={20}
                  defaultValue={match.score?.awayYellowCards ?? 0}
                  className="w-10 h-8 text-sm text-center text-ink bg-white border border-dashed border-ink/20 rounded-lg focus:outline-none focus:border-solid focus:border-gold transition-colors"
                />
                {/* Red cards */}
                <span className="text-ink/65">🟥 Red</span>
                <input
                  name="homeRedCards"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={11}
                  defaultValue={match.score?.homeRedCards ?? 0}
                  className="w-10 h-8 text-sm text-center text-ink bg-white border border-dashed border-ink/20 rounded-lg focus:outline-none focus:border-solid focus:border-gold transition-colors"
                />
                <input
                  name="awayRedCards"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={11}
                  defaultValue={match.score?.awayRedCards ?? 0}
                  className="w-10 h-8 text-sm text-center text-ink bg-white border border-dashed border-ink/20 rounded-lg focus:outline-none focus:border-solid focus:border-gold transition-colors"
                />
              </div>
            </div>
          )}

          {state.error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 text-center">
              {state.error}
            </p>
          )}

          <p className="text-[10px] text-ink/35 text-center -mt-1">
            Leave both scores empty to clear a result.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-semibold text-ink/70 border border-ink/15 rounded-xl hover:bg-ink/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-3 text-sm font-semibold text-white bg-gold hover:bg-gold/90 disabled:bg-gold/40 rounded-xl transition-colors"
            >
              {pending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
