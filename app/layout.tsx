import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CookieConsent } from "@/components/site/cookie-consent";
import { getSiteUrl } from "@/lib/site-url";
import { getNavigationPages } from "@/lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Nexo | Plataforma digital moderna", template: "%s | Nexo" },
  description: "Base full-stack moderna con CMS, seguridad y despliegue global en Cloudflare.",
  alternates: { canonical: "/", languages: { "es-CL": "/", es: "/" } },
  openGraph: { type: "website", locale: "es_CL", siteName: "Nexo", title: "Nexo | Plataforma digital moderna", description: "Arquitectura moderna, contenido administrable y seguridad desde el primer día." },
  twitter: { card: "summary_large_image", title: "Nexo", description: "Una base sólida para productos digitales." },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fixedLinks=[{label:"Inicio",href:"/",order:0},{label:"Nosotros",href:"/nosotros",order:10},{label:"Servicios",href:"/servicios",order:20},{label:"Noticias",href:"/noticias",order:30},{label:"Blog",href:"/blog",order:40},{label:"FAQ",href:"/faq",order:50}];
  const fixedPaths=new Set(fixedLinks.map(link=>link.href));
  const cmsLinks=(await getNavigationPages()).map(page=>({label:page.menu_label?.trim()||page.title,href:page.slug==="home"?"/":`/${page.slug}`,order:page.menu_order??100})).filter(link=>!fixedPaths.has(link.href));
  const navigationLinks=[...fixedLinks,...cmsLinks].toSorted((first,second)=>first.order-second.order).map(({label,href})=>({label,href}));
  return (
    <html lang="es-CL" suppressHydrationWarning>
      <body className="antialiased"><Header links={navigationLinks}/>{children}<Footer /><CookieConsent /></body>
    </html>
  );
}
