/**
 * Imports news from https://donboscocollege.ac.in/news-events (all pages)
 * and each /post/... detail page (rich-text body + feature image).
 *
 * Run: npx tsx scripts/import-dbc-news-events.ts
 * Requires: seeded admin user (npm run db:seed)
 */
import "dotenv/config"
import { parse, isValid } from "date-fns"
import { PrismaClient } from "../lib/prisma-generated/client"

const prisma = new PrismaClient()

const BASE = "https://donboscocollege.ac.in"
const LIST_PATH = "/news-events"
const MAX_PAGES = 25
const REQUEST_DELAY_MS = 200

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DonBoscoCollegeSiteMirror/1.0; +https://donboscocollege.ac.in)",
      Accept: "text/html,application/xhtml+xml",
    },
  })
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`)
  return res.text()
}

function absUrl(pathOrUrl: string): string {
  try {
    return new URL(pathOrUrl, BASE).href
  } catch {
    return pathOrUrl
  }
}

function slugFromPostUrl(postUrl: string): string | null {
  try {
    const u = new URL(postUrl)
    const parts = u.pathname.split("/").filter(Boolean)
    const last = parts[parts.length - 1]
    return last && last !== "post" ? last : null
  } catch {
    return null
  }
}

function parseListedDate(raw: string): Date | null {
  const t = raw.replace(/\s+/g, " ").trim()
  const formats = ["MMM dd,yyyy", "MMM d,yyyy", "MMM dd, yyyy", "MMM d, yyyy"]
  for (const fmt of formats) {
    const d = parse(t, fmt, new Date())
    if (isValid(d)) return d
  }
  const fallback = new Date(t)
  return isValid(fallback) ? fallback : null
}

type ListingCard = {
  postUrl: string
  slug: string
  imageUrl: string
  title: string
  listedDate: Date | null
}

/** Prefer news card image; ignore logo/favicon; support src before or after class. */
function extractFeatureImageSrc(chunk: string): string {
  const imgTags = chunk.match(/<img\b[^>]*>/gi) ?? []
  for (const tag of imgTags) {
    if (!/\bnews-img\b/.test(tag)) continue
    const srcM = tag.match(/\bsrc=["']([^"']+)["']/i)
    if (!srcM) continue
    return srcM[1].trim()
  }
  return ""
}

function sanitizeNewsImageUrl(url: string): string | null {
  if (!url) return null
  const abs = absUrl(url)
  const lower = abs.toLowerCase()
  if (lower.includes("fav.png") || lower.includes("/frontend/img/logo")) {
    return null
  }
  return abs
}

function parseListingPage(html: string): ListingCard[] {
  const out: ListingCard[] = []
  const chunks = html.split('<div class="col-md-4">')
  for (const chunk of chunks) {
    if (!chunk.includes("news-img")) continue

    const hrefM = chunk.match(/href="(https:\/\/donboscocollege\.ac\.in\/post\/[^"]+)"/)
    if (!hrefM) continue
    const postUrl = hrefM[1]
    const slug = slugFromPostUrl(postUrl)
    if (!slug) continue

    const rawSrc = extractFeatureImageSrc(chunk)
    const imageUrl = sanitizeNewsImageUrl(rawSrc) ?? ""

    const titleM = chunk.match(/<h5 class="card-title">([\s\S]*?)<\/h5>/)
    const title = titleM
      ? titleM[1]
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim()
      : ""

    const dateM = chunk.match(/fa-calendar[^<]*<\/i>\s*([^<]+)<\/small>/)
    const listedDate = dateM ? parseListedDate(dateM[1]) : null

    if (!title) continue

    out.push({ postUrl, slug, imageUrl, title, listedDate })
  }
  return out
}

function extractRichText(html: string): string | null {
  const m = html.match(/<div class="rich-text">([\s\S]*?)<\/div>/)
  return m ? m[1].trim() : null
}

function excerptFromHtml(html: string, max = 240): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (text.length <= max) return text
  return text.slice(0, max - 1) + "…"
}

async function fetchPostBody(postUrl: string): Promise<{ content: string; excerpt: string }> {
  try {
    const html = await fetchText(postUrl)
    const inner = extractRichText(html)
    if (inner) {
      return {
        content: `<div class="dbc-imported">${inner}</div>`,
        excerpt: excerptFromHtml(inner),
      }
    }
  } catch (e) {
    console.warn("Post fetch failed:", postUrl, e)
  }
  const fallback = `<p>Read the full story on <a href="${postUrl}" target="_blank" rel="noopener noreferrer">Don Bosco College, Tura</a>.</p>`
  return { content: fallback, excerpt: excerptFromHtml(fallback) }
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { email: "admin@donbosco.edu.in" } })
  if (!admin) throw new Error("Admin user not found. Run: npm run db:seed")

  const allCards: ListingCard[] = []
  const page1FeaturedSlugs = new Set<string>()

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1 ? `${BASE}${LIST_PATH}` : `${BASE}${LIST_PATH}?page=${page}`
    console.log("Listing:", url)
    const html = await fetchText(url)
    await sleep(REQUEST_DELAY_MS)

    const cards = parseListingPage(html)
    if (cards.length === 0) {
      console.log(`No cards on page ${page}, stopping.`)
      break
    }

    if (page === 1) {
      cards.slice(0, 5).forEach((c) => page1FeaturedSlugs.add(c.slug))
    }

    allCards.push(...cards)
  }

  console.log(`Total listing cards: ${allCards.length}`)

  const bySlug = new Map<string, ListingCard>()
  for (const c of allCards) {
    if (!bySlug.has(c.slug)) bySlug.set(c.slug, c)
  }
  const unique = [...bySlug.values()]
  console.log(`Unique posts: ${unique.length}`)

  let n = 0
  for (const card of unique) {
    n += 1
    const { content, excerpt } = await fetchPostBody(card.postUrl)
    await sleep(REQUEST_DELAY_MS)

    const publishedAt = card.listedDate ?? new Date()

    const image = card.imageUrl ? sanitizeNewsImageUrl(card.imageUrl) : null

    const data = {
      title: card.title,
      slug: card.slug,
      content,
      excerpt,
      image,
      publishedAt,
      featured: page1FeaturedSlugs.has(card.slug),
      authorId: admin.id,
    }

    const existing = await prisma.news.findUnique({ where: { slug: card.slug } })
    if (existing) {
      await prisma.news.update({
        where: { slug: card.slug },
        data: {
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          image: data.image,
          publishedAt: data.publishedAt,
          featured: data.featured,
        },
      })
      console.log(`[${n}/${unique.length}] Updated`, card.slug)
    } else {
      await prisma.news.create({ data })
      console.log(`[${n}/${unique.length}] Created`, card.slug)
    }
  }

  const cleared = await prisma.$executeRawUnsafe(
    `UPDATE News SET image = NULL WHERE image IS NOT NULL AND (
      LOWER(image) LIKE '%fav.png%' OR
      LOWER(image) LIKE '%/frontend/img/logo%' OR
      LOWER(image) LIKE '%/frontend/img/logo/%'
    )`
  )
  console.log("Cleared invalid logo/favicon image URLs (rows affected):", cleared)

  console.log("Done.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
