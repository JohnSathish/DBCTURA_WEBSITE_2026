"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { Menu, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { defaultNavigation, type NavigationItem } from "@/lib/navigation"

const DEFAULT_ADMISSION_URL = "https://admissionsdbctura.com/register"

function DesktopNavDropdown({ item }: { item: NavigationItem }) {
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false)
      closeTimerRef.current = null
    }, 220)
  }, [clearCloseTimer])

  const handleOpen = useCallback(() => {
    clearCloseTimer()
    setOpen(true)
  }, [clearCloseTimer])

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

  const children = item.children ?? []

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        clearCloseTimer()
        setOpen(next)
      }}
      modal={false}
    >
      <div className="inline-block" onMouseEnter={handleOpen} onMouseLeave={scheduleClose}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="px-3 py-1.5 text-sm font-medium uppercase tracking-wide text-brand-navy hover:text-brand-maroon hover:bg-brand-gold/15 rounded-md transition-colors flex items-center gap-1 outline-none data-[state=open]:text-brand-maroon"
          >
            {item.label}
            <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent
        align="start"
        className="font-nav min-w-[200px] bg-brand-cream border border-brand-gold/25 shadow-md"
        sideOffset={4}
        onMouseEnter={handleOpen}
        onMouseLeave={scheduleClose}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {children.map((child) => {
          const childKey = child.href ?? child.label
          if (child.children && child.children.length > 0) {
            return (
              <DropdownMenuSub key={childKey}>
                <DropdownMenuSubTrigger className="cursor-pointer">{child.label}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="font-nav bg-brand-cream border border-brand-gold/25">
                  {child.children.map((grandchild) => (
                    <DropdownMenuItem key={grandchild.href ?? grandchild.label} asChild>
                      <Link href={grandchild.href || "#"} className="cursor-pointer">
                        {grandchild.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )
          }
          return (
            <DropdownMenuItem key={childKey} asChild>
              <Link href={child.href || "#"} className="cursor-pointer">
                {child.label}
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileNavItem({
  item,
  onClose,
  level = 0,
}: {
  item: NavigationItem
  onClose: () => void
  level?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const href = item.href || "#"

  if (item.children && item.children.length > 0) {
    return (
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between w-full">
          <Link
            href={href}
            className={`flex-1 px-4 py-3 text-base font-medium text-brand-navy hover:text-brand-maroon hover:bg-brand-gold/12 rounded-md transition-colors block min-w-0 break-words ${level === 0 ? "uppercase tracking-wide" : ""}`}
            onClick={onClose}
          >
            <span className="block whitespace-normal break-words">{item.label}</span>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setExpanded((prev) => !prev)
            }}
            className="px-3 py-3 text-brand-navy hover:bg-brand-gold/20 rounded-md transition-colors flex-shrink-0"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
        {expanded && (
          <div
            className={`w-full ${level === 0 ? "ml-0" : "ml-4"} mt-1 mb-1 ${
              level === 0 ? "border-l-2 border-brand-gold/60 pl-4" : "pl-2"
            }`}
          >
            {item.children.map((child) => (
              <div key={child.href ?? child.label} className="w-full">
                <MobileNavItem item={child} onClose={onClose} level={level + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={`px-4 py-3 text-base font-medium text-brand-navy hover:text-brand-maroon hover:bg-brand-gold/12 rounded-md transition-colors block w-full min-w-0 break-words ${level === 0 ? "uppercase tracking-wide" : ""}`}
      onClick={onClose}
    >
      <span className="block whitespace-normal break-words">{item.label}</span>
    </Link>
  )
}

interface HeaderProps {
  navigationItems?: NavigationItem[]
}

export default function Header({ navigationItems }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [navStuck, setNavStuck] = useState(false)
  const [navHeight, setNavHeight] = useState(0)
  const [onlineAdmissionUrl, setOnlineAdmissionUrl] = useState(DEFAULT_ADMISSION_URL)
  const navRef = useRef<HTMLDivElement | null>(null)
  const navSentinelRef = useRef<HTMLDivElement | null>(null)
  const items = navigationItems && navigationItems.length > 0 ? navigationItems : defaultNavigation

  useEffect(() => {
    let cancelled = false
    fetch("/api/settings/admission-links", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        const url = String(j?.onlineAdmissionUrl || "").trim()
        setOnlineAdmissionUrl(url || DEFAULT_ADMISSION_URL)
      })
      .catch(() => {
        // ignore
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const el = navRef.current
    if (!el) return

    const updateHeight = () => setNavHeight(el.offsetHeight)
    updateHeight()

    const ro = new ResizeObserver(() => updateHeight())
    ro.observe(el)

    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const sentinel = navSentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setNavStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px 0px 0px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <header className="border-b border-brand-gold/30">
      {/* Top Header (Non-sticky) */}
      <div className="bg-gradient-to-r from-brand-navy via-[#1f4fb5] to-[#2563eb] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 lg:items-center py-3 lg:py-4">
            <div className="flex items-start justify-between gap-3 min-w-0">
              <Link href="/" className="flex items-center gap-3 md:gap-4 min-w-0">
                <Image
                  src="/logo.png"
                  alt="Don Bosco College, Tura logo"
                  width={56}
                  height={56}
                  priority
                  className="h-10 w-10 md:h-14 md:w-14 shrink-0 object-contain rounded bg-white/95 p-1 shadow-md"
                />
                <div className="text-white min-w-0">
                  <div className="text-lg md:text-2xl font-bold leading-tight tracking-wide drop-shadow-sm">
                    Don Bosco College, Tura
                  </div>
                  <div className="hidden sm:block text-[11px] md:text-xs leading-snug text-white/90 max-w-2xl space-y-0.5">
                    <span className="block">Affiliated to the North Eastern University, Shillong - 793 002</span>
                    <span className="block">Recognised by University Grants Commission UGC, New Delhi</span>
                  </div>
                  <div className="hidden md:block text-[11px] md:text-xs leading-snug text-brand-sun/95">
                    (Re-accredited with &apos;B&apos; Grade by NAAC Bangalore)
                  </div>
                </div>
              </Link>
            </div>

            <div className="font-nav flex flex-col items-center lg:items-end justify-center text-center lg:text-right border-t border-white/15 pt-3 mt-1 lg:border-t-0 lg:pt-0 lg:mt-0 lg:pl-6 lg:border-l lg:border-white/20 gap-3">
              <div>
                <p className="text-white/90 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] border-b-2 border-white/35 pb-1 mb-2 inline-block">
                  Our Motto
                </p>
                <p className="text-white text-base sm:text-lg md:text-xl font-medium tracking-wide text-balance max-w-md lg:max-w-none">
                  <span className="text-amber-300">Pursuit of Excellence</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 w-full lg:w-auto">
                <Button
                  asChild
                  size="sm"
                  className="shrink-0 rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md shadow-black/15 hover:bg-amber-300 focus-visible:ring-amber-400/40 border-0"
                >
                  <Link href={onlineAdmissionUrl} target="_blank" rel="noreferrer">
                    Online Admission
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-md border-2 border-white/80 bg-white px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm hover:bg-white/90 focus-visible:ring-white/40"
                >
                  <Link href="/downloads">Prospectus 2026</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar (Sticky) */}
      <div ref={navSentinelRef} aria-hidden="true" className="h-px w-full" />
      {navStuck && navHeight > 0 ? <div aria-hidden="true" style={{ height: navHeight }} /> : null}
      <div
        ref={navRef}
        className={[
          "bg-white border-t border-slate-200/80 shadow-sm",
          "transition-[box-shadow] duration-200",
          navStuck ? "fixed top-0 left-0 right-0 z-50" : "relative z-10",
          scrolled ? "shadow-md" : "shadow-none",
        ].join(" ")}
        suppressHydrationWarning
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 py-2.5">
            {/* Mobile: brand + hamburger (sticky) */}
            <Link href="/" className="lg:hidden flex items-center gap-2 min-w-0">
              <Image
                src="/logo.png"
                alt="Don Bosco College, Tura logo"
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 object-contain rounded bg-white p-1 shadow-sm"
              />
              <span className="font-nav text-sm font-semibold text-brand-navy truncate">Don Bosco College</span>
            </Link>

            <nav className="font-nav hidden lg:flex flex-wrap items-center gap-1">
              {items.map((item, index) => {
                const key = item.id ?? item.href ?? `nav-${index}-${item.label}`
                if (item.children && item.children.length > 0) {
                  return <DesktopNavDropdown key={key} item={item} />
                }
                return (
                  <Link
                    key={key}
                    href={item.href || "#"}
                    className="px-3 py-1.5 text-sm font-medium uppercase tracking-wide text-brand-navy hover:text-brand-maroon hover:bg-brand-gold/15 rounded-md transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <Link
              href="/news"
              className="hidden lg:inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-brand-navy transition hover:bg-brand-gold/15"
              aria-label="Search news and updates"
            >
              <Search className="h-5 w-5" strokeWidth={2} />
            </Link>

            {/* Mobile menu trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden shrink-0">
                <Button variant="ghost" size="icon" className="text-brand-navy hover:bg-brand-gold/15">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-brand-cream border-l border-brand-gold/35 overflow-y-auto p-0">
                <SheetHeader className="p-6 pb-4">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <nav className="font-nav flex flex-col px-4 pb-6 space-y-1 overflow-y-auto">
                  {items.map((item, index) => (
                    <MobileNavItem
                      key={item.id ?? item.href ?? `mnav-${index}-${item.label}`}
                      item={item}
                      onClose={() => setMobileMenuOpen(false)}
                      level={0}
                    />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

