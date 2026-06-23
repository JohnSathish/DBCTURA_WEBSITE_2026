"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  Menu,
  Home,
  FileText,
  Newspaper,
  Image as GalleryIcon,
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
  BookOpen,
  ClipboardList,
  Droplet,
  ListTree,
  UsersRound,
} from "lucide-react"

const adminMenuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/notice-board", label: "Notice Board", icon: Calendar },
  { href: "/admin/flash-news", label: "Flash News", icon: Megaphone },
  { href: "/admin/testimonials", label: "Testimonials", icon: Users },
  { href: "/admin/hero-slides", label: "Hero Slides", icon: ImageIcon },
  { href: "/admin/gallery", label: "Gallery", icon: GalleryIcon },
  { href: "/admin/short-term-courses", label: "Short-Term Courses", icon: FileText },
  { href: "/admin/syllabus", label: "Syllabus Management", icon: BookOpen },
  { href: "/admin/course-applications", label: "Course Applications", icon: ClipboardList },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/popup", label: "Popup Banners", icon: Bell },
  { href: "/admin/file-manager", label: "File Manager", icon: FolderOpen },
  { href: "/admin/question-bank", label: "Question Bank", icon: Archive },
  { href: "/admin/grievances", label: "Grievances", icon: ShieldAlert },
  { href: "/admin/blood-donors", label: "Blood Donors", icon: Droplet },
  { href: "/admin/navigation", label: "Navigation", icon: ListTree },
  { href: "/admin/alumni-registrations", label: "Alumni registrations", icon: Users },
  { href: "/admin/staff-profiles", label: "Staff Profiles", icon: GraduationCap },
  { href: "/admin/committees", label: "Committees", icon: UsersRound },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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

  const isActive = (href: string) => {
    if (!pathname) return false
    return pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href + "/"))
  }

  const NavItem = ({
    href,
    label,
    icon: Icon,
    onClick,
  }: {
    href: string
    label: string
    icon: any
    onClick?: () => void
  }) => {
    const active = isActive(href)
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
          active
            ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
            : "text-white/70 hover:bg-white/8 hover:text-white"
        )}
      >
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-xl border transition-colors",
            active
              ? "border-white/12 bg-white/8"
              : "border-white/8 bg-white/4 group-hover:border-white/12"
          )}
        >
          <Icon className={cn("h-4.5 w-4.5", active ? "text-white" : "text-white/80 group-hover:text-white")} />
        </span>
        <span className="truncate">{label}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100/40">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white/10 text-white shadow-sm shadow-slate-900/20 ring-1 ring-black/5">
              <Image src="/logo.png" alt="Don Bosco College logo" width={36} height={36} className="h-9 w-9 object-contain p-1" priority />
            </span>
            <span className="text-base font-bold tracking-tight text-slate-900">Don Bosco Admin</span>
          </Link>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-700 hover:bg-slate-100">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Admin Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <div className="border-b border-white/10 px-4 py-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/10 text-white shadow-sm shadow-blue-900/20 ring-1 ring-white/15">
                      <Image src="/logo.png" alt="Don Bosco College logo" width={40} height={40} className="h-10 w-10 object-contain p-1" priority />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-white">Don Bosco Admin</div>
                      <div className="truncate text-xs text-white/70">{session.user?.email || "Admin"}</div>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-3 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
                  <div className="space-y-1">
                    {adminMenuItems.map((item) => (
                      <NavItem
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        onClick={() => setSidebarOpen(false)}
                      />
                    ))}
                  </div>
                </nav>

                <div className="border-t border-white/10 p-3 space-y-1 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
                  <Link
                    href="/"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
                      <Home className="h-4.5 w-4.5 text-white/85" />
                    </span>
                    <span>View Site</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/15 transition-colors"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl border border-rose-300/20 bg-white/5">
                      <LogOut className="h-4.5 w-4.5 text-rose-200" />
                    </span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex min-w-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white min-h-screen sticky top-0">
          <div className="border-b border-white/10 px-5 py-5">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white/10 text-white shadow-sm shadow-blue-900/20 ring-1 ring-white/15">
                <Image src="/logo.png" alt="Don Bosco College logo" width={44} height={44} className="h-11 w-11 object-contain p-1.5" priority />
              </span>
              <div className="min-w-0">
                <div className="truncate text-base font-bold tracking-tight text-white">Don Bosco Admin</div>
                <div className="truncate text-xs text-white/70">{session.user?.email || "Admin"}</div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {adminMenuItems.map((item) => (
                <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
              ))}
            </div>
          </nav>

          <div className="border-t border-white/10 p-4 space-y-1 bg-gradient-to-b from-slate-900 to-slate-950">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
                <Home className="h-4.5 w-4.5 text-white/85" />
              </span>
              <span>View Site</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/15 transition-colors"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-rose-300/20 bg-white/5">
                <LogOut className="h-4.5 w-4.5 text-rose-200" />
              </span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="relative min-w-0 flex-1 overflow-x-hidden p-4 lg:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_20%_-10%,rgba(99,102,241,0.08),transparent_60%),radial-gradient(900px_circle_at_80%_0%,rgba(37,99,235,0.06),transparent_60%),radial-gradient(900px_circle_at_10%_90%,rgba(14,165,233,0.05),transparent_55%)]"
          />
          <div className="admin-page mx-auto w-full max-w-full min-w-0">{children}</div>
        </main>
      </div>
    </div>
  )
}

