-- ─── follows ──────────────────────────────────────────────────────────────────

create table if not exists public.follows (
  id           uuid primary key default gen_random_uuid(),
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

alter table public.follows enable row level security;

create policy "follows_select" on public.follows
  for select using (true);

create policy "follows_insert" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "follows_delete" on public.follows
  for delete using (auth.uid() = follower_id);

create index if not exists follows_follower_idx  on public.follows(follower_id);
create index if not exists follows_following_idx on public.follows(following_id);

-- ─── notifications ────────────────────────────────────────────────────────────

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

create policy "notifications_select" on public.notifications
  for select using (auth.uid() = user_id);

create policy "notifications_insert" on public.notifications
  for insert with check (true);

create policy "notifications_update" on public.notifications
  for update using (auth.uid() = user_id);

create index if not exists notifications_user_unread_idx
  on public.notifications(user_id, read, created_at desc);

-- ─── trigger: like → notification ────────────────────────────────────────────

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

-- ─── trigger: follow → notification ──────────────────────────────────────────

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
