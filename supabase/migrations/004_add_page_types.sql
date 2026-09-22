-- Plantillas seleccionables para páginas creadas desde el CMS.
alter table public.pages
  add column if not exists page_type text not null default 'basic';

alter table public.pages
  drop constraint if exists pages_page_type_check;

alter table public.pages
  add constraint pages_page_type_check check (
    page_type in (
      'basic','contact','blog_archive','catalog','gallery',
      'blog_post','product_detail','project_detail',
      'search_results','not_found','private_account'
    )
  );

comment on column public.pages.page_type is
  'Plantilla pública seleccionada desde el CMS para renderizar la página.';
