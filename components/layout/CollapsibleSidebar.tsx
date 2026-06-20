"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavItem {
  href?: string
  label: string
  children?: NavItem[]
}

interface CollapsibleSidebarProps {
  title: string
  items: NavItem[]
  currentPath: string
}

export default function CollapsibleSidebar({
  title,
  items,
  currentPath,
}: CollapsibleSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full justify-between bg-white border border-slate-200 hover:bg-brand-surface"
      >
        <span className="font-bold text-brand-text">
          {title}
        </span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-brand-hover" />
        ) : (
          <ChevronRight className="h-4 w-4 text-brand-hover" />
        )}
      </Button>

      {/* Mobile Sidebar - Hidden by default, shown when toggled */}
      {isOpen && (
        <div className="mt-4 bg-white border border-slate-200 rounded-lg shadow-sm p-5">
          <nav className="font-nav space-y-2">
            {items.map((child) => (
              <Link
                key={child.href ?? child.label}
                href={child.href || "#"}
                onClick={() => setIsOpen(false)} // Close sidebar when link is clicked on mobile
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPath === child.href
                    ? "bg-brand-gold text-brand-text shadow-sm border-l-4 border-brand-hover"
                    : "text-slate-700 hover:bg-slate-100 hover:text-brand-hover"
                }`}
              >
                {child.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}

