# World Cup 2026 — Bracket Tracker · SPEC.md

## Vision
A mobile-first web app that recreates the feeling of a physical World Cup booklet.
Users log in, enter match scores as games are played, and watch the bracket
automatically update — group standings recalculate and knockout rounds populate
with advancing teams in real time.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Neon
- **ORM:** Drizzle ORM
- **Auth:** NextAuth.js (credentials + GitHub OAuth)
- **Deployment:** Vercel
- **Architecture:** Clean Architecture (domain → use cases → infrastructure → UI)

## Users & Auth
- Users can register with email/password or GitHub OAuth
- Each user has their own bracket — scores they enter are theirs alone
- Scores are editable at any time before or after the tournament

## Tournament Structure — FIFA World Cup 2026
- 48 teams, 12 groups of 4 teams each (Groups A–L)
- Group stage: each team plays 3 matches (6 matches per group, 72 total)
- Top 2 from each group + 8 best third-place teams = 32 teams advance
- Knockout rounds: Round of 32 → Round of 16 → Quarterfinals → Semifinals → Final

## Core Features

### Group Stage
- Display all 12 groups with their 4 teams
- Each group shows a standings table: P W D L GF GA GD Pts
- User can click any match and enter a score (home goals : away goals)
- Standings update instantly after score entry
- Tiebreaker order: points → goal difference → goals scored → head-to-head

### Knockout Bracket
- Visual bracket showing all rounds from R32 to Final
- After group stage completes, slots populate with advancing teams
- As user enters knockout scores, next-round slots update automatically
- Before a match is played, slots show the potential matchup (e.g. "1A vs 2B")

### Visual Style
- Clean + retro aesthetic: think typewriter fonts, aged paper tones, stamp motifs
- Mobile-first: designed for a phone, scales up gracefully to desktop
- Dark mode optional (stretch goal)

## Data Model (conceptual)

### teams
id, name, country_code, group_id, flag_emoji

### groups
id, name (A–L)

### matches
id, group_id (null for knockout), round, home_team_id, away_team_id,
match_date, match_number

### scores (user-specific)
id, user_id, match_id, home_goals, away_goals, created_at, updated_at

### users
id, name, email, password_hash, provider, created_at

## Clean Architecture Layers
src/

domain/          # Types, entities, business rules (no framework deps)

use-cases/       # Application logic (calculateStandings, advanceTeams, etc.)

infrastructure/  # DB queries, NextAuth config, Neon client

ui/              # Next.js pages, components, server actions

## Development Phases
1. Project setup + DB schema + seed data (all 48 teams & 72 matches)
2. Auth (register, login, session)
3. Group stage UI + score entry
4. Standings calculation engine
5. Knockout bracket UI + advancement logic
6. Polish: animations, retro styling, mobile tuning
7. Deploy to Vercel + connect Neon prod DB