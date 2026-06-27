# Scores Cup 26

A full-stack web application for tracking FIFA World Cup 2026 predictions. Users enter their own score predictions for all 104 matches — group stage and knockout rounds — and watch group standings, third-place rankings, and the knockout bracket update in real time.

---

## Overview

Scores Cup 26 is a personal prediction tracker built for the 2026 FIFA World Cup (Canada, Mexico & USA). Each user logs in and enters their predicted scores for every match. The app computes standings using official FIFA tiebreaker rules, determines which teams advance from the group stage, resolves knockout bracket slots dynamically, and displays the full 104-match bracket.

The app is designed mobile-first and intended for a Spanish-speaking audience, displaying all kickoff times in Madrid time (CEST, UTC+2).

---

## Features

- **User authentication** — Email/password registration and login with hashed passwords (bcrypt) via NextAuth v5
- **Group stage predictions** — 12 groups × 4 teams, 48 matches total; tap any match to enter a score
- **Live standings** — Points, goal difference, goals scored, and head-to-head updated instantly from user predictions
- **FIFA tiebreaker rules** — Full implementation including disciplinary points, head-to-head, and drawing of lots fallback
- **Third-place ranking table** — All 12 third-place teams ranked globally; top 8 qualify for the Round of 32
- **Knockout bracket** — Visual bracket for all 32 knockout matches (R32 → R16 → QF → SF → 3rd place → Final), with team slots resolved dynamically as group stage results are entered
- **Matches timeline** — Chronological list of all 104 matches with kickoff times in Madrid (CEST), grouped by local date
- **Jump to today** — One-tap scroll to the nearest upcoming match day
- **Score sync banner** — Detects when a user's predictions are behind the reference dataset and offers a one-click catch-up (throttled to once per 24 hours)
- **Penalty shootout support** — Score modal accepts penalty scores when a knockout match ends level

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens |
| Database | [Neon](https://neon.tech/) (serverless PostgreSQL) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Auth | [NextAuth v5](https://authjs.dev/) (credentials provider) |
| Font | Anton (Google Fonts) via `next/font` |
| Hosting | [Vercel](https://vercel.com/) |
| Runtime | React 19 / Node.js 20 |

---

## Architecture

The project follows **Clean Architecture** with a strict dependency direction: domain → use-cases → infrastructure → UI.

```
src/
├── domain/
│   ├── types.ts                # All domain entities (Group, Team, Match, Score, Standing…)
│   └── rules.ts                # Pure business rules (FIFA tiebreaker constants)
│
├── use-cases/
│   ├── calculateStandings.ts   # Computes group standings from scores
│   ├── determineAdvancing.ts   # Resolves advancing teams + ranks third-placers
│   ├── buildBracket.ts         # Assembles bracket match data from DB + standings
│   └── registerUser.ts         # User registration logic
│
├── infrastructure/
│   ├── auth/                   # NextAuth configuration
│   └── db/
│       ├── schema.ts           # Drizzle schema (groups, teams, matches, scores, users)
│       ├── client.ts           # Neon DB connection
│       ├── queries/            # All DB queries (groups, knockout, schedule, scores, users)
│       ├── seed.ts             # Group stage data (48 teams, 72 matches)
│       ├── seed-knockout.ts    # Knockout bracket structure (32 matches)
│       └── update-match-times.ts  # One-time script: populates UTC kickoff times
│
├── ui/
│   └── components/             # React UI components (zero business logic)
│       ├── KnockoutBracket.tsx
│       ├── GroupTable.tsx
│       ├── ScoreModal.tsx
│       ├── SyncScoresBanner.tsx
│       └── …
│
├── app/                        # Next.js App Router pages and Server Actions
│   ├── groups/                 # Group stage page + score actions
│   ├── matches/                # Full match timeline
│   ├── bracket/                # Knockout bracket page
│   └── (auth)/                 # Login and register pages
│
└── lib/
    └── timezone.ts             # UTC → Madrid time conversion utilities
```

**Key architectural decisions:**

- **Server Components by default** — data is fetched on the server and passed down; no client-side data fetching
- **Server Actions for mutations** — score saves, user registration, and score sync all use Next.js Server Actions (no separate API routes)
- **No business logic in components** — standings calculations, tiebreaker resolution, and bracket assembly live entirely in `use-cases/`
- **All DB access in `infrastructure/db/`** — components and use-cases never touch the database directly

---

## Data Model

```
users       id, email, name, password_hash, provider, created_at
groups      id, name (A–L)
teams       id, name, country_code, flag_emoji, group_id
matches     id, match_number, round, group_id, home_team_id, away_team_id,
            home_slot, away_slot, match_date (timestamp UTC), venue
scores      id, user_id, match_id, home_goals, away_goals,
            home_penalties, away_penalties, home_yellow_cards,
            away_yellow_cards, home_red_cards, away_red_cards
```

Knockout matches are stored with `home_slot` / `away_slot` text labels (e.g. `"1A"`, `"WM73"`, `"3ABCDF"`) that are resolved at runtime from live group standings.

---

## Key Implementation Details

### FIFA Tiebreaker Logic
When teams are level on points, the app applies the full FIFA tiebreaker cascade:
1. Points in head-to-head matches between tied teams
2. Goal difference in head-to-head matches
3. Goals scored in head-to-head matches
4. Goal difference across all group matches
5. Goals scored across all group matches
6. Disciplinary points (yellow = 1, red = 3)
7. Drawing of lots (random, as a final fallback)

### Best 8 Third-Place Teams
After all 12 groups are complete, the app ranks all 12 third-place teams globally using the same FIFA criteria. The top 8 qualify for the Round of 32. Their bracket slots (e.g. `"3ABCDF"`) are resolved only once all 72 group matches have been scored.

### Kickoff Times
Match times are stored as UTC timestamps in the database, sourced from the [openfootball/world-cup.json](https://github.com/openfootball/world-cup.json) public dataset. Times were parsed from local stadium timezones (UTC-4 to UTC-7) and converted to UTC. The app displays them in Madrid local time (CEST = UTC+2) using the `Intl` browser API. Day-grouping on the matches page also uses the Madrid date boundary so late-night matches (e.g. 23:30 UTC = 01:30 CEST next day) appear on the correct calendar day.

### Dynamic Slot Resolution
Knockout match participants are not known until group stage results are in. Slots like `"2B"` (runner-up of Group B) or `"3ABCDF"` (best third-placer from groups A/B/C/D/F) are stored as text in the database and resolved at request time by running group standings through `determineAdvancing()`. This means the bracket always reflects the user's current predictions without any re-seeding step.

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- A [Neon](https://neon.tech/) PostgreSQL database

### Setup

```bash
# Clone the repository
git clone https://github.com/DanSantamaria/world-cup-2026.git
cd world-cup-2026

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# Push the schema to the database
npx drizzle-kit push

# Seed the database
npx tsx src/infrastructure/db/seed.ts
npx tsx src/infrastructure/db/seed-knockout.ts
npx tsx src/infrastructure/db/update-match-times.ts

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), register an account, and start entering predictions.

---

## Design

The visual identity is built around the **Scores Cup** brand:

- **Background**: warm paper white (`#FAF6F1`)
- **Primary**: gold (`#B3944D`) with a dark variant (`#886F35`)
- **Text**: near-black ink (`#1A1815`)
- **Display font**: Anton (condensed, uppercase — used for headers and labels)
- **Mobile-first**: designed for 390px viewport width and scaled up for desktop

---

## Author

**Daniel Santamaria** — [st.daniel88@gmail.com](mailto:st.daniel88@gmail.com)

Built during the 2026 FIFA World Cup as a personal project to track predictions with friends and family.
