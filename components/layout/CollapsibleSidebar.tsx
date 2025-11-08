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
        className="w-full justify-between bg-gradient-to-r from-white via-indigo-50/50 to-purple-50/50 border-2 border-indigo-200/50 hover:from-indigo-100 hover:to-purple-100"
      >
        <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-indigo-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-indigo-600" />
        )}
      </Button>

      {/* Mobile Sidebar - Hidden by default, shown when toggled */}
      {isOpen && (
        <div className="mt-4 bg-gradient-to-br from-white via-indigo-50/50 to-purple-50/50 border-2 border-indigo-200/50 rounded-lg shadow-lg p-5 backdrop-blur-sm">
          <nav className="space-y-2">
            {items.map((child) => (
              <Link
                key={child.href ?? child.label}
                href={child.href || "#"}
                onClick={() => setIsOpen(false)} // Close sidebar when link is clicked on mobile
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPath === child.href
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transform scale-[1.02]"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 hover:text-indigo-700 hover:shadow-sm"
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

