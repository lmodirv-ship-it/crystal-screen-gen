ALTER TABLE public.booking_requests ADD COLUMN IF NOT EXISTS contract_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL;
ALTER TABLE public.booking_requests ADD COLUMN IF NOT EXISTS history jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public._req_log(p_id uuid, p_step text) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  update public.booking_requests set history = history || jsonb_build_array(jsonb_build_object('step', p_step, 'at', now(), 'by', coalesce(public.my_display_email(), 'client'), 'role', (select string_agg(role::text, ',') from public.user_roles where user_id = auth.uid())))
  where id = p_id $$;
REVOKE ALL ON FUNCTION public._req_log(uuid, text) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_booking(p_ref int, p_phone text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select jsonb_build_object('ref', r.ref, 'status', r.status, 'full_name', r.full_name, 'start_date', r.start_date, 'end_date', r.end_date,
    'estimate', r.estimate, 'has_license', r.license_path is not null, 'has_id', r.id_card_path is not null, 'car', c.model, 'agency', a.name,
    'contract', case when r.status = 'sent' then (select jsonb_build_object('ref', k.ref, 'start_date', k.start_date, 'end_date', k.end_date, 'daily_rate', k.daily_rate, 'total', k.total, 'deposit', k.deposit, 'plate', c.plate, 'agency_phone', a.phone, 'agency_address', a.address, 'agency_city', a.city) from public.contracts k where k.id = r.contract_id) end)
  from public.booking_requests r left join public.cars c on c.id = r.car_id left join public.agencies a on a.id = r.agency_id
  where r.ref = p_ref and regexp_replace(r.phone, '\D', '', 'g') = regexp_replace(coalesce(p_phone,''), '\D', '', 'g') and length(regexp_replace(coalesce(p_phone,''), '\D', '', 'g')) >= 6
  limit 1 $$;
GRANT EXECUTE ON FUNCTION public.track_booking(int, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_booking_docs(p_ref int, p_phone text, p_license text, p_id_card text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare rid uuid;
begin
  if p_license is null or p_id_card is null or p_license not like 'requests/%' or p_id_card not like 'requests/%' then raise exception 'invalid files'; end if;
  select id into rid from public.booking_requests where ref = p_ref and status in ('pending','accepted','docs_sent')
    and regexp_replace(phone, '\D', '', 'g') = regexp_replace(coalesce(p_phone,''), '\D', '', 'g');
  if rid is null then return false; end if;
  update public.booking_requests set license_path = p_license, id_card_path = p_id_card, status = 'docs_sent' where id = rid;
  perform public._req_log(rid, 'docs_sent');
  return true;
end $$;
GRANT EXECUTE ON FUNCTION public.submit_booking_docs(int, text, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_request_status(p_id uuid, p_status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
begin
  if not public.has_any_role(auth.uid(), array['developer','owner','manager','operator']::app_role[]) then raise exception 'forbidden'; end if;
  if p_status not in ('accepted','cancelled') then raise exception 'bad status'; end if;
  update public.booking_requests set status = p_status where id = p_id;
  perform public._req_log(p_id, p_status);
end $$;
GRANT EXECUTE ON FUNCTION public.set_request_status(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.prepare_contract(p_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare r public.booking_requests; cid uuid; kid uuid; rate numeric; n int;
begin
  if not public.has_any_role(auth.uid(), array['developer','owner','manager','operator']::app_role[]) then raise exception 'forbidden'; end if;
  select * into r from public.booking_requests where id = p_id;
  if r.id is null or r.car_id is null then raise exception 'request without car'; end if;
  if r.contract_id is not null then return r.contract_id; end if;
  select id into cid from public.customers where regexp_replace(coalesce(phone,''), '\D', '', 'g') = regexp_replace(r.phone, '\D', '', 'g') limit 1;
  if cid is null then
    insert into public.customers(full_name, phone, email, agency_id) values (r.full_name, r.phone, r.email, r.agency_id) returning id into cid;
  end if;
  select price_per_day into rate from public.cars where id = r.car_id;
  n := greatest(1, r.end_date - r.start_date);
  insert into public.contracts(customer_id, car_id, start_date, end_date, daily_rate, total, deposit, status, agency_id, notes)
  values (cid, r.car_id, r.start_date, r.end_date, rate, rate * n, 0, 'draft', r.agency_id, 'REQ #' || r.ref) returning id into kid;
  update public.booking_requests set contract_id = kid, status = 'contract_ready' where id = p_id;
  if r.license_path is not null then insert into public.documents(customer_id, contract_id, title, doc_type, file_path, uploaded_by) values (cid, kid, 'Permis', 'license', r.license_path, auth.uid()); end if;
  if r.id_card_path is not null then insert into public.documents(customer_id, contract_id, title, doc_type, file_path, uploaded_by) values (cid, kid, 'CIN', 'id_card', r.id_card_path, auth.uid()); end if;
  perform public._req_log(p_id, 'contract_ready');
  return kid;
end $$;
GRANT EXECUTE ON FUNCTION public.prepare_contract(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.approve_contract(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare r public.booking_requests;
begin
  if not public.has_any_role(auth.uid(), array['developer','owner','manager','operator']::app_role[]) then raise exception 'forbidden'; end if;
  select * into r from public.booking_requests where id = p_id;
  if r.contract_id is null then raise exception 'no contract'; end if;
  update public.contracts set status = 'active' where id = r.contract_id;
  update public.booking_requests set status = 'sent' where id = p_id;
  insert into public.notifications(customer_id, title, body, kind, priority)
    select customer_id, 'contract', 'REQ #' || r.ref, 'contract', 'high' from public.contracts where id = r.contract_id;
  perform public._req_log(p_id, 'sent');
end $$;
GRANT EXECUTE ON FUNCTION public.approve_contract(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public._req_created() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
begin new.history := jsonb_build_array(jsonb_build_object('step','pending','at',now(),'by','client')); return new; end $$;
DROP TRIGGER IF EXISTS booking_requests_created ON public.booking_requests;
CREATE TRIGGER booking_requests_created BEFORE INSERT ON public.booking_requests FOR EACH ROW EXECUTE FUNCTION public._req_created();
DROP TRIGGER IF EXISTS audit_booking_requests ON public.booking_requests;
CREATE TRIGGER audit_booking_requests AFTER INSERT OR UPDATE OR DELETE ON public.booking_requests FOR EACH ROW EXECUTE FUNCTION public.log_audit();