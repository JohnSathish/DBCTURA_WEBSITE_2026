import type { MetadataRoute } from "next"

import { prisma } from "@/lib/prisma"
import { getStaticPublicPaths } from "@/lib/sitemap-urls"
import { getSiteUrl } from "@/lib/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = getStaticPublicPaths().map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }))

  let dynamicEntries: MetadataRoute.Sitemap = []

  try {
    const [pages, newsPosts] = await Promise.all([
      prisma.page.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.news.findMany({
        where: { publishedAt: { not: null } },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
    ])

    const pagePaths = new Set(getStaticPublicPaths())

    dynamicEntries = [
      ...pages
        .filter((p) => !pagePaths.has(`/${p.slug}`))
        .map((p) => ({
          url: `${base}/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        })),
      ...newsPosts.map((n) => ({
        url: `${base}/news/${n.slug}`,
        lastModified: n.updatedAt ?? n.publishedAt ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.65,
      })),
    ]
  } catch {
    // DB unavailable at build time — static routes still work
  }

  return [...staticEntries, ...dynamicEntries]
}
