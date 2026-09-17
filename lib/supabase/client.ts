import {createClient,SupabaseClient} from "@supabase/supabase-js";

// Singleton del navegador. La publishable key es pública por diseño; la seguridad real vive en RLS.
let browserClient:SupabaseClient|null=null;
export function getSupabaseClient(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key)return null;
  browserClient??=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  return browserClient;
}
export const isSupabaseConfigured=()=>Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
