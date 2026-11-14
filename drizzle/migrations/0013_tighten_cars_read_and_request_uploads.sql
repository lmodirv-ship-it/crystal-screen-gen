DROP POLICY IF EXISTS "cars public read" ON public.cars;
CREATE POLICY "cars public available read" ON public.cars FOR SELECT TO anon, authenticated USING (status = 'available');
CREATE POLICY "cars staff read" ON public.cars FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "cars customer own read" ON public.cars FOR SELECT TO authenticated USING (
  exists (select 1 from public.contracts k where k.car_id = cars.id and k.customer_id = public.my_customer_id())
  or exists (select 1 from public.bookings b where b.car_id = cars.id and b.customer_id = public.my_customer_id())
);
DROP POLICY IF EXISTS "request uploads anon" ON storage.objects;