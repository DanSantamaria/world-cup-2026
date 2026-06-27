'use client';

interface Props {
  dateKeys: string[];
}

export function JumpToTodayButton({ dateKeys }: Props): React.ReactElement {
  function handleClick(): void {
    const today = new Date().toISOString().slice(0, 10);
    const target = dateKeys.find((d) => d >= today) ?? dateKeys[dateKeys.length - 1];
    document.getElementById(`day-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <button
      onClick={handleClick}
      className="text-xs font-display tracking-wide text-gold hover:text-gold-dark underline underline-offset-2 transition-colors"
    >
      Go to next match day
    </button>
  );
}
