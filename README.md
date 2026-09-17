# Nexo — Full-Stack Cloudflare + Supabase Starter

Esqueleto Mobile-First con Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres, CMS privado y salida compatible con Cloudflare Workers/Pages.

## Inicio local

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

1. Crea un proyecto Supabase y ejecuta `supabase/migrations/001_initial_cms.sql`.
2. Crea el primer usuario en Authentication → Users.
3. Inserta su UUID en `profiles` con rol `admin` usando la sentencia al final de la migración.
4. Completa `.env.local`; no agregues ese archivo a Git.

## GitHub y Cloudflare Pages

1. Crea un repositorio: `git init`, `git add .`, `git commit -m "Initial CMS starter"`.
2. Agrega el remoto y sube: `git remote add origin <URL>` y `git push -u origin main`.
3. En Cloudflare abre **Workers & Pages → Create → Pages → Import an existing Git repository**.
4. Selecciona Node.js 22 y el comando `pnpm build`. El proyecto usa Vinext para producir un Worker Edge compatible con Cloudflare.
5. Agrega `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `NEXT_PUBLIC_SITE_URL` en **Settings → Variables and Secrets**.
6. Despliega, agrega el dominio personalizado y registra ese dominio en **Supabase Auth → URL Configuration**.

## Seguridad

- `.env.example` no contiene secretos reales.
- El CMS exige sesión y rol `admin`, validado nuevamente por RLS en cada operación.
- El navegador usa solo la publishable key; nunca `service_role`.
- `/admin` está fuera de la navegación pública y excluido en `robots.txt`.

Consulta `ARCHITECTURE.md` para el árbol del proyecto y la responsabilidad de cada carpeta.
