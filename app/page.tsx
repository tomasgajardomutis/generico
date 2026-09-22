import { ArrowRight, CheckCircle2, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import type {Metadata} from "next";
import { getPage,getServices } from "@/lib/content";

export async function generateMetadata():Promise<Metadata>{
  const page=await getPage("home");
  return{title:page?.seo_title,description:page?.seo_description,alternates:{canonical:"/"}};
}

// Server Component: entrega HTML útil para SEO antes de hidratar el cliente.
export default async function HomePage() {
  const [services,page] = await Promise.all([getServices(3),getPage("home")]);
  return <>
    <section className="hero-shell"><div className="page-container hero-grid">
      <div className="hero-copy"><p className="eyebrow"><Sparkles size={15}/> Plataforma digital preparada para crecer</p><h1>{page?.title}</h1><p className="hero-lead">{page?.summary}</p><div className="hero-actions"><a className="button button-primary" href="/servicios">Explorar servicios <ArrowRight size={18}/></a><a className="button button-secondary" href="/nosotros">Conocer el proyecto</a></div><ul className="trust-list"><li><CheckCircle2 size={17}/> Edge ready</li><li><CheckCircle2 size={17}/> CMS seguro</li><li><CheckCircle2 size={17}/> SEO técnico</li></ul></div>
      <div className="architecture-card"><div className="status-row"><span className="status-dot"/> Sistema listo</div><h2>Tu plataforma, conectada.</h2><div className="stack-flow"><div><Globe2/><span>Cloudflare Edge</span><small>Entrega global</small></div><div><ShieldCheck/><span>Supabase</span><small>Datos + Auth</small></div><div><Sparkles/><span>CMS modular</span><small>Contenido editable</small></div></div></div>
    </div></section>
    <section className="section page-container" aria-labelledby="services-title"><div className="section-heading"><div><p className="eyebrow">Servicios</p><h2 id="services-title">Construido para el trabajo real</h2></div><a className="text-link" href="/servicios">Ver todos <ArrowRight size={16}/></a></div><div className="card-grid">{services.map((service,index)=><article className="content-card" key={service.id}><span className="card-index">0{index+1}</span><h3>{service.title}</h3><p>{service.summary}</p><a href={`/servicios#${service.slug}`}>Ver detalle <ArrowRight size={15}/></a></article>)}</div></section>
    <section className="section page-container"><div className="cta-panel"><div><p className="eyebrow">Arquitectura preparada</p><h2>{page?.body}</h2></div><a className="button button-light" href="/blog">Leer recursos <ArrowRight size={18}/></a></div></section>
  </>;
}
