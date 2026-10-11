
create policy "docs staff all" on storage.objects for all to authenticated
  using (bucket_id = 'documents' and public.has_any_role(auth.uid(), array['developer','owner','manager','operator']::app_role[]))
  with check (bucket_id = 'documents' and public.has_any_role(auth.uid(), array['developer','owner','manager','operator']::app_role[]));
create policy "docs customer own read" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "docs customer own upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
