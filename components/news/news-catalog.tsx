"use client";

import {useMemo,useState} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowRight,Search} from "lucide-react";
import type {ContentItem} from "@/lib/types";

const PAGE_SIZE=9;
const normalize=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

// El navegador filtra únicamente noticias publicadas que el Server Component
// obtuvo previamente mediante las políticas RLS de Supabase.
export function NewsCatalog({news}:{news:ContentItem[]}){
  const[category,setCategory]=useState("Todas");
  const[query,setQuery]=useState("");
  const[page,setPage]=useState(1);
  const categories=useMemo(()=>["Todas",...new Set(news.map(item=>item.category).filter((value):value is string=>Boolean(value)))],[news]);
  const filtered=useMemo(()=>{
    const term=normalize(query.trim());
    return news.filter(item=>{
      const matchesCategory=category==="Todas"||item.category===category;
      const searchable=normalize(`${item.title} ${item.summary} ${item.body??""} ${item.category??""}`);
      return matchesCategory&&(!term||searchable.includes(term));
    });
  },[news,category,query]);
  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const visible=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);

  return <div>
    <div className="catalog-controls">
      <label className="catalog-search"><Search size={17}/><span className="sr-only">Buscar noticias</span><input value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}} placeholder="Buscar noticias o temas…"/></label>
      <div className="filter-bar" aria-label="Filtrar noticias por categoría">{categories.map(value=><button type="button" className={`chip ${category===value?"active":""}`} aria-pressed={category===value} key={value} onClick={()=>{setCategory(value);setPage(1)}}>{value}</button>)}</div>
    </div>
    <p className="results-count" aria-live="polite">{filtered.length} {filtered.length===1?"noticia encontrada":"noticias encontradas"}</p>
    {visible.length>0?<div className="card-grid">{visible.map(item=><article className="content-card" key={item.id} itemScope itemType="https://schema.org/NewsArticle"><p className="article-meta"><time dateTime={item.published_at}>{item.published_at?new Intl.DateTimeFormat("es-CL",{dateStyle:"long"}).format(new Date(item.published_at)):"Sin fecha"}</time> · {item.category}</p><h2 itemProp="headline">{item.title}</h2><p itemProp="description">{item.summary}</p><Link href={`/noticias/${item.slug}`}>Leer noticia <ArrowRight size={15}/></Link></article>)}</div>:<div className="empty-results"><h2>Sin resultados</h2><p>No encontramos noticias con esos filtros.</p><button className="button button-secondary" onClick={()=>{setQuery("");setCategory("Todas");setPage(1)}}>Limpiar filtros</button></div>}
    {totalPages>1&&<nav className="catalog-pagination" aria-label="Paginación de noticias"><button className="button button-secondary" disabled={page===1} onClick={()=>setPage(current=>Math.max(1,current-1))}><ArrowLeft size={16}/> Anterior</button><span>Página {page} de {totalPages}</span><button className="button button-secondary" disabled={page===totalPages} onClick={()=>setPage(current=>Math.min(totalPages,current+1))}>Siguiente <ArrowRight size={16}/></button></nav>}
  </div>;
}
