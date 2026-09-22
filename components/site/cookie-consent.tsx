"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import {Cookie,X} from "lucide-react";

type Consent={version:1;analytics:boolean;marketing:boolean;updatedAt:string};
const STORAGE_KEY="nexo-cookie-consent";
const OPEN_EVENT="open-cookie-preferences";

function readConsent():Consent|null{
  try{
    const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)??"null") as Consent|null;
    return parsed?.version===1?parsed:null;
  }catch{return null}
}

function persistConsent(analytics:boolean,marketing:boolean){
  const consent:Consent={version:1,analytics,marketing,updatedAt:new Date().toISOString()};
  localStorage.setItem(STORAGE_KEY,JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("cookie-consent-changed",{detail:consent}));
  return consent;
}

// Este componente no activa proveedores externos. Publica un evento solamente
// después del consentimiento para que futuras integraciones respeten la elección.
export function CookieConsent(){
  const[consent,setConsent]=useState<Consent|null>(null);
  const[visible,setVisible]=useState(false);
  const[customizing,setCustomizing]=useState(false);
  const[analytics,setAnalytics]=useState(false);
  const[marketing,setMarketing]=useState(false);

  useEffect(()=>{
    const initialize=()=>{const stored=readConsent();setConsent(stored);setAnalytics(stored?.analytics??false);setMarketing(stored?.marketing??false);setVisible(!stored)};
    const open=()=>{const stored=readConsent();setAnalytics(stored?.analytics??false);setMarketing(stored?.marketing??false);setCustomizing(true);setVisible(true)};
    queueMicrotask(initialize);
    window.addEventListener(OPEN_EVENT,open);
    return()=>window.removeEventListener(OPEN_EVENT,open);
  },[]);

  function save(nextAnalytics:boolean,nextMarketing:boolean){
    setConsent(persistConsent(nextAnalytics,nextMarketing));
    setVisible(false);setCustomizing(false);
  }

  if(!visible)return null;
  return <div className="cookie-layer" role="region" aria-label="Preferencias de cookies">
    <section className="cookie-panel" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
      <div className="cookie-heading"><div className="cookie-icon"><Cookie size={20}/></div><div><h2 id="cookie-title">{customizing?"Configura tus preferencias":"Tu privacidad importa"}</h2><p>Usamos cookies esenciales para el funcionamiento del sitio. Las opcionales solo se activan con tu permiso.</p></div>{consent&&<button className="icon-button" onClick={()=>setVisible(false)} aria-label="Cerrar preferencias"><X size={17}/></button>}</div>
      {customizing&&<div className="cookie-options">
        <label><span><strong>Esenciales</strong><small>Sesión, seguridad y preferencias básicas.</small></span><input type="checkbox" checked disabled aria-label="Cookies esenciales siempre activas"/></label>
        <label><span><strong>Analítica</strong><small>Ayuda a comprender el uso del sitio.</small></span><input type="checkbox" checked={analytics} onChange={event=>setAnalytics(event.target.checked)}/></label>
        <label><span><strong>Marketing</strong><small>Permite medir campañas y contenido promocional.</small></span><input type="checkbox" checked={marketing} onChange={event=>setMarketing(event.target.checked)}/></label>
      </div>}
      <p className="cookie-legal">Puedes cambiar tu decisión cuando quieras. Consulta la <Link href="/legal/cookies">política de cookies</Link>.</p>
      <div className="cookie-actions">
        {customizing?<><button className="button button-secondary" onClick={()=>save(false,false)}>Rechazar opcionales</button><button className="button button-primary" onClick={()=>save(analytics,marketing)}>Guardar preferencias</button></>:<><button className="button button-secondary" onClick={()=>setCustomizing(true)}>Configurar</button><button className="button button-secondary" onClick={()=>save(false,false)}>Solo esenciales</button><button className="button button-primary" onClick={()=>save(true,true)}>Aceptar todas</button></>}
      </div>
    </section>
  </div>;
}

export const cookiePreferencesEvent=OPEN_EVENT;
