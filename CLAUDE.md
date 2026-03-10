# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow

Always work on a feature branch and open a PR — never commit directly to `main`.

```bash
git checkout main && git pull
git checkout -b feat/<short-name>
# ... make changes, commit ...
git push -u origin feat/<short-name>
gh pr create ...
```

## Commands

```bash
# Development
npm run dev        # Start Next.js dev server (Turbopack) on http://localhost:3000
npm run build      # Production build + type check
npm run lint       # ESLint

# Database
npx prisma migrate dev --name <name>   # Create and apply a migration
npx prisma generate                    # Regenerate Prisma client after schema changes
npx prisma studio                      # Open DB GUI
```

## Architecture

**Stack:** Next.js 16 (App Router, TypeScript, Tailwind v4), NextAuth v5 (JWT strategy), Prisma v7 + PostgreSQL, Vercel Cron.

### Auth split (critical)
Two auth configs exist to avoid Edge runtime errors:
- `src/lib/auth.config.ts` — Edge-safe (no Prisma), used by `src/middleware.ts` (now called `proxy.ts` in Next 16)
- `src/lib/auth.ts` — Node.js only, extends auth.config + adds PrismaAdapter. Used everywhere else.

### Prisma v7 quirks
- `datasource db` in `schema.prisma` has **no `url` field** — URL lives in `prisma.config.ts`
- Runtime client **requires a driver adapter**: `src/lib/prisma.ts` uses `PrismaPg` with a `pg.Pool`
- Always run `npx prisma generate` after schema changes

### XP system (`src/lib/xp.ts`)
All XP math lives here: `calcLevel`, `calcRank`, `xpToNextRank`, prestige multipliers/titles.
- Use `calcRank(user.totalXP)` for live eligibility checks — don't trust `user.rank` (stale DB value until next sync)
- NATIONAL threshold is currently `100` (temp for testing) — restore to `300000` before release

### Key data flow
1. User signs in → PrismaAdapter creates User row (githubId/username are nullable for adapter compat)
2. `jwt` callback in `auth.ts` fires after creation → updates githubId, username, avatarUrl in DB
3. `src/actions/syncXP.ts` — server action that fetches GitHub public events, diffs against stored `XPEvent` rows, awards XP with prestige multiplier applied
4. Cron: `src/app/api/cron/sync/route.ts` — calls `syncAllActiveUsers()` every 6h (protected by `CRON_SECRET`)

### Styling conventions
- Dark Solo Leveling aesthetic: `#050810` background, `#4fc3f7` gate blue, `#7c4dff` magic purple, `#ffd54f` gold
- Fonts: `font-display` = Cinzel Decorative (titles), `font-sans` = Rajdhani (body) — set via CSS vars in `globals.css`
- Custom CSS classes (`.gate-btn`, `.void-btn`, `.shimmer-text`, `.animate-*`) defined in `globals.css` — use these instead of Tailwind arbitrary values for animated/glow effects
- Dynamic colors (rank, prestige tier) use inline `style` props since Tailwind can't JIT dynamic class names

### Prestige tiers
Each tier has a distinct color identity defined in `PRESTIGE_STYLES` in `dashboard/page.tsx`:
I = amber, II = purple, III = ice blue, IV+ = crimson. Apply consistently to badges and title pills.
