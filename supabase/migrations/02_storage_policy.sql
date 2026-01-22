-- Make sure the 'assets' bucket exists and is public
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

-- 1. Allow Public Read Access (Downloading images/models)
create policy "Allow Public Read"
on storage.objects for select
using ( bucket_id = 'assets' );

-- 2. Allow Public Upload Access (Uploading from CMS)
-- Note: In a real app, you would restrict this to authenticated users.
create policy "Allow Public Upload"
on storage.objects for insert
with check ( bucket_id = 'assets' );

-- 3. Allow Public Update/Delete (Optional, for editing)
create policy "Allow Public Update"
on storage.objects for update
using ( bucket_id = 'assets' );

create policy "Allow Public Delete"
on storage.objects for delete
using ( bucket_id = 'assets' );
