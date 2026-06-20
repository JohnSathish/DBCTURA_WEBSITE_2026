import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import Link from "next/link"
import { NavigationItem } from "@/lib/navigation"
import { getNavigationItems } from "@/lib/navigation-server"
import { findNavigationItemByPath, findParentNavigationItem } from "@/lib/navigation-helpers"
import CollapsibleSidebar from "@/components/layout/CollapsibleSidebar"
import {
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Target,
  BadgeCheck,
  Link2,
  BookOpen,
  Settings,
  History,
  Users,
  UserSquare2,
} from "lucide-react"

type SidebarNavItem = {
  href?: string
  label: string
  children?: SidebarNavItem[]
}

function iconForAboutHref(href?: string) {
  switch (href) {
    case "/about/founder":
      return <Sparkles className="h-4 w-4 shrink-0" />
    case "/about/rector-major":
      return <UserSquare2 className="h-4 w-4 shrink-0" />
    case "/about/vision-mission":
      return <Target className="h-4 w-4 shrink-0" />
    case "/about/objectives":
      return <BadgeCheck className="h-4 w-4 shrink-0" />
    case "/about/affiliation":
      return <Link2 className="h-4 w-4 shrink-0" />
    case "/about/philosophy":
      return <BookOpen className="h-4 w-4 shrink-0" />
    case "/about/management":
      return <Settings className="h-4 w-4 shrink-0" />
    case "/about/history":
      return <History className="h-4 w-4 shrink-0" />
    case "/about/former-principals":
      return <Users className="h-4 w-4 shrink-0" />
    case "/about/former-vice-principals":
      return <Users className="h-4 w-4 shrink-0" />
    case "/about/db-higher-education":
      return <BookOpen className="h-4 w-4 shrink-0" />
    default:
      return null
  }
}

function toSidebarNavItems(items?: NavigationItem[] | null): SidebarNavItem[] {
  if (!items || items.length === 0) {
    return []
  }

  return items.map((item) => ({
    href: item.href ?? undefined,
    label: item.label,
    children: toSidebarNavItems(item.children),
  }))
}

// Excluded paths that should be handled by other routes
// Only exact matches are excluded, nested paths are handled by this route
const EXCLUDED_PATHS = [
  '/admin',
  '/api',
  '/news',
  '/gallery',
  '/downloads',
]

// Helper function to check if path should be excluded
function isExcludedPath(path: string): boolean {
  // Only exclude exact matches or paths that start with excluded paths followed by a non-slash character
  // This allows /about/founder to be handled by this route while excluding /about from this route
  if (EXCLUDED_PATHS.includes(path)) {
    return true
  }
  
  // Exclude paths that start with excluded paths (like /api/... or /admin/...)
  for (const excluded of EXCLUDED_PATHS) {
    if (path.startsWith(excluded + '/')) {
      return true
    }
  }
  
  return false
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const path = `/${slug.join("/")}`
  
  // Don't handle excluded paths
  if (isExcludedPath(path)) {
    return {}
  }
  
  const page = await prisma.page.findUnique({
    where: { slug: path },
  })

  const navigation = await getNavigationItems()
  const navItem = findNavigationItemByPath(path, navigation)

  if (page && page.published) {
    return {
      title: page.metaTitle || page.title,
      description: page.metaDescription || undefined,
    }
  }

  return {
    title: navItem?.label || "Page",
    description: undefined,
  }
}

