create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text, phone text, email text, address text,
  currency text not null default 'MAD',
  status text not null default 'active',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.agencies to authenticated;
grant all on public.agencies to service_role;
alter table public.agencies enable row level security;
create policy "agencies staff read" on public.agencies for select to authenticated using (public.is_staff(auth.uid()));
create policy "agencies owner write" on public.agencies for all to authenticated
  using (public.has_any_role(auth.uid(), array['owner','developer']::app_role[]))
  with check (public.has_any_role(auth.uid(), array['owner','developer']::app_role[]));

create table public.agency_members (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  full_name text not null,
  email text, phone text,
  role app_role not null default 'operator',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.agency_members to authenticated;
grant all on public.agency_members to service_role;
alter table public.agency_members enable row level security;
create policy "members staff read" on public.agency_members for select to authenticated using (public.is_staff(auth.uid()));
create policy "members owner write" on public.agency_members for all to authenticated
  using (public.has_any_role(auth.uid(), array['owner','developer']::app_role[]))
  with check (public.has_any_role(auth.uid(), array['owner','developer']::app_role[]));

alter table public.cars add column agency_id uuid references public.agencies(id) on delete set null;
alter table public.customers add column agency_id uuid references public.agencies(id) on delete set null;
alter table public.contracts add column agency_id uuid references public.agencies(id) on delete set null;
alter table public.payments add column agency_id uuid references public.agencies(id) on delete set null;
alter table public.expenses add column agency_id uuid references public.agencies(id) on delete set null;

insert into public.agencies(name, city) values ('HN RentCar Tanger', 'Tanger');
update public.cars set agency_id = (select id from public.agencies limit 1);
update public.customers set agency_id = (select id from public.agencies limit 1);
update public.contracts set agency_id = (select id from public.agencies limit 1);
update public.payments set agency_id = (select id from public.agencies limit 1);
update public.expenses set agency_id = (select id from public.agencies limit 1);