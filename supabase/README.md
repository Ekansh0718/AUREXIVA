# Supabase Setup — AUREXIVA

Corresponds to PRD [Section 9–10](../docs/PRD.md#9-data-model-supabase--postgresql) and Delivery Plan Day 1.

## 1. Create the project

1. Go to [supabase.com](https://supabase.com) and create a new project (pick a region close to your users).
2. Under **Project Settings → API**, copy the **Project URL** and **anon public** key.
3. Copy `.env.example` to `.env` in the repo root and paste those two values into `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## 2. Run the migrations

In the Supabase dashboard, open **SQL Editor** and run the files in this folder **in order**:

1. `migrations/0001_schema.sql` — tables, indexes, triggers
2. `migrations/0002_rls.sql` — Row Level Security policies
3. `migrations/0003_seed.sql` — the 3 MVP categories + sample products (safe to re-run)
4. `migrations/0004_payment.sql` — payment status/transaction fields on `orders` + the payment RLS policy (see the security note inside that file before going live with a real gateway)

(If you prefer the CLI: `supabase link --project-ref <ref>` then `supabase db push` after placing these files under a CLI-managed `migrations` folder — the SQL is CLI-compatible as-is.)

## 3. Verify RLS is working

As an anonymous/unauthenticated request, you should be able to `select` from `categories` and `products` but **not** from `profiles`, `cart_items`, `orders`, or `order_items`. Create two test users in **Authentication → Users** and confirm each can only see their own `cart_items`/`orders` rows — this is the check called out in PRD Section 21, Day 7.

## 4. Auth email settings

Supabase's default SMTP is fine for development. Before production launch, confirm "Confirm email" is enabled under **Authentication → Providers → Email**, and consider a custom SMTP provider (Resend/Postmark) if verification emails land in spam (PRD Section 22 risk).

## 5. Storage (product/category images)

Create a public bucket named `product-images` (**Storage → New bucket**, "Public bucket" on) for category and product images referenced by `categories.image_url` and `products.images`.

## 6. Regenerating types

`src/types/database.ts` is hand-written to match `0001_schema.sql`. If you install the Supabase CLI, you can regenerate it exactly from the live schema instead:

```
supabase gen types typescript --project-id <ref> > src/types/database.ts
```

Run this any time the schema changes so the TypeScript types don't drift.

## 7. Payment module (Day 6)

The app's payment code (`src/services/payment/`) is provider-agnostic — it currently runs against `MockPaymentProvider`, which simulates the full gateway round-trip with no external dependency (see `src/pages/payment/MockPaymentGateway.tsx`). No bank credentials are needed to test checkout end-to-end right now.

Three Supabase Edge Functions are scaffolded under `functions/` but **not deployed**:

- `payment-webhook` — where the bank's server-to-server webhook will land
- `create-payment-order` — where `BankPaymentProvider.initializePayment` will call out to the bank (using the secret key, server-side only)
- `verify-payment` — where payment status checks against the bank happen server-side

When the bank sends Merchant ID / API Keys / Gateway URL / Webhook Secret:

1. Fill in the client-safe values in `.env` (`VITE_PAYMENT_MERCHANT_ID`, `VITE_PAYMENT_PUBLIC_KEY`, `VITE_PAYMENT_GATEWAY_URL`) and set `VITE_PAYMENT_PROVIDER=bank`.
2. Set the secret values as Supabase secrets — **never** in `.env`: `supabase secrets set BANK_SECRET_KEY=... BANK_WEBHOOK_SECRET=...`
3. Implement the TODOs in `src/services/payment/providers/bank.provider.ts` and the three Edge Functions above.
4. Deploy: `supabase functions deploy payment-webhook create-payment-order verify-payment`.

No other application code should need to change — see the architecture comment at the top of `bank.provider.ts`.
