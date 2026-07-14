-- Private bulk-add tool support. This is NOT the client-facing admin panel
-- (explicitly out of MVP scope) — it's a narrow, owner-only write path so
-- the site owner can add products without hand-writing SQL for every row.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ---------------------------------------------------------------------------
-- Allow admins to write to the catalog tables. Everyone else keeps the
-- public-read-only behavior from 0002_rls.sql.
-- ---------------------------------------------------------------------------
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write"
  on public.products for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write"
  on public.categories for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ---------------------------------------------------------------------------
-- After running this migration, make YOUR OWN account an admin by running:
--
--   update public.profiles set is_admin = true where id =
--     (select id from auth.users where email = 'your-email@example.com');
--
-- Do this for your own account only — never share admin status with a
-- customer-facing account.
-- ---------------------------------------------------------------------------
