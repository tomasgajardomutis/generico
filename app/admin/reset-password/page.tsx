"use client";

import {FormEvent,useEffect,useState} from "react";
import {getSupabaseClient} from "@/lib/supabase/client";

// Supabase abre esta ruta desde el correo y entrega una sesión temporal de
// recuperación. Solo con esa sesión se permite establecer la nueva contraseña.
export default function ResetPasswordPage(){
  const[password,setPassword]=useState("");
  const[confirmation,setConfirmation]=useState("");
  const[ready,setReady]=useState(false);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");

  useEffect(()=>{
    const client=getSupabaseClient();
    if(!client)return;

    let active=true;
    client.auth.getSession().then(({data})=>{if(active&&data.session)setReady(true)});
    const{data:{subscription}}=client.auth.onAuthStateChange((event,session)=>{
      if(active&&(event==="PASSWORD_RECOVERY"||session))setReady(true);
    });
    return()=>{active=false;subscription.unsubscribe()};
  },[]);

  async function submit(event:FormEvent){
    event.preventDefault();
    if(password!==confirmation){setError("Las contraseñas no coinciden.");return}
    if(password.length<10){setError("La contraseña debe tener al menos 10 caracteres.");return}

    const client=getSupabaseClient();
    if(!client||!ready){setError("El enlace es inválido o expiró. Solicita uno nuevo.");return}

    setLoading(true);setError("");
    const{error:updateError}=await client.auth.updateUser({password});
    if(updateError){setLoading(false);setError("No fue posible actualizar la contraseña. Solicita un enlace nuevo.");return}

    await client.auth.signOut();
    window.location.replace("/admin/login?password=updated");
  }

  return <main className="admin-shell"><section className="admin-card">
    <p className="eyebrow">Administración privada</p>
    <h1>Nueva contraseña</h1>
    <p className="article-meta">Crea una contraseña de al menos 10 caracteres.</p>
    {!ready&&!error&&<p className="notice" role="status">Validando el enlace de recuperación…</p>}
    <form className="form-stack" onSubmit={submit}>
      <div className="form-field"><label htmlFor="password">Nueva contraseña</label><input className="input" id="password" type="password" autoComplete="new-password" minLength={10} value={password} onChange={event=>setPassword(event.target.value)} required/></div>
      <div className="form-field"><label htmlFor="confirmation">Confirmar contraseña</label><input className="input" id="confirmation" type="password" autoComplete="new-password" minLength={10} value={confirmation} onChange={event=>setConfirmation(event.target.value)} required/></div>
      {error&&<p role="alert" className="notice">{error}</p>}
      <button className="button button-primary" disabled={loading||!ready}>{loading?"Actualizando…":"Guardar nueva contraseña"}</button>
      <a className="text-link" href="/admin/login">Volver al inicio de sesión</a>
    </form>
  </section></main>
}
