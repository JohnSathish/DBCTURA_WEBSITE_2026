import { prisma } from "@/lib/prisma"
import { defaultNavigation, NavigationItem } from "./navigation"
import { ensurePublicNavItems } from "./navigation-merge"

export type NavigationMenuRecord = {
  id: string
  title: string
  href: string | null
  order: number
  isVisible: boolean
  parentId: string | null
}

interface GetNavigationOptions {
  includeHidden?: boolean
}

/** Build nav tree from DB rows (used by public nav + admin API). */
export function buildTree(records: NavigationMenuRecord[]): NavigationItem[] {
  const map = new Map<string, NavigationItem & { children: NavigationItem[] }>()
  const roots: (NavigationItem & { children: NavigationItem[] })[] = []

  records.forEach((record) => {
    map.set(record.id, {
      id: record.id,
      label: record.title,
      href: record.href ?? undefined,
      order: record.order,
      isVisible: record.isVisible,
      parentId: record.parentId,
      children: [],
    })
  })

  records.forEach((record) => {
    const current = map.get(record.id)
    if (!current) return

    if (record.parentId) {
      const parent = map.get(record.parentId)
      if (parent) {
        parent.children.push(current)
      } else {
        roots.push(current)
      }
    } else {
      roots.push(current)
    }
  })

  const sortChildren = (items: (NavigationItem & { children: NavigationItem[] })[]) => {
    items.sort((a, b) => {
      const orderDiff = (a.order ?? 0) - (b.order ?? 0)
      if (orderDiff !== 0) return orderDiff
      return a.label.localeCompare(b.label)
    })
    items.forEach((item) => {
      if (item.children.length > 0) {
        sortChildren(item.children as (NavigationItem & { children: NavigationItem[] })[])
      }
    })
  }

  sortChildren(roots)

  return roots.map(({ children, ...rest }) => ({
    ...rest,
    children: children.length > 0 ? children : undefined,
  }))
}

export { ensureAlumniMenuItem, ensureContactMenuItem, ensurePublicNavItems } from "./navigation-merge"

export async function getNavigationItems(options: GetNavigationOptions = {}): Promise<NavigationItem[]> {
  const { includeHidden = false } = options

  try {
    if (!(prisma as any).navigationMenu) {
      console.warn("NavigationMenu model not available in Prisma client.")
      return defaultNavigation
    }

    const records = await prisma.navigationMenu.findMany({
      where: includeHidden ? {} : { isVisible: true },
      orderBy: [{ order: "asc" }, { title: "asc" }],
    })

    if (!records.length) {
      return defaultNavigation
    }

    return ensurePublicNavItems(buildTree(records))
  } catch (error) {
    console.error("Failed to fetch navigation items:", error)
    return defaultNavigation
  }
}


