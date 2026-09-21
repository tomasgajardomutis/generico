import {createClient,SupabaseClient} from "@supabase/supabase-js";
import {getSupabasePublicConfig} from "./client";

// Cliente de solo lectura para contenido público. No persiste sesiones ni usa
// claves privilegiadas: todas las consultas siguen sujetas a las políticas RLS.
let publicClient:SupabaseClient|null=null;
export function getSupabasePublicClient(){
  const{url,key}=getSupabasePublicConfig();
  publicClient??=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  return publicClient;
}
