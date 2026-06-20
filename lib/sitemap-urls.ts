import { defaultNavigation, type NavigationItem } from "@/lib/navigation"

export function collectNavPaths(items: NavigationItem[]): string[] {
  const paths = new Set<string>()
  const walk = (list: NavigationItem[]) => {
    for (const item of list) {
      if (item.href && item.href.startsWith("/") && !item.href.startsWith("//")) {
        paths.add(item.href)
      }
      if (item.children?.length) walk(item.children)
    }
  }
  walk(items)
  return Array.from(paths)
}

/** Static public routes for SEO sitemap (navigation + common pages). */
export function getStaticPublicPaths(): string[] {
  const extra = [
    "/news",
    "/notice-board",
    "/alumni",
    "/principal-message",
    "/explore-courses",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/site-map",
    "/blood-donors",
    "/career-placement",
    "/admission-closed",
  ]
  const fromNav = collectNavPaths(defaultNavigation)
  return Array.from(new Set([...fromNav, ...extra])).sort()
}
