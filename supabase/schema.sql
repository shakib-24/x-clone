-- ============================================================
-- X Clone — Full Database Schema
-- Run this entire file in the Supabase SQL Editor.
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS + OR REPLACE.
-- ============================================================


-- ─── profiles ────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text not null unique,
  display_name text not null,
  bio          text,
  avatar_url   text,
  provider     text not null default 'email',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create index if not exists profiles_username_idx on public.profiles(username);


-- ─── posts ───────────────────────────────────────────────────────────────────

create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  content     text not null check (char_length(content) between 1 and 280),
  likes_count int  not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "posts_select_all" on public.posts
  for select using (true);

create policy "posts_insert_own" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "posts_delete_own" on public.posts
  for delete using (auth.uid() = user_id);

create policy "posts_update_likes" on public.posts
  for update using (true);

create index if not exists posts_user_id_idx    on public.posts(user_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);


-- ─── likes ───────────────────────────────────────────────────────────────────

create table if not exists public.likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  post_id    uuid not null references public.posts(id)    on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

alter table public.likes enable row level security;

create policy "likes_select_all" on public.likes
  for select using (true);

create policy "likes_insert_own" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "likes_delete_own" on public.likes
  for delete using (auth.uid() = user_id);

create index if not exists likes_post_id_idx on public.likes(post_id);
create index if not exists likes_user_id_idx on public.likes(user_id);


-- ─── follows ─────────────────────────────────────────────────────────────────

create table if not exists public.follows (
  id           uuid primary key default gen_random_uuid(),
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

alter table public.follows enable row level security;

create policy "follows_select_all" on public.follows
  for select using (true);

create policy "follows_insert_own" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "follows_delete_own" on public.follows
  for delete using (auth.uid() = follower_id);

create index if not exists follows_follower_idx  on public.follows(follower_id);
create index if not exists follows_following_idx on public.follows(following_id);


-- ─── notifications ───────────────────────────────────────────────────────────

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  actor_id   uuid not null references public.profiles(id) on delete cascade,
  type       text not null check (type in ('like', 'follow')),
  post_id    uuid references public.posts(id) on delete cascade,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);

create policy "notifications_insert_any" on public.notifications
  for insert with check (true);

create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id);

create index if not exists notifications_user_unread_idx
  on public.notifications(user_id, read, created_at desc);


-- ─── updated_at trigger ──────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function set_updated_at();


-- ─── like notification trigger ────────────────────────────────────────────────

create or replace function handle_like_notification()
returns trigger language plpgsql security definer as $$
declare
  v_author uuid;
begin
  select user_id into v_author from public.posts where id = new.post_id;
  if v_author is not null and v_author <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, post_id)
    values (v_author, new.user_id, 'like', new.post_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_like_notification on public.likes;
create trigger trg_like_notification
  after insert on public.likes
  for each row execute function handle_like_notification();


-- ─── follow notification trigger ──────────────────────────────────────────────

create or replace function handle_follow_notification()
returns trigger language plpgsql security definer as $$
begin
  insert into public.notifications (user_id, actor_id, type)
  values (new.following_id, new.follower_id, 'follow');
  return new;
end;
$$;

drop trigger if exists trg_follow_notification on public.follows;
create trigger trg_follow_notification
  after insert on public.follows
  for each row execute function handle_follow_notification();


-- ─── auto-create profile on signup ───────────────────────────────────────────

create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _username      text;
  _display_name  text;
  _avatar_url    text;
  _provider      text;
  _meta_username text;
begin
  _display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );
  _avatar_url := new.raw_user_meta_data->>'avatar_url';
  _provider   := coalesce(new.raw_app_meta_data->>'provider', 'email');
  -- Use username from signup metadata if provided and valid, else generate one
  _meta_username := new.raw_user_meta_data->>'username';
  if _meta_username is not null and _meta_username ~ '^[a-zA-Z0-9_]{3,20}$' then
    _username := _meta_username;
  else
    _username :=
      left(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'), 15)
      || '_' || floor(random() * 9000 + 1000)::text;
  end if;

  insert into public.profiles (id, username, display_name, avatar_url, provider)
  values (new.id, _username, _display_name, _avatar_url, _provider)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();


-- ─── backfill existing auth users who have no profile ────────────────────────

insert into public.profiles (id, username, display_name, avatar_url, provider)
select
  u.id,
  left(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'), 15)
    || '_' || floor(random() * 9000 + 1000)::text,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'display_name',
    split_part(u.email, '@', 1)
  ),
  u.raw_user_meta_data->>'avatar_url',
  coalesce(u.raw_app_meta_data->>'provider', 'email')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
