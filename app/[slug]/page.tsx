import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {PostsCatalog} from "@/components/blog/posts-catalog";
import {ServicesCatalog} from "@/components/catalog/services-catalog";
import {CmsSearchResults} from "@/components/site/cms-search-results";
import {EditablePageBody} from "@/components/site/editable-page-body";
import {getNews,getPage,getPosts,getPublishedPages,getServices} from "@/lib/content";
import {PAGE_TYPE_LABELS,isPageType} from "@/lib/page-types";
import {getSiteUrl} from "@/lib/site-url";
import type {PageItem} from "@/lib/types";

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

  const pageType=isPageType(page.page_type)?page.page_type:"basic";
  const schema={
    "@context":"https://schema.org","@type":"WebPage",
    name:page.title,description:page.seo_description??page.summary,
    url:`${getSiteUrl()}/${slug}`,inLanguage:page.locale,
    dateModified:page.updated_at,
  };

  let content:React.ReactNode;
  if(pageType==="blog_archive"){
    content=<PostsCatalog posts={await getPosts()}/>;
  }else if(pageType==="catalog"){
    content=<ServicesCatalog items={await getServices()}/>;
  }else if(pageType==="search_results"){
    const[posts,news,services]=await Promise.all([getPosts(),getNews(),getServices()]);
    content=<CmsSearchResults posts={posts} news={news} services={services}/>;
  }else if(pageType==="gallery"){
    const[posts,news]=await Promise.all([getPosts(),getNews()]);
    const items=[...posts,...news];
    content=<div className="cms-gallery">{items.map(item=><article className="content-card" key={`${item.slug}-${item.id}`}><span className="card-index">{item.category??"Portafolio"}</span><h2>{item.title}</h2><p>{item.summary}</p></article>)}</div>;
  }else if(pageType==="private_account"){
    content=<div className="account-entry"><EditablePageBody body={page.body}/><Link className="button button-primary" href="/admin/login">Ingresar de forma segura</Link></div>;
  }else if(pageType==="not_found"){
    content=<div className="empty-results"><EditablePageBody body={page.body}/><Link className="button button-primary" href="/">Volver al inicio</Link></div>;
  }else{
    content=<EditableTemplate page={page} type={pageType}/>;
  }

  return <main className={`cms-page cms-page-${pageType}`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>
    <header className="page-hero page-container">
      <p className="eyebrow">{PAGE_TYPE_LABELS[pageType]}</p><h1>{page.title}</h1><p>{page.summary}</p>
    </header>
    <section className={`section page-container ${["basic","blog_post","project_detail"].includes(pageType)?"prose-page":""}`}>{content}</section>
  </main>;
}

function EditableTemplate({page,type}:{page:PageItem;type:string}){
  if(type==="contact")return <div className="contact-template"><article className="prose-page"><EditablePageBody body={page.body}/></article><aside className="content-card"><span className="card-index">Contacto</span><h2>Información y canales</h2><p>Agrega en el contenido los datos de contacto, horarios, sucursales, mapa y redes sociales que correspondan.</p></aside></div>;
  if(type==="product_detail")return <article className="product-template"><div><span className="card-index">Ficha de producto</span><h2>{page.title}</h2><p className="hero-lead">{page.summary}</p></div><div className="content-card"><EditablePageBody body={page.body}/></div></article>;
  if(type==="blog_post")return <article><p className="article-meta">Actualizado {page.updated_at?new Intl.DateTimeFormat("es-CL",{dateStyle:"long"}).format(new Date(page.updated_at)):"recientemente"}</p><EditablePageBody body={page.body}/></article>;
  if(type==="project_detail")return <article><span className="card-index">Caso de éxito</span><EditablePageBody body={page.body}/></article>;
  return <article><EditablePageBody body={page.body}/></article>;
}
