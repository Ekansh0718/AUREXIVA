-- Real newsletter signup capture (footer form). Public can insert their own
-- email; nobody (including other visitors) can read the list back via the
-- client — only via the Supabase dashboard/service role.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "newsletter_subscribers_insert_public" on public.newsletter_subscribers;
create policy "newsletter_subscribers_insert_public"
  on public.newsletter_subscribers for insert
  with check (true);

-- No select/update/delete policy for the client on purpose: subscriber
-- emails are only readable via the Supabase dashboard or service role.
