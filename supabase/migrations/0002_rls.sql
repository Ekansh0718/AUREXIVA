-- AUREXIVA Row Level Security (PRD Section 10)
-- Run after 0001_schema.sql. Safe to re-run (drops policies before recreating).

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert/delete policy: rows are created only by the handle_new_user
-- trigger (security definer) and are never deleted by the client.

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
  on public.categories for select
  using (true);

-- No client-side insert/update/delete policy in MVP: catalog writes happen
-- via the Supabase SQL editor / service role (PRD Section 10, 12).

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "products_select_active" on public.products;
create policy "products_select_active"
  on public.products for select
  using (is_active = true);

-- No client-side insert/update/delete policy in MVP.

-- ---------------------------------------------------------------------------
-- cart_items
-- ---------------------------------------------------------------------------
alter table public.cart_items enable row level security;

drop policy if exists "cart_items_select_own" on public.cart_items;
create policy "cart_items_select_own"
  on public.cart_items for select
  using (auth.uid() = user_id);

drop policy if exists "cart_items_insert_own" on public.cart_items;
create policy "cart_items_insert_own"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "cart_items_update_own" on public.cart_items;
create policy "cart_items_update_own"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "cart_items_delete_own" on public.cart_items;
create policy "cart_items_delete_own"
  on public.cart_items for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- No client-side update/delete policy: status transitions (e.g. pending ->
-- paid) happen via the payment webhook using the service role key
-- (PRD Section 11), never via a client call.

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
alter table public.order_items enable row level security;

drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- No client-side update/delete policy: order line items are immutable once
-- created (they are a snapshot of the order at purchase time).
