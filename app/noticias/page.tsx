import type {Metadata} from "next";
import {NewsCatalog} from "@/components/news/news-catalog";
import {getNews} from "@/lib/content";

export const metadata:Metadata={title:"Noticias",description:"Novedades y actualizaciones de Nexo.",alternates:{canonical:"/noticias"}};

export default async function NewsPage(){
  const news=await getNews();
  return <main>
    <header className="page-hero page-container"><p className="eyebrow">Noticias</p><h1>Lo nuevo en Nexo.</h1><p>Actualizaciones de producto, tecnología y crecimiento.</p></header>
    <section className="section page-container" aria-label="Listado de noticias"><NewsCatalog news={news}/></section>
  </main>;
}
