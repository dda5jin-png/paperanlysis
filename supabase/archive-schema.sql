-- Research Writing Guide Archive schema
-- Run in Supabase SQL editor after reviewing naming conventions.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  seo_title text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  title text not null,
  organization text not null,
  url text not null,
  source_type text not null check (source_type in ('institution', 'style-guide', 'library-guide', 'academic-database', 'government', 'paper')),
  language text not null check (language in ('en', 'ko')),
  authority_note text not null,
  raw_metadata jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  slug text not null unique,
  title jsonb not null,
  lead jsonb not null,
  summary jsonb not null,
  tags text[] not null default '{}',
  reading_minutes integer not null default 8,
  author text not null default 'Paper Analysis Editorial Team',
  trust_score integer not null default 0 check (trust_score between 0 and 100),
  popularity integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  translation_notice text not null default '',
  seo_metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guide_sources (
  guide_id uuid not null references public.guides(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete restrict,
  usage_note text,
  primary key (guide_id, source_id)
);

create table if not exists public.guide_sections (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.guides(id) on delete cascade,
  section_key text not null,
  heading jsonb not null,
  body jsonb not null,
  checklist jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid references public.guides(id) on delete set null,
  agent_name text not null,
  event_type text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_guides_status_updated on public.guides(status, updated_at desc);
create index if not exists idx_guides_tags on public.guides using gin(tags);
create index if not exists idx_guide_sections_guide_order on public.guide_sections(guide_id, sort_order);
create index if not exists idx_sources_type_checked on public.sources(source_type, checked_at desc);
create index if not exists idx_logs_guide_created on public.logs(guide_id, created_at desc);

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
