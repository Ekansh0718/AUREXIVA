-- AUREXIVA seed data: 3 MVP categories + sample products per category.
-- Mirrors src/constants/dummyData.ts so the app looks identical once
-- Products/ProductDetail switch from DUMMY_PRODUCTS to live Supabase data.
-- Safe to re-run: uses ON CONFLICT to upsert by slug.

insert into public.categories (name, slug, image_url) values
  ('Footwear', 'footwear', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop'),
  ('Clothing', 'clothing', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop'),
  ('Electronics', 'electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop')
on conflict (slug) do update set
  name = excluded.name,
  image_url = excluded.image_url;

insert into public.products
  (category_id, name, slug, description, price, images, variants, is_best_seller, is_active)
values
  (
    (select id from public.categories where slug = 'footwear'),
    'Classic Runner Sneakers',
    'classic-runner-sneakers',
    'Step into comfort and style with our classic runner sneakers. Lightweight design meets premium durable materials, featuring a breathable upper mesh and cushioned midsole designed by Aurexiva.',
    7499.00,
    array['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop'],
    '["US 8", "US 9", "US 10", "US 11"]'::jsonb,
    true,
    true
  ),
  (
    (select id from public.categories where slug = 'clothing'),
    'Essential Hoodie',
    'essential-hoodie',
    'An everyday essential. Crafted from double-brushed organic cotton and recycled polyester for exceptional warmth, durability, and standard relaxed comfort by Aurexiva.',
    1999.00,
    array['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop'],
    '["2-3Y", "4-5Y", "6-7Y", "8-9Y"]'::jsonb,
    true,
    true
  ),
  (
    (select id from public.categories where slug = 'electronics'),
    'Smart Watch Series 8',
    'smart-watch-series-8',
    'Advanced health sensors, crystal-clear Retina display, and refined watch design. Stay connected, monitor your workouts, and track sleep with Aurexiva Series 8.',
    16999.00,
    array['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'],
    '[]'::jsonb,
    true,
    true
  ),
  (
    (select id from public.categories where slug = 'clothing'),
    'Urban Backpack',
    'urban-backpack',
    'Water-resistant premium fabric, dedicated padded laptop sleeve, and ergonomic shoulder straps. Built for daily commutes and weekend travels, refined by Aurexiva.',
    2499.00,
    array['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop'],
    '[]'::jsonb,
    true,
    true
  ),
  (
    (select id from public.categories where slug = 'electronics'),
    'Digital Camera Pro',
    'digital-camera-pro',
    'Uncompromising image quality. Features a 24.2 MP full-frame sensor, ultra-fast autofocus tracking, and 4K video recording capabilities in a compact body, engineered by Aurexiva.',
    34999.00,
    array['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop'],
    '[]'::jsonb,
    true,
    true
  )
on conflict (slug) do update set
  description = excluded.description,
  price = excluded.price,
  images = excluded.images,
  variants = excluded.variants,
  is_best_seller = excluded.is_best_seller,
  is_active = excluded.is_active;
