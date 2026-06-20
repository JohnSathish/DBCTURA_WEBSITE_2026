import type { NavigationItem } from "./navigation"

function normalizeNavHref(href?: string | null): string {
  if (!href) return ""
  const t = href.trim()
  if (!t) return ""
  return t.startsWith("/") ? t : `/${t}`
}

function treeHasHref(items: NavigationItem[], target: string): boolean {
  const t = normalizeNavHref(target)
  for (const it of items) {
    if (normalizeNavHref(it.href) === t) return true
    if (it.children?.length && treeHasHref(it.children, target)) return true
  }
  return false
}

/** Inject /alumni after Gallery when missing from DB-backed nav. */
export function ensureAlumniMenuItem(roots: NavigationItem[]): NavigationItem[] {
  if (treeHasHref(roots, "/alumni")) return roots

  const next = roots.map((r) => ({ ...r }))
  const galleryIdx = next.findIndex((r) => normalizeNavHref(r.href) === "/gallery")

  const alumni: NavigationItem = {
    label: "Alumni",
    href: "/alumni",
    order: galleryIdx >= 0 ? (next[galleryIdx].order ?? galleryIdx) + 1 : 999,
  }

  if (galleryIdx >= 0) {
    next.splice(galleryIdx + 1, 0, alumni)
  } else {
    const downloadsIdx = next.findIndex((r) => normalizeNavHref(r.href) === "/downloads")
    if (downloadsIdx >= 0) {
      alumni.order = next[downloadsIdx].order
      next.splice(downloadsIdx, 0, alumni)
    } else {
      next.push(alumni)
    }
  }

  return next
}

/** Inject /contact after Alumni when missing from DB-backed nav. */
export function ensureContactMenuItem(roots: NavigationItem[]): NavigationItem[] {
  if (treeHasHref(roots, "/contact")) return roots

  const next = roots.map((r) => ({ ...r }))
  const alumniIdx = next.findIndex((r) => normalizeNavHref(r.href) === "/alumni")

  const contact: NavigationItem = {
    label: "Contact Us",
    href: "/contact",
    order: alumniIdx >= 0 ? (next[alumniIdx].order ?? alumniIdx) + 1 : 1000,
  }

  if (alumniIdx >= 0) {
    next.splice(alumniIdx + 1, 0, contact)
  } else {
    next.push(contact)
  }

  return next
}

export function ensurePublicNavItems(roots: NavigationItem[]): NavigationItem[] {
  return ensureContactMenuItem(ensureAlumniMenuItem(roots))
}
