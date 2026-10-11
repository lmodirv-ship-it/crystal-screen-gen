
drop policy "notifications read" on public.notifications;
create policy "notifications read" on public.notifications for select to authenticated
  using ((customer_id is null and public.is_staff(auth.uid())) or customer_id = public.my_customer_id());
