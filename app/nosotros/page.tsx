import type {Metadata} from "next";
import {EditablePageBody} from "@/components/site/editable-page-body";
import {getPage} from "@/lib/content";

export async function generateMetadata():Promise<Metadata>{
  const page=await getPage("nosotros");
  return{title:page?.seo_title??page?.title,description:page?.seo_description??page?.summary,alternates:{canonical:"/nosotros"}};
}

export default async function AboutPage(){
  const page=await getPage("nosotros");
  return <main>
    <header className="page-hero page-container"><p className="eyebrow">Quiénes somos</p><h1>{page?.title}</h1><p>{page?.summary}</p></header>
    <section className="section page-container prose-page"><EditablePageBody body={page?.body??""}/></section>
    <section className="section page-container"><div className="section-heading"><div><p className="eyebrow">Equipo</p><h2>Experiencia complementaria</h2></div></div><div className="card-grid">{["Sofía · Producto","Mateo · Tecnología","Isidora · Crecimiento"].map(name=><article className="content-card" key={name}><div className="brand-mark">{name[0]}</div><h3>{name}</h3><p>Especialistas enfocados en resultados, aprendizaje continuo y colaboración transparente.</p></article>)}</div></section>
  </main>;
}
