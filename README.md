# EventSnap

**Live event photo sharing — scan, snap, share. No app install required.**

EventSnap is a browser-only mobile web application for live events (weddings, parties, conferences). Guests scan a QR code, enter their name, and start taking photos. All photos appear in a real-time shared gallery visible to every guest.

## Architecture

```
┌──────────────────────────────────────┐
│         Vercel (Next.js 16)          │
│                                      │
│   /admin/*   ← Supabase Auth         │
│   /event/*   ← Guest session tokens  │
│   /api/*     ← Server-side routes    │
└──────────────┬───────────────────────┘
               │
   ┌───────────▼──────────────┐
   │        Supabase          │
   │  Auth · Postgres · Storage│
   │  Realtime · Edge Functions│
   └──────────────────────────┘
```

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript strict)
- **Styling:** Tailwind CSS v4
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage (private buckets, signed URLs)
- **Auth:** Supabase Auth (admin) + localStorage tokens (guests)
- **Real-time:** Supabase Realtime (with polling fallback at ≥150 guests)
- **QR Code:** qrcode.react
- **PDF Export:** jsPDF + html2canvas
- **ZIP:** fflate (client + edge functions)
- **Testing:** Vitest + Testing Library + MSW

## Quick Start

```bash
# Install dependencies
cd eventsnap
npm install

# Set up environment
cp .env.example .env.local
# Fill in your Supabase credentials in .env.local

# Run development server
npm run dev
```

## Environment Variables

See `.env.example` for all required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` — **Server-only** service role key
- `NEXT_PUBLIC_APP_URL` — Production domain for QR URLs

## Supabase Setup

1. **Create admin account:** Follow `supabase/setup/admin-account.md`
2. **Run migrations:** Execute SQL files in `supabase/migrations/` in order
3. **Create storage buckets:** Run `supabase/setup/buckets.sql`
4. **Enable pg_cron:** Dashboard → Database → Extensions → pg_cron
5. **Deploy Edge Functions:**
   ```bash
   supabase functions deploy export-event-zip
   supabase functions deploy auto-delete-expired
   ```

## Project Structure

```
eventsnap/
├── src/
│   ├── app/           # Next.js App Router pages + API routes
│   ├── components/    # React components (guest/, admin/, shared/)
│   ├── lib/           # Utilities (supabase clients, compression, etc.)
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   └── middleware.ts   # Admin route protection
├── supabase/
│   ├── migrations/    # Database schema SQL
│   ├── setup/         # One-time setup scripts
│   └── functions/     # Edge Functions (Deno)
├── .agent/
│   ├── BUILD_GRAPH.md # Live build state
│   └── DECISIONS.md   # Architectural decision log
└── .env.local         # Secrets (gitignored)
```

## Build Phases

| # | Phase | Status |
|---|-------|--------|
| 0 | Architecture & Setup | ✅ |
| 1 | Database & Storage | ⬜ |
| 2 | Auth & Session Architecture | ⬜ |
| 3 | Guest App Shell & Theme | ⬜ |
| 4 | Camera & Upload Pipeline | ⬜ |
| 5 | Gallery, Sharing & Downloads | ⬜ |
| 6 | Admin Dashboard Core | ⬜ |
| 7 | Branding, Theming & Forms | ⬜ |
| 8 | QR Code & PDF Export | ⬜ |
| 9 | Supabase Edge Functions | ⬜ |
| 10 | Real-Time Connections | ⬜ |
| 11 | Testing & QA | ⬜ |
| 12 | Deployment Config | ⬜ |
| 13 | Final Review & PR | ⬜ |

## Security Model

- **Admin:** Supabase Auth JWT (cookie-based session)
- **Guests:** UUID session tokens in localStorage
- **Service role key:** Server-side only, never exposed to client
- **All storage:** Private buckets with signed URLs
- **RLS:** Enabled on all tables

## License

Private — all rights reserved.
