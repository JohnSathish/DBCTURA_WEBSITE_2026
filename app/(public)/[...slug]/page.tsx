import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import Link from "next/link"
import { NavigationItem } from "@/lib/navigation"
import { getNavigationItems } from "@/lib/navigation-server"
import { findNavigationItemByPath, findParentNavigationItem } from "@/lib/navigation-helpers"
import CollapsibleSidebar from "@/components/layout/CollapsibleSidebar"

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
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Mobile Toggle Button - Outside grid */}
          {parentNavItem && parentNavItem.children && parentNavItem.children.length > 0 && (
            <div className="lg:hidden mb-4">
              <CollapsibleSidebar
                title={parentNavItem.label}
                items={parentNavItem.children}
                currentPath={path}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with child menus */}
            {parentNavItem && parentNavItem.children && parentNavItem.children.length > 0 && (
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24 bg-gradient-to-br from-white via-indigo-50/50 to-purple-50/50 border-2 border-indigo-200/50 rounded-lg shadow-lg p-5 backdrop-blur-sm">
                  <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{parentNavItem.label}</h3>
                  <nav className="space-y-2">
                    {parentNavItem.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          path === child.href
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transform scale-[1.02]"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 hover:text-indigo-700 hover:shadow-sm"
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
                <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{page.title}</h1>
                <div
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-indigo-600 hover:prose-a:text-purple-600"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              </div>
            </article>
          </div>
        </div>
      </div>
    )
  }

  // Show placeholder if page doesn't exist or isn't published
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mobile Toggle Button - Outside grid */}
        {parentNavItem && parentNavItem.children && parentNavItem.children.length > 0 && (
          <div className="lg:hidden mb-4">
            <CollapsibleSidebar
              title={parentNavItem.label}
              items={parentNavItem.children}
              currentPath={path}
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with child menus */}
          {parentNavItem && parentNavItem.children && parentNavItem.children.length > 0 && (
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 bg-gradient-to-br from-white via-indigo-50/50 to-purple-50/50 border-2 border-indigo-200/50 rounded-lg shadow-lg p-5 backdrop-blur-sm">
                <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{parentNavItem.label}</h3>
                <nav className="space-y-2">
                  {parentNavItem.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        path === child.href
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transform scale-[1.02]"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 hover:text-indigo-700 hover:shadow-sm"
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
              <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{navItem.label}</h1>
              
              {page && !page.published ? (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
                  <p className="text-yellow-800 font-medium">This page is currently unpublished.</p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg shadow-sm">
                  <p className="text-blue-800 font-medium">
                    This page hasn't been created yet. Please create it from the admin panel.
                  </p>
                </div>
              )}

              {navItem.children && navItem.children.length > 0 && (
                <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                  <h2 className="text-2xl font-semibold mb-4 text-purple-900">Subpages</h2>
                  <ul className="space-y-2">
                    {navItem.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="inline-flex items-center px-4 py-2 bg-white hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 text-indigo-700 hover:text-purple-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!page && (
                <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 shadow-sm">
                  <p className="text-gray-700 mb-4">
                    To add content to this page, please visit the admin panel and create a new page with the slug: <code className="bg-white px-2 py-1 rounded border border-gray-300 text-indigo-600 font-mono text-sm">{path}</code>
                  </p>
                  <Link
                    href="/admin/pages/new"
                    className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
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

