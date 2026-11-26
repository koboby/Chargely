insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('business-logos','business-logos',true,102400,array['image/webp'])
on conflict (id) do update set public=true,file_size_limit=102400,allowed_mime_types=array['image/webp'];

create policy "business_logo_upload_own_folder" on storage.objects for insert to authenticated
with check (bucket_id='business-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "business_logo_update_own_folder" on storage.objects for update to authenticated
using (bucket_id='business-logos' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check (bucket_id='business-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "business_logo_select_own_folder" on storage.objects for select to authenticated
using (bucket_id='business-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);