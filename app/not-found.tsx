import Link from "next/link";
import {EditablePageBody} from "@/components/site/editable-page-body";
import {getPageByType} from "@/lib/content";

// Si el CMS contiene una página 404 publicada, se reutiliza su contenido. El
// fallback mantiene siempre una salida útil aunque todavía no se haya creado.
export default async function NotFoundPage(){
  const page=await getPageByType("not_found");
  return <main className="section page-container prose-page">
    <p className="eyebrow">Error 404</p>
    <h1>{page?.title??"Página no encontrada"}</h1>
    <p className="hero-lead">{page?.summary??"La dirección que intentaste abrir no existe o dejó de estar disponible."}</p>
    {page?.body&&<EditablePageBody body={page.body}/>}<Link className="button button-primary" href="/">Volver al inicio</Link>
  </main>;
}
