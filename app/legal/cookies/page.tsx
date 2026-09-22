import type {Metadata} from "next";
import {EditablePageBody} from "@/components/site/editable-page-body";
import {CookieSettingsButton} from "@/components/site/cookie-settings-button";
import {getPage} from "@/lib/content";

export async function generateMetadata():Promise<Metadata>{
  const page=await getPage("cookies");
  return{title:page?.seo_title??page?.title,description:page?.seo_description??page?.summary,alternates:{canonical:"/legal/cookies"}};
}

export default async function CookiesPage(){
  const page=await getPage("cookies");
  return <main className="section page-container prose-page"><p className="eyebrow">Legal</p><h1>{page?.title}</h1><p className="hero-lead">{page?.summary}</p><EditablePageBody body={page?.body??""}/><div className="cookie-page-action"><CookieSettingsButton/></div></main>;
}
