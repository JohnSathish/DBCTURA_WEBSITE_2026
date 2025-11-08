"use client"

import { useEffect, useState } from "react"
import Topbar from "@/components/layout/Topbar"
import Header from "@/components/layout/Header"
import Breadcrumb from "@/components/layout/Breadcrumb"
import { defaultNavigation, type NavigationItem } from "@/lib/navigation"

export default function StickyHeaderWrapper() {
  const [topbarHeight, setTopbarHeight] = useState(50)
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(defaultNavigation)

  useEffect(() => {
    const updateHeight = () => {
      const topbar = document.getElementById("topbar")
      if (topbar) {
        setTopbarHeight(topbar.offsetHeight)
      }
    }

    updateHeight()
    window.addEventListener("resize", updateHeight)
    const timeout = setTimeout(updateHeight, 100)

    return () => {
      window.removeEventListener("resize", updateHeight)
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadNavigation() {
      try {
        const response = await fetch("/api/navigation", { cache: "no-store" })
        const data = await response.json()
        if (!cancelled && Array.isArray(data.items) && data.items.length > 0) {
          setNavigationItems(data.items)
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
      <div id="topbar" className="sticky top-0 z-[60]">
        <Topbar />
      </div>
      <div className="sticky z-50" style={{ top: `${topbarHeight}px` }}>
        <Header navigationItems={navigationItems} />
      </div>
      <Breadcrumb navigationItems={navigationItems} />
    </>
  )
}

