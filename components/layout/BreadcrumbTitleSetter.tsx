"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useBreadcrumbTitles } from "@/app/providers"

export default function BreadcrumbTitleSetter({ title }: { title?: string }) {
  const pathname = usePathname()
  const { setTitleForPath } = useBreadcrumbTitles()

  useEffect(() => {
    if (!pathname) return
    setTitleForPath(pathname, title)
    return () => {
      setTitleForPath(pathname, undefined)
    }
  }, [pathname, setTitleForPath, title])

  return null
}

