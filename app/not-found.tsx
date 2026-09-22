/* eslint-disable @next/next/no-img-element -- Supabase Storage URLs are dynamic CMS content. */
import Link from "next/link";
import {EditablePageBody} from "@/components/site/editable-page-body";
import {getPageByType} from "@/lib/content";
import {normalizePageContent} from "@/lib/page-content";

// Si el CMS contiene una página 404 publicada, se reutiliza su contenido. El
// fallback mantiene siempre una salida útil aunque todavía no se haya creado.
export default async function NotFoundPage(){
  const page=await getPageByType("not_found");
  const data=normalizePageContent(page?.content_data);
  const image=typeof data.featured_image_url==="string"?data.featured_image_url:"";
  const imageAlt=typeof data.image_alt==="string"?data.image_alt:"";
  const buttonLabel=typeof data.button_label==="string"?data.button_label:"Volver al inicio";
  const requestedUrl=typeof data.button_url==="string"?data.button_url:"/";
  const buttonUrl=requestedUrl.startsWith("/")&&!requestedUrl.startsWith("//")?requestedUrl:"/";
  return <main className="section page-container prose-page">
    <p className="eyebrow">Error 404</p>
    <h1>{page?.title??"Página no encontrada"}</h1>
    <p className="hero-lead">{page?.summary??"La dirección que intentaste abrir no existe o dejó de estar disponible."}</p>
    {image&&<figure className="featured-media"><img src={image} alt={imageAlt||page?.title||"Página no encontrada"}/></figure>}
    {page?.body&&<EditablePageBody body={page.body}/>}<Link className="button button-primary" href={buttonUrl}>{buttonLabel}</Link>
  </main>;
}
