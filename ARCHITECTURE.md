# Architecture Guide

## Folder Structure
src/

app/                        # Next.js App Router

(auth)/login/page.tsx

(auth)/register/page.tsx

dashboard/page.tsx

groups/[groupId]/page.tsx

bracket/page.tsx

api/auth/[...nextauth]/route.ts

domain/

types.ts                  # Team, Group, Match, Score, Standing interfaces

rules.ts                  # Tiebreaker logic, advancement rules

use-cases/

calculateStandings.ts

determineAdvancing.ts

enterScore.ts

infrastructure/

db/

schema.ts               # Drizzle schema

client.ts               # Neon connection

seed.ts                 # All 48 teams + 104 matches

auth/

nextauth.config.ts

ui/

components/

GroupTable.tsx

MatchCard.tsx

ScoreInput.tsx

KnockoutBracket.tsx

BracketSlot.tsx

## Key Principles
- Domain layer has zero imports from Next.js or Drizzle
- Use cases receive and return domain types only
- Server Actions live in ui/ and call use cases
- Database queries live in infrastructure/ only
- Components are either Server Components (data fetching) or Client Components (interactivity), never mixed carelessly