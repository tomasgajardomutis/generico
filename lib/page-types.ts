// Catálogo único de plantillas compartido por el CMS y el sitio público.
export type PageType=
  |"basic"|"contact"|"blog_archive"|"catalog"|"gallery"
  |"blog_post"|"product_detail"|"project_detail"
  |"search_results"|"not_found"|"private_account";

export const PAGE_TYPE_GROUPS=[
  {label:"Contenido estático e informativo",options:[
    {value:"basic",label:"Página básica / Contenido",description:"Texto e imágenes para páginas institucionales, legales o informativas."},
    {value:"contact",label:"Contacto",description:"Estructura para información de contacto, formulario, mapa y redes sociales."},
  ]},
  {label:"Estructura dinámica",options:[
    {value:"blog_archive",label:"Blog / Archivo de noticias",description:"Listado cronológico con búsqueda, categorías y paginación."},
    {value:"catalog",label:"Catálogo / Tienda",description:"Rejilla de elementos con búsqueda, filtros y ordenamiento."},
    {value:"gallery",label:"Galería / Portafolio",description:"Presentación visual en cuadrícula para imágenes, videos o proyectos."},
  ]},
  {label:"Páginas de detalle",options:[
    {value:"blog_post",label:"Artículo de blog",description:"Lectura individual con autor, fecha y contenido relacionado."},
    {value:"product_detail",label:"Ficha de producto",description:"Detalle orientado a producto, especificaciones y conversión."},
    {value:"project_detail",label:"Detalle de proyecto / Portafolio",description:"Caso de éxito con descripción, herramientas y resultados."},
  ]},
  {label:"Sistema y flujos",options:[
    {value:"search_results",label:"Resultados de búsqueda",description:"Buscador que reúne coincidencias del contenido público."},
    {value:"not_found",label:"Página de error 404",description:"Contenido utilizado cuando una dirección no existe."},
    {value:"private_account",label:"Área privada / Mi cuenta",description:"Portada de acceso para contenido asociado a una sesión."},
  ]},
] as const;

export const PAGE_TYPE_OPTIONS=PAGE_TYPE_GROUPS.flatMap(group=>group.options);
export const PAGE_TYPE_LABELS=Object.fromEntries(PAGE_TYPE_OPTIONS.map(option=>[option.value,option.label])) as Record<PageType,string>;
export const PAGE_TYPE_DESCRIPTIONS=Object.fromEntries(PAGE_TYPE_OPTIONS.map(option=>[option.value,option.description])) as Record<PageType,string>;

export function isPageType(value:unknown):value is PageType{
  return typeof value==="string"&&PAGE_TYPE_OPTIONS.some(option=>option.value===value);
}
