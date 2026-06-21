import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import Link from "next/link"
import {
  FileText,
  Newspaper,
  Image,
  Download,
  Plus,
  ArrowRight,
  Megaphone,
  Calendar,
  GraduationCap,
} from "lucide-react"

function startOfMonth() {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatRelative(date: Date) {
  const diffMs = Date.now() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const monthStart = startOfMonth()

  const [
    pagesCount,
    newsCount,
    galleryCount,
    downloadsCount,
    pagesThisMonth,
    newsThisMonth,
    galleryThisMonth,
    downloadsThisMonth,
    recentNews,
    recentPages,
  ] = await Promise.all([
    prisma.page.count(),
    prisma.news.count(),
    prisma.galleryImage.count(),
    prisma.download.count(),
    prisma.page.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.news.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.galleryImage.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.download.count({ where: { uploadedAt: { gte: monthStart } } }),
    prisma.news.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true, publishedAt: true },
    }),
    prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, updatedAt: true, published: true },
    }),
  ])

  const totalContent = pagesCount + newsCount + galleryCount + downloadsCount

  const stats = [
    {
      label: "Pages",
      value: pagesCount,
      delta: pagesThisMonth,
      icon: FileText,
      gradient: "from-violet-500 to-indigo-600",
      light: "bg-violet-50 text-violet-700",
    },
    {
      label: "News",
      value: newsCount,
      delta: newsThisMonth,
      icon: Newspaper,
      gradient: "from-sky-500 to-blue-600",
      light: "bg-sky-50 text-sky-700",
    },
    {
      label: "Gallery Images",
      value: galleryCount,
      delta: galleryThisMonth,
      icon: Image,
      gradient: "from-emerald-500 to-teal-600",
      light: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Downloads",
      value: downloadsCount,
      delta: downloadsThisMonth,
      icon: Download,
      gradient: "from-amber-500 to-orange-600",
      light: "bg-amber-50 text-amber-700",
    },
  ]

  const overview = [
    { label: "Pages", value: pagesCount, color: "bg-violet-500" },
    { label: "News", value: newsCount, color: "bg-sky-500" },
    { label: "Gallery", value: galleryCount, color: "bg-emerald-500" },
    { label: "Downloads", value: downloadsCount, color: "bg-amber-500" },
  ]

  const activity = [
    ...recentNews.map((item) => ({
      id: `news-${item.id}`,
      title: item.title,
      detail: item.publishedAt ? "News published" : "News draft saved",
      date: item.createdAt,
      href: `/admin/news/${item.id}`,
    })),
    ...recentPages.map((item) => ({
      id: `page-${item.id}`,
      title: item.title,
      detail: item.published ? "Page updated" : "Page draft updated",
      date: item.updatedAt,
      href: `/admin/pages/${item.id}`,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6)

  const quickActions = [
    {
      href: "/admin/pages/new",
      label: "Create New Page",
      sub: "Add a new page",
      icon: FileText,
      className: "from-violet-500/10 to-indigo-500/5 border-violet-200/60 hover:border-violet-300",
      iconClass: "bg-violet-600 text-white",
    },
    {
      href: "/admin/news/new",
      label: "Create News Article",
      sub: "Publish news",
      icon: Newspaper,
      className: "from-sky-500/10 to-blue-500/5 border-sky-200/60 hover:border-sky-300",
      iconClass: "bg-sky-600 text-white",
    },
    {
      href: "/admin/gallery",
      label: "Manage Gallery",
      sub: "Upload images",
      icon: Image,
      className: "from-emerald-500/10 to-teal-500/5 border-emerald-200/60 hover:border-emerald-300",
      iconClass: "bg-emerald-600 text-white",
    },
    {
      href: "/admin/downloads/new",
      label: "Add Download",
      sub: "Upload files",
      icon: Download,
      className: "from-amber-500/10 to-orange-500/5 border-amber-200/60 hover:border-amber-300",
      iconClass: "bg-amber-600 text-white",
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Admin Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back 👋
            </h1>
            <p className="mt-2 text-slate-600">{session.user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/flash-news/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <Megaphone className="h-4 w-4 text-amber-600" />
              Flash News
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              View Site
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${stat.light}`}>
                      +{stat.delta} this month
                    </p>
                  </div>
                  <div className={`rounded-xl bg-gradient-to-br p-3 text-white shadow-sm ${stat.gradient}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${action.className}`}
                >
                  <div className={`mb-4 inline-flex rounded-xl p-3 shadow-sm ${action.iconClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="font-semibold text-slate-900">{action.label}</div>
                  <div className="mt-1 text-sm text-slate-600">{action.sub}</div>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 opacity-0 transition group-hover:opacity-100">
                    Open <Plus className="h-3.5 w-3.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-1">
            <h2 className="text-lg font-semibold text-slate-900">Website Overview</h2>
            <p className="mt-1 text-sm text-slate-500">Content distribution across the site</p>
            <div className="mt-6 flex items-center justify-center">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-slate-50 ring-8 ring-slate-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{totalContent}</div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Total</div>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {overview.map((item) => {
                const pct = totalContent > 0 ? Math.round((item.value / totalContent) * 1000) / 10 : 0
                return (
                  <div key={item.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="text-slate-500">
                        {item.value} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-1">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <p className="mt-1 text-sm text-slate-500">Latest updates across pages and news</p>
            <ul className="mt-5 space-y-4">
              {activity.length === 0 ? (
                <li className="text-sm text-slate-500">No recent activity yet.</li>
              ) : (
                activity.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="group block rounded-xl p-3 transition hover:bg-slate-50">
                      <p className="line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-indigo-700">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.detail} · {formatRelative(item.date)}
                      </p>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-1">
            <h2 className="text-lg font-semibold text-slate-900">Quick Stats</h2>
            <p className="mt-1 text-sm text-slate-500">At-a-glance content totals</p>
            <div className="mt-5 space-y-5">
              {overview.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className={`h-10 w-1.5 rounded-full ${item.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-600">{item.label}</div>
                    <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/admin/notice-board"
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Calendar className="h-4 w-4 text-indigo-600" />
                Notices
              </Link>
              <Link
                href="/admin/alumni-registrations"
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                Alumni
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 p-6 text-white shadow-lg md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome to Don Bosco College Admin Panel</h2>
              <p className="mt-2 max-w-2xl text-sm text-white/85 md:text-base">
                Manage pages, news, gallery, downloads, and more for Don Bosco College, Tura.
              </p>
              <div className="mt-5 flex flex-wrap gap-6 text-sm">
                <div>
                  <div className="text-white/70">Established</div>
                  <div className="text-lg font-semibold">1964</div>
                </div>
                <div>
                  <div className="text-white/70">Students</div>
                  <div className="text-lg font-semibold">3000</div>
                </div>
                <div>
                  <div className="text-white/70">Accreditation</div>
                  <div className="text-lg font-semibold">NAAC B Grade</div>
                </div>
              </div>
            </div>
            <div className="hidden shrink-0 md:block">
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-sm">
                <LayoutDashboardIllustration />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function LayoutDashboardIllustration() {
  return (
    <svg viewBox="0 0 120 80" className="h-24 w-36 text-white/90" aria-hidden>
      <rect x="8" y="10" width="104" height="60" rx="6" fill="currentColor" opacity="0.15" />
      <rect x="16" y="18" width="36" height="8" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="16" y="32" width="88" height="6" rx="2" fill="currentColor" opacity="0.25" />
      <rect x="16" y="44" width="88" height="6" rx="2" fill="currentColor" opacity="0.25" />
      <rect x="16" y="56" width="60" height="6" rx="2" fill="currentColor" opacity="0.25" />
    </svg>
  )
}
