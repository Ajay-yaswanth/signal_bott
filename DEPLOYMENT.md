# Testing And Deployment

This application publishes trading workflow data. It does not guarantee profit
or perfect signal accuracy.

## Install

```powershell
npm install
npx prisma generate
```

To install the test runner explicitly on an older checkout:

```powershell
npm install --save-dev vitest
```

## Local Checks

Run focused unit tests:

```powershell
npm run test:run
```

Run the complete pre-deployment check:

```powershell
npm run check
```

Run the application locally:

```powershell
npm run dev
```

## Prisma And Neon

Use a separate Neon branch or disposable database before production.

```powershell
npx prisma format
npx prisma validate
npx prisma generate
npm run db:migrate:status
```

Create a development migration only after reviewing the schema diff:

```powershell
npm run db:migrate -- --name describe_change
```

Apply committed migrations in preview or production:

```powershell
npm run db:migrate:deploy
```

Do not run `prisma migrate reset` against Neon production. Do not deploy until
`prisma migrate status` succeeds and the migration history matches the target
database.

This repository's current Neon database contains the initial application
tables, but Prisma reports every migration as unapplied. On a Neon backup
branch, verify the live-to-schema diff first. If the database already matches
the initial migration, baseline only that migration before deploying the
remaining migrations:

```powershell
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
npx prisma migrate resolve --applied 20260611100000_init_ultron_signals
npm run db:migrate:status
npm run db:migrate:deploy
```

Do not run `migrate resolve` until the initial migration has been manually
verified against the target database.

## Vercel Cron

The committed `vercel.json` invokes `/api/strategy/scan` every minute:

```json
{
  "crons": [
    {
      "path": "/api/strategy/scan",
      "schedule": "* * * * *"
    }
  ]
}
```

Set `CRON_SECRET` in Vercel. Vercel sends it to the route as:

```text
Authorization: Bearer <CRON_SECRET>
```

A one-minute schedule requires a paid Vercel plan. Hobby cron jobs can run only
once per day. Configure `MARKET_DATA_PROVIDER` and the selected provider's
variables before enabling the cron.

## Required Environment Variables

Core:

```text
DATABASE_URL
NEXTAUTH_SECRET
AUTH_SECRET
NEXTAUTH_URL
CRON_SECRET
ULTRON_STRATEGY_API_KEY
ULTRON_BOT_API_KEY
MARKET_DATA_PROVIDER
```

Set `NEXTAUTH_SECRET` and `AUTH_SECRET` to the same strong production secret.
Set `NEXTAUTH_URL` to the production HTTPS origin, for example
`https://your-domain.com`; never use localhost for the Vercel Production
environment.

For TwelveData forex:

```text
TWELVE_DATA_BASE_URL
TWELVE_DATA_API_KEY
TWELVE_DATA_SYMBOL
TWELVE_DATA_POINT_SIZE
TWELVE_DATA_SPREAD_POINTS
```

For Binance crypto:

```text
BINANCE_BASE_URL
BINANCE_SYMBOL
BINANCE_POINT_SIZE
```

Optional TradingView webhook:

```text
TRADINGVIEW_WEBHOOK_ENABLED
TRADINGVIEW_WEBHOOK_SECRET
```

Razorpay billing:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

Optional strategy limits:

```text
ULTRON_MAX_NORMAL_SIGNALS_PER_DAY
ULTRON_MAX_SNIPER_SIGNALS_PER_DAY
```

Use `.env.example` as the full template. Never commit real credentials.

## Razorpay Paid-Trial Testing

The pricing flow charges a ₹9 upfront add-on for two days of paid access. The
selected recurring plan is created with a future `start_at` and begins after
the paid trial. Checkout requires explicit recurring-autopay consent.

Local test-mode flow:

1. Use Razorpay Test Mode keys for `RAZORPAY_KEY_ID` and
   `RAZORPAY_KEY_SECRET`.
2. Set a strong local `RAZORPAY_WEBHOOK_SECRET`.
3. Expose the local server with a secure tunnel such as ngrok or Cloudflare
   Tunnel.
4. Configure the Razorpay test webhook URL as
   `https://your-tunnel.example/api/razorpay/webhook`.
5. Subscribe to payment and subscription lifecycle events, including
   `payment.captured`, `payment.failed`, `subscription.authenticated`,
   `subscription.activated`, `subscription.charged`, `subscription.pending`,
   `subscription.halted`, `subscription.cancelled`, `subscription.completed`,
   and `subscription.expired`.
6. Register a fresh user, choose a plan, confirm the autopay disclosure, and
   complete checkout using Razorpay test credentials.
7. Confirm `TrialAccess`, `Subscription`, `Payment`, and `AuditLog` records in
   Prisma Studio.
8. Test cancellation from the dashboard and confirm the signed webhook updates
   the local subscription.

Production flow:

1. Replace test keys with live Razorpay keys in Vercel Production.
2. Configure the production webhook URL and matching webhook secret.
3. Run a low-risk live checkout with a controlled account.
4. Confirm the ₹9 charge, two-day paid access, future recurring start date,
   webhook events, cancellation, and premium locking before launch.

Razorpay timing and event delivery are external behavior. Verify the exact
subscription start and billing schedule in the Razorpay dashboard for every
plan before offering it to customers.

## Deployment Checklist

- Create a backup or Neon branch before changing the production schema.
- Confirm the Vercel Git repository is `Ajay-yaswanth/signal_bott`.
- Confirm the Vercel Production Branch is `main`.
- Confirm the Vercel Root Directory is the repository root (`.`).
- Confirm Framework Preset is `Next.js`, Build Command is `npm run build`, and
  the Output Directory override is empty.
- Confirm the Ignored Build Step does not skip commits on `main`.
- Confirm `npm install` completes.
- Confirm `npm run test:run`, `npm run lint`, and `npm run build` pass.
- Confirm `npm run db:migrate:status` succeeds against the target database.
- Review every pending migration before `npm run db:migrate:deploy`.
- Add all required environment variables to Vercel Production.
- Use strong, unique values for authentication and webhook secrets.
- Set `NEXTAUTH_URL` to the production HTTPS URL.
- Confirm the selected market provider is configured and reachable.
- Confirm the Vercel plan supports the configured cron frequency.
- Redeploy the latest `main` deployment with **Use existing Build Cache**
  disabled.
- Hard refresh the production site, then test the production URL with
  `?v=latest` appended to bypass browser/CDN URL caching.
- Verify the deployment source commit matches the latest `main` commit.
- Verify login, admin authorization, premium locking, and billing.
- Verify `/api/strategy/scan` rejects requests without valid authorization.
- Review Vercel logs after the first cron executions.
- Monitor signal outcomes and risk controls; do not represent signals as
  guaranteed profit or perfectly accurate.
