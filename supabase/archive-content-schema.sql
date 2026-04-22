-- Admin archive content MVP
-- Stores AI-generated guide drafts and copy-ready Naver Blog summaries.

create table if not exists public.archive_contents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  tags text[] not null default '{}',
  guide_data jsonb not null,
  naver_summary jsonb not null,
  source_candidates jsonb not null default '[]'::jsonb,
  content_status text not null default 'draft'
    check (content_status in ('draft', 'reviewed', 'published', 'archived')),
  naver_status text not null default 'not_ready'
    check (naver_status in ('not_ready', 'ready', 'copied', 'distributed')),
  created_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_archive_contents_status_updated
  on public.archive_contents(content_status, naver_status, updated_at desc);

create index if not exists idx_archive_contents_tags
  on public.archive_contents using gin(tags);

alter table public.archive_contents enable row level security;

grant select on public.archive_contents to anon;
grant select, insert, update, delete on public.archive_contents to authenticated;
grant all on public.archive_contents to service_role;

drop policy if exists "Published archive content is publicly readable"
  on public.archive_contents;
create policy "Published archive content is publicly readable"
  on public.archive_contents
  for select
  using (content_status = 'published');

drop policy if exists "Admins can read archive contents"
  on public.archive_contents;
create policy "Admins can read archive contents"
  on public.archive_contents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins can manage archive contents"
  on public.archive_contents;
create policy "Admins can manage archive contents"
  on public.archive_contents
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

notify pgrst, 'reload schema';
