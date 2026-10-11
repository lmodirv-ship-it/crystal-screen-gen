CREATE TABLE public.document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_types TO authenticated;
GRANT ALL ON public.document_types TO service_role;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read doc types" ON public.document_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff add doc types" ON public.document_types FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "admins edit doc types" ON public.document_types FOR UPDATE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['owner','developer','manager']::app_role[]));
CREATE POLICY "admins delete doc types" ON public.document_types FOR DELETE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['owner','developer','manager']::app_role[]));