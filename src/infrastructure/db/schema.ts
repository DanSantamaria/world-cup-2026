import { pgTable, serial, varchar, integer, timestamp, unique } from 'drizzle-orm/pg-core';

// Groups (A through L)
export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 1 }).notNull(), // A, B, C...
});

// Teams
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  countryCode: varchar('country_code', { length: 3 }).notNull(),
  flagEmoji: varchar('flag_emoji', { length: 10 }).notNull(),
  groupId: integer('group_id').references(() => groups.id).notNull(),
});

// Matches (group stage + knockout)
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => groups.id), // null for knockout
  round: varchar('round', { length: 50 }).notNull(), // 'group', 'r32', 'r16', 'qf', 'sf', '3rd', 'final'
  matchNumber: integer('match_number').notNull(),
  homeTeamId: integer('home_team_id').references(() => teams.id),
  awayTeamId: integer('away_team_id').references(() => teams.id),
  matchDate: timestamp('match_date'),
  venue: varchar('venue', { length: 100 }),
  // For knockout: store slot labels when teams not yet known
  homeSlot: varchar('home_slot', { length: 20 }), // e.g. "1A", "2B"
  awaySlot: varchar('away_slot', { length: 20 }),
});

// Users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  provider: varchar('provider', { length: 50 }).default('credentials'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Scores (one per user per match)
export const scores = pgTable('scores', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  matchId: integer('match_id').references(() => matches.id).notNull(),
  homeGoals: integer('home_goals').notNull(),
  awayGoals: integer('away_goals').notNull(),
  // Disciplinary: yellow=1pt, direct red=3pts, yellow+red=3pts (subsumed)
  homeYellowCards: integer('home_yellow_cards').notNull().default(0),
  awayYellowCards: integer('away_yellow_cards').notNull().default(0),
  homeRedCards: integer('home_red_cards').notNull().default(0),
  awayRedCards: integer('away_red_cards').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  uniqueUserMatch: unique().on(table.userId, table.matchId),
}));