"use client";

import {FormEvent,useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {Eye,EyeOff,FileText,HelpCircle,LayoutTemplate,LogOut,Newspaper,Package,Pencil,Plus,Save,Search,Trash2,X} from "lucide-react";
import {demoFaqs,demoNews,demoPages,demoPosts,demoServices} from "@/lib/content";
import {PageContentFields} from "@/components/admin/page-content-fields";
import {PAGE_TYPE_DESCRIPTIONS,PAGE_TYPE_GROUPS,PAGE_TYPE_LABELS,isPageType} from "@/lib/page-types";
import {getSupabaseClient,isSupabaseConfigured} from "@/lib/supabase/client";

const modules=[
  {id:"pages",label:"Páginas",icon:LayoutTemplate},
  {id:"services",label:"Servicios",icon:Package},
  {id:"posts",label:"Blog",icon:FileText},
  {id:"news",label:"Noticias",icon:Newspaper},
  {id:"faqs",label:"FAQ",icon:HelpCircle},
] as const;

type ModuleId=typeof modules[number]["id"];
type CmsRow=Record<string,unknown>;
type EditorState={mode:"create"|"edit";values:CmsRow}|null;

const fallback:Record<ModuleId,CmsRow[]>={
  pages:Object.values(demoPages) as unknown as CmsRow[],
  services:demoServices as unknown as CmsRow[],
  posts:demoPosts as unknown as CmsRow[],
  news:demoNews as unknown as CmsRow[],
  faqs:demoFaqs as unknown as CmsRow[],
};

// Lista blanca de columnas editables. Los campos internos (id y timestamps)
// nunca se muestran ni se envían de vuelta a la API.
type EditorField={name:string;label:string;type?:"text"|"textarea"|"number"|"datetime-local"|"page-type"};
const editableFields:Record<ModuleId,EditorField[]>={
  pages:[
    {name:"page_type",label:"Tipo de página",type:"page-type"},
    {name:"title",label:"Título principal"},{name:"slug",label:"Identificador de página"},
    {name:"summary",label:"Introducción",type:"textarea"},{name:"body",label:"Contenido",type:"textarea"},
    {name:"seo_title",label:"Título SEO"},{name:"seo_description",label:"Descripción SEO",type:"textarea"},
    {name:"locale",label:"Idioma y región"},
  ],
  services:[
    {name:"title",label:"Título"},{name:"slug",label:"URL (slug)"},
    {name:"summary",label:"Resumen",type:"textarea"},{name:"body",label:"Contenido",type:"textarea"},
    {name:"category",label:"Categoría"},{name:"image_url",label:"URL de imagen"},
    {name:"sort_order",label:"Orden",type:"number"},
  ],
  posts:[
    {name:"title",label:"Título"},{name:"slug",label:"URL (slug)"},
    {name:"summary",label:"Resumen",type:"textarea"},{name:"body",label:"Contenido",type:"textarea"},
    {name:"category",label:"Categoría"},{name:"author_name",label:"Autor"},
    {name:"image_url",label:"URL de imagen"},{name:"seo_title",label:"Título SEO"},
    {name:"seo_description",label:"Descripción SEO",type:"textarea"},
    {name:"published_at",label:"Fecha de publicación",type:"datetime-local"},
  ],
  news:[
    {name:"title",label:"Título"},{name:"slug",label:"URL (slug)"},
    {name:"summary",label:"Resumen",type:"textarea"},{name:"body",label:"Contenido",type:"textarea"},
    {name:"category",label:"Categoría"},{name:"image_url",label:"URL de imagen"},
    {name:"published_at",label:"Fecha de publicación",type:"datetime-local"},
  ],
  faqs:[
    {name:"question",label:"Pregunta"},{name:"answer",label:"Respuesta",type:"textarea"},
    {name:"sort_order",label:"Orden",type:"number"},
  ],
};

function emptyItem(module:ModuleId,rowCount:number):CmsRow{
  if(module==="faqs")return{question:"",answer:"",sort_order:rowCount+1,is_published:false};
  if(module==="pages")return{page_type:"basic",content_data:{},title:"",slug:"",summary:"",body:"",seo_title:"",seo_description:"",locale:"es-CL",is_published:false};
  return{title:"",slug:"",summary:"",body:"",category:"",image_url:"",is_published:false,
    ...(module==="services"?{sort_order:rowCount+1}:{}),
    ...(module==="posts"?{author_name:"",seo_title:"",seo_description:"",published_at:""}:{}),
    ...(module==="news"?{published_at:""}:{}),
  };
}

function localDateTime(value:unknown){
  if(!value||typeof value!=="string")return"";
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return"";
  const offset=date.getTimezoneOffset()*60_000;
  return new Date(date.getTime()-offset).toISOString().slice(0,16);
}

// El dashboard usa la sesión del navegador. Supabase vuelve a aplicar RLS en
// cada lectura y escritura, incluso si alguien manipula el código del cliente.
export default function AdminPage(){
  const router=useRouter();
  const client=useMemo(()=>getSupabaseClient(),[]);
  const[ready,setReady]=useState(!client);
  const[active,setActive]=useState<ModuleId>("services");
  const[rows,setRows]=useState<CmsRow[]>(fallback.services);
  const[editor,setEditor]=useState<EditorState>(null);
  const[message,setMessage]=useState("");
  const[loading,setLoading]=useState(false);
  const[search,setSearch]=useState("");
  const[status,setStatus]=useState<"all"|"published"|"draft">("all");

  // El filtrado se ejecuta en memoria porque cada módulo del CMS contiene una
  // cantidad acotada de registros. Evita consultas extra mientras se escribe.
  const visibleRows=useMemo(()=>rows.filter(row=>{
    const label=String(row.title??row.question??"").toLocaleLowerCase("es");
    const matchesText=label.includes(search.trim().toLocaleLowerCase("es"));
    const published=row.is_published!==false;
    const matchesStatus=status==="all"||(status==="published"?published:!published);
    return matchesText&&matchesStatus;
  }),[rows,search,status]);

  useEffect(()=>{
    client?.auth.getSession().then(({data})=>{
      if(!data.session)router.replace("/admin/login");
      else setReady(true);
    });
  },[client,router]);

  useEffect(()=>{
    if(!ready||!client)return;
    const ordered=active==="faqs"||active==="services";
    client.from(active).select("*").order(ordered?"sort_order":"created_at",{ascending:ordered})
      .then(({data,error})=>{
        setLoading(false);
        if(error){setMessage(`No fue posible cargar el contenido: ${error.message}`);return}
        setRows(data??[]);
      });
  },[active,ready,client]);

  function changeModule(id:ModuleId){
    setActive(id);setEditor(null);setMessage("");setSearch("");setStatus("all");setLoading(Boolean(client));
    if(!client)setRows(fallback[id]);
  }

  function openCreate(){setEditor({mode:"create",values:emptyItem(active,rows.length)});setMessage("")}
  function openEdit(row:CmsRow){
    const values={...row};
    if("published_at" in values)values.published_at=localDateTime(values.published_at);
    setEditor({mode:"edit",values});setMessage("");
  }

  function setField(name:string,value:unknown){
    setEditor(current=>current?{...current,values:{...current.values,[name]:value}}:current);
  }

  async function save(event:FormEvent){
    event.preventDefault();
    if(!client||!editor){setMessage("No fue posible conectar con Supabase.");return}
    setLoading(true);setMessage("");

    // Se construye una lista blanca para impedir cambios en columnas internas.
    const payload=Object.fromEntries(editableFields[active].map(field=>{
      let value=editor.values[field.name]??"";
      if(field.type==="number")value=Number(value)||0;
      if(field.type==="datetime-local")value=value?new Date(String(value)).toISOString():null;
      return[field.name,value];
    }));
    // content_data es JSONB y contiene únicamente los campos específicos de
    // la plantilla. Se conserva separado de los metadatos comunes de página.
    if(active==="pages")payload.content_data=editor.values.content_data??{};
    // Los textos obligatorios se normalizan antes de escribir. Esto evita FAQ
    // vacías o preguntas compuestas solo por espacios.
    for(const field of editableFields[active]){
      if(["title","slug","question","answer"].includes(field.name)&&!String(payload[field.name]??"").trim()){
        setLoading(false);setMessage(`Completa el campo ${field.label.toLowerCase()}.`);return;
      }
      if(typeof payload[field.name]==="string")payload[field.name]=String(payload[field.name]).trim();
    }
    const writable={...payload,is_published:Boolean(editor.values.is_published)};
    const query=editor.mode==="create"
      ?client.from(active).insert(writable)
      :client.from(active).update(writable).eq("id",String(editor.values.id));
    const{data,error}=await query.select("*").single();
    setLoading(false);
    if(error){setMessage(`No fue posible guardar: ${error.message}`);return}

    setRows(current=>{
      const updated=editor.mode==="create"?[data,...current]:current.map(row=>row.id===data.id?data:row);
      return active==="faqs"||active==="services"
        ?updated.toSorted((a,b)=>Number(a.sort_order??0)-Number(b.sort_order??0))
        :updated;
    });
    setEditor(null);setMessage("Cambios guardados correctamente.");
  }

  async function remove(id:unknown){
    if(!client||typeof id!=="string"){setMessage("Acción disponible al conectar Supabase.");return}
    if(!confirm("¿Eliminar este contenido? Esta acción no se puede deshacer."))return;
    setLoading(true);setMessage("");
    const{error}=await client.from(active).delete().eq("id",id);
    setLoading(false);
    if(error)setMessage(`No fue posible eliminar: ${error.message}`);
    else{setRows(current=>current.filter(row=>row.id!==id));setMessage("Contenido eliminado.")}
  }

  // Publicación rápida desde la tabla. La política RLS vuelve a validar que la
  // sesión pertenece a un administrador antes de modificar el registro.
  async function togglePublished(row:CmsRow){
    if(!client||typeof row.id!=="string"){setMessage("Acción disponible al conectar Supabase.");return}
    const next=row.is_published===false;
    setLoading(true);setMessage("");
    const{data,error}=await client.from(active).update({is_published:next}).eq("id",row.id).select("*").single();
    setLoading(false);
    if(error){setMessage(`No fue posible cambiar el estado: ${error.message}`);return}
    setRows(current=>current.map(item=>item.id===data.id?data:item));
    setMessage(next?"Contenido publicado correctamente.":"Contenido guardado como borrador.");
  }

  async function logout(){await client?.auth.signOut();router.replace("/admin/login")}

  if(!ready)return <main className="admin-shell"><section className="admin-card">Validando sesión…</section></main>;

  return <main className="admin-layout">
    <aside className="admin-sidebar">
      <p className="eyebrow">CMS Nexo</p><h2>Contenido</h2>
      <nav className="admin-nav">{modules.map(module=><button className={`chip ${active===module.id?"active":""}`} key={module.id} onClick={()=>changeModule(module.id)}><module.icon size={15}/> {module.label}</button>)}</nav>
      <button className="button button-secondary" style={{marginTop:"1rem"}} onClick={logout}><LogOut size={16}/> Salir</button>
    </aside>
    <section className="admin-main">
      <div className="stat-grid">{modules.map(module=><div className="stat-card" key={module.id}><span>{module.label}</span><strong>{active===module.id?rows.length:"—"}</strong></div>)}</div>
      <div className="section">
        <div className="admin-toolbar"><div><p className="eyebrow">Editor</p><h1>{modules.find(module=>module.id===active)?.label}</h1></div><button className="button button-primary" onClick={openCreate}><Plus size={17}/> Crear</button></div>
        {!isSupabaseConfigured()&&<p className="notice">Vista de demostración. Configura Supabase para habilitar operaciones persistentes.</p>}
        {message&&<p className="notice" role="status">{message}</p>}
        <div className="admin-filters">
          <label className="admin-search"><Search size={17}/><span className="sr-only">Buscar contenido</span><input value={search} onChange={event=>setSearch(event.target.value)} placeholder={active==="faqs"?"Buscar una pregunta…":"Buscar contenido…"}/></label>
          <label className="admin-status"><span>Estado</span><select value={status} onChange={event=>setStatus(event.target.value as typeof status)}><option value="all">Todos</option><option value="published">Publicados</option><option value="draft">Borradores</option></select></label>
          <span className="admin-result-count">{visibleRows.length} de {rows.length}</span>
        </div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr>{active==="faqs"&&<th>Orden</th>}<th>Título / pregunta</th>{active==="pages"&&<th>Tipo</th>}<th>Estado</th><th>Acciones</th></tr></thead><tbody>
          {visibleRows.map(row=><tr key={String(row.id)}>{active==="faqs"&&<td>{String(row.sort_order??"—")}</td>}<td>{String(row.title??row.question??"Sin título")}</td>{active==="pages"&&<td>{PAGE_TYPE_LABELS[isPageType(row.page_type)?row.page_type:"basic"]}</td>}<td><span className={`status-badge ${row.is_published===false?"draft":"published"}`}>{row.is_published===false?"Borrador":"Publicado"}</span></td><td><div className="admin-actions"><button className="icon-button" onClick={()=>togglePublished(row)} aria-label={row.is_published===false?"Publicar":"Pasar a borrador"} title={row.is_published===false?"Publicar":"Pasar a borrador"}>{row.is_published===false?<Eye size={16}/>:<EyeOff size={16}/>}</button><button className="icon-button" onClick={()=>openEdit(row)} aria-label="Editar" title="Editar"><Pencil size={16}/></button><button className="icon-button danger" onClick={()=>remove(row.id)} aria-label="Eliminar" title="Eliminar"><Trash2 size={16}/></button></div></td></tr>)}
          {!loading&&visibleRows.length===0&&<tr><td colSpan={active==="faqs"||active==="pages"?4:3}>{rows.length===0?"Aún no hay contenido en este módulo.":"No hay resultados para estos filtros."}</td></tr>}
        </tbody></table></div>
        {loading&&!editor&&<p className="article-meta">Cargando contenido…</p>}
      </div>
    </section>

    {editor&&<div className="editor-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setEditor(null)}}>
      <section className="editor-panel" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <div className="editor-heading"><div><p className="eyebrow">{editor.mode==="create"?"Nuevo contenido":"Editar contenido"}</p><h2 id="editor-title">{modules.find(module=>module.id===active)?.label}</h2></div><button className="icon-button" onClick={()=>setEditor(null)} aria-label="Cerrar editor"><X size={18}/></button></div>
        <form className="editor-form" onSubmit={save}>
          {editableFields[active].map(field=><div className={`form-field ${field.type==="textarea"?"editor-field-wide":""}`} key={field.name}>
            <label htmlFor={`field-${field.name}`}>{field.label}</label>
            {field.type==="page-type"
              ?<><select className="input" id={`field-${field.name}`} value={String(editor.values[field.name]??"basic")} onChange={event=>setField(field.name,event.target.value)} required>{PAGE_TYPE_GROUPS.map(group=><optgroup label={group.label} key={group.label}>{group.options.map(option=><option value={option.value} key={option.value}>{option.label}</option>)}</optgroup>)}</select><small className="field-help">{PAGE_TYPE_DESCRIPTIONS[isPageType(editor.values.page_type)?editor.values.page_type:"basic"]}</small></>
              :field.type==="textarea"
              ?<textarea className="input editor-textarea" id={`field-${field.name}`} value={String(editor.values[field.name]??"")} onChange={event=>setField(field.name,event.target.value)} required={field.name==="summary"||field.name==="body"||field.name==="answer"}/>
              :<input className="input" id={`field-${field.name}`} type={field.type??"text"} value={String(editor.values[field.name]??"")} onChange={event=>setField(field.name,event.target.value)} required={["title","slug","question"].includes(field.name)}/>}
          </div>)}
          {active==="pages"&&<PageContentFields pageType={isPageType(editor.values.page_type)?editor.values.page_type:"basic"} value={editor.values.content_data} onChange={value=>setField("content_data",value)}/>}
          <label className="publish-toggle"><input type="checkbox" checked={Boolean(editor.values.is_published)} onChange={event=>setField("is_published",event.target.checked)}/><span>Publicar contenido</span></label>
          <div className="editor-footer"><button type="button" className="button button-secondary" onClick={()=>setEditor(null)}>Cancelar</button><button className="button button-primary" disabled={loading}><Save size={17}/>{loading?"Guardando…":"Guardar cambios"}</button></div>
        </form>
      </section>
    </div>}
  </main>;
}
