-- Add a second variant dimension (color) alongside the existing size
-- variant, so one product listing can offer multiple colors from a single
-- photo instead of needing a duplicate product row per color.

alter table public.products
  add column if not exists colors text[] not null default '{}';

alter table public.cart_items
  add column if not exists color text;

alter table public.order_items
  add column if not exists color text;

-- cart_items previously enforced uniqueness on (user_id, product_id,
-- variant); a customer must now be able to have the same product+size in
-- two different colors as separate lines, so color joins the uniqueness key.
alter table public.cart_items drop constraint if exists cart_items_user_id_product_id_variant_key;
alter table public.cart_items
  add constraint cart_items_user_id_product_id_variant_color_key
  unique (user_id, product_id, variant, color);
