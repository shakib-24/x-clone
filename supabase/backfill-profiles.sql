-- Run this in the Supabase SQL Editor ONCE.
-- Creates profile rows for any auth.users who don't have one yet
-- (e.g. Google OAuth users who signed up before the trigger was added).

insert into public.profiles (id, username, display_name, avatar_url, provider)
select
  u.id,
  left(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'), 15)
    || '_' || floor(random() * 9000 + 1000)::text  as username,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'display_name',
    split_part(u.email, '@', 1)
  )                                                  as display_name,
  u.raw_user_meta_data->>'avatar_url'                as avatar_url,
  coalesce(u.raw_app_meta_data->>'provider', 'email') as provider
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);
