"use client";

import {FormEvent,useEffect,useState} from "react";
import {getSupabaseClient,isSupabaseConfigured} from "@/lib/supabase/client";

type FormMode="login"|"recovery";

// Acceso y recuperación comparten el correo, pero mantienen estados separados
// para impedir envíos dobles y evitar revelar si una cuenta existe o no.
export default function LoginPage(){
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[mode,setMode]=useState<FormMode>("login");
  const[error,setError]=useState("");
  const[success,setSuccess]=useState(()=>typeof window!=="undefined"&&new URLSearchParams(window.location.search).get("password")==="updated"?"Contraseña actualizada. Ya puedes iniciar sesión.":"");
  const[loading,setLoading]=useState(false);

  useEffect(()=>{
    const client=getSupabaseClient();
    client?.auth.getSession().then(({data})=>{
      if(data.session)window.location.replace("/admin");
    });
  },[]);

  function changeMode(next:FormMode){
    setMode(next);
    setError("");
    setSuccess("");
  }

  async function submitLogin(event:FormEvent){
    event.preventDefault();
    const client=getSupabaseClient();
    if(!client){setError("No fue posible conectar con Supabase.");return}

    setLoading(true);setError("");setSuccess("");
    const{error:signInError}=await client.auth.signInWithPassword({email,password});
    setLoading(false);
    if(signInError){setError("No fue posible iniciar sesión. Revisa tus credenciales.");return}
    window.location.replace("/admin");
  }

  async function submitRecovery(event:FormEvent){
    event.preventDefault();
    const client=getSupabaseClient();
    if(!client){setError("No fue posible conectar con Supabase.");return}

    setLoading(true);setError("");setSuccess("");
    const redirectTo=`${window.location.origin}/admin/reset-password`;
    const{error:recoveryError}=await client.auth.resetPasswordForEmail(email,{redirectTo});
    setLoading(false);
    if(recoveryError){setError("No fue posible enviar el correo. Intenta nuevamente en unos minutos.");return}

    // Respuesta deliberadamente genérica para no confirmar qué correos existen.
    setSuccess("Si el correo está registrado, recibirás un enlace para crear una nueva contraseña.");
  }

  return <main className="admin-shell"><section className="admin-card">
    <p className="eyebrow">Administración privada</p>
    <h1>{mode==="login"?"Iniciar sesión":"Recuperar contraseña"}</h1>
    <p className="article-meta">{mode==="login"?"Acceso exclusivo para editores autorizados.":"Te enviaremos un enlace seguro para elegir una nueva contraseña."}</p>
    {!isSupabaseConfigured()&&<p className="notice">Modo demostración: falta conectar Supabase.</p>}

    <form className="form-stack" onSubmit={mode==="login"?submitLogin:submitRecovery}>
      <div className="form-field"><label htmlFor="email">Correo</label><input className="input" id="email" type="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} required/></div>
      {mode==="login"&&<div className="form-field"><label htmlFor="password">Contraseña</label><input className="input" id="password" type="password" autoComplete="current-password" minLength={8} value={password} onChange={event=>setPassword(event.target.value)} required/></div>}
      {error&&<p role="alert" className="notice">{error}</p>}
      {success&&<p role="status" className="notice">{success}</p>}
      <button className="button button-primary" disabled={loading}>{loading?"Procesando…":mode==="login"?"Entrar al panel":"Enviar enlace de recuperación"}</button>
      <button type="button" className="text-link" style={{border:0,background:"transparent",cursor:"pointer",padding:0,justifySelf:"start"}} onClick={()=>changeMode(mode==="login"?"recovery":"login")}>
        {mode==="login"?"¿Olvidaste tu contraseña?":"Volver al inicio de sesión"}
      </button>
    </form>
  </section></main>
}
