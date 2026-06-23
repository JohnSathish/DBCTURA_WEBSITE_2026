import Link from "next/link"
import { ReactNode } from "react"
import { ArrowLeft, ChevronRight } from "lucide-react"
import CollapsibleSidebar from "@/components/layout/CollapsibleSidebar"
import { NavigationItem } from "@/lib/navigation"
import { getNavigationItems } from "@/lib/navigation-server"
import { findParentNavigationItem } from "@/lib/navigation-helpers"

type SidebarNavItem = {
  href?: string
  label: string
  children?: SidebarNavItem[]
}

function toSidebarNavItems(items?: NavigationItem[] | null): SidebarNavItem[] {
  if (!items?.length) return []
  return items.map((item) => ({
    href: item.href ?? undefined,
    label: item.label,
    children: toSidebarNavItems(item.children),
  }))
}

type Props = {
  path: string
  title: string
  children: ReactNode
}

export default async function AdministrationSectionLayout({ path, title, children }: Props) {
  const navigation = await getNavigationItems()
  const parentNavItem = findParentNavigationItem(path, navigation) as NavigationItem | null

  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          {parentNavItem?.href ? (
            <div className="mb-3">
              <Link
                href={parentNavItem.href}
                className="inline-flex items-center gap-2 text-sm text-brand-text/70 transition-colors hover:text-brand-hover"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to {parentNavItem.label}
              </Link>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <Link href="/" className="transition-colors hover:text-brand-hover">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            {parentNavItem?.href ? (
              <>
                <Link href={parentNavItem.href} className="transition-colors hover:text-brand-hover">
                  {parentNavItem.label}
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </>
            ) : null}
            <span className="font-medium text-slate-700">{title}</span>
          </div>
        </div>

        {parentNavItem?.children?.length ? (
          <div className="mb-4 lg:hidden">
            <CollapsibleSidebar
              title={parentNavItem.label}
              items={toSidebarNavItems(parentNavItem.children)}
              currentPath={path}
            />
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {parentNavItem?.children?.length ? (
            <div className="hidden lg:col-span-1 lg:block">
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur">
                <h3 className="mb-4 border-b border-slate-200 pb-3 text-lg font-bold text-brand-text">
                  {parentNavItem.label}
                </h3>
                <nav className="space-y-2">
                  {parentNavItem.children.map((child) => (
                    <Link
                      key={child.href ?? child.label}
                      href={child.href ?? "#"}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        path === child.href
                          ? "border-l-4 border-brand-hover bg-brand-gold/90 text-brand-text shadow-sm ring-1 ring-brand-gold"
                          : "text-slate-700 hover:bg-slate-100 hover:text-brand-hover"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          ) : null}

          <div
            className={
              parentNavItem?.children?.length ? "lg:col-span-3" : "mx-auto max-w-4xl lg:col-span-4"
            }
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
