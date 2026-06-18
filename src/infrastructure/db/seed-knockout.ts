import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { matches } from './schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seedKnockout(): Promise<void> {
  const existing = await db.select({ id: matches.id }).from(matches).where(eq(matches.round, 'r32')).limit(1);
  if (existing.length > 0) {
    console.log('Knockout matches already seeded — skipping.');
    return;
  }

  // 3rd-place slot labels (e.g. "3ABCDF") mean: the best qualifying 3rd-place team
  // from among the listed groups fills this slot (per official FIFA 2026 allocation table).
  // WM<n> = winner of match n, LM<n> = loser of match n.
  const data = [
    // ── Round of 32 ──────────────────────────────────────────────────────────
    { n: 73,  r: 'r32',   h: '2A',    a: '2B',       date: '2026-06-28', venue: 'Los Angeles Stadium' },
    { n: 74,  r: 'r32',   h: '1C',    a: '2F',       date: '2026-06-29', venue: 'Houston Stadium' },
    { n: 75,  r: 'r32',   h: '1E',    a: '3ABCDF',   date: '2026-06-29', venue: 'Boston Stadium' },
    { n: 76,  r: 'r32',   h: '1F',    a: '2C',       date: '2026-06-30', venue: 'Monterrey Stadium' },
    { n: 77,  r: 'r32',   h: '2E',    a: '2I',       date: '2026-06-30', venue: 'Dallas Stadium' },
    { n: 78,  r: 'r32',   h: '1I',    a: '3CDFGH',   date: '2026-06-30', venue: 'New York/New Jersey Stadium' },
    { n: 79,  r: 'r32',   h: '1A',    a: '3CEFHI',   date: '2026-07-01', venue: 'Mexico City Stadium' },
    { n: 80,  r: 'r32',   h: '1L',    a: '3EHIJK',   date: '2026-07-01', venue: 'Atlanta Stadium' },
    { n: 81,  r: 'r32',   h: '1G',    a: '3AEHIJ',   date: '2026-07-01', venue: 'Seattle Stadium' },
    { n: 82,  r: 'r32',   h: '1D',    a: '3BEFIJ',   date: '2026-07-02', venue: 'San Francisco Bay Area Stadium' },
    { n: 83,  r: 'r32',   h: '1H',    a: '2J',       date: '2026-07-02', venue: 'Los Angeles Stadium' },
    { n: 84,  r: 'r32',   h: '2K',    a: '2L',       date: '2026-07-03', venue: 'Toronto Stadium' },
    { n: 85,  r: 'r32',   h: '1B',    a: '3EFGIJ',   date: '2026-07-03', venue: 'BC Place Vancouver' },
    { n: 86,  r: 'r32',   h: '2D',    a: '2G',       date: '2026-07-03', venue: 'Dallas Stadium' },
    { n: 87,  r: 'r32',   h: '1J',    a: '2H',       date: '2026-07-04', venue: 'Miami Stadium' },
    { n: 88,  r: 'r32',   h: '1K',    a: '3DEIJL',   date: '2026-07-04', venue: 'Kansas City Stadium' },
    // ── Round of 16 ──────────────────────────────────────────────────────────
    { n: 89,  r: 'r16',   h: 'WM73',  a: 'WM75',     date: '2026-07-04', venue: 'Houston Stadium' },
    { n: 90,  r: 'r16',   h: 'WM74',  a: 'WM77',     date: '2026-07-04', venue: 'Philadelphia Stadium' },
    { n: 91,  r: 'r16',   h: 'WM76',  a: 'WM78',     date: '2026-07-05', venue: 'New York/New Jersey Stadium' },
    { n: 92,  r: 'r16',   h: 'WM79',  a: 'WM80',     date: '2026-07-06', venue: 'Mexico City Stadium' },
    { n: 93,  r: 'r16',   h: 'WM83',  a: 'WM84',     date: '2026-07-06', venue: 'Dallas Stadium' },
    { n: 94,  r: 'r16',   h: 'WM81',  a: 'WM82',     date: '2026-07-07', venue: 'Seattle Stadium' },
    { n: 95,  r: 'r16',   h: 'WM86',  a: 'WM88',     date: '2026-07-07', venue: 'Atlanta Stadium' },
    { n: 96,  r: 'r16',   h: 'WM85',  a: 'WM87',     date: '2026-07-07', venue: 'BC Place Vancouver' },
    // ── Quarter-finals ───────────────────────────────────────────────────────
    { n: 97,  r: 'qf',    h: 'WM89',  a: 'WM90',     date: '2026-07-09', venue: 'Boston Stadium' },
    { n: 98,  r: 'qf',    h: 'WM93',  a: 'WM94',     date: '2026-07-10', venue: 'Los Angeles Stadium' },
    { n: 99,  r: 'qf',    h: 'WM91',  a: 'WM92',     date: '2026-07-11', venue: 'Miami Stadium' },
    { n: 100, r: 'qf',    h: 'WM95',  a: 'WM96',     date: '2026-07-12', venue: 'Kansas City Stadium' },
    // ── Semi-finals ──────────────────────────────────────────────────────────
    { n: 101, r: 'sf',    h: 'WM97',  a: 'WM98',     date: '2026-07-14', venue: 'Dallas Stadium' },
    { n: 102, r: 'sf',    h: 'WM99',  a: 'WM100',    date: '2026-07-15', venue: 'Atlanta Stadium' },
    // ── 3rd Place ────────────────────────────────────────────────────────────
    { n: 103, r: '3rd',   h: 'LM101', a: 'LM102',    date: '2026-07-18', venue: 'Miami Stadium' },
    // ── Final ────────────────────────────────────────────────────────────────
    { n: 104, r: 'final', h: 'WM101', a: 'WM102',    date: '2026-07-19', venue: 'New York/New Jersey Stadium' },
  ];

  await db.insert(matches).values(
    data.map((m) => ({
      matchNumber: m.n,
      round: m.r,
      homeSlot: m.h,
      awaySlot: m.a,
      matchDate: new Date(m.date),
      venue: m.venue,
    })),
  );

  console.log(`✅ Seeded ${data.length} knockout matches (R32 → Final).`);
}

seedKnockout().catch(console.error);
