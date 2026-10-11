-- One public email, one password per role: signing in with lmodirv@gmail.com resolves the real login (and therefore the role) from the password typed.

create table if not exists public.role_logins (
  id uuid primary key default gen_random_uuid(),
  display_email text not null,
  login_email text not null unique,
  role app_role not null,
  created_at timestamptz not null default now()
);

GRANT SELECT ON public.role_logins TO authenticated;
GRANT ALL ON public.role_logins TO service_role;

alter table public.role_logins enable row level security;

drop policy if exists "role logins read own or staff" on public.role_logins;
create policy "role logins read own or staff" on public.role_logins
  for select to authenticated
  using (
    lower(login_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.has_any_role(auth.uid(), array['owner', 'developer']::app_role[])
  );

insert into public.role_logins (display_email, login_email, role) values
  ('lmodirv@gmail.com', 'lmodirv@gmail.com', 'owner'),
  ('lmodirv@gmail.com', 'lmodirv+admin@gmail.com', 'developer'),
  ('lmodirv@gmail.com', 'lmodirv+comptable@gmail.com', 'accountant')
on conflict (login_email) do nothing;

-- Password -> role lookup. Runs as the table owner so it can read auth.users without exposing it.
create or replace function public.resolve_role_login(p_email text, p_password text)
returns table (login text, login_role app_role)
language sql stable security definer
set search_path = public, extensions
as $$
  select l.login_email, l.role
  from public.role_logins l
  join auth.users u on lower(u.email) = lower(l.login_email)
  where lower(l.display_email) = lower(trim(coalesce(p_email, '')))
    and p_password is not null
    and char_length(p_password) >= 6
    and u.encrypted_password is not null
    and extensions.crypt(p_password, u.encrypted_password) = u.encrypted_password
  limit 1;
$$;

revoke execute on function public.resolve_role_login(text, text) from public;
grant execute on function public.resolve_role_login(text, text) to anon, authenticated;

-- The email the workspace should show, so every role login looks like the same address.
create or replace function public.my_display_email()
returns text
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    (select l.display_email from public.role_logins l
      where lower(l.login_email) = lower(coalesce(auth.jwt() ->> 'email', ''))),
    coalesce(auth.jwt() ->> 'email', '')
  )
$$;

revoke execute on function public.my_display_email() from public;
grant execute on function public.my_display_email() to authenticated;