"use client";
import {Menu,Moon,Sun,X} from "lucide-react";
import {useEffect,useState} from "react";

export type NavigationLink={label:string;href:string};

// La lista llega desde el layout del servidor para incluir páginas publicadas
// por el CMS sin exponer borradores ni realizar consultas desde el navegador.
export function Header({links}:{links:NavigationLink[]}){
  const[open,setOpen]=useState(false);
  const[dark,setDark]=useState(()=>typeof window!=="undefined"&&(localStorage.getItem("theme")==="dark"||(!localStorage.getItem("theme")&&matchMedia("(prefers-color-scheme: dark)").matches)));
  useEffect(()=>{document.documentElement.classList.toggle("dark",dark);localStorage.setItem("theme",dark?"dark":"light")},[dark]);
  function toggle(){setDark(value=>!value)}
  return <header className="site-header"><div className="page-container header-inner"><a className="brand" href="/"><span className="brand-mark">N</span>Nexo</a><nav className="desktop-nav" aria-label="Navegación principal">{links.map(link=><a key={link.href} href={link.href}>{link.label}</a>)}</nav><div className="header-actions"><button className="icon-button" onClick={toggle} aria-label="Cambiar tema">{dark?<Sun size={18}/>:<Moon size={18}/>}</button><button className="icon-button menu-button" onClick={()=>setOpen(!open)} aria-label="Abrir menú">{open?<X size={19}/>:<Menu size={19}/>}</button></div><nav className={`mobile-menu ${open?"open":""}`} aria-label="Navegación móvil">{links.map(link=><a key={link.href} href={link.href} onClick={()=>setOpen(false)}>{link.label}</a>)}</nav></div></header>;
}
