-- Configuración opcional para mostrar páginas creadas en el menú principal.
alter table public.pages
  add column if not exists show_in_menu boolean not null default false,
  add column if not exists menu_label text,
  add column if not exists menu_order integer not null default 100;

comment on column public.pages.show_in_menu is
  'Incluye la página publicada en la navegación principal.';
comment on column public.pages.menu_label is
  'Etiqueta corta del enlace; usa title cuando está vacía.';
comment on column public.pages.menu_order is
  'Orden relativo de las páginas dinámicas dentro del menú.';

create index if not exists pages_public_menu_order_idx
  on public.pages(menu_order,title)
  where is_published=true and show_in_menu=true;
