# Arquitectura

```text
app/                         Rutas App Router y metadatos SEO
├── admin/                   Login y dashboard CMS privado
├── blog/[slug]/             Artículos + Article schema
├── faq/                     FAQ + FAQPage schema
├── legal/                   Privacidad y términos
├── noticias/                Novedades públicas
├── nosotros/                Historia, misión, visión y equipo
├── servicios/               Catálogo público
├── robots.ts                Exclusión del CMS
└── sitemap.ts               URLs indexables
components/site/             Navegación y pie reutilizables
lib/supabase/client.ts       Cliente Auth/Data para navegador
lib/content.ts               Capa de datos y fallback demostrativo
supabase/migrations/         Esquema, triggers y políticas RLS
```

Next.js App Router se compila para Cloudflare Workers mediante Vinext. Las claves públicas solo identifican el proyecto; RLS autoriza cada fila. Nunca se envía `service_role` al navegador.
