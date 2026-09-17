import {createClient,SupabaseClient} from "@supabase/supabase-js";

// Respaldo público para este despliegue. Supabase diseña la publishable key
// para clientes web; las políticas RLS siguen autorizando cada operación.
const deployedSupabaseUrl="https://qmdmtfvskwfhrpzvnlwi.supabase.co";
const deployedPublishableKey="sb_publishable_dQKXy50ifJoXZR0O2nKYPw_36TotdYx";

// Singleton del navegador. La publishable key es pública por diseño; la seguridad real vive en RLS.
let browserClient:SupabaseClient|null=null;
export function getSupabaseClient(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL||deployedSupabaseUrl;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||deployedPublishableKey;
  if(!url||!key)return null;
  browserClient??=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  return browserClient;
}
export const isSupabaseConfigured=()=>Boolean(
  (process.env.NEXT_PUBLIC_SUPABASE_URL||deployedSupabaseUrl)&&
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||deployedPublishableKey)
);