export default async function NestedPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const path = `/${slug.join("/")}`
  
  // Don't handle excluded paths - let other routes handle them
  // Only exclude exact matches or API/admin routes
  if (isExcludedPath(path)) {
    notFound()
  }
  
  // Check if page exists in database
  // Try with leading slash first, then without
  let page = await prisma.page.findUnique({
    where: { slug: path },
  })
  
  // If not found, try without leading slash (in case slug was stored differently)
  if (!page && path.startsWith('/')) {
    page = await prisma.page.findUnique({
      where: { slug: path.slice(1) },
    })
  }
  
  // If still not found, try with leading slash (in case slug was stored without it)
  if (!page && !path.startsWith('/')) {
    page = await prisma.page.findUnique({
      where: { slug: `/${path}` },
    })
  }

  const navigation = await getNavigationItems()
  const navItem = findNavigationItemByPath(path, navigation)

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('NestedPage Debug:', {
      path,
      hasPage: !!page,
      pagePublished: page?.published,
      hasNavItem: !!navItem,
    })
  }

  if (!navItem) {
    notFound()
  }

  // Find parent navigation item to show sidebar
  const parentNavItem = findParentNavigationItem(path, navigation) as NavigationItem | null

  // If page exists and is published, show it
  if (page && page.published) {
    return (
      <div className="bg-brand-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header row */}
          <div className="mb-6">
            {parentNavItem?.href ? (
              <div className="mb-3">
                <Link
                  href={parentNavItem.href}
                  className="inline-flex items-center gap-2 text-sm text-brand-text/70 hover:text-brand-hover transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to {parentNavItem.label}
                </Link>
              </div>
            ) : null}

            {/* Compact breadcrumb-style path (in addition to the global breadcrumb) */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <Link href="/" className="hover:text-brand-hover transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              {parentNavItem?.href ? (
                <>
                  <Link href={parentNavItem.href} className="hover:text-brand-hover transition-colors">
                    {parentNavItem.label}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </>
              ) : null}
              <span className="text-slate-700 font-medium">{page.title}</span>
            </div>
          </div>

          {/* Mobile Toggle Button - Outside grid */}
          {parentNavItem && parentNavItem.children && parentNavItem.children.length > 0 && (
            <div className="lg:hidden mb-4">
              <CollapsibleSidebar
                title={parentNavItem.label}
                items={toSidebarNavItems(parentNavItem.children)}
                currentPath={path}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with child menus */}
            {parentNavItem && parentNavItem.children && parentNavItem.children.length > 0 && (
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24 bg-white/85 backdrop-blur border border-slate-200 rounded-2xl shadow-sm p-5">
                  <h3 className="font-bold text-lg mb-4 text-brand-text border-b border-slate-200 pb-3">
                    {parentNavItem.label}
                  </h3>
                  <nav className="space-y-2">
                  {parentNavItem.children.map((child) => (
                      <Link
                      key={child.href ?? child.label}
                      href={child.href ?? "#"}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          path === child.href
                            ? "bg-brand-gold/90 text-brand-text shadow-sm ring-1 ring-brand-gold border-l-4 border-brand-hover"
                            : "text-slate-700 hover:bg-slate-100 hover:text-brand-hover"
                        }`}
                      >
                        <span className={`${path === child.href ? "text-brand-maroon" : "text-slate-500"} transition-colors`}>
                          {parentNavItem?.href === "/about" ? iconForAboutHref(child.href ?? undefined) : null}
                        </span>
                        {child.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Main Content */}
            <article className={parentNavItem && parentNavItem.children && parentNavItem.children.length > 0 ? "lg:col-span-3" : "lg:col-span-4 max-w-4xl mx-auto"}>
              <div className="relative overflow-hidden bg-white/85 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-gold via-brand-sun to-brand-gold" />
                <div className="p-6 sm:p-8">
                  <div className="mb-6">
                    {parentNavItem ? (
                      <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {parentNavItem.label}
                      </div>
                    ) : null}
                    <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-brand-text tracking-tight">{page.title}</h1>
                    <p className="mt-2 text-sm sm:text-base text-slate-500">
                      Updated content from the official college website.
                    </p>
                  </div>

                <div
                  className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:tracking-tight
                    prose-p:text-slate-700 prose-p:leading-relaxed
                    prose-a:text-brand-hover hover:prose-a:text-brand-text prose-a:underline underline-offset-2
                    prose-strong:text-slate-900
                    prose-blockquote:border-l-brand-gold prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl
                    prose-ul:my-4 prose-ol:my-4
                    prose-li:my-1
                    [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl
                    [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    )
  }

  // Show placeholder if page doesn't exist or isn't published
  return (
    <div className="bg-brand-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mobile Toggle Button - Outside grid */}
        {parentNavItem && parentNavItem.children && parentNavItem.children.length > 0 && (
          <div className="lg:hidden mb-4">
            <CollapsibleSidebar
              title={parentNavItem.label}
              items={toSidebarNavItems(parentNavItem.children)}
              currentPath={path}
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with child menus */}
          {parentNavItem && parentNavItem.children && parentNavItem.children.length > 0 && (
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 bg-white border border-slate-200 rounded-lg shadow-sm p-5">
                <h3 className="font-bold text-lg mb-4 text-brand-text border-b border-slate-200 pb-2">{parentNavItem.label}</h3>
                <nav className="space-y-2">
                  {parentNavItem.children.map((child) => (
                    <Link
                      key={child.href ?? child.label}
                      href={child.href ?? "#"}
                      className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        path === child.href
                          ? "bg-brand-gold text-brand-text shadow-sm border-l-4 border-brand-hover"
                          : "text-slate-700 hover:bg-slate-100 hover:text-brand-hover"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Main Content */}
          <article className={parentNavItem && parentNavItem.children && parentNavItem.children.length > 0 ? "lg:col-span-3" : "lg:col-span-4 max-w-4xl mx-auto"}>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-8">
              <h1 className="text-4xl font-bold mb-6 text-brand-text">{navItem.label}</h1>
              
              {page && !page.published ? (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-md">
                  <p className="text-yellow-800 font-medium">This page is currently unpublished.</p>
                </div>
              ) : (
                <div className="bg-slate-100 border-l-4 border-brand-gold p-4 mb-6 rounded-r-md">
                  <p className="text-brand-text font-medium">
                    This page hasn't been created yet. Please create it from the admin panel.
                  </p>
                </div>
              )}

              {navItem.children && navItem.children.length > 0 && (
                <div className="mt-8 bg-brand-surface rounded-lg p-6 border border-slate-200">
                  <h2 className="text-2xl font-semibold mb-4 text-brand-text">Subpages</h2>
                  <ul className="space-y-2">
                    {navItem.children.map((child) => (
                      <li key={child.href ?? child.label}>
                        <Link
                          href={child.href ?? "#"}
                          className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-brand-text hover:text-brand-hover hover:bg-brand-surface rounded-md transition-colors"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!page && (
                <div className="mt-8 p-6 bg-brand-surface rounded-lg border border-slate-200">
                  <p className="text-gray-700 mb-4">
                    To add content to this page, please visit the admin panel and create a new page with the slug: <code className="bg-white px-2 py-1 rounded border border-gray-300 text-brand-text font-mono text-sm">{path}</code>
                  </p>
                  <Link
                    href="/admin/pages/new"
                    className="inline-block bg-brand-gold text-brand-text px-6 py-3 rounded-md hover:bg-brand-gold/90 transition-colors font-semibold border border-brand-gold"
                  >
                    Create This Page
                  </Link>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

