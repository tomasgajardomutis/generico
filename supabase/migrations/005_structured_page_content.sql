-- Contenido estructurado por plantilla y almacenamiento de imágenes del CMS.
alter table public.pages
  add column if not exists content_data jsonb not null default '{}'::jsonb;

comment on column public.pages.content_data is
  'Campos estructurados específicos del tipo de página seleccionado en page_type.';

-- Bucket público: los archivos publicados se sirven por CDN sin autenticar.
-- Las políticas siguientes mantienen las escrituras limitadas a administradores.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'page-media','page-media',true,6291456,
  array['image/jpeg','image/png','image/webp','image/avif','image/gif']
)
on conflict (id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "admins upload page media" on storage.objects;
drop policy if exists "admins update page media" on storage.objects;
drop policy if exists "admins delete page media" on storage.objects;
drop policy if exists "admins list page media" on storage.objects;

create policy "admins upload page media" on storage.objects
for insert to authenticated
with check (bucket_id='page-media' and public.is_admin());

create policy "admins update page media" on storage.objects
for update to authenticated
using (bucket_id='page-media' and public.is_admin())
with check (bucket_id='page-media' and public.is_admin());

create policy "admins delete page media" on storage.objects
for delete to authenticated
using (bucket_id='page-media' and public.is_admin());

create policy "admins list page media" on storage.objects
for select to authenticated
using (bucket_id='page-media' and public.is_admin());
