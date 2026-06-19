-- Phase 6: Comments + Post Images
-- Run this entire file in the Supabase SQL Editor.

-- ─── posts: add new columns ──────────────────────────────────────────────────

alter table public.posts
  add column if not exists comments_count int not null default 0,
  add column if not exists image_url text;

-- ─── comments ────────────────────────────────────────────────────────────────

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  post_id    uuid not null references public.posts(id)    on delete cascade,
  content    text not null check (char_length(content) between 1 and 280),
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "comments_select_all" on public.comments
  for select using (true);

create policy "comments_insert_own" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "comments_delete_own" on public.comments
  for delete using (auth.uid() = user_id);

create index if not exists comments_post_id_idx on public.comments(post_id, created_at desc);
create index if not exists comments_user_id_idx on public.comments(user_id);

-- ─── trigger: update comments_count on posts ─────────────────────────────────

create or replace function handle_comment_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_comment_count on public.comments;
create trigger trg_comment_count
  after insert or delete on public.comments
  for each row execute function handle_comment_count();

-- ─── storage: post-images bucket ─────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

create policy "post_images_public_read" on storage.objects
  for select using (bucket_id = 'post-images');

create policy "post_images_auth_upload" on storage.objects
  for insert with check (bucket_id = 'post-images' and auth.uid() is not null);

create policy "post_images_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
