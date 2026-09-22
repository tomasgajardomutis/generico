import type {Metadata} from "next";
import {ServicesCatalog} from "@/components/catalog/services-catalog";
import {getServices} from "@/lib/content";

export const metadata:Metadata={title:"Servicios",description:"Servicios de estrategia, producto, automatización y SEO local.",alternates:{canonical:"/servicios"}};

export default async function ServicesPage(){
  const items=await getServices();
  return <main>
    <header className="page-hero page-container"><p className="eyebrow">Servicios</p><h1>Capacidades que se conectan.</h1><p>Desde la definición del problema hasta una operación segura, medible y lista para escalar.</p></header>
    <section className="section page-container" aria-label="Catálogo de servicios"><ServicesCatalog items={items}/></section>
  </main>;
}
