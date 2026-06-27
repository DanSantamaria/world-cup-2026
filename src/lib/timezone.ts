const VENUE_TZ: Record<string, string> = {
  'Mexico City Stadium': 'America/Mexico_City',
  'Guadalajara Stadium': 'America/Mexico_City',
  'Monterrey Stadium': 'America/Monterrey',
  'Atlanta Stadium': 'America/New_York',
  'Houston Stadium': 'America/Chicago',
  'San Francisco Bay Area Stadium': 'America/Los_Angeles',
  'Los Angeles Stadium': 'America/Los_Angeles',
  'BC Place Vancouver': 'America/Vancouver',
  'Toronto Stadium': 'America/Toronto',
  'Seattle Stadium': 'America/Los_Angeles',
  'Kansas City Stadium': 'America/Chicago',
  'New York/New Jersey Stadium': 'America/New_York',
  'Boston Stadium': 'America/New_York',
  'Philadelphia Stadium': 'America/New_York',
  'Dallas Stadium': 'America/Chicago',
  'Miami Stadium': 'America/New_York',
};

export function venueTimezone(venue: string): string {
  return VENUE_TZ[venue] ?? 'America/New_York';
}

/**
 * Returns the kickoff time in Madrid (Europe/Madrid, CEST during the tournament)
 * as "HH:MM".
 */
export function toMadridTime(utcDate: Date): string {
  return utcDate.toLocaleTimeString('en-GB', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns the date in Madrid timezone as "YYYY-MM-DD".
 * Used to group matches by local Madrid date so late-night matches
 * (e.g. 23:30 UTC = 01:30 CEST next day) fall on the correct day header.
 */
export function toMadridDateKey(utcDate: Date): string {
  return utcDate.toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' });
}

/** "2026-06-11" → "Thursday, June 11, 2026" */
export function formatDayHeader(isoDateKey: string): string {
  const d = new Date(`${isoDateKey}T12:00:00Z`);
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const ROUND_LABELS: Record<string, string> = {
  group: 'Group Stage',
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-final',
  sf: 'Semi-final',
  '3rd': '3rd-place Play-off',
  final: 'Final',
};

export function formatRoundLabel(round: string, groupName: string | null): string {
  if (round === 'group' && groupName) return `Group ${groupName}`;
  return ROUND_LABELS[round] ?? round;
}
