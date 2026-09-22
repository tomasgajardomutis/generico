import type {MetadataRoute} from "next";
import {getNews,getPosts,getPublishedPages} from "@/lib/content";
import {getSiteUrl} from "@/lib/site-url";

const reservedPageSlugs=new Set(["home","nosotros","privacidad","terminos","cookies"]);

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=getSiteUrl();
 const[posts,news,pages]=await Promise.all([getPosts(),getNews(),getPublishedPages()]);
 const routes=["","/nosotros","/servicios","/noticias","/blog","/faq","/legal/privacidad","/legal/terminos","/legal/cookies"];
 const customPages=pages.filter(page=>!reservedPageSlugs.has(page.slug));
 return[
  ...routes.map(route=>({url:`${base}${route}`,lastModified:new Date(),changeFrequency:route===""?"weekly" as const:"monthly" as const,priority:route===""?1:.7})),
  ...customPages.map(page=>({url:`${base}/${page.slug}`,lastModified:new Date(page.updated_at??Date.now()),changeFrequency:"monthly" as const,priority:.6})),
  ...posts.map(post=>({url:`${base}/blog/${post.slug}`,lastModified:new Date(post.published_at!),changeFrequency:"monthly" as const,priority:.65})),
  ...news.map(item=>({url:`${base}/noticias/${item.slug}`,lastModified:new Date(item.published_at!),changeFrequency:"monthly" as const,priority:.65})),
 ];
}
