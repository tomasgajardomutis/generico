import type {Metadata} from "next";
import {PostsCatalog} from "@/components/blog/posts-catalog";
import {getPosts} from "@/lib/content";

export const metadata:Metadata={title:"Blog",description:"Ideas prácticas sobre arquitectura, seguridad, producto y SEO.",alternates:{canonical:"/blog"},openGraph:{title:"Blog de Nexo",type:"website"}};

export default async function BlogPage(){
  const posts=await getPosts();
  return <main>
    <header className="page-hero page-container"><p className="eyebrow">Blog</p><h1>Decisiones técnicas, explicadas con claridad.</h1><p>Guías y aprendizajes para crear productos digitales más rápidos, seguros y útiles.</p></header>
    <section className="section page-container" aria-label="Artículos del blog"><PostsCatalog posts={posts}/></section>
  </main>;
}
