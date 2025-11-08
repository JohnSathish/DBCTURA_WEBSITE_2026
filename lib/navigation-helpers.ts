import { NavigationItem } from "./navigation"

export function flattenNavigation(items: NavigationItem[], depth = 0, parentId: string | null = null) {
  const result: Array<NavigationItem & { depth: number }> = []
  items.forEach((item) => {
    result.push({
      ...item,
      depth,
      children: item.children,
    })
    if (item.children && item.children.length > 0) {
      result.push(...flattenNavigation(item.children, depth + 1, item.id ?? null))
    }
  })
  return result
}

export function findNavigationItemByPath(
  path: string,
  items: NavigationItem[]
): NavigationItem | null {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  for (const item of items) {
    if (item.href === normalizedPath) {
      return item
    }
    if (item.children) {
      const found = findNavigationItemByPath(normalizedPath, item.children)
      if (found) return found
    }
  }
  return null
}

export function findParentNavigationItem(
  path: string,
  items: NavigationItem[],
  parent: NavigationItem | null = null
): NavigationItem | null {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  for (const item of items) {
    if (item.href === normalizedPath) {
      return parent
    }
    if (item.children) {
      const found = findParentNavigationItem(normalizedPath, item.children, item)
      if (found) return found
    }
  }
  return null
}

export function navigationHasRecords(items: NavigationItem[]) {
  return Array.isArray(items) && items.length > 0
}


