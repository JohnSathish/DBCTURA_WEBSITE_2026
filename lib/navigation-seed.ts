import { prisma } from "@/lib/prisma"
import { defaultNavigation, type NavigationItem } from "@/lib/navigation"

/**
 * Inserts the built-in `defaultNavigation` tree into `NavigationMenu` (recursive).
 * Call only when the table is empty (caller should check).
 */
export async function seedDefaultNavigationMenus(): Promise<number> {
  let created = 0

  async function walk(items: NavigationItem[], parentId: string | null) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const row = await prisma.navigationMenu.create({
        data: {
          title: item.label,
          href: item.href ?? null,
          order: item.order ?? i,
          isVisible: item.isVisible !== false,
          parentId,
        },
      })
      created += 1
      if (item.children?.length) {
        await walk(item.children, row.id)
      }
    }
  }

  await walk(defaultNavigation, null)
  return created
}
