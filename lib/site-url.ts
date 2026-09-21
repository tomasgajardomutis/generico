const deployedSiteUrl = "https://generico.tomas-gajardo-mutis.workers.dev";

// Normaliza la URL pública y evita que una variable mal formada impida que el
// Worker arranque. Solo se aceptan orígenes HTTP(S), sin rutas adicionales.
export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    const parsed = new URL(configured || deployedSiteUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return deployedSiteUrl;
    }
    return parsed.origin;
  } catch {
    return deployedSiteUrl;
  }
}
