CREATE OR REPLACE FUNCTION public.latest_request_ref(p_phone text) RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select ref from public.booking_requests
  where regexp_replace(phone, '\D', '', 'g') = regexp_replace(coalesce(p_phone,''), '\D', '', 'g')
    and created_at > now() - interval '15 minutes'
  order by created_at desc limit 1 $$;
GRANT EXECUTE ON FUNCTION public.latest_request_ref(text) TO anon, authenticated;