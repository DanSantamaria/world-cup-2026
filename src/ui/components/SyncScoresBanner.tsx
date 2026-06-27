'use client';

import { useState, useEffect } from 'react';
import { importReferenceScoresAction } from '@/app/groups/actions';

const STORAGE_KEY = 'scores-cup-last-sync-check';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

interface Props {
  isOutOfSync: boolean;
}

export function SyncScoresBanner({ isOutOfSync }: Props): React.ReactElement | null {
  const [visible, setVisible] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Check the 24h throttle on the client after mount
  // (localStorage is not available on the server)
  useEffect(() => {
    if (!isOutOfSync) return;
    const last = localStorage.getItem(STORAGE_KEY);
    const elapsed = last ? Date.now() - parseInt(last) : Infinity;
    if (elapsed > TWENTY_FOUR_HOURS) setVisible(true);
  }, [isOutOfSync]);

  function dismiss(): void {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  }

  async function handleSync(): Promise<void> {
    setSyncing(true);
    await importReferenceScoresAction();
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    // Full reload so the new scores are reflected everywhere
    window.location.reload();
  }

  if (!visible) return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-gold/10 border-b border-gold/25 px-4 py-2.5">
      <p className="text-xs text-ink/70">
        New match results available —{' '}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="text-gold font-semibold underline underline-offset-2 hover:text-gold-dark disabled:opacity-50 transition-colors"
        >
          {syncing ? 'Updating…' : 'Update scores'}
        </button>
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="text-ink/30 hover:text-ink/60 transition-colors text-base leading-none shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
