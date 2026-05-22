-- Public bucket for worksheet images (stable URLs for preview + PDF export).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'worksheet-images',
  'worksheet-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "worksheet_images_select_public"
on storage.objects for select
to public
using (bucket_id = 'worksheet-images');

create policy "worksheet_images_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'worksheet-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "worksheet_images_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'worksheet-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "worksheet_images_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'worksheet-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
