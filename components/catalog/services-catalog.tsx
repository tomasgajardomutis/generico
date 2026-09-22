"use client";

import {useMemo,useState} from "react";
import {Search} from "lucide-react";
import type {ContentItem} from "@/lib/types";

const normalize=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

// La consulta sigue ocurriendo en el servidor; este componente solo filtra los
// resultados publicados que ya fueron autorizados por RLS.
export function ServicesCatalog({items}:{items:ContentItem[]}){
  const[category,setCategory]=useState("Todos");
  const[query,setQuery]=useState("");
  const categories=useMemo(()=>["Todos",...new Set(items.map(item=>item.category).filter((value):value is string=>Boolean(value)))],[items]);
  const filtered=useMemo(()=>{
    const term=normalize(query.trim());
    return items.filter(item=>{
      const matchesCategory=category==="Todos"||item.category===category;
      const searchable=normalize(`${item.title} ${item.summary} ${item.body??""} ${item.category??""}`);
      return matchesCategory&&(!term||searchable.includes(term));
    });
  },[items,category,query]);

  return <div>
    <div className="catalog-controls">
      <label className="catalog-search"><Search size={17}/><span className="sr-only">Buscar servicios</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar por nombre, categoría o descripción…"/></label>
      <div className="filter-bar" aria-label="Filtrar servicios por categoría">{categories.map(value=><button type="button" className={`chip ${category===value?"active":""}`} aria-pressed={category===value} key={value} onClick={()=>setCategory(value)}>{value}</button>)}</div>
    </div>
    <p className="results-count" aria-live="polite">{filtered.length} {filtered.length===1?"servicio encontrado":"servicios encontrados"}</p>
    {filtered.length>0?<div className="card-grid">{filtered.map((item,index)=><article className="content-card" id={item.slug} key={item.id}><span className="card-index">{String(index+1).padStart(2,"0")} · {item.category}</span><h2>{item.title}</h2><p>{item.summary}</p></article>)}</div>:<div className="empty-results"><h2>Sin resultados</h2><p>Prueba otra palabra o selecciona una categoría diferente.</p><button className="button button-secondary" onClick={()=>{setQuery("");setCategory("Todos")}}>Limpiar filtros</button></div>}
  </div>;
}
