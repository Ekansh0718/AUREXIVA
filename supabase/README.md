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

## 7. Payment module

The app's payment code (`src/services/payment/`) is provider-agnostic. Three providers exist:

- `mock` — simulated gateway, no external dependency, good for demoing the flow with zero setup
- `razorpay` — **the real, fully-implemented integration** — just needs credentials + deployment (steps below)
- `bank` — placeholder for the client's own bank API, not implemented (kept in case Razorpay isn't the final choice)

### Going live with Razorpay

**A. Get your credentials** from the Razorpay Dashboard → Settings → API Keys:
- **Key ID** (looks like `rzp_live_xxxxxxxxxxxx` or `rzp_test_...` for test mode) — this one is safe client-side
- **Key Secret** — this one is NOT safe client-side, ever

**B. Install and link the Supabase CLI** (needed to deploy Edge Functions — skip if already done):
```
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
```
(Find `<your-project-ref>` in your project URL: `supabase.com/dashboard/project/<ref>`.)

**C. Set the secret values** — never in `.env`, only as Supabase secrets:
```
supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<from Project Settings > API>
```

**D. Deploy the three Edge Functions:**
```
supabase functions deploy create-payment-order
supabase functions deploy verify-payment
supabase functions deploy payment-webhook --no-verify-jwt
supabase functions deploy refund-payment
```
(`payment-webhook` uses `--no-verify-jwt` because Razorpay calls it directly with no Supabase session — it authenticates via the webhook signature instead, not a JWT.)

**E. Set up the Razorpay webhook** (durable server-side confirmation, independent of the customer's browser):
1. Razorpay Dashboard → Settings → Webhooks → **Add New Webhook**
2. Webhook URL: the deployed `payment-webhook` function's URL (Supabase gives you this after deploying — looks like `https://<ref>.supabase.co/functions/v1/payment-webhook`)
3. Active events: check `payment.captured` and `payment.failed`
4. Set a secret, then run: `supabase secrets set RAZORPAY_WEBHOOK_SECRET=<that secret>`

**F. Flip the frontend to Razorpay** — in `.env` (and in Vercel's environment variables for the deployed site):
```
VITE_PAYMENT_PROVIDER=razorpay
VITE_PAYMENT_MERCHANT_ID=rzp_live_xxxxxxxxxxxx
VITE_PAYMENT_PUBLIC_KEY=rzp_live_xxxxxxxxxxxx
```
(Same Key ID in both — `VITE_PAYMENT_PUBLIC_KEY` is the one actually used by `RazorpayPaymentProvider`.)

**In Vercel specifically**, scope the live (`rzp_live_...`) values to the **Production** environment only, and leave **Preview** deployments on the test (`rzp_test_...`) values. Preview URLs get shared casually (client review links, PR previews) — keeping them on test keys means a stray link never lets anyone trigger a real charge. Set both sets of values under Project Settings → Environment Variables, each scoped to the right environment.

**That's it.** No other application code changes — `src/services/payment/providers/razorpay.provider.ts` and the Edge Functions handle everything: order creation, opening Razorpay's real checkout modal, cryptographic signature verification, and the webhook as a durable backup. See the architecture comments at the top of `razorpay.provider.ts` and each function under `functions/` for how the pieces fit together.

**Test mode first:** use your `rzp_test_...` Key ID/Secret and Razorpay's [test card numbers](https://razorpay.com/docs/payments/payments/test-card-upi-details/) to run through a full checkout before switching to live keys.
