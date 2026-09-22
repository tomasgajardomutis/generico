/* eslint-disable @next/next/no-img-element -- Supabase Storage URLs are dynamic CMS content. */
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {PostsCatalog} from "@/components/blog/posts-catalog";
import {ServicesCatalog} from "@/components/catalog/services-catalog";
import {CmsSearchResults} from "@/components/site/cms-search-results";
import {EditablePageBody} from "@/components/site/editable-page-body";
import {getNews,getPage,getPosts,getPublishedPages,getServices} from "@/lib/content";
import {getGalleryItems,normalizePageContent,type PageContentData} from "@/lib/page-content";
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
  const pageData=normalizePageContent(page.content_data);
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
    content=<CmsSearchResults posts={posts} news={news} services={services} placeholder={text(pageData,"search_placeholder")} emptyMessage={text(pageData,"empty_message")}/>;
  }else if(pageType==="gallery"){
    const items=getGalleryItems(pageData);
    content=<><EditablePageBody body={text(pageData,"gallery_description")||page.body}/>{items.length?<div className="cms-gallery media-gallery">{items.map((item,index)=><figure key={`${item.url}-${index}`}><img src={item.url} alt={item.alt||item.caption||`Imagen ${index+1} de ${page.title}`} loading="lazy"/><figcaption>{item.caption}</figcaption></figure>)}</div>:<div className="empty-results"><h2>Galería en preparación</h2><p>Las imágenes aparecerán aquí cuando se publiquen desde el administrador.</p></div>}</>;
  }else if(pageType==="private_account"){
    content=<div className="account-entry">{featuredImage(page,pageData)}<EditablePageBody body={page.body}/><Link className="button button-primary" href={safeInternalPath(text(pageData,"login_url"),"/admin/login")}>{text(pageData,"login_label")||"Ingresar de forma segura"}</Link>{text(pageData,"support_email")&&<a href={`mailto:${text(pageData,"support_email")}`}>Soporte: {text(pageData,"support_email")}</a>}</div>;
  }else if(pageType==="not_found"){
    content=<div className="empty-results">{featuredImage(page,pageData)}<EditablePageBody body={page.body}/><Link className="button button-primary" href={safeInternalPath(text(pageData,"button_url"),"/")}>{text(pageData,"button_label")||"Volver al inicio"}</Link></div>;
  }else{
    content=<EditableTemplate page={page} type={pageType} data={pageData}/>;
  }

  return <main className={`cms-page cms-page-${pageType}`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>
    <header className="page-hero page-container">
      <p className="eyebrow">{PAGE_TYPE_LABELS[pageType]}</p><h1>{page.title}</h1><p>{page.summary}</p>
    </header>
    <section className={`section page-container ${["basic","blog_post","project_detail"].includes(pageType)?"prose-page":""}`}>{content}</section>
  </main>;
}

