import type {Metadata} from "next";
import {EditablePageBody} from "@/components/site/editable-page-body";
import {getPage} from "@/lib/content";

export async function generateMetadata():Promise<Metadata>{
  const page=await getPage("terminos");
  return{title:page?.seo_title??page?.title,description:page?.seo_description??page?.summary};
}

export default async function TermsPage(){
  const page=await getPage("terminos");
  return <main className="section page-container prose-page"><p className="eyebrow">Legal</p><h1>{page?.title}</h1><p>{page?.summary}</p><EditablePageBody body={page?.body??""}/></main>;
}
