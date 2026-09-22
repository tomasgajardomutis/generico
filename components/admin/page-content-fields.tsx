"use client";
/* eslint-disable @next/next/no-img-element -- Admin previews use dynamic Supabase Storage URLs. */

import {useState} from "react";
import {ImagePlus,Trash2,Upload} from "lucide-react";
import {PAGE_CONTENT_FIELDS,getGalleryItems,normalizePageContent,type GalleryItem,type PageContentData,type PageContentValue} from "@/lib/page-content";
import type {PageType} from "@/lib/page-types";
import {getSupabaseClient} from "@/lib/supabase/client";

type Props={pageType:PageType;value:unknown;onChange:(value:PageContentData)=>void};

// Editor estructurado por plantilla. Mantiene el JSON completo al cambiar de
// tipo para que un cambio accidental no elimine información ya cargada.
export function PageContentFields({pageType,value,onChange}:Props){
  const data=normalizePageContent(value);
  const[uploading,setUploading]=useState("");
  const[error,setError]=useState("");

  function update(name:string,next:PageContentValue){onChange({...data,[name]:next})}

  async function uploadImage(file:File,fieldName:string){
    const client=getSupabaseClient();
    if(!client)throw new Error("Supabase no está configurado.");
    if(!file.type.startsWith("image/"))throw new Error("Selecciona un archivo de imagen.");
    if(file.size>6*1024*1024)throw new Error("La imagen no puede superar 6 MB.");
    const extension=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");
    const path=`pages/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${extension}`;
    setUploading(fieldName);setError("");
    const{error:uploadError}=await client.storage.from("page-media").upload(path,file,{cacheControl:"3600",upsert:false,contentType:file.type});
    if(uploadError)throw uploadError;
    return client.storage.from("page-media").getPublicUrl(path).data.publicUrl;
  }

  async function handleSingleFile(file:File|undefined,name:string){
    if(!file)return;
    try{update(name,await uploadImage(file,name))}catch(reason){setError(reason instanceof Error?reason.message:"No fue posible cargar la imagen.")}finally{setUploading("")}
  }

  async function handleGalleryFiles(files:FileList|null){
    if(!files?.length)return;
    try{
      const current=getGalleryItems(data);const added:GalleryItem[]=[];
      for(const file of Array.from(files))added.push({url:await uploadImage(file,"gallery_items"),alt:"",caption:""});
      update("gallery_items",[...current,...added]);
    }catch(reason){setError(reason instanceof Error?reason.message:"No fue posible cargar las imágenes.")}finally{setUploading("")}
  }

  function updateGallery(index:number,key:keyof GalleryItem,next:string){
    update("gallery_items",getGalleryItems(data).map((item,itemIndex)=>itemIndex===index?{...item,[key]:next}:item));
  }

  function removeGallery(index:number){update("gallery_items",getGalleryItems(data).filter((_,itemIndex)=>itemIndex!==index))}

  return <fieldset className="page-content-fields">
    <legend>Contenido específico de la plantilla</legend>
    <p className="field-help">Estos campos cambian según el tipo de página seleccionado.</p>
    {error&&<p className="upload-error" role="alert">{error}</p>}
    <div className="page-content-grid">
      {PAGE_CONTENT_FIELDS[pageType].map(field=>{
        const fieldValue=data[field.name];
        if(field.type==="gallery"){
          const items=getGalleryItems(data);
          return <div className="form-field editor-field-wide" key={field.name}>
            <label>{field.label}</label>
            <label className="media-upload"><ImagePlus size={18}/><span>{uploading===field.name?"Cargando imágenes…":"Seleccionar imágenes"}</span><input type="file" accept="image/*" multiple disabled={Boolean(uploading)} onChange={event=>handleGalleryFiles(event.target.files)}/></label>
            {field.help&&<small className="field-help">{field.help}</small>}
            <div className="gallery-editor">{items.map((item,index)=><article className="gallery-editor-item" key={`${item.url}-${index}`}>
              <img src={item.url} alt={item.alt||"Vista previa"}/>
              <div><input className="input" value={item.alt} placeholder="Texto alternativo" aria-label={`Texto alternativo de imagen ${index+1}`} onChange={event=>updateGallery(index,"alt",event.target.value)}/><input className="input" value={item.caption} placeholder="Descripción o pie de foto" aria-label={`Descripción de imagen ${index+1}`} onChange={event=>updateGallery(index,"caption",event.target.value)}/></div>
              <button type="button" className="icon-button danger" onClick={()=>removeGallery(index)} aria-label={`Eliminar imagen ${index+1}`}><Trash2 size={16}/></button>
            </article>)}</div>
          </div>;
        }
        if(field.type==="image")return <div className="form-field editor-field-wide" key={field.name}>
          <label htmlFor={`page-content-${field.name}`}>{field.label}</label>
          <div className="image-field"><input className="input" id={`page-content-${field.name}`} type="url" value={typeof fieldValue==="string"?fieldValue:""} placeholder="https://…" onChange={event=>update(field.name,event.target.value)}/><label className="media-upload compact"><Upload size={17}/><span>{uploading===field.name?"Cargando…":"Subir"}</span><input type="file" accept="image/*" disabled={Boolean(uploading)} onChange={event=>handleSingleFile(event.target.files?.[0],field.name)}/></label></div>
          {typeof fieldValue==="string"&&fieldValue&&<div className="image-preview"><img src={fieldValue} alt="Vista previa del contenido"/></div>}
          {field.help&&<small className="field-help">{field.help}</small>}
        </div>;
        if(field.type==="checkbox")return <label className="publish-toggle" key={field.name}><input type="checkbox" checked={Boolean(fieldValue)} onChange={event=>update(field.name,event.target.checked)}/><span>{field.label}</span></label>;
        if(field.type==="textarea")return <div className="form-field editor-field-wide" key={field.name}><label htmlFor={`page-content-${field.name}`}>{field.label}</label><textarea className="input editor-textarea" id={`page-content-${field.name}`} value={typeof fieldValue==="string"?fieldValue:""} placeholder={field.placeholder} onChange={event=>update(field.name,event.target.value)}/>{field.help&&<small className="field-help">{field.help}</small>}</div>;
        return <div className="form-field" key={field.name}><label htmlFor={`page-content-${field.name}`}>{field.label}</label><input className="input" id={`page-content-${field.name}`} type={field.type} value={typeof fieldValue==="string"||typeof fieldValue==="number"?fieldValue:""} placeholder={field.placeholder} min={field.type==="number"?0:undefined} onChange={event=>update(field.name,field.type==="number"?Number(event.target.value):event.target.value)}/>{field.help&&<small className="field-help">{field.help}</small>}</div>;
      })}
    </div>
  </fieldset>;
}
