"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, ChevronDown } from "lucide-react"
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
            className="flex-1 px-4 py-3 text-base font-medium text-white hover:text-cyan-200 hover:bg-white/10 rounded-md transition-colors block min-w-0 break-words"
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
            className="px-3 py-3 text-white hover:bg-white/10 rounded-md transition-colors flex-shrink-0"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
        {expanded && (
          <div
            className={`w-full ${level === 0 ? "ml-0" : "ml-4"} mt-1 mb-1 ${
              level === 0 ? "border-l-2 border-white/20 pl-4" : "pl-2"
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
      className="px-4 py-3 text-base font-medium text-white hover:text-cyan-200 hover:bg-white/10 rounded-md transition-colors block w-full min-w-0 break-words"
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
  const [mounted, setMounted] = useState(false)
  const items = navigationItems && navigationItems.length > 0 ? navigationItems : defaultNavigation

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-lg border-b-4 border-white/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between py-3 border-b border-white/20">
          <Link href="/" className="flex items-center gap-3 md:gap-4">
            <Image
              src="/logo.png"
              alt="Don Bosco College, Tura logo"
              width={56}
              height={56}
              priority
              className="h-10 w-10 md:h-14 md:w-14 object-contain rounded bg-white/95 p-1 shadow-md"
            />
            <div className="text-white">
              <div className="text-lg md:text-2xl font-bold leading-tight tracking-wide drop-shadow-sm">
                Don Bosco College, Tura
              </div>
              <div className="hidden sm:block text-[11px] md:text-xs leading-snug text-white/90 max-w-2xl">
                Affiliated to the North Eastern University, Shillong -793 002 Recognised by University Grants Commision
                UGC, New Delhi
              </div>
              <div className="hidden md:block text-[11px] md:text-xs leading-snug text-cyan-200">
                (Re-accredited with 'B' Grade by NAAC Bangalore)
              </div>
            </div>
          </Link>

          {mounted ? (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden mt-1">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-gradient-to-b from-indigo-600 to-purple-600 overflow-y-auto p-0">
                <SheetHeader className="p-6 pb-4">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col px-4 pb-6 space-y-1 overflow-y-auto">
                  {items.map((item) => (
                    <MobileNavItem
                      key={item.href ?? item.label}
                      item={item}
                      onClose={() => setMobileMenuOpen(false)}
                      level={0}
                    />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            <Button variant="ghost" size="icon" className="lg:hidden mt-1 text-white hover:bg-white/20" disabled>
              <Menu className="h-6 w-6" />
            </Button>
          )}
        </div>

        <div className="hidden lg:block">
          <nav className="flex flex-wrap items-center gap-1 py-2">
            {items.map((item) => {
              const key = item.href ?? item.label
              if (item.children && item.children.length > 0) {
                if (!mounted) {
                  return (
                    <button
                      key={key}
                      className="px-3 py-1.5 text-sm font-medium text-white hover:text-cyan-200 hover:bg-white/15 rounded-md transition-colors flex items-center gap-1"
                      disabled
                    >
                      {item.label}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  )
                }
                return (
                  <DropdownMenu key={key}>
                    <DropdownMenuTrigger asChild>
                      <button className="px-3 py-1.5 text-sm font-medium text-white hover:text-cyan-200 hover:bg-white/15 rounded-md transition-colors flex items-center gap-1">
                        {item.label}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[200px] bg-white">
                      {item.children.map((child) => {
                        const childKey = child.href ?? child.label
                        if (child.children && child.children.length > 0) {
                          return (
                            <DropdownMenuSub key={childKey}>
                              <DropdownMenuSubTrigger className="cursor-pointer">
                                {child.label}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="bg-white">
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
              return (
                <Link
                  key={key}
                  href={item.href || "#"}
                  className="px-3 py-1.5 text-sm font-medium text-white hover:text-cyan-200 hover:bg-white/15 rounded-md transition-colors"
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

