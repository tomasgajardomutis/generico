import type {ContentItem,FaqItem} from "./types";
import {getSupabasePublicClient} from "./supabase/public";

// Datos semilla: mantienen la UI navegable antes de enlazar Supabase.
export const demoServices:ContentItem[]=[
 {id:"1",slug:"estrategia-digital",title:"Estrategia digital",summary:"Convierte objetivos de negocio en una hoja de ruta clara, medible y priorizada.",category:"Estrategia"},
 {id:"2",slug:"experiencias-web",title:"Experiencias web",summary:"Interfaces rápidas, accesibles y optimizadas para cada pantalla y contexto.",category:"Producto"},
 {id:"3",slug:"datos-automatizacion",title:"Datos y automatización",summary:"Integra operaciones y contenido con controles seguros y trazabilidad.",category:"Tecnología"},
 {id:"4",slug:"seo-local",title:"SEO local",summary:"Estructura técnica y contenido preparado para búsquedas por ciudad y región.",category:"Crecimiento"}
];
export const demoPosts:ContentItem[]=[
 {id:"1",slug:"arquitectura-edge",title:"Por qué llevar tu aplicación al Edge",summary:"Menor latencia, despliegues globales y una experiencia consistente sin infraestructura compleja.",category:"Arquitectura",published_at:"2026-09-10"},
 {id:"2",slug:"rls-supabase",title:"RLS: la frontera de seguridad que sí importa",summary:"Cómo proteger cada fila y evitar que una clave pública se convierta en un riesgo.",category:"Seguridad",published_at:"2026-09-04"},
 {id:"3",slug:"seo-tecnico",title:"SEO técnico desde el primer componente",summary:"Metadatos, HTML semántico y datos estructurados como parte de la arquitectura.",category:"SEO",published_at:"2026-08-28"}
];
export const demoNews:ContentItem[]=[{id:"1",slug:"nueva-plataforma",title:"Lanzamos una nueva base para productos digitales",summary:"Una arquitectura abierta, segura y preparada para crecer desde el primer día.",category:"Producto",published_at:"2026-09-15"},{id:"2",slug:"cobertura-regional",title:"Mejor rendimiento para usuarios en Latinoamérica",summary:"Optimización de entrega y caché distribuida en la red global.",category:"Tecnología",published_at:"2026-09-01"}];
export const demoFaqs:FaqItem[]=[{id:"1",question:"¿Puedo conectar mi propio proyecto Supabase?",answer:"Sí. Solo debes configurar la URL y publishable key en las variables del entorno y ejecutar la migración SQL incluida.",sort_order:1},{id:"2",question:"¿El panel de administración es público?",answer:"La ruta de acceso no aparece en la navegación y cada operación está protegida por autenticación y políticas RLS.",sort_order:2},{id:"3",question:"¿Puedo usar mi propio dominio?",answer:"Sí. Cloudflare Pages permite enlazar un dominio personalizado y gestionar SSL automáticamente.",sort_order:3}];

// Cada consulta pública respeta RLS y vuelve a los datos locales solo ante un
// error de red o configuración. Una tabla vacía se respeta como decisión del CMS.
export async function getServices(limit?:number){
 const query=getSupabasePublicClient().from("services").select("id,slug,title,summary,body,category,is_published").eq("is_published",true).order("sort_order",{ascending:true});
 if(limit)query.limit(limit);
 const{data,error}=await query;
 if(error)return limit?demoServices.slice(0,limit):demoServices;
 return data as ContentItem[];
}

export async function getPosts(){
 const{data,error}=await getSupabasePublicClient().from("posts").select("id,slug,title,summary,body,category,author_name,seo_title,seo_description,published_at,is_published").eq("is_published",true).lte("published_at",new Date().toISOString()).order("published_at",{ascending:false});
 if(error)return demoPosts;
 return data as ContentItem[];
}

export async function getPostBySlug(slug:string){
 const{data,error}=await getSupabasePublicClient().from("posts").select("id,slug,title,summary,body,category,author_name,seo_title,seo_description,published_at,is_published").eq("slug",slug).eq("is_published",true).lte("published_at",new Date().toISOString()).maybeSingle();
 if(error)return demoPosts.find(post=>post.slug===slug)??null;
 return data as ContentItem|null;
}

export async function getNews(){
 const{data,error}=await getSupabasePublicClient().from("news").select("id,slug,title,summary,body,category,published_at,is_published").eq("is_published",true).lte("published_at",new Date().toISOString()).order("published_at",{ascending:false});
 if(error)return demoNews;
 return data as ContentItem[];
}

export async function getFaqs(){
 const{data,error}=await getSupabasePublicClient().from("faqs").select("id,question,answer,sort_order,is_published").eq("is_published",true).order("sort_order",{ascending:true});
 if(error)return demoFaqs;
 return data as FaqItem[];
}
