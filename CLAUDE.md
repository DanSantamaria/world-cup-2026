# Claude Agent Instructions

You are helping build the World Cup 2026 Bracket Tracker.
Always read SPEC.md and ARCHITECTURE.md before making decisions.

## Rules
- Follow Clean Architecture: domain → use-cases → infrastructure → ui
- Mobile-first Tailwind: design for 390px width first
- Use Server Actions for all data mutations (no separate API routes unless needed)
- Use Drizzle ORM for all DB access — no raw SQL except in migrations
- TypeScript strict mode always
- Never put business logic in components
- Never put DB queries outside infrastructure/

## Code Style
- Functional components only
- Explicit return types on all functions
- Prefer async Server Components for data fetching
- Name files in kebab-case, components in PascalCase

## When adding a feature
1. Define the type in domain/types.ts first
2. Write the use case in use-cases/
3. Add the DB query in infrastructure/db/
4. Wire it in a Server Action
5. Build the UI component last