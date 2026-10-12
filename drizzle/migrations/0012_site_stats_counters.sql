create table if not exists public.site_stats (
  id int primary key default 1,
  visitors bigint not null default 10000,
  constraint single_row check (id = 1)
);
insert into public.site_stats (id, visitors) values (1, 10000) on conflict (id) do nothing;
grant select on public.site_stats to anon, authenticated;
grant all on public.site_stats to service_role;
alter table public.site_stats enable row level security;
create policy "anyone reads site_stats" on public.site_stats for select to anon, authenticated using (true);

create or replace function public.bump_visitors()
returns bigint language plpgsql security definer set search_path = public as $$
declare v bigint;
begin
  update public.site_stats set visitors = visitors + 1 where id = 1 returning visitors into v;
  return v;
end $$;
grant execute on function public.bump_visitors() to anon, authenticated;

create or replace function public.count_registered()
returns bigint language sql stable security definer set search_path = public as $$
  select (select count(*) from public.profiles) + (select count(*) from public.customers)
$$;
grant execute on function public.count_registered() to anon, authenticated;