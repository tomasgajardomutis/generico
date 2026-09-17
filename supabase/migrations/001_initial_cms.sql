-- CMS multi-módulo para Supabase PostgreSQL.
create extension if not exists pgcrypto;
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,role text not null default 'editor' check(role in('admin','editor')),display_name text,created_at timestamptz not null default now());
create table public.pages(id uuid primary key default gen_random_uuid(),slug text unique not null,title text not null,summary text not null default '',body text not null default '',seo_title text,seo_description text,locale text not null default 'es-CL',is_published boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.services(id uuid primary key default gen_random_uuid(),slug text unique not null,title text not null,summary text not null default '',body text not null default '',category text,image_url text,sort_order integer not null default 0,is_published boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.posts(id uuid primary key default gen_random_uuid(),slug text unique not null,title text not null,summary text not null default '',body text not null default '',category text,author_name text,image_url text,seo_title text,seo_description text,is_published boolean not null default false,published_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.news(id uuid primary key default gen_random_uuid(),slug text unique not null,title text not null,summary text not null default '',body text not null default '',category text,image_url text,is_published boolean not null default false,published_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.faqs(id uuid primary key default gen_random_uuid(),question text not null,answer text not null,sort_order integer not null default 0,is_published boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.site_settings(id uuid primary key default gen_random_uuid(),key text unique not null,value jsonb not null default '{}'::jsonb,updated_at timestamptz not null default now());

-- SECURITY DEFINER usa search_path fijo para evitar escalamiento.
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin')$$;
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path=public as $$begin new.updated_at=now();return new;end$$;
do $$declare t text;begin foreach t in array array['pages','services','posts','news','faqs','site_settings'] loop execute format('create trigger set_updated_at before update on public.%I for each row execute function public.touch_updated_at()',t);end loop;end$$;

alter table public.profiles enable row level security;alter table public.pages enable row level security;alter table public.services enable row level security;alter table public.posts enable row level security;alter table public.news enable row level security;alter table public.faqs enable row level security;alter table public.site_settings enable row level security;
create policy "published pages public" on public.pages for select using(is_published);
create policy "published services public" on public.services for select using(is_published);
create policy "published posts public" on public.posts for select using(is_published and published_at<=now());
create policy "published news public" on public.news for select using(is_published and published_at<=now());
create policy "published faqs public" on public.faqs for select using(is_published);
create policy "settings public" on public.site_settings for select using(true);
create policy "admins read profiles" on public.profiles for select to authenticated using(public.is_admin());
create policy "admins manage profiles" on public.profiles for all to authenticated using(public.is_admin()) with check(public.is_admin());
do $$declare t text;begin foreach t in array array['pages','services','posts','news','faqs','site_settings'] loop
 execute format('create policy "admin select %1$s" on public.%1$I for select to authenticated using(public.is_admin())',t);
 execute format('create policy "admin insert %1$s" on public.%1$I for insert to authenticated with check(public.is_admin())',t);
 execute format('create policy "admin update %1$s" on public.%1$I for update to authenticated using(public.is_admin()) with check(public.is_admin())',t);
 execute format('create policy "admin delete %1$s" on public.%1$I for delete to authenticated using(public.is_admin())',t);
end loop;end$$;

-- Tras crear el primer usuario Auth, promoverlo desde SQL Editor:
-- insert into public.profiles(id,role,display_name) values('UUID-DEL-USUARIO','admin','Administrador');
