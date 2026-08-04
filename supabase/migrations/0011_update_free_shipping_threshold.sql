-- The free-shipping threshold changed from ₹999 to ₹800 (client's actual
-- policy). This must be updated here too, not just in Checkout.tsx/Cart.tsx —
-- recompute_order_totals() (0010_security_hardening.sql) is what actually
-- determines orders.total server-side, and it had the old ₹999 threshold
-- hardcoded. If only the frontend changed, the DB would keep charging
-- shipping on orders between ₹800 and ₹999 despite the UI showing "Free".
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

  new_shipping := case when new_subtotal > 800 then 0 else 99 end;

  update public.orders
  set subtotal = new_subtotal,
      total = new_subtotal + new_shipping
  where id = target_order_id
    and status = 'pending';

  return null;
end;
$$;
