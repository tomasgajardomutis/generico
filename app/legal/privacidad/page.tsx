import type {Metadata} from "next";
import {EditablePageBody} from "@/components/site/editable-page-body";
import {getPage} from "@/lib/content";

export async function generateMetadata():Promise<Metadata>{
  const page=await getPage("privacidad");
  return{title:page?.seo_title??page?.title,description:page?.seo_description??page?.summary,robots:{index:true,follow:true}};
}

export default async function PrivacyPage(){
  const page=await getPage("privacidad");
  return <main className="section page-container prose-page"><p className="eyebrow">Legal</p><h1>{page?.title}</h1><p>{page?.summary}</p><EditablePageBody body={page?.body??""}/></main>;
}
