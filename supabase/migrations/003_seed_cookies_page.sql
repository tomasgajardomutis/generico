-- Agrega la política de cookies al conjunto de páginas administrables.
insert into public.pages (slug,title,summary,body,seo_title,seo_description,locale,is_published)
values (
  'cookies',
  'Política de cookies',
  'Información sobre las cookies utilizadas y cómo administrar tus preferencias.',
  E'## ¿Qué son las cookies?\nSon pequeños archivos que el navegador almacena para recordar información y permitir determinadas funciones.\n\n## Cookies esenciales\nSon necesarias para la seguridad, autenticación y funcionamiento básico. No pueden desactivarse desde el panel de preferencias.\n\n## Cookies analíticas\nPermiten comprender cómo se utiliza el sitio. Solo se activan después de recibir consentimiento.\n\n## Cookies de marketing\nAyudan a medir campañas y contenido promocional. Permanecen desactivadas hasta que el usuario las autorice.\n\n## Cambiar o retirar el consentimiento\nPuedes abrir Configurar cookies desde el pie de página y cambiar tu decisión en cualquier momento.',
  'Política de cookies',
  'Consulta y administra las preferencias de cookies del sitio.',
  'es-CL',
  true
)
on conflict (slug) do update set
 title=excluded.title,summary=excluded.summary,body=excluded.body,
 seo_title=excluded.seo_title,seo_description=excluded.seo_description,
 locale=excluded.locale,is_published=excluded.is_published;
