-- AUREXIVA currency switch: USD -> INR.
-- The seed prices in 0003_seed.sql were USD-scale ($89.99 etc). Since the
-- app now formats and charges in INR (src/utils/format.ts,
-- payment.config.ts), those numbers need to become realistic INR prices,
-- not just relabeled. Run after 0004_payment.sql. Safe to re-run.

update public.products set price = 7499.00 where slug = 'classic-runner-sneakers';
update public.products set price = 1999.00 where slug = 'essential-hoodie';
update public.products set price = 16999.00 where slug = 'smart-watch-series-8';
update public.products set price = 2499.00 where slug = 'urban-backpack';
update public.products set price = 34999.00 where slug = 'digital-camera-pro';
