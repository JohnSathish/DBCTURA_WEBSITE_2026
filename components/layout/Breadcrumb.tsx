"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { NavigationItem } from "@/lib/navigation"
import { findNavigationItemByPath } from "@/lib/navigation-helpers"

interface BreadcrumbProps {
  navigationItems?: NavigationItem[]
}

export default function Breadcrumb({ navigationItems = [] }: BreadcrumbProps) {
  const pathname = usePathname()

  if (pathname === "/") {
    return null
  }

  const currentItem = findNavigationItemByPath(pathname, navigationItems)

  if (!currentItem) {
    return null
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center py-2 text-sm">
          <Link href="/" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
          <span className="text-gray-900 font-medium" suppressHydrationWarning>{currentItem.label}</span>
        </nav>
      </div>
    </div>
  )
}

