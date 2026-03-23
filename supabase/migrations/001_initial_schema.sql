create extension if not exists "uuid-ossp";

-- POSTS: one per email (or manual)
create table public.posts (
  id                  uuid primary key default uuid_generate_v4(),
  title               text not null,
  slug                text not null unique,
  body                text,
  status              text not null default 'published',
  lat                 double precision,
  lng                 double precision,
  location_name       text,
  email_message_id    text unique,
  email_from          text,
  post_date           timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

create index on public.posts (post_date desc) where status = 'published';
create index on public.posts (lat, lng) where lat is not null;
create index on public.posts (slug);

-- MEDIA: multiple per post
create table public.media (
  id              uuid primary key default uuid_generate_v4(),
  post_id         uuid not null references public.posts(id) on delete cascade,
  r2_key          text not null unique,
  r2_url          text not null,
  media_type      text not null,
  mime_type       text not null,
  file_name       text,
  file_size_bytes bigint,
  exif_lat        double precision,
  exif_lng        double precision,
  exif_taken_at   timestamptz,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

create index on public.media (post_id);
create index on public.media (media_type);

-- RLS
alter table public.posts enable row level security;
alter table public.media enable row level security;

create policy "public_read_posts" on public.posts for select using (status = 'published');
create policy "public_read_media" on public.media for select using (true);
