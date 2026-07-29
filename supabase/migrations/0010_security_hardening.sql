-- Security hardening pass (pre-handover audit).
--
-- Two real vulnerabilities found: both let a malicious authenticated user
-- bypass business logic entirely by calling the Supabase REST/JS API
-- directly with their own valid session — the app's own UI never needed to
-- be touched. Fixed at the RLS/trigger layer, which is the only boundary
-- that actually matters (client code is never trustworthy).

-- ---------------------------------------------------------------------------
-- 1. Privilege escalation: profiles_update_own (0002_rls.sql) lets a user
--    update ANY column on their own row, including is_admin. Any registered
--    customer could run `update profiles set is_admin = true where id =
--    auth.uid()` directly against the API and grant themselves full
--    products/categories write access (0009_admin_catalog_writes.sql).
-- ---------------------------------------------------------------------------
create or replace function public.prevent_admin_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin then
    if coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'is_admin can only be changed by the service role';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_admin_escalation on public.profiles;
create trigger profiles_prevent_admin_escalation
  before update on public.profiles
  for each row execute function public.prevent_admin_self_escalation();

-- ---------------------------------------------------------------------------
-- 2. Price tampering: createOrder() (src/services/orders.ts) inserts
--    orders.total and order_items.unit_price straight from client-side
--    JavaScript. orders_insert_own / order_items_insert_own (0002_rls.sql)
--    only check that the row belongs to the caller — nothing validates the
--    amount. A malicious user could insert an order with total = 1 while
--    order_items reference real (expensive) products; create-payment-order
--    trusts orders.total unconditionally, so Razorpay would legitimately
--    charge ₹1 for a real order.
--
--    Fix: unit_price is now always overwritten from the authoritative
--    products.price at insert time, and orders.subtotal/total are always
--    recomputed server-side from the (now-trustworthy) order_items — never
--    trusted from the client. Free-shipping-over-₹999 / else-₹99 mirrors
--    the same rule in Checkout.tsx; keep both in sync if it ever changes.
-- ---------------------------------------------------------------------------
create or replace function public.set_order_item_price_from_product()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  real_price numeric;
begin
  if new.product_id is not null then
    select price into real_price from public.products where id = new.product_id;
    if real_price is not null then
      new.unit_price := real_price;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists order_items_set_price on public.order_items;
create trigger order_items_set_price
  before insert on public.order_items
  for each row execute function public.set_order_item_price_from_product();

create or replace function public.recompute_order_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order_id uuid;
  new_subtotal numeric;
  new_shipping numeric;
begin
  target_order_id := coalesce(new.order_id, old.order_id);

  select coalesce(sum(unit_price * quantity), 0) into new_subtotal
  from public.order_items
  where order_id = target_order_id;

  new_shipping := case when new_subtotal > 999 then 0 else 99 end;

  -- Never rewrite an order that's already been paid — only pending orders
  -- are still "under construction" from the checkout flow's point of view.
  update public.orders
  set subtotal = new_subtotal,
      total = new_subtotal + new_shipping
  where id = target_order_id
    and status = 'pending';

  return null;
end;
$$;

drop trigger if exists order_items_recompute_totals on public.order_items;
create trigger order_items_recompute_totals
  after insert or update or delete on public.order_items
  for each row execute function public.recompute_order_totals();
