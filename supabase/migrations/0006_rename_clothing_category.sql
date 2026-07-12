-- Rename "Kids Clothing" -> "Clothing" so adult apparel (trackpants,
-- shorts, etc.) has a real home. The category's `id` doesn't change, so
-- existing products already assigned to it keep their category
-- automatically — only the display name and URL slug change.

update public.categories
set name = 'Clothing', slug = 'clothing'
where slug = 'kids-clothing';
