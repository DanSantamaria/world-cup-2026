import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { groups, teams, matches } from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. GROUPS
  console.log('Creating groups...');
  const groupNames = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  const insertedGroups = await db.insert(groups).values(
    groupNames.map(name => ({ name }))
  ).returning();
  const groupMap = Object.fromEntries(insertedGroups.map(g => [g.name, g.id]));
  console.log('✓ Groups created');

  // 2. TEAMS
  console.log('Creating teams...');
  const teamsData = [
    // Group A
    { name: 'Mexico',        countryCode: 'MEX', flagEmoji: '🇲🇽', group: 'A' },
    { name: 'South Africa',  countryCode: 'RSA', flagEmoji: '🇿🇦', group: 'A' },
    { name: 'Korea Republic',countryCode: 'KOR', flagEmoji: '🇰🇷', group: 'A' },
    { name: 'Czechia',       countryCode: 'CZE', flagEmoji: '🇨🇿', group: 'A' },
    // Group B
    { name: 'Canada',        countryCode: 'CAN', flagEmoji: '🇨🇦', group: 'B' },
    { name: 'Bosnia and Herzegovina', countryCode: 'BIH', flagEmoji: '🇧🇦', group: 'B' },
    { name: 'Qatar',         countryCode: 'QAT', flagEmoji: '🇶🇦', group: 'B' },
    { name: 'Switzerland',   countryCode: 'SUI', flagEmoji: '🇨🇭', group: 'B' },
    // Group C
    { name: 'Brazil',        countryCode: 'BRA', flagEmoji: '🇧🇷', group: 'C' },
    { name: 'Morocco',       countryCode: 'MAR', flagEmoji: '🇲🇦', group: 'C' },
    { name: 'Haiti',         countryCode: 'HAI', flagEmoji: '🇭🇹', group: 'C' },
    { name: 'Scotland',      countryCode: 'SCO', flagEmoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C' },
    // Group D
    { name: 'USA',           countryCode: 'USA', flagEmoji: '🇺🇸', group: 'D' },
    { name: 'Paraguay',      countryCode: 'PAR', flagEmoji: '🇵🇾', group: 'D' },
    { name: 'Australia',     countryCode: 'AUS', flagEmoji: '🇦🇺', group: 'D' },
    { name: 'Türkiye',       countryCode: 'TUR', flagEmoji: '🇹🇷', group: 'D' },
    // Group E
    { name: 'Germany',       countryCode: 'GER', flagEmoji: '🇩🇪', group: 'E' },
    { name: 'Curaçao',       countryCode: 'CUW', flagEmoji: '🇨🇼', group: 'E' },
    { name: "Côte d'Ivoire", countryCode: 'CIV', flagEmoji: '🇨🇮', group: 'E' },
    { name: 'Ecuador',       countryCode: 'ECU', flagEmoji: '🇪🇨', group: 'E' },
    // Group F
    { name: 'Netherlands',   countryCode: 'NED', flagEmoji: '🇳🇱', group: 'F' },
    { name: 'Japan',         countryCode: 'JPN', flagEmoji: '🇯🇵', group: 'F' },
    { name: 'Sweden',        countryCode: 'SWE', flagEmoji: '🇸🇪', group: 'F' },
    { name: 'Tunisia',       countryCode: 'TUN', flagEmoji: '🇹🇳', group: 'F' },
    // Group G
    { name: 'Belgium',       countryCode: 'BEL', flagEmoji: '🇧🇪', group: 'G' },
    { name: 'Egypt',         countryCode: 'EGY', flagEmoji: '🇪🇬', group: 'G' },
    { name: 'IR Iran',       countryCode: 'IRN', flagEmoji: '🇮🇷', group: 'G' },
    { name: 'New Zealand',   countryCode: 'NZL', flagEmoji: '🇳🇿', group: 'G' },
    // Group H
    { name: 'Spain',         countryCode: 'ESP', flagEmoji: '🇪🇸', group: 'H' },
    { name: 'Cabo Verde',    countryCode: 'CPV', flagEmoji: '🇨🇻', group: 'H' },
    { name: 'Saudi Arabia',  countryCode: 'KSA', flagEmoji: '🇸🇦', group: 'H' },
    { name: 'Uruguay',       countryCode: 'URU', flagEmoji: '🇺🇾', group: 'H' },
    // Group I
    { name: 'France',        countryCode: 'FRA', flagEmoji: '🇫🇷', group: 'I' },
    { name: 'Senegal',       countryCode: 'SEN', flagEmoji: '🇸🇳', group: 'I' },
    { name: 'Iraq',          countryCode: 'IRQ', flagEmoji: '🇮🇶', group: 'I' },
    { name: 'Norway',        countryCode: 'NOR', flagEmoji: '🇳🇴', group: 'I' },
    // Group J
    { name: 'Argentina',     countryCode: 'ARG', flagEmoji: '🇦🇷', group: 'J' },
    { name: 'Algeria',       countryCode: 'ALG', flagEmoji: '🇩🇿', group: 'J' },
    { name: 'Austria',       countryCode: 'AUT', flagEmoji: '🇦🇹', group: 'J' },
    { name: 'Jordan',        countryCode: 'JOR', flagEmoji: '🇯🇴', group: 'J' },
    // Group K
    { name: 'Portugal',      countryCode: 'POR', flagEmoji: '🇵🇹', group: 'K' },
    { name: 'Congo DR',      countryCode: 'COD', flagEmoji: '🇨🇩', group: 'K' },
    { name: 'Uzbekistan',    countryCode: 'UZB', flagEmoji: '🇺🇿', group: 'K' },
    { name: 'Colombia',      countryCode: 'COL', flagEmoji: '🇨🇴', group: 'K' },
    // Group L
    { name: 'England',       countryCode: 'ENG', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L' },
    { name: 'Croatia',       countryCode: 'CRO', flagEmoji: '🇭🇷', group: 'L' },
    { name: 'Ghana',         countryCode: 'GHA', flagEmoji: '🇬🇭', group: 'L' },
    { name: 'Panama',        countryCode: 'PAN', flagEmoji: '🇵🇦', group: 'L' },
  ];

  const insertedTeams = await db.insert(teams).values(
    teamsData.map(t => ({
      name: t.name,
      countryCode: t.countryCode,
      flagEmoji: t.flagEmoji,
      groupId: groupMap[t.group],
    }))
  ).returning();

  const teamMap = Object.fromEntries(
    insertedTeams.map(t => [t.countryCode, t.id])
  );
  console.log('✓ Teams created');

  // 3. GROUP STAGE MATCHES
  console.log('Creating group stage matches...');
  const groupMatches = [
    // Group A
    { n: 1,  g: 'A', h: 'MEX', a: 'RSA', date: '2026-06-11', venue: 'Mexico City Stadium' },
    { n: 2,  g: 'A', h: 'KOR', a: 'CZE', date: '2026-06-12', venue: 'Guadalajara Stadium' },
    { n: 3,  g: 'A', h: 'CZE', a: 'RSA', date: '2026-06-18', venue: 'Atlanta Stadium' },
    { n: 4,  g: 'A', h: 'MEX', a: 'KOR', date: '2026-06-19', venue: 'Guadalajara Stadium' },
    { n: 5,  g: 'A', h: 'CZE', a: 'MEX', date: '2026-06-25', venue: 'Mexico City Stadium' },
    { n: 6,  g: 'A', h: 'RSA', a: 'KOR', date: '2026-06-25', venue: 'Monterrey Stadium' },
    // Group B
    { n: 7,  g: 'B', h: 'CAN', a: 'BIH', date: '2026-06-12', venue: 'Toronto Stadium' },
    { n: 8,  g: 'B', h: 'QAT', a: 'SUI', date: '2026-06-13', venue: 'San Francisco Bay Area Stadium' },
    { n: 9,  g: 'B', h: 'SUI', a: 'BIH', date: '2026-06-18', venue: 'Los Angeles Stadium' },
    { n: 10, g: 'B', h: 'CAN', a: 'QAT', date: '2026-06-19', venue: 'BC Place Vancouver' },
    { n: 11, g: 'B', h: 'SUI', a: 'CAN', date: '2026-06-24', venue: 'BC Place Vancouver' },
    { n: 12, g: 'B', h: 'BIH', a: 'QAT', date: '2026-06-24', venue: 'Seattle Stadium' },
    // Group C
    { n: 13, g: 'C', h: 'BRA', a: 'MAR', date: '2026-06-14', venue: 'New York/New Jersey Stadium' },
    { n: 14, g: 'C', h: 'HAI', a: 'SCO', date: '2026-06-14', venue: 'Boston Stadium' },
    { n: 15, g: 'C', h: 'SCO', a: 'MAR', date: '2026-06-20', venue: 'Boston Stadium' },
    { n: 16, g: 'C', h: 'BRA', a: 'HAI', date: '2026-06-20', venue: 'Philadelphia Stadium' },
    { n: 17, g: 'C', h: 'SCO', a: 'BRA', date: '2026-06-25', venue: 'Miami Stadium' },
    { n: 18, g: 'C', h: 'MAR', a: 'HAI', date: '2026-06-25', venue: 'Atlanta Stadium' },
    // Group D
    { n: 19, g: 'D', h: 'USA', a: 'PAR', date: '2026-06-13', venue: 'Los Angeles Stadium' },
    { n: 20, g: 'D', h: 'AUS', a: 'TUR', date: '2026-06-14', venue: 'BC Place Vancouver' },
    { n: 21, g: 'D', h: 'USA', a: 'AUS', date: '2026-06-19', venue: 'Seattle Stadium' },
    { n: 22, g: 'D', h: 'TUR', a: 'PAR', date: '2026-06-20', venue: 'San Francisco Bay Area Stadium' },
    { n: 23, g: 'D', h: 'TUR', a: 'USA', date: '2026-06-26', venue: 'Los Angeles Stadium' },
    { n: 24, g: 'D', h: 'PAR', a: 'AUS', date: '2026-06-26', venue: 'San Francisco Bay Area Stadium' },
    // Group E
    { n: 25, g: 'E', h: 'GER', a: 'CUW', date: '2026-06-14', venue: 'Houston Stadium' },
    { n: 26, g: 'E', h: 'CIV', a: 'ECU', date: '2026-06-15', venue: 'Philadelphia Stadium' },
    { n: 27, g: 'E', h: 'GER', a: 'CIV', date: '2026-06-20', venue: 'Toronto Stadium' },
    { n: 28, g: 'E', h: 'ECU', a: 'CUW', date: '2026-06-21', venue: 'Kansas City Stadium' },
    { n: 29, g: 'E', h: 'CUW', a: 'CIV', date: '2026-06-25', venue: 'Philadelphia Stadium' },
    { n: 30, g: 'E', h: 'ECU', a: 'GER', date: '2026-06-25', venue: 'New York/New Jersey Stadium' },
    // Group F
    { n: 31, g: 'F', h: 'NED', a: 'JPN', date: '2026-06-14', venue: 'Dallas Stadium' },
    { n: 32, g: 'F', h: 'SWE', a: 'TUN', date: '2026-06-15', venue: 'Monterrey Stadium' },
    { n: 33, g: 'F', h: 'NED', a: 'SWE', date: '2026-06-20', venue: 'Houston Stadium' },
    { n: 34, g: 'F', h: 'TUN', a: 'JPN', date: '2026-06-21', venue: 'Monterrey Stadium' },
    { n: 35, g: 'F', h: 'JPN', a: 'SWE', date: '2026-06-26', venue: 'Dallas Stadium' },
    { n: 36, g: 'F', h: 'TUN', a: 'NED', date: '2026-06-26', venue: 'Kansas City Stadium' },
    // Group G
    { n: 37, g: 'G', h: 'BEL', a: 'EGY', date: '2026-06-15', venue: 'Seattle Stadium' },
    { n: 38, g: 'G', h: 'IRN', a: 'NZL', date: '2026-06-16', venue: 'Los Angeles Stadium' },
    { n: 39, g: 'G', h: 'BEL', a: 'IRN', date: '2026-06-21', venue: 'Los Angeles Stadium' },
    { n: 40, g: 'G', h: 'NZL', a: 'EGY', date: '2026-06-22', venue: 'BC Place Vancouver' },
    { n: 41, g: 'G', h: 'EGY', a: 'IRN', date: '2026-06-27', venue: 'Seattle Stadium' },
    { n: 42, g: 'G', h: 'NZL', a: 'BEL', date: '2026-06-27', venue: 'BC Place Vancouver' },
    // Group H
    { n: 43, g: 'H', h: 'ESP', a: 'CPV', date: '2026-06-15', venue: 'Atlanta Stadium' },
    { n: 44, g: 'H', h: 'KSA', a: 'URU', date: '2026-06-16', venue: 'Miami Stadium' },
    { n: 45, g: 'H', h: 'ESP', a: 'KSA', date: '2026-06-21', venue: 'Atlanta Stadium' },
    { n: 46, g: 'H', h: 'URU', a: 'CPV', date: '2026-06-22', venue: 'Miami Stadium' },
    { n: 47, g: 'H', h: 'CPV', a: 'KSA', date: '2026-06-27', venue: 'Houston Stadium' },
    { n: 48, g: 'H', h: 'URU', a: 'ESP', date: '2026-06-27', venue: 'Guadalajara Stadium' },
    // Group I
    { n: 49, g: 'I', h: 'FRA', a: 'SEN', date: '2026-06-16', venue: 'New York/New Jersey Stadium' },
    { n: 50, g: 'I', h: 'IRQ', a: 'NOR', date: '2026-06-17', venue: 'Boston Stadium' },
    { n: 51, g: 'I', h: 'FRA', a: 'IRQ', date: '2026-06-22', venue: 'Philadelphia Stadium' },
    { n: 52, g: 'I', h: 'NOR', a: 'SEN', date: '2026-06-23', venue: 'New York/New Jersey Stadium' },
    { n: 53, g: 'I', h: 'NOR', a: 'FRA', date: '2026-06-26', venue: 'Boston Stadium' },
    { n: 54, g: 'I', h: 'SEN', a: 'IRQ', date: '2026-06-26', venue: 'Toronto Stadium' },
    // Group J
    { n: 55, g: 'J', h: 'ARG', a: 'ALG', date: '2026-06-17', venue: 'Kansas City Stadium' },
    { n: 56, g: 'J', h: 'AUT', a: 'JOR', date: '2026-06-17', venue: 'San Francisco Bay Area Stadium' },
    { n: 57, g: 'J', h: 'ARG', a: 'AUT', date: '2026-06-22', venue: 'Dallas Stadium' },
    { n: 58, g: 'J', h: 'JOR', a: 'ALG', date: '2026-06-23', venue: 'San Francisco Bay Area Stadium' },
    { n: 59, g: 'J', h: 'ALG', a: 'AUT', date: '2026-06-28', venue: 'Kansas City Stadium' },
    { n: 60, g: 'J', h: 'JOR', a: 'ARG', date: '2026-06-28', venue: 'Dallas Stadium' },
    // Group K
    { n: 61, g: 'K', h: 'POR', a: 'COD', date: '2026-06-17', venue: 'Houston Stadium' },
    { n: 62, g: 'K', h: 'UZB', a: 'COL', date: '2026-06-18', venue: 'Mexico City Stadium' },
    { n: 63, g: 'K', h: 'POR', a: 'UZB', date: '2026-06-23', venue: 'Houston Stadium' },
    { n: 64, g: 'K', h: 'COL', a: 'COD', date: '2026-06-24', venue: 'Guadalajara Stadium' },
    { n: 65, g: 'K', h: 'COL', a: 'POR', date: '2026-06-28', venue: 'Miami Stadium' },
    { n: 66, g: 'K', h: 'COD', a: 'UZB', date: '2026-06-28', venue: 'Atlanta Stadium' },
    // Group L
    { n: 67, g: 'L', h: 'ENG', a: 'CRO', date: '2026-06-17', venue: 'Dallas Stadium' },
    { n: 68, g: 'L', h: 'GHA', a: 'PAN', date: '2026-06-18', venue: 'Toronto Stadium' },
    { n: 69, g: 'L', h: 'ENG', a: 'GHA', date: '2026-06-23', venue: 'Boston Stadium' },
    { n: 70, g: 'L', h: 'PAN', a: 'CRO', date: '2026-06-24', venue: 'Toronto Stadium' },
    { n: 71, g: 'L', h: 'PAN', a: 'ENG', date: '2026-06-27', venue: 'New York/New Jersey Stadium' },
    { n: 72, g: 'L', h: 'CRO', a: 'GHA', date: '2026-06-27', venue: 'Philadelphia Stadium' },
  ];

  await db.insert(matches).values(
    groupMatches.map(m => ({
      matchNumber: m.n,
      groupId: groupMap[m.g],
      round: 'group',
      homeTeamId: teamMap[m.h],
      awayTeamId: teamMap[m.a],
      matchDate: new Date(m.date),
      venue: m.venue,
    }))
  );
  console.log('✓ Group stage matches created');

  console.log('✅ Seeding complete! 12 groups, 48 teams, 72 matches ready.');
}

seed().catch(console.error);