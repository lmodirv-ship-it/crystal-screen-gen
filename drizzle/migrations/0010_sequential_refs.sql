ALTER TABLE public.documents ADD COLUMN ref serial;
ALTER TABLE public.expenses ADD COLUMN ref serial;
ALTER TABLE public.maintenance ADD COLUMN ref serial;
COMMENT ON COLUMN public.documents.ref IS 'Sequential document number, auto-assigned';
COMMENT ON COLUMN public.expenses.ref IS 'Sequential expense number, auto-assigned';
COMMENT ON COLUMN public.maintenance.ref IS 'Sequential maintenance number, auto-assigned';