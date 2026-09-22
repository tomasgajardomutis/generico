import type {PageType} from "./page-types";

// Los campos específicos viven en pages.content_data (JSONB). Este catálogo
// alimenta el editor y documenta qué información admite cada plantilla.
export type PageContentValue=string|number|boolean|GalleryItem[];
export type PageContentData=Record<string,PageContentValue>;
export type GalleryItem={url:string;alt:string;caption:string};
export type PageContentField={
  name:string;
  label:string;
  type:"text"|"textarea"|"email"|"url"|"number"|"date"|"checkbox"|"image"|"gallery";
  help?:string;
  placeholder?:string;
};

export const PAGE_CONTENT_FIELDS:Record<PageType,PageContentField[]>={
  basic:[
    {name:"featured_image_url",label:"Imagen principal",type:"image",help:"Imagen opcional para acompañar el contenido."},
    {name:"image_alt",label:"Texto alternativo",type:"text",help:"Describe la imagen para accesibilidad y SEO."},
  ],
  contact:[
    {name:"email",label:"Correo de contacto",type:"email",placeholder:"contacto@empresa.cl"},
    {name:"phone",label:"Teléfono",type:"text",placeholder:"+56 2 2345 6789"},
    {name:"address",label:"Dirección",type:"textarea"},
    {name:"opening_hours",label:"Horario de atención",type:"textarea"},
    {name:"map_url",label:"URL del mapa",type:"url",help:"Enlace HTTPS de Google Maps u OpenStreetMap."},
    {name:"social_links",label:"Redes sociales",type:"textarea",help:"Una dirección web por línea."},
  ],
  blog_archive:[
    {name:"posts_per_page",label:"Artículos por página",type:"number"},
    {name:"default_category",label:"Categoría inicial",type:"text"},
    {name:"featured_image_url",label:"Imagen de cabecera",type:"image"},
  ],
  catalog:[
    {name:"items_per_page",label:"Elementos por página",type:"number"},
    {name:"currency",label:"Moneda",type:"text",placeholder:"CLP"},
    {name:"show_price_filter",label:"Mostrar filtro de precio",type:"checkbox"},
    {name:"featured_image_url",label:"Imagen de cabecera",type:"image"},
  ],
  gallery:[
    {name:"gallery_description",label:"Descripción de la galería",type:"textarea"},
    {name:"gallery_items",label:"Imágenes",type:"gallery",help:"Carga imágenes y agrega texto alternativo y pie de foto."},
  ],
  blog_post:[
    {name:"author_name",label:"Autor",type:"text"},
    {name:"published_at",label:"Fecha de publicación",type:"date"},
    {name:"category",label:"Categoría",type:"text"},
    {name:"tags",label:"Etiquetas",type:"text",help:"Separadas por comas."},
    {name:"featured_image_url",label:"Imagen destacada",type:"image"},
    {name:"image_alt",label:"Texto alternativo",type:"text"},
    {name:"allow_comments",label:"Permitir comentarios",type:"checkbox"},
  ],
  product_detail:[
    {name:"sku",label:"SKU",type:"text"},{name:"brand",label:"Marca",type:"text"},
    {name:"price",label:"Precio",type:"number"},{name:"currency",label:"Moneda",type:"text",placeholder:"CLP"},
    {name:"stock",label:"Stock disponible",type:"number"},{name:"sizes",label:"Tallas o variantes",type:"text",help:"Separadas por comas."},
    {name:"colors",label:"Colores",type:"text",help:"Separados por comas."},
    {name:"specifications",label:"Especificaciones técnicas",type:"textarea"},
    {name:"gallery_items",label:"Galería del producto",type:"gallery"},
    {name:"cta_label",label:"Texto del botón",type:"text",placeholder:"Solicitar información"},
    {name:"cta_url",label:"Destino del botón",type:"url"},
  ],
  project_detail:[
    {name:"client",label:"Cliente",type:"text"},{name:"project_date",label:"Fecha del proyecto",type:"date"},
    {name:"tools",label:"Herramientas utilizadas",type:"text",help:"Separadas por comas."},
    {name:"results",label:"Resultados",type:"textarea"},{name:"project_url",label:"URL del proyecto",type:"url"},
    {name:"gallery_items",label:"Galería del proyecto",type:"gallery"},
  ],
  search_results:[
    {name:"search_placeholder",label:"Texto del buscador",type:"text",placeholder:"Buscar en el sitio…"},
    {name:"empty_message",label:"Mensaje sin resultados",type:"textarea"},
  ],
  not_found:[
    {name:"featured_image_url",label:"Imagen de error",type:"image"},
    {name:"image_alt",label:"Texto alternativo",type:"text"},
    {name:"button_label",label:"Texto del botón",type:"text",placeholder:"Volver al inicio"},
    {name:"button_url",label:"Destino del botón",type:"text",placeholder:"/"},
  ],
  private_account:[
    {name:"featured_image_url",label:"Imagen de acceso",type:"image"},
    {name:"login_label",label:"Texto del botón",type:"text",placeholder:"Ingresar de forma segura"},
    {name:"login_url",label:"Ruta de acceso",type:"text",placeholder:"/admin/login"},
    {name:"support_email",label:"Correo de soporte",type:"email"},
  ],
};

export function normalizePageContent(value:unknown):PageContentData{
  return value&&typeof value==="object"&&!Array.isArray(value)?value as PageContentData:{};
}

export function getGalleryItems(data:PageContentData):GalleryItem[]{
  return Array.isArray(data.gallery_items)?data.gallery_items.filter(item=>item&&typeof item.url==="string"):[];
}
