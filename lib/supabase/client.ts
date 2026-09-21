import {createClient,SupabaseClient} from "@supabase/supabase-js";

// Respaldo público para este despliegue. Supabase diseña la publishable key
// para clientes web; las políticas RLS siguen autorizando cada operación.
const deployedSupabaseUrl="https://qmdmtfvskwfhrpzvnlwi.supabase.co";
const deployedPublishableKey="sb_publishable_dQKXy50ifJoXZR0O2nKYPw_36TotdYx";

function validSupabaseUrl(value:string|undefined){
  try{
    const parsed=new URL(value?.trim()||"");
    return parsed.protocol==="https:"&&parsed.hostname.endsWith(".supabase.co");
  }catch{return false}
}

function validPublishableKey(value:string|undefined){
  const key=value?.trim()||"";
  return key.startsWith("sb_publishable_")||key.startsWith("eyJ");
}

// Comparte únicamente la configuración pública entre el cliente del navegador
// y las consultas públicas ejecutadas por Server Components.
export function getSupabasePublicConfig(){
  const configuredUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const configuredKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return{
    url:validSupabaseUrl(configuredUrl)?configuredUrl!.trim():deployedSupabaseUrl,
    key:validPublishableKey(configuredKey)?configuredKey!.trim():deployedPublishableKey,
  };
}

// Singleton del navegador. La publishable key es pública por diseño; la seguridad real vive en RLS.
let browserClient:SupabaseClient|null=null;
export function getSupabaseClient(){
  const{url,key}=getSupabasePublicConfig();
  if(!url||!key)return null;
  browserClient??=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  return browserClient;
}
export const isSupabaseConfigured=()=>true;
