ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS inspection_expiry date;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS next_service_km integer;

CREATE TABLE public.booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref serial,
  agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  car_id uuid REFERENCES public.cars(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  estimate numeric NOT NULL DEFAULT 0,
  license_path text,
  id_card_path text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.booking_requests TO anon;
GRANT USAGE ON SEQUENCE public.booking_requests_ref_seq TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_requests TO authenticated;
GRANT ALL ON public.booking_requests TO service_role;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requests public submit" ON public.booking_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND char_length(full_name) BETWEEN 2 AND 120 AND char_length(phone) BETWEEN 6 AND 30 AND end_date >= start_date);
CREATE POLICY "requests staff read" ON public.booking_requests FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "requests staff write" ON public.booking_requests FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['developer','owner','manager','operator']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['developer','owner','manager','operator']::app_role[]));
CREATE POLICY "requests staff delete" ON public.booking_requests FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['developer','owner','manager']::app_role[]));

GRANT SELECT ON public.agencies TO anon;
CREATE POLICY "agencies public read" ON public.agencies FOR SELECT TO anon USING (status = 'active');

CREATE POLICY "request uploads anon" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'requests');
CREATE POLICY "request uploads staff read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'requests' AND public.is_staff(auth.uid()));