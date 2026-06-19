-- Run this in the Supabase SQL Editor.
-- Creates a profile row automatically whenever a new auth user is created,
-- so the /home redirect loop can never happen again.

create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _username     text;
  _display_name text;
  _avatar_url   text;
  _provider     text;
  _meta_username text;
begin
  _display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );

  _avatar_url := new.raw_user_meta_data->>'avatar_url';

  _provider := coalesce(
    new.raw_app_meta_data->>'provider',
    'email'
  );

  -- Use username from signup metadata if provided, else generate one
  _meta_username := new.raw_user_meta_data->>'username';
  if _meta_username is not null and _meta_username ~ '^[a-zA-Z0-9_]{3,20}$' then
    _username := _meta_username;
  else
    _username :=
      left(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'), 15)
      || '_'
      || floor(random() * 9000 + 1000)::text;
  end if;

  insert into public.profiles (id, username, display_name, avatar_url, provider)
  values (new.id, _username, _display_name, _avatar_url, _provider)
  on conflict (id) do nothing;   -- safe to re-run; email signups may already have a row

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();
