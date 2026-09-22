import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {EditablePageBody} from "@/components/site/editable-page-body";
import {getNews,getNewsBySlug} from "@/lib/content";
import {getSiteUrl} from "@/lib/site-url";

type Props={params:Promise<{slug:string}>};

export async function generateStaticParams(){return(await getNews()).map(item=>({slug:item.slug}))}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const{slug}=await params;
  const item=await getNewsBySlug(slug);
  if(!item)return{};
  return{
    title:item.title,description:item.summary,alternates:{canonical:`/noticias/${slug}`},
    openGraph:{type:"article",title:item.title,description:item.summary,publishedTime:item.published_at,images:item.image_url?[{url:item.image_url}]:undefined},
    twitter:{card:"summary_large_image",title:item.title,description:item.summary,images:item.image_url?[item.image_url]:undefined},
  };
}

export default async function NewsDetailPage({params}:Props){
  const{slug}=await params;
  const item=await getNewsBySlug(slug);
  if(!item)notFound();
  const url=`${getSiteUrl()}/noticias/${slug}`;
  const schema={"@context":"https://schema.org","@type":"NewsArticle",headline:item.title,description:item.summary,datePublished:item.published_at,dateModified:item.published_at,mainEntityOfPage:url,image:item.image_url?[item.image_url]:undefined,publisher:{"@type":"Organization",name:"Nexo"}};
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>
    <article className="section page-container prose-page">
      <p className="eyebrow">{item.category??"Noticias"}</p><h1>{item.title}</h1>
      <p className="article-meta"><time dateTime={item.published_at}>{item.published_at?new Intl.DateTimeFormat("es-CL",{dateStyle:"long"}).format(new Date(item.published_at)):""}</time></p>
      <p className="hero-lead">{item.summary}</p>
      <EditablePageBody body={item.body??""}/>
    </article>
  </main>;
}
