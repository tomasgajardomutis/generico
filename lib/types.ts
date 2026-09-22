// Tipos compartidos entre las consultas públicas y el CMS.
export type ContentItem={id:string;slug:string;title:string;summary:string;body?:string;category?:string;author_name?:string;image_url?:string;seo_title?:string;seo_description?:string;published_at?:string;is_published?:boolean};
export type FaqItem={id:string;question:string;answer:string;sort_order:number;is_published?:boolean};
export type PageItem={id:string;slug:string;title:string;summary:string;body:string;seo_title?:string;seo_description?:string;locale:string;is_published:boolean;updated_at?:string};
