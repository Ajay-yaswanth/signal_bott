# ULTRON Signals

Production-ready XAUUSD signal SaaS with live signal publishing, trade history, performance analytics, subscriptions, and audited admin workflows.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS 4
- shadcn/ui-style components
- Prisma 7
- PostgreSQL
- NextAuth/Auth.js via `next-auth`
- Zod
- Recharts

## Routes

- `/` signal desk overview
- `/login`
- `/register`
- `/dashboard`
- `/signals`
- `/performance`
- `/pricing`
- `/admin`
- `/robots.txt`
- `/sitemap.xml`

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Razorpay account and recurring monthly plan for billing

## Local Setup

1. Install dependencies and create the local environment file:

```bash
npm install
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp .env.example .env`.

2. Set every value in `.env`, then generate the Prisma client, apply migrations, and seed demo data:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection used by Prisma |
| `NEXTAUTH_SECRET` | Yes | Signs Auth.js session tokens |
| `NEXTAUTH_URL` | Yes | Canonical application URL and auth callback origin |
| `RAZORPAY_KEY_ID` | Yes | Public Razorpay checkout key returned by the server |
| `RAZORPAY_KEY_SECRET` | Yes | Private Razorpay API secret |
| `RAZORPAY_MONTHLY_PLAN_ID` | Yes | Razorpay recurring monthly plan |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Verifies Razorpay webhook signatures |
| `RAZORPAY_SUBSCRIPTION_TOTAL_COUNT` | No | Billing-cycle cap; defaults to `120` |
| `ULTRON_BOT_API_KEY` | Yes | Authenticates bot signal publishing |

Never expose `NEXTAUTH_SECRET`, Razorpay secrets, or `ULTRON_BOT_API_KEY` to browser code.

## Database

Prisma is configured in `prisma/schema.prisma` and `prisma.config.ts`. The generated client is emitted to `src/generated/prisma`. Razorpay amounts are stored as integer minor units, so `149900` represents INR 1,499.00.

For local schema changes, run `npm run db:migrate`. In production, apply committed migrations with:

```bash
npx prisma migrate deploy
```

## Authentication And Access

Authentication uses NextAuth credentials with Prisma-backed users and bcrypt password hashes. Registration creates a three-day trial. Dashboard routes require authentication, and `/admin` plus `/api/admin/*` require the `ADMIN` role.

Dashboard signal details remain blocked after trial expiry unless the user has an active subscription.

## Razorpay Setup

1. Create a monthly recurring plan and set `RAZORPAY_MONTHLY_PLAN_ID`.
2. Configure the webhook URL as `https://your-domain.com/api/razorpay/webhook`.
3. Subscribe to payment success/failure and subscription lifecycle events.
4. Set the same webhook signing secret in `RAZORPAY_WEBHOOK_SECRET`.

Checkout signatures and webhooks are verified server-side. Secrets are never sent to the frontend.

## Bot Signal API

Set `ULTRON_BOT_API_KEY` in `.env`, then publish signals using either an `Authorization: Bearer` or `x-api-key` header:

```bash
curl -X POST http://localhost:3000/api/signals/publish \
  -H "Authorization: Bearer $ULTRON_BOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"XAUUSD","direction":"BUY","entry":2338.40,"stopLoss":2327.20,"tp1":2348,"tp2":2356.50,"tp3":2364.80,"confidence":92,"bias":"Bullish liquidity reclaim","reason":"Sell-side liquidity sweep followed by bullish displacement and fair-value-gap confirmation."}'
```

Authenticated dashboard users with an active trial or subscription can fetch the current XAUUSD signal from `GET /api/signals/latest`.

After seeding, demo credentials are:

```text
admin@ultronsignals.com / UltronAdmin123!
trader@ultronsignals.com / UltronTrader123!
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Production Checklist

```bash
npm run lint
npm run build
npx prisma migrate deploy
npm run start
```

Before launch, replace demo credentials, rotate all secrets, use Razorpay live keys, set `NEXTAUTH_URL` to the HTTPS production origin, and confirm the webhook endpoint is reachable.
