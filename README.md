# EduSheet AI (MVP)

EduSheet AI is a SaaS web app for teachers to generate worksheet drafts with AI, then manually customize and export them.

## Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, RLS)
- Stripe subscriptions
- OpenAI or **Google Gemini** worksheet generation (configurable)
- Zod validation
- React Hook Form + dnd-kit (editor interactions)
- `@react-pdf/renderer` for PDF export

## Features Implemented

- Authentication (email/password + magic link)
- Protected dashboard routes
- Supabase schema + RLS policies
- Worksheet CRUD APIs
- AI worksheet generation endpoint with strict JSON validation
- Drag-and-drop-capable editor shell with inline edits
- Stripe checkout, billing portal, and webhook sync
- Plan usage limits (free vs pro)
- PDF export endpoint + export history table
- Stripe webhook idempotency (`stripe_processed_events`) and audit logs (`audit_logs`)
- Per-user rate limits on AI generation and PDF export routes

## Project Structure

- `src/app` - pages and API routes
- `src/components` - UI and feature components
- `src/features` - business logic modules
- `src/lib` - integrations and validators
- `src/types` - domain types
- `supabase/migrations` - SQL schema + RLS

## Required Environment Variables

Copy `.env.example` to `.env.local` and populate values:

```bash
cp .env.example .env.local
```

### Worksheet AI provider (OpenAI vs Gemini)

- **`WORKSHEET_AI_PROVIDER`**: `openai` or `gemini` (optional).
- If unset: uses **Gemini** when only `GEMINI_API_KEY` is set; otherwise **OpenAI** when `OPENAI_API_KEY` is set.
- For local testing with Gemini: set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`, e.g. `gemini-2.0-flash`). You can omit `OPENAI_API_KEY` to force Gemini, or set `WORKSHEET_AI_PROVIDER=gemini` explicitly.

## Local Setup

1. Install dependencies

```bash
pnpm install
```

2. Create a Supabase project and run SQL migrations:

- `supabase/migrations/0001_init.sql`
- `supabase/migrations/0002_rls_policies.sql`
- `supabase/migrations/0003_webhook_idempotency_audit.sql`

3. Configure Supabase Auth redirect URLs:

- `http://localhost:3000/sign-in`
- `http://localhost:3000/dashboard`

4. Create Stripe product + recurring Pro price, set `STRIPE_PRO_PRICE_ID`.

5. Configure Stripe webhook endpoint:

- Local/dev URL -> `/api/stripe/webhook`

6. Add OpenAI API key.

7. Run development server:

```bash
pnpm dev
```

## Verification Commands

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Notes

- Worksheet architecture intentionally separates:
  - `content_json`
  - `layout_json`
  - `theme_json`
- AI generation only creates initial worksheet content; user edits remain source of truth.
- Regeneration only occurs via explicit user action.
