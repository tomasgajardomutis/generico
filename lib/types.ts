// Tipos compartidos entre las consultas públicas y el CMS.
export type ContentItem={id:string;slug:string;title:string;summary:string;body?:string;category?:string;published_at?:string;is_published?:boolean};
export type FaqItem={id:string;question:string;answer:string;sort_order:number;is_published?:boolean};
