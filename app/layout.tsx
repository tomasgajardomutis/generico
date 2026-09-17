import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://fullstack-cloudflare-supabase-starter.sites.openai.com"),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" suppressHydrationWarning>
      <body className="antialiased"><Header />{children}<Footer /></body>
    </html>
  );
}
