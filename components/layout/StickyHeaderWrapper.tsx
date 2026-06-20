"use client"

import Topbar from "@/components/layout/Topbar"
import Header from "@/components/layout/Header"
import Breadcrumb from "@/components/layout/Breadcrumb"
import { defaultNavigation, type NavigationItem } from "@/lib/navigation"
import { ensurePublicNavItems } from "@/lib/navigation-merge"
import { useEffect, useState } from "react"

export default function StickyHeaderWrapper() {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(() =>
    ensurePublicNavItems(defaultNavigation)
  )

  useEffect(() => {
    let cancelled = false

    async function loadNavigation() {
      try {
        const response = await fetch("/api/navigation", { cache: "no-store" })
        const data = await response.json()
        if (!cancelled && Array.isArray(data.items) && data.items.length > 0) {
          setNavigationItems(ensurePublicNavItems(data.items))
        }
      } catch (error) {
        console.error("Failed to load navigation menus:", error)
      }
    }

    loadNavigation()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <Topbar />
      <Header navigationItems={navigationItems} />
      <Breadcrumb navigationItems={navigationItems} />
    </>
  )
}