function EditableTemplate({page,type,data}:{page:PageItem;type:string;data:PageContentData}){
  if(type==="contact")return <div className="contact-template"><article className="prose-page"><EditablePageBody body={page.body}/></article><div className="contact-sidebar"><aside className="content-card"><span className="card-index">Contacto</span><h2>Información y canales</h2><dl className="detail-list">{text(data,"phone")&&<><dt>Teléfono</dt><dd><a href={`tel:${text(data,"phone")}`}>{text(data,"phone")}</a></dd></>}{text(data,"email")&&<><dt>Correo</dt><dd><a href={`mailto:${text(data,"email")}`}>{text(data,"email")}</a></dd></>}{text(data,"address")&&<><dt>Dirección</dt><dd>{text(data,"address")}</dd></>}{text(data,"opening_hours")&&<><dt>Horario</dt><dd>{text(data,"opening_hours")}</dd></>}</dl>{lines(data,"social_links").length>0&&<div className="social-links">{lines(data,"social_links").map(url=><a href={safeExternalUrl(url)} key={url} rel="noreferrer" target="_blank">{new URL(safeExternalUrl(url)).hostname}</a>)}</div>}</aside>{safeMapUrl(text(data,"map_url"))&&<iframe className="contact-map" src={safeMapUrl(text(data,"map_url"))} title={`Mapa de ${page.title}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>}</div></div>;
  if(type==="product_detail")return <article className="product-template"><div>{gallery(data,page.title)}<span className="card-index">{text(data,"brand")||"Ficha de producto"}</span><h2>{page.title}</h2><p className="hero-lead">{page.summary}</p></div><div className="content-card"><div className="product-price">{formatPrice(data)}</div><dl className="detail-list">{text(data,"sku")&&<><dt>SKU</dt><dd>{text(data,"sku")}</dd></>}{number(data,"stock")>=0&&<><dt>Stock</dt><dd>{number(data,"stock")}</dd></>}{text(data,"sizes")&&<><dt>Variantes</dt><dd>{text(data,"sizes")}</dd></>}{text(data,"colors")&&<><dt>Colores</dt><dd>{text(data,"colors")}</dd></>}</dl><EditablePageBody body={page.body}/>{text(data,"specifications")&&<div className="specifications"><h3>Especificaciones</h3><p>{text(data,"specifications")}</p></div>}{text(data,"cta_url")&&<a className="button button-primary" href={safeLink(text(data,"cta_url"))}>{text(data,"cta_label")||"Solicitar información"}</a>}</div></article>;
  if(type==="blog_post")return <article>{featuredImage(page,data)}<p className="article-meta">{text(data,"author_name")&&<>Por {text(data,"author_name")} · </>}<time dateTime={text(data,"published_at")||page.updated_at}>{formatDate(text(data,"published_at")||page.updated_at)}</time>{text(data,"category")&&<> · {text(data,"category")}</>}</p>{text(data,"tags")&&<div className="filter-bar">{text(data,"tags").split(",").map(tag=><span className="chip" key={tag}>{tag.trim()}</span>)}</div>}<EditablePageBody body={page.body}/></article>;
  if(type==="project_detail")return <article><div className="project-meta"><span className="card-index">Caso de éxito</span><dl className="detail-list">{text(data,"client")&&<><dt>Cliente</dt><dd>{text(data,"client")}</dd></>}{text(data,"project_date")&&<><dt>Fecha</dt><dd>{formatDate(text(data,"project_date"))}</dd></>}{text(data,"tools")&&<><dt>Herramientas</dt><dd>{text(data,"tools")}</dd></>}</dl></div><EditablePageBody body={page.body}/>{text(data,"results")&&<aside className="content-card"><h2>Resultados</h2><p>{text(data,"results")}</p></aside>}{gallery(data,page.title)}{text(data,"project_url")&&<a className="button button-primary" href={safeExternalUrl(text(data,"project_url"))} rel="noreferrer" target="_blank">Ver proyecto</a>}</article>;
  return <article>{featuredImage(page,data)}<EditablePageBody body={page.body}/></article>;
}

function text(data:PageContentData,key:string){const value=data[key];return typeof value==="string"?value.trim():""}
function number(data:PageContentData,key:string){const value=data[key];return typeof value==="number"?value:-1}
function lines(data:PageContentData,key:string){return text(data,key).split(/\r?\n/).map(value=>value.trim()).filter(value=>/^https:\/\//.test(value))}
function safeInternalPath(value:string,fallback:string){return value.startsWith("/")&&!value.startsWith("//")?value:fallback}
function safeExternalUrl(value:string){try{const url=new URL(value);return url.protocol==="https:"?url.toString():"#"}catch{return"#"}}
function safeLink(value:string){return value.startsWith("/")?safeInternalPath(value,"#"):safeExternalUrl(value)}
function safeMapUrl(value:string){try{const url=new URL(value);const allowed=url.protocol==="https:"&&(url.hostname.endsWith("google.com")||url.hostname.endsWith("google.cl")||url.hostname.endsWith("openstreetmap.org"));return allowed?url.toString():""}catch{return""}}
function formatDate(value?:string){if(!value)return"Actualizado recientemente";const date=new Date(value);return Number.isNaN(date.getTime())?value:new Intl.DateTimeFormat("es-CL",{dateStyle:"long"}).format(date)}
function formatPrice(data:PageContentData){const price=number(data,"price");if(price<0)return null;try{return new Intl.NumberFormat("es-CL",{style:"currency",currency:text(data,"currency")||"CLP",maximumFractionDigits:0}).format(price)}catch{return `${price} ${text(data,"currency")}`}}
function featuredImage(page:PageItem,data:PageContentData){const url=text(data,"featured_image_url");return url?<figure className="featured-media"><img src={url} alt={text(data,"image_alt")||page.title}/></figure>:null}
function gallery(data:PageContentData,title:string){const items=getGalleryItems(data);return items.length?<div className="cms-gallery media-gallery">{items.map((item,index)=><figure key={`${item.url}-${index}`}><img src={item.url} alt={item.alt||item.caption||`${title}, imagen ${index+1}`} loading="lazy"/><figcaption>{item.caption}</figcaption></figure>)}</div>:null}
