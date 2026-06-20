"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { NavigationItem } from "@/lib/navigation"
import { findNavigationItemByPath } from "@/lib/navigation-helpers"
import { useBreadcrumbTitles } from "@/app/providers"

interface BreadcrumbProps {
  navigationItems?: NavigationItem[]
}

type Crumb = {
  label: string
  href?: string
}

function titleizeSegment(seg: string) {
  return seg
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function sectionLabel(seg: string) {
  const map: Record<string, string> = {
    news: "News",
    "flash-news": "Flash News",
    gallery: "Gallery",
    downloads: "Downloads",
    campus: "Campus",
    academics: "Academics",
    administration: "Administration",
    "student-services": "Student Services",
    clubs: "Clubs",
    about: "About Us",
    aqar: "AQAR",
    "notice-board": "Notice Board",
    "short-term-courses": "Short Term Courses",
    "blood-donors": "Blood Donors",
    contact: "Contact Us",
  }
  return map[seg] ?? titleizeSegment(seg)
}

function findNavTrail(path: string, items: NavigationItem[]): NavigationItem[] | null {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  function dfs(list: NavigationItem[], trail: NavigationItem[]): NavigationItem[] | null {
    for (const item of list) {
      const nextTrail = [...trail, item]
      if (item.href === normalizedPath) return nextTrail
      if (item.children && item.children.length > 0) {
        const found = dfs(item.children, nextTrail)
        if (found) return found
      }
    }
    return null
  }

  return dfs(items, [])
}

export default function Breadcrumb({ navigationItems = [] }: BreadcrumbProps) {
  const pathname = usePathname()
  const { titlesByPath } = useBreadcrumbTitles()

  if (pathname === "/") {
    return null
  }

  const navTrail = navigationItems.length > 0 ? findNavTrail(pathname, navigationItems) : null
  const dynamicTitle = titlesByPath[pathname]

  let crumbs: Crumb[] = [{ label: "Home", href: "/" }]

  if (navTrail && navTrail.length > 0) {
    crumbs = crumbs.concat(
      navTrail.map((item, idx) => ({
        label: idx === navTrail.length - 1 && dynamicTitle ? dynamicTitle : item.label,
        href: idx === navTrail.length - 1 ? undefined : item.href ?? undefined,
      }))
    )
  } else {
    const parts = pathname.split("/").filter(Boolean)
    const built: Crumb[] = []
    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i]
      const href = "/" + parts.slice(0, i + 1).join("/")
      const isLast = i === parts.length - 1
      const label =
        isLast && dynamicTitle
          ? dynamicTitle
          : i === 0
            ? sectionLabel(seg)
            : sectionLabel(seg)
      built.push({ label, href: isLast ? undefined : href })
    }
    crumbs = crumbs.concat(built)
  }

  return (
    <div className="font-nav bg-brand-cream border-b border-brand-gold/30 shadow-sm" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2 text-sm">
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1
            const node = crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="text-brand-navy/70 hover:text-brand-maroon transition-colors inline-flex items-center gap-1 min-w-0"
              >
                {idx === 0 ? <Home className="h-3.5 w-3.5 shrink-0" /> : null}
                <span className="truncate">{crumb.label}</span>
              </Link>
            ) : (
              <span className="text-brand-navy font-medium min-w-0">
                <span className="truncate">{crumb.label}</span>
              </span>
            )

            return (
              <div key={`${crumb.label}-${idx}`} className="inline-flex items-center min-w-0">
                {idx > 0 ? <ChevronRight className="h-4 w-4 text-gray-400 mx-1.5 shrink-0" /> : null}
                {node}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

