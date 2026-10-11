
create type public.app_role as enum ('developer','owner','manager','operator','accountant','customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, phone text, created_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null, unique (user_id, role)
);
grant select, update on public.profiles to authenticated; grant all on public.profiles to service_role;
grant select, insert, delete on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create or replace function public.has_any_role(_user_id uuid, _roles app_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id=_user_id and role = any(_roles)) $$;
create or replace function public.is_staff(_user_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_any_role(_user_id, array['developer','owner','manager','operator','accountant']::app_role[]) $$;

create policy "roles read own or admin" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_any_role(auth.uid(), array['owner','developer']::app_role[]));
create policy "roles admin insert" on public.user_roles for insert to authenticated
  with check (public.has_any_role(auth.uid(), array['owner','developer']::app_role[]));
create policy "roles admin delete" on public.user_roles for delete to authenticated
  using (public.has_any_role(auth.uid(), array['owner','developer']::app_role[]));
create policy "profiles read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid());

-- Domain tables
create table public.cars (
  id uuid primary key default gen_random_uuid(),
  model text not null, plate text not null unique, category text not null default 'economy',
  fuel text not null default 'diesel', transmission text not null default 'manual', year int not null default 2024,
  price_per_day numeric not null default 300, mileage int not null default 0,
  status text not null default 'available', insurance_expiry date, created_at timestamptz not null default now()
);
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique, full_name text not null, phone text, email text, city text,
  license_no text, license_expiry date, status text not null default 'active', created_at timestamptz not null default now()
);
create table public.bookings (
  id uuid primary key default gen_random_uuid(), ref serial,
  customer_id uuid not null references public.customers(id) on delete cascade,
  car_id uuid not null references public.cars(id) on delete cascade,
  start_date date not null, end_date date not null, total numeric not null default 0,
  status text not null default 'pending', notes text, created_at timestamptz not null default now()
);
create table public.contracts (
  id uuid primary key default gen_random_uuid(), ref serial,
  booking_id uuid references public.bookings(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  car_id uuid not null references public.cars(id) on delete cascade,
  start_date date not null, end_date date not null, daily_rate numeric not null, total numeric not null,
  deposit numeric not null default 0, mileage_out int, status text not null default 'active', notes text,
  created_at timestamptz not null default now()
);
create table public.payments (
  id uuid primary key default gen_random_uuid(), ref serial,
  contract_id uuid references public.contracts(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  amount numeric not null, method text not null default 'cash', paid_at date not null default current_date,
  note text, created_at timestamptz not null default now()
);
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'other', label text not null, amount numeric not null,
  car_id uuid references public.cars(id) on delete set null, spent_at date not null default current_date,
  created_at timestamptz not null default now()
);
create table public.maintenance (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  type text not null, cost numeric not null default 0, scheduled_at date not null default current_date,
  mileage int, status text not null default 'scheduled', created_at timestamptz not null default now()
);
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  car_id uuid references public.cars(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete cascade,
  title text not null, doc_type text not null default 'other', file_path text not null,
  status text not null default 'pending', uploaded_by uuid, created_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  title text not null, body text, kind text not null default 'info', priority text not null default 'medium',
  is_read boolean not null default false, created_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(), actor uuid, action text not null,
  entity text not null, entity_id text, created_at timestamptz not null default now()
);

grant select on public.cars to anon;
grant select, insert, update, delete on public.cars, public.customers, public.bookings, public.contracts, public.payments,
  public.expenses, public.maintenance, public.documents, public.notifications to authenticated;
grant select on public.audit_logs to authenticated;
grant usage on all sequences in schema public to authenticated;
grant all on public.cars, public.customers, public.bookings, public.contracts, public.payments, public.expenses,
  public.maintenance, public.documents, public.notifications, public.audit_logs to service_role;

alter table public.cars enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.contracts enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.maintenance enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.my_customer_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.customers where user_id = auth.uid() limit 1 $$;

-- cars: public read; fleet roles write
create policy "cars public read" on public.cars for select to anon, authenticated using (true);
create policy "cars write" on public.cars for all to authenticated
  using (public.has_any_role(auth.uid(), array['developer','owner','manager']::app_role[]))
  with check (public.has_any_role(auth.uid(), array['developer','owner','manager']::app_role[]));
create policy "car status by operator" on public.cars for update to authenticated
  using (public.has_role(auth.uid(),'operator')) with check (public.has_role(auth.uid(),'operator'));

-- customers
create policy "customers read" on public.customers for select to authenticated using (public.is_staff(auth.uid()) or user_id = auth.uid());
create policy "customers write" on public.customers for all to authenticated
  using (public.has_any_role(auth.uid(), array['developer','owner','manager','operator']::app_role[]))
  with check (public.has_any_role(auth.uid(), array['developer','owner','manager','operator']::app_role[]));
create policy "customers update self" on public.customers for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- bookings
create policy "bookings read" on public.bookings for select to authenticated using (public.is_staff(auth.uid()) or customer_id = public.my_customer_id());
create policy "bookings staff write" on public.bookings for all to authenticated
  using (public.has_any_role(auth.uid(), array['developer','owner','manager','operator']::app_role[]))
  with check (public.has_any_role(auth.uid(), array['developer','owner','manager','operator']::app_role[]));
create policy "bookings customer request" on public.bookings for insert to authenticated
  with check (customer_id = public.my_customer_id() and status = 'pending');

-- contracts
create policy "contracts read" on public.contracts for select to authenticated using (public.is_staff(auth.uid()) or customer_id = public.my_customer_id());
create policy "contracts write" on public.contracts for all to authenticated
  using (public.has_any_role(auth.uid(), array['developer','owner','manager','operator']::app_role[]))
  with check (public.has_any_role(auth.uid(), array['developer','owner','manager','operator']::app_role[]));

-- payments
create policy "payments read" on public.payments for select to authenticated
  using (public.has_any_role(auth.uid(), array['developer','owner','manager','accountant']::app_role[]) or customer_id = public.my_customer_id());
create policy "payments write" on public.payments for all to authenticated
  using (public.has_any_role(auth.uid(), array['developer','owner','accountant']::app_role[]))
  with check (public.has_any_role(auth.uid(), array['developer','owner','accountant']::app_role[]));

-- expenses
create policy "expenses read" on public.expenses for select to authenticated
  using (public.has_any_role(auth.uid(), array['developer','owner','manager','accountant']::app_role[]));
create policy "expenses write" on public.expenses for all to authenticated
  using (public.has_any_role(auth.uid(), array['developer','owner','accountant']::app_role[]))
  with check (public.has_any_role(auth.uid(), array['developer','owner','accountant']::app_role[]));

-- maintenance
create policy "maintenance read" on public.maintenance for select to authenticated using (public.is_staff(auth.uid()));
create policy "maintenance write" on public.maintenance for all to authenticated
  using (public.has_any_role(auth.uid(), array['developer','owner','manager']::app_role[]))
  with check (public.has_any_role(auth.uid(), array['developer','owner','manager']::app_role[]));

-- documents
create policy "documents read" on public.documents for select to authenticated using (public.is_staff(auth.uid()) or customer_id = public.my_customer_id());
create policy "documents staff write" on public.documents for all to authenticated
  using (public.has_any_role(auth.uid(), array['developer','owner','manager','operator']::app_role[]))
  with check (public.has_any_role(auth.uid(), array['developer','owner','manager','operator']::app_role[]));
create policy "documents customer upload" on public.documents for insert to authenticated
  with check (customer_id = public.my_customer_id() and status = 'pending');

-- notifications: staff see broadcasts (customer_id null); customers see their own
create policy "notifications read" on public.notifications for select to authenticated
  using ((customer_id is null and public.is_staff(auth.uid())) or customer_id = public.my_customer_id() or public.has_any_role(auth.uid(), array['owner','developer','manager']::app_role[]));
create policy "notifications mark read" on public.notifications for update to authenticated
  using ((customer_id is null and public.is_staff(auth.uid())) or customer_id = public.my_customer_id());
create policy "notifications staff create" on public.notifications for insert to authenticated with check (public.is_staff(auth.uid()));

create policy "audit read" on public.audit_logs for select to authenticated using (public.has_any_role(auth.uid(), array['owner','developer']::app_role[]));

-- audit trigger
create or replace function public.log_audit() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs(actor, action, entity, entity_id)
  values (auth.uid(), lower(tg_op), tg_table_name, coalesce((case when tg_op='DELETE' then old.id else new.id end)::text, ''));
  return coalesce(new, old);
end $$;
do $$ declare t text; begin
  foreach t in array array['cars','customers','bookings','contracts','payments','expenses','maintenance','documents'] loop
    execute format('create trigger audit_%1$s after insert or update or delete on public.%1$s for each row execute function public.log_audit()', t);
  end loop; end $$;

-- payment notification for customers
create or replace function public.notify_payment() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications(customer_id, title, body, kind, priority)
  values (new.customer_id, 'payment', new.amount::text, 'payment', 'low');
  return new;
end $$;
create trigger payments_notify after insert on public.payments for each row execute function public.notify_payment();

-- signup: profile + role (first user = developer, others = customer with linked customer record)
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  insert into public.profiles(id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  if not exists (select 1 from public.user_roles) then
    insert into public.user_roles(user_id, role) values (new.id, 'developer');
  else
    insert into public.user_roles(user_id, role) values (new.id, 'customer');
    select id into cid from public.customers where lower(email) = lower(new.email) and user_id is null limit 1;
    if cid is not null then update public.customers set user_id = new.id where id = cid;
    else insert into public.customers(user_id, full_name, email) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email);
    end if;
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Seed demo data
insert into public.cars(model, plate, category, fuel, transmission, year, price_per_day, mileage, status, insurance_expiry) values
 ('Dacia Logan','12345-A-6','economy','diesel','manual',2022,250,48200,'available', current_date + 5),
 ('Renault Clio 5','67890-B-6','compact','petrol','manual',2023,300,31000,'rented', current_date + 90),
 ('Peugeot 208','11223-A-6','compact','petrol','automatic',2024,350,12000,'rented', current_date + 120),
 ('Hyundai Tucson','44556-D-6','suv','diesel','automatic',2023,500,10000,'maintenance', current_date + 60),
 ('Toyota Corolla','99887-H-6','sedan','hybrid','automatic',2022,450,56000,'available', current_date + 200),
 ('Dacia Duster','66778-A-6','suv','diesel','manual',2023,400,27000,'rented', current_date + 150),
 ('Peugeot 3008','33445-B-6','suv','diesel','automatic',2024,600,8000,'available', current_date + 300),
 ('Mercedes C200','55667-W-6','premium','petrol','automatic',2024,1200,9000,'available', current_date + 250);

insert into public.customers(full_name, phone, email, city, license_no, license_expiry, status) values
 ('أحمد بوزيان','06 12 34 56 78','ahmed@example.com','طنجة','B-883421', current_date + 400,'active'),
 ('سعيد الكرمي','06 98 76 54 32','said@example.com','الدار البيضاء','B-120044', current_date + 700,'active'),
 ('فاطمة الزهراء','06 67 89 12 34','fatima@example.com','الرباط','B-554109', current_date + 30,'active'),
 ('يوسف الحسن','06 55 44 33 22','youssef@example.com','مراكش','B-778812', current_date + 500,'active'),
 ('خالد الإدريسي','06 11 22 33 44','khalid@example.com','فاس','B-990011', current_date - 10,'blocked'),
 ('Sophie Martin','+33 6 12 34 56 78','sophie@example.com','Paris','FR-11923', current_date + 900,'active');

with c as (select id, full_name from public.customers), k as (select id, model, price_per_day from public.cars)
insert into public.bookings(customer_id, car_id, start_date, end_date, total, status)
select (select id from c where full_name=x.cn), (select id from k where model=x.km), current_date + x.s, current_date + x.e,
  (x.e - x.s) * (select price_per_day from k where model=x.km), x.st
from (values ('أحمد بوزيان','Dacia Logan',1,4,'confirmed'),('سعيد الكرمي','Renault Clio 5',-2,3,'confirmed'),
  ('فاطمة الزهراء','Peugeot 208',-1,2,'confirmed'),('يوسف الحسن','Toyota Corolla',3,6,'pending'),
  ('Sophie Martin','Peugeot 3008',5,12,'pending'),('خالد الإدريسي','Hyundai Tucson',-20,-17,'cancelled')) as x(cn,km,s,e,st);

with c as (select id, full_name from public.customers), k as (select id, model, price_per_day from public.cars)
insert into public.contracts(customer_id, car_id, start_date, end_date, daily_rate, total, deposit, status)
select (select id from c where full_name=x.cn), (select id from k where model=x.km), current_date + x.s, current_date + x.e,
  (select price_per_day from k where model=x.km), (x.e - x.s) * (select price_per_day from k where model=x.km), x.dep, x.st
from (values ('سعيد الكرمي','Renault Clio 5',-2,3,3000,'active'),('فاطمة الزهراء','Peugeot 208',-1,2,3000,'active'),
  ('أحمد بوزيان','Dacia Duster',-6,1,3000,'active'),('يوسف الحسن','Toyota Corolla',-40,-35,4000,'closed'),
  ('خالد الإدريسي','Dacia Logan',-12,-9,2000,'overdue')) as x(cn,km,s,e,dep,st);

-- payments spread over 10 months for charts
insert into public.payments(contract_id, customer_id, amount, method, paid_at)
select ct.id, ct.customer_id, round(ct.total * 0.5), 'cash', ct.start_date from public.contracts ct;
insert into public.payments(customer_id, amount, method, paid_at)
select (select id from public.customers order by random() limit 1), (2500 + (g * 937) % 9000), (array['cash','card','transfer','cheque'])[1 + g % 4],
  (date_trunc('month', current_date) - (g % 10) * interval '1 month' + (g % 25) * interval '1 day')::date
from generate_series(1, 60) g;

insert into public.expenses(category, label, amount, spent_at)
select (array['maintenance','fuel','insurance','wash','admin','other'])[1 + g % 6], 'مصروف #' || g, (300 + (g * 613) % 3500),
  (date_trunc('month', current_date) - (g % 10) * interval '1 month' + (g % 25) * interval '1 day')::date
from generate_series(1, 50) g;

insert into public.maintenance(car_id, type, cost, scheduled_at, mileage, status)
select id, x.t, x.c, current_date + x.d, mileage, x.s from public.cars, (values ('Hyundai Tucson','تغيير الفرامل',1800,0,'in_progress'),
 ('Dacia Logan','تغيير الزيت',450,3,'scheduled'),('Peugeot 3008','الإطارات',3200,-20,'done')) as x(m,t,c,d,s) where model = x.m;

insert into public.notifications(title, body, kind, priority) values
 ('انتهاء تأمين السيارة','Dacia Logan - 12345-A-6','insurance','high'),
 ('عقد متأخر','Dacia Logan - خالد الإدريسي','overdue','high'),
 ('رجوع سيارة اليوم','Peugeot 208 - فاطمة الزهراء','return','medium'),
 ('صيانة دورية','Dacia Logan - تغيير الزيت','maintenance','medium'),
 ('انتهاء رخصة زبون','فاطمة الزهراء','license','low');
