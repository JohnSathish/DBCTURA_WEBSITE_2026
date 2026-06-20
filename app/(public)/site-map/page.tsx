import Link from "next/link"

import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import { getStaticPublicPaths } from "@/lib/sitemap-urls"

export const metadata = {
  title: "Sitemap | Don Bosco College, Tura",
  description: "Browse all main sections of the Don Bosco College, Tura website.",
}

export default function SitemapPage() {
  const paths = getStaticPublicPaths().filter((p) => p !== "/site-map")

  return (
    <div className="min-h-screen bg-brand-surface py-12">
      <BreadcrumbTitleSetter title="Sitemap" />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <h1 className="font-heading text-3xl font-bold text-brand-text">Sitemap</h1>
          <p className="mt-2 text-slate-600">
            Main pages on{" "}
            <a href="https://donboscocollege.ac.in" className="text-[#1E3A8A] hover:underline">
              donboscocollege.ac.in
            </a>
            . For search engines, see{" "}
            <Link href="/sitemap.xml" className="text-[#1E3A8A] hover:underline">
              sitemap.xml
            </Link>
            .
          </p>
          <ul className="mt-8 columns-1 gap-x-8 sm:columns-2">
            {paths.map((path) => (
              <li key={path} className="mb-2 break-inside-avoid">
                <Link href={path} className="text-sm font-medium text-[#1E3A8A] hover:underline">
                  {path === "/" ? "Home" : path}
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  )
}
