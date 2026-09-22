import type {ContentItem,FaqItem,PageItem} from "./types";
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
export const demoPages:Record<string,PageItem>={
 home:{id:"home",slug:"home",title:"Una base sólida para convertir ideas en productos reales.",summary:"Arquitectura moderna, contenido administrable y seguridad desde el primer despliegue. Diseñada para operar rápido en cualquier región.",body:"Publica, mide y mejora sin rehacer tu base.",seo_title:"Nexo | Plataforma digital moderna",seo_description:"Base full-stack moderna con CMS, seguridad y despliegue global en Cloudflare.",locale:"es-CL",is_published:true},
 nosotros:{id:"nosotros",slug:"nosotros",title:"Construimos con intención, no por inercia.",summary:"Un equipo multidisciplinario que combina estrategia, diseño y tecnología para resolver problemas importantes.",body:"## Nuestra historia\nNacimos para acortar la distancia entre una buena idea y un producto confiable.\n\n## Misión\nCrear soluciones claras, inclusivas y medibles que mejoren decisiones y experiencias.\n\n## Visión\nSer el socio técnico que convierte complejidad en progreso sostenible.",seo_title:"Quiénes somos",seo_description:"Conoce la misión, visión y equipo detrás de Nexo.",locale:"es-CL",is_published:true},
 privacidad:{id:"privacidad",slug:"privacidad",title:"Política de privacidad",summary:"Última actualización: 17 de septiembre de 2026.",body:"## Datos que tratamos\nRecopilamos únicamente los datos necesarios para prestar el servicio, proteger las cuentas y mejorar la experiencia.\n\n## Base y finalidad\nEl tratamiento se basa en el consentimiento, la ejecución del servicio y obligaciones legales aplicables. No vendemos información personal.\n\n## Tus derechos\nPuedes solicitar acceso, rectificación, portabilidad o eliminación de tus datos, sujeto a las normas aplicables, incluyendo RGPD y CCPA.\n\n## Cookies\nLas cookies esenciales mantienen la sesión. Las analíticas opcionales requieren consentimiento previo.",seo_title:"Política de privacidad",seo_description:"Información sobre privacidad y tratamiento de datos.",locale:"es-CL",is_published:true},
 terminos:{id:"terminos",slug:"terminos",title:"Términos de servicio",summary:"Última actualización: 17 de septiembre de 2026.",body:"## Aceptación\nAl utilizar el servicio aceptas estos términos y las políticas vinculadas.\n\n## Uso permitido\nNo puedes vulnerar la seguridad, interferir con el servicio ni utilizarlo para actividades ilícitas.\n\n## Disponibilidad\nTrabajamos para mantener una alta disponibilidad, aunque pueden existir ventanas de mantenimiento y eventos externos.\n\n## Responsabilidad\nLa responsabilidad se limita en la medida permitida por la legislación aplicable.",seo_title:"Términos de servicio",seo_description:"Condiciones generales para el uso del servicio.",locale:"es-CL",is_published:true},
 cookies:{id:"cookies",slug:"cookies",title:"Política de cookies",summary:"Información sobre las cookies utilizadas y cómo administrar tus preferencias.",body:"## ¿Qué son las cookies?\nSon pequeños archivos que el navegador almacena para recordar información y permitir determinadas funciones.\n\n## Cookies esenciales\nSon necesarias para la seguridad, autenticación y funcionamiento básico. No pueden desactivarse desde el panel de preferencias.\n\n## Cookies analíticas\nPermiten comprender cómo se utiliza el sitio. Solo se activan después de recibir consentimiento.\n\n## Cookies de marketing\nAyudan a medir campañas y contenido promocional. Permanecen desactivadas hasta que el usuario las autorice.\n\n## Cambiar o retirar el consentimiento\nPuedes abrir Configurar cookies desde el pie de página y cambiar tu decisión en cualquier momento.",seo_title:"Política de cookies",seo_description:"Consulta y administra las preferencias de cookies del sitio.",locale:"es-CL",is_published:true},
};

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
 const{data,error}=await getSupabasePublicClient().from("news").select("id,slug,title,summary,body,category,image_url,published_at,is_published").eq("is_published",true).lte("published_at",new Date().toISOString()).order("published_at",{ascending:false});
 if(error)return demoNews;
 return data as ContentItem[];
}

export async function getNewsBySlug(slug:string){
 const{data,error}=await getSupabasePublicClient().from("news").select("id,slug,title,summary,body,category,image_url,published_at,is_published").eq("slug",slug).eq("is_published",true).lte("published_at",new Date().toISOString()).maybeSingle();
 if(error)return demoNews.find(item=>item.slug===slug)??null;
 return data as ContentItem|null;
}

export async function getFaqs(){
 const{data,error}=await getSupabasePublicClient().from("faqs").select("id,question,answer,sort_order,is_published").eq("is_published",true).order("sort_order",{ascending:true});
 if(error)return demoFaqs;
 return data as FaqItem[];
}

export async function getPage(slug:string){
 const{data,error}=await getSupabasePublicClient().from("pages").select("id,slug,title,summary,body,seo_title,seo_description,locale,is_published,updated_at").eq("slug",slug).eq("is_published",true).maybeSingle();
 if(error||!data)return demoPages[slug]??null;
 return data as PageItem;
}

// Devuelve las páginas públicas para generar rutas y sitemap. Ante un error de
// conexión se conservan únicamente las páginas de demostración conocidas.
export async function getPublishedPages(){
 const{data,error}=await getSupabasePublicClient().from("pages").select("id,slug,title,summary,body,seo_title,seo_description,locale,is_published,updated_at").eq("is_published",true).order("updated_at",{ascending:false});
 if(error)return Object.values(demoPages);
 return data as PageItem[];
}
