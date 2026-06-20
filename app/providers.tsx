"use client"

import { SessionProvider } from "next-auth/react"
import { createContext, useCallback, useContext, useMemo, useState } from "react"

type BreadcrumbTitleContextValue = {
  titlesByPath: Record<string, string | undefined>
  setTitleForPath: (path: string, title?: string) => void
}

const BreadcrumbTitleContext = createContext<BreadcrumbTitleContextValue | null>(null)

export function useBreadcrumbTitles() {
  const ctx = useContext(BreadcrumbTitleContext)
  if (!ctx) {
    throw new Error("useBreadcrumbTitles must be used within Providers")
  }
  return ctx
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [titlesByPath, setTitlesByPath] = useState<Record<string, string | undefined>>({})

  const setTitleForPath = useCallback((path: string, title?: string) => {
    setTitlesByPath((prev) => {
      if (prev[path] === title) return prev
      return { ...prev, [path]: title }
    })
  }, [])

  const value = useMemo(() => ({ titlesByPath, setTitleForPath }), [titlesByPath, setTitleForPath])

  return (
    <SessionProvider>
      <BreadcrumbTitleContext.Provider value={value}>{children}</BreadcrumbTitleContext.Provider>
    </SessionProvider>
  )
}

