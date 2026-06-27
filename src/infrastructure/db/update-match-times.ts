/**
 * One-time script: fetches kickoff times from openfootball/world-cup.json
 * and updates the matchDate column with correct UTC timestamps.
 *
 * Run with:  npx tsx src/infrastructure/db/update-match-times.ts
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { matches, teams } from './schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = drizzle(neon(process.env.DATABASE_URL!));

// Maps openfootball full names → our DB country codes
const NAME_TO_CODE: Record<string, string> = {
  'Mexico':               'MEX',
  'South Africa':         'RSA',
  'South Korea':          'KOR',
  'Czech Republic':       'CZE',
  'Canada':               'CAN',
  'Bosnia & Herzegovina': 'BIH',
  'Qatar':                'QAT',
  'Switzerland':          'SUI',
  'Brazil':               'BRA',
  'Morocco':              'MAR',
  'Haiti':                'HAI',
  'Scotland':             'SCO',
  'USA':                  'USA',
  'Paraguay':             'PAR',
  'Australia':            'AUS',
  'Turkey':               'TUR',
  'Germany':              'GER',
  'Curaçao':              'CUW',
  'Ivory Coast':          'CIV',
  'Ecuador':              'ECU',
  'Netherlands':          'NED',
  'Japan':                'JPN',
  'Sweden':               'SWE',
  'Tunisia':              'TUN',
  'Belgium':              'BEL',
  'Egypt':                'EGY',
  'Iran':                 'IRN',
  'New Zealand':          'NZL',
  'Spain':                'ESP',
  'Cape Verde':           'CPV',
  'Saudi Arabia':         'KSA',
  'Uruguay':              'URU',
  'France':               'FRA',
  'Senegal':              'SEN',
  'Iraq':                 'IRQ',
  'Norway':               'NOR',
  'Argentina':            'ARG',
  'Algeria':              'ALG',
  'Austria':              'AUT',
  'Jordan':               'JOR',
  'Portugal':             'POR',
  'DR Congo':             'COD',
  'Uzbekistan':           'UZB',
  'Colombia':             'COL',
  'England':              'ENG',
  'Croatia':              'CRO',
  'Ghana':                'GHA',
  'Panama':               'PAN',
};

// "16:30 UTC-4" + "2026-06-29" → UTC Date
function parseToUtc(dateStr: string, timeStr: string): Date {
  const [timePart, tzPart] = timeStr.split(' ');
  const [hours, minutes] = timePart.split(':').map(Number);
  const offset = parseInt(tzPart.replace('UTC', '')); // -4, -6, -7 …
  // UTC = local − offset  (UTC-4 → offset=-4 → UTC = local + 4)
  const utcMinutes = hours * 60 + minutes - offset * 60;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day) + utcMinutes * 60 * 1000);
}

interface ScheduleEntry {
  round: string;
  num?: number;
  date: string;
  time: string;
  team1: string;
  team2: string;
}

interface ScheduleFile {
  name: string;
  matches: ScheduleEntry[];
}

async function main(): Promise<void> {
  console.log('Fetching schedule from openfootball…');
  const res = await fetch(
    'https://raw.githubusercontent.com/openfootball/world-cup.json/master/2026/worldcup.json',
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { matches: schedule }: ScheduleFile = await res.json();

  const allTeams   = await db.select().from(teams);
  const allMatches = await db.select().from(matches);

  const codeToId   = new Map(allTeams.map((t) => [t.countryCode, t.id]));
  const matchByNum = new Map(allMatches.map((m) => [m.matchNumber, m]));
  const matchByPair = new Map(
    allMatches
      .filter((m) => m.homeTeamId && m.awayTeamId)
      .map((m) => [`${m.homeTeamId}_${m.awayTeamId}`, m]),
  );

  let updated = 0;
  let skipped = 0;

  for (const entry of schedule) {
    if (!entry.date || !entry.time) { skipped++; continue; }

    const utcDate = parseToUtc(entry.date, entry.time);

    // Knockout rounds have a num field — match directly by matchNumber
    if (entry.num) {
      const m = matchByNum.get(entry.num);
      if (!m) {
        console.warn(`  ⚠  No DB match for num=${entry.num}`);
        skipped++;
        continue;
      }
      await db.update(matches).set({ matchDate: utcDate }).where(eq(matches.id, m.id));
      console.log(`  ✓  M${entry.num} → ${utcDate.toISOString()}`);
      updated++;
      continue;
    }

    // Group stage — match by home + away team pair
    const homeCode = NAME_TO_CODE[entry.team1];
    const awayCode = NAME_TO_CODE[entry.team2];
    if (!homeCode || !awayCode) {
      console.warn(`  ⚠  Unknown name: "${entry.team1}" or "${entry.team2}"`);
      skipped++;
      continue;
    }
    const homeId = codeToId.get(homeCode);
    const awayId = codeToId.get(awayCode);
    if (!homeId || !awayId) {
      console.warn(`  ⚠  No DB team for: ${homeCode} or ${awayCode}`);
      skipped++;
      continue;
    }
    const m = matchByPair.get(`${homeId}_${awayId}`);
    if (!m) {
      console.warn(`  ⚠  No DB match for ${homeCode} vs ${awayCode}`);
      skipped++;
      continue;
    }
    await db.update(matches).set({ matchDate: utcDate }).where(eq(matches.id, m.id));
    console.log(`  ✓  ${entry.team1} vs ${entry.team2} → ${utcDate.toISOString()}`);
    updated++;
  }

  console.log(`\nDone.  Updated: ${updated}  Skipped: ${skipped}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
