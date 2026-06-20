/** Canonical public site URL (production: https://donboscocollege.ac.in). */
export const PRODUCTION_SITE_URL = "https://donboscocollege.ac.in"

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    PRODUCTION_SITE_URL
  return raw.replace(/\/+$/, "")
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl()
  if (!path) return base
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}
