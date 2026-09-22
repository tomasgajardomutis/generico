"use client";

import {useMemo,useState} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowRight,Search} from "lucide-react";
import type {ContentItem} from "@/lib/types";

const PAGE_SIZE=6;
const normalize=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

export function PostsCatalog({posts}:{posts:ContentItem[]}){
  const[category,setCategory]=useState("Todos");
  const[query,setQuery]=useState("");
  const[page,setPage]=useState(1);
  const categories=useMemo(()=>["Todos",...new Set(posts.map(post=>post.category).filter((value):value is string=>Boolean(value)))],[posts]);
  const filtered=useMemo(()=>{
    const term=normalize(query.trim());
    return posts.filter(post=>{
      const matchesCategory=category==="Todos"||post.category===category;
      const searchable=normalize(`${post.title} ${post.summary} ${post.body??""} ${post.category??""} ${post.author_name??""}`);
      return matchesCategory&&(!term||searchable.includes(term));
    });
  },[posts,category,query]);
  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const visible=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);

  return <div>
    <div className="catalog-controls">
      <label className="catalog-search"><Search size={17}/><span className="sr-only">Buscar artículos</span><input value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}} placeholder="Buscar artículos, temas o autores…"/></label>
      <div className="filter-bar" aria-label="Filtrar artículos por categoría">{categories.map(value=><button type="button" className={`chip ${category===value?"active":""}`} aria-pressed={category===value} key={value} onClick={()=>{setCategory(value);setPage(1)}}>{value}</button>)}</div>
    </div>
    <p className="results-count" aria-live="polite">{filtered.length} {filtered.length===1?"artículo encontrado":"artículos encontrados"}</p>
    {visible.length>0?<div className="card-grid">{visible.map(post=><article className="content-card" key={post.id} itemScope itemType="https://schema.org/Article"><p className="article-meta"><time dateTime={post.published_at}>{post.published_at?new Intl.DateTimeFormat("es-CL",{dateStyle:"medium"}).format(new Date(post.published_at)):"Sin fecha"}</time> · {post.category}</p><h2 itemProp="headline">{post.title}</h2><p itemProp="description">{post.summary}</p><Link href={`/blog/${post.slug}`}>Leer artículo <ArrowRight size={15}/></Link></article>)}</div>:<div className="empty-results"><h2>Sin resultados</h2><p>No encontramos artículos con esos filtros.</p><button className="button button-secondary" onClick={()=>{setQuery("");setCategory("Todos")}}>Limpiar filtros</button></div>}
    {totalPages>1&&<nav className="catalog-pagination" aria-label="Paginación del blog"><button className="button button-secondary" disabled={page===1} onClick={()=>setPage(current=>Math.max(1,current-1))}><ArrowLeft size={16}/> Anterior</button><span>Página {page} de {totalPages}</span><button className="button button-secondary" disabled={page===totalPages} onClick={()=>setPage(current=>Math.min(totalPages,current+1))}>Siguiente <ArrowRight size={16}/></button></nav>}
  </div>;
}
