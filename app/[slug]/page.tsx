import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {EditablePageBody} from "@/components/site/editable-page-body";
import {getPage,getPublishedPages} from "@/lib/content";
import {getSiteUrl} from "@/lib/site-url";

type Props={params:Promise<{slug:string}>};

// Las páginas publicadas se incluyen durante la construcción cuando Supabase
// está disponible. La ruta sigue siendo dinámica para admitir nuevas páginas
// creadas desde el CMS sin agregar un archivo de código por cada slug.
export async function generateStaticParams(){
  const pages=await getPublishedPages();
  return pages.map(page=>({slug:page.slug}));
}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const{slug}=await params;
  const page=await getPage(slug);
  if(!page)return{};
  const title=page.seo_title??page.title;
  const description=page.seo_description??page.summary;
  return{
    title,description,alternates:{canonical:`/${slug}`},
    openGraph:{type:"website",title,description,url:`/${slug}`},
    twitter:{card:"summary",title,description},
  };
}

export default async function CmsPage({params}:Props){
  const{slug}=await params;
  const page=await getPage(slug);
  if(!page)notFound();

  const schema={
    "@context":"https://schema.org","@type":"WebPage",
    name:page.title,description:page.seo_description??page.summary,
    url:`${getSiteUrl()}/${slug}`,inLanguage:page.locale,
    dateModified:page.updated_at,
  };

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>
    <header className="page-hero page-container">
      <p className="eyebrow">Página</p><h1>{page.title}</h1><p>{page.summary}</p>
    </header>
    <article className="section page-container prose-page"><EditablePageBody body={page.body}/></article>
  </main>;
}
