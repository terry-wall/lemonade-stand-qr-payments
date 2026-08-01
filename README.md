# lemonade-stand-qr-payments

A digital lemonade stand: pick drinks on the stand's screen, and the customer
scans a QR code with their phone to pay via Stripe.

## How it works

1. `POST /api/checkout` receives `{ items: [{ id, quantity }] }`. The server
   prices the order from `src/lib/menu.ts` — prices are never accepted from the
   browser — and creates a Stripe **Checkout Session**.
2. The browser navigates to `/payment/<session_id>`, which renders the order
   summary and a QR code encoding Stripe's hosted checkout URL.
3. The customer scans it and pays on Stripe's page. No card data ever touches
   this app.
4. `POST /api/webhook` receives `checkout.session.*` events and updates the
   order. The payment page also polls `GET /api/checkout/<session_id>`, so the
   status still resolves if webhooks are not wired up locally.

## Setup

```bash
cp .env.example .env      # then fill in your Stripe keys
npm install
npx prisma migrate deploy # or `migrate dev` while iterating on the schema
npm run dev
```

Requires a Postgres database. `docker compose up` starts one alongside the app.

To exercise webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

`APP_URL` must be reachable from the phone scanning the QR code. On `localhost`
the QR still works if you scan it from the same machine; otherwise use a tunnel
(`stripe listen` / `ngrok`) and set `APP_URL` to that hostname.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (generates Prisma client, typechecks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Notes

- Money is stored and computed in integer cents throughout; no floats.
- Schema changes go through `prisma/migrations`. The container runs
  `prisma migrate deploy` on start, which never drops data.
