-- AUREXIVA payment fields (PRD Section 11 / Day 6 payment module)
-- Run after 0003_seed.sql. Safe to re-run.

-- The original `payment_reference` column (added in 0001) is superseded by
-- the more granular fields below, matching the payment provider interface's
-- PaymentVerificationResult shape (transaction_id, gateway_reference,
-- payment_method) plus a payment_status distinct from the fulfillment
-- `status` column (pending/paid/shipped/delivered/cancelled).
alter table public.orders drop column if exists payment_reference;

alter table public.orders
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending', 'success', 'failed', 'cancelled', 'refunded')),
  add column if not exists transaction_id text,
  add column if not exists gateway_reference text,
  add column if not exists payment_method text;

create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_transaction_id_idx on public.orders (transaction_id);

-- ---------------------------------------------------------------------------
-- RLS: allow the order's owner to write the payment result back onto their
-- own still-pending order.
--
-- MVP SIMPLIFICATION — READ BEFORE INTEGRATING A REAL GATEWAY:
-- With a real bank gateway, payment confirmation must be written by a
-- trusted server (the webhook handler in supabase/functions/payment-webhook,
-- using the service-role key) after verifying the gateway's signature — never
-- directly by the client, since that would let a user mark their own order
-- "paid" without actually paying. This client-write policy exists only
-- because the current provider is a simulated mock gateway with no server
-- component to call back. Tighten this (drop the policy below, verify
-- exclusively via the webhook) before going live with real credentials.
-- ---------------------------------------------------------------------------
drop policy if exists "orders_update_own_pending_payment" on public.orders;
create policy "orders_update_own_pending_payment"
  on public.orders for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id);
