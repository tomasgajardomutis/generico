"use client";

import {useMemo,useState} from "react";
import Link from "next/link";
import {Search} from "lucide-react";
import type {ContentItem} from "@/lib/types";

type SearchEntry=ContentItem&{href:string;kind:string};
const normalize=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

// Busca solo sobre registros publicados obtenidos previamente mediante RLS.
export function CmsSearchResults({posts,news,services}:{posts:ContentItem[];news:ContentItem[];services:ContentItem[]}){
  const[query,setQuery]=useState("");
  const entries=useMemo<SearchEntry[]>(()=>[
    ...posts.map(item=>({...item,href:`/blog/${item.slug}`,kind:"Artículo"})),
    ...news.map(item=>({...item,href:`/noticias/${item.slug}`,kind:"Noticia"})),
    ...services.map(item=>({...item,href:`/servicios#${item.slug}`,kind:"Servicio"})),
  ],[posts,news,services]);
  const results=useMemo(()=>{const term=normalize(query.trim());return term?entries.filter(item=>normalize(`${item.title} ${item.summary} ${item.category??""}`).includes(term)):[]},[entries,query]);

  return <div>
    <label className="catalog-search"><Search size={18}/><span className="sr-only">Buscar en el sitio</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar artículos, noticias o servicios…"/></label>
    <p className="results-count" aria-live="polite">{query.trim()?`${results.length} resultados`:"Escribe una palabra para comenzar."}</p>
    {results.length>0&&<div className="card-grid">{results.map(item=><article className="content-card" key={`${item.kind}-${item.id}`}><span className="card-index">{item.kind} · {item.category??"Contenido"}</span><h2>{item.title}</h2><p>{item.summary}</p><Link href={item.href}>Ver contenido</Link></article>)}</div>}
  </div>;
}
