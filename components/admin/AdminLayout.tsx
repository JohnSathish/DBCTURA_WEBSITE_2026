"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Menu,
  Home,
  FileText,
  Newspaper,
  Image,
  Download,
  LogOut,
  LayoutDashboard,
  Settings,
  Calendar,
  Megaphone,
  Users,
  ImageIcon,
  Bell,
  FolderOpen,
  GraduationCap,
  Archive,
  ShieldAlert,
  Droplet,
  ListTree,
} from "lucide-react"

const adminMenuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/notice-board", label: "Notice Board", icon: Calendar },
  { href: "/admin/flash-news", label: "Flash News", icon: Megaphone },
  { href: "/admin/testimonials", label: "Testimonials", icon: Users },
  { href: "/admin/hero-slides", label: "Hero Slides", icon: ImageIcon },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/short-term-courses", label: "Short-Term Courses", icon: FileText },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/popup", label: "Popup Banners", icon: Bell },
  { href: "/admin/file-manager", label: "File Manager", icon: FolderOpen },
  { href: "/admin/question-bank", label: "Question Bank", icon: Archive },
  { href: "/admin/grievances", label: "Grievances", icon: ShieldAlert },
  { href: "/admin/blood-donors", label: "Blood Donors", icon: Droplet },
  { href: "/admin/navigation", label: "Navigation", icon: ListTree },
  { href: "/admin/staff-profiles", label: "Staff Profiles", icon: GraduationCap },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Handle redirect in useEffect, not during render
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login")
    }
  }, [status, router])

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render layout if not authenticated (redirect will happen)
  if (!session) {
    return null
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <Link href="/admin/dashboard" className="text-xl font-bold text-blue-600">
            Don Bosco Admin
          </Link>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Admin Navigation Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col h-full pt-6">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                <div className="mt-auto border-t pt-4">
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    <span>View Site</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-6 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r min-h-screen sticky top-0">
          <div className="p-6 border-b">
            <Link href="/admin/dashboard" className="text-xl font-bold text-blue-600">
              Don Bosco Admin
            </Link>
          </div>
          <nav className="flex flex-col p-4">
            {adminMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="mt-auto pt-4 border-t space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>View Site</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

