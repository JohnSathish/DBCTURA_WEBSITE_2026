/**
 * Migrates legacy CMS news feature images to public/uploads/news/.
 *
 * Sources tried (in order):
 *   1. Existing file in public/uploads/news/
 *   2. Local legacy CMS storage folder (--legacy-storage or LEGACY_STORAGE_PATH)
 *   3. Internet Archive (Wayback Machine) — multiple URL variants
 *   4. Archived /news-events listing pages matched by slug
 *   5. Direct HTTP fetch from legacy URL (--try-live)
 *
 * Run: npx tsx scripts/migrate-news-images.ts
 * Options:
 *   --dry-run                      Log actions without writing files or updating DB
 *   --delay=500                    Delay between network requests in ms (default: 500)
 *   --limit=N                      Process at most N unique legacy image URLs
 *   --legacy-storage=PATH          Folder containing old CMS storage (…/storage/file-manager)
 *   --try-live                     Attempt direct download from legacy URL after Wayback fails
 */
import "dotenv/config"
import { createHash } from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import { PrismaClient } from "../lib/prisma-generated/client"

const prisma = new PrismaClient()

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "news")
const FETCH_HEADERS = {
  "User-Agent":
    "DonBoscoCollegeMigration/1.0 (+https://donboscocollege.ac.in; contact admin@donboscocollege.ac.in)",
  Accept: "image/*,*/*",
}

type Options = {
  dryRun: boolean
  delayMs: number
  limit: number | null
  legacyStoragePaths: string[]
  tryLive: boolean
}

type DownloadResult = {
  buffer: Buffer
  contentType: string
  source: string
}

type NewsGroup = {
  sampleUrl: string
  slug: string
  publishedAt: Date | null
  newsIds: string[]
  titles: string[]
}

function parseArgs(): Options {
  const dryRun = process.argv.includes("--dry-run")
  const tryLive = process.argv.includes("--try-live")
  const delayArg = process.argv.find((a) => a.startsWith("--delay="))
  const limitArg = process.argv.find((a) => a.startsWith("--limit="))
  const legacyArg = process.argv.find((a) => a.startsWith("--legacy-storage="))

  const delayMs = delayArg ? Math.max(0, parseInt(delayArg.split("=")[1] ?? "500", 10)) : 500
  const limitRaw = limitArg ? parseInt(limitArg.split("=")[1] ?? "", 10) : NaN
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : null

  const legacyStoragePaths = [
    legacyArg?.split("=").slice(1).join("="),
    process.env.LEGACY_STORAGE_PATH,
    path.join(process.cwd(), "legacy-storage", "file-manager"),
    path.join(process.cwd(), "storage", "file-manager"),
    path.join(process.cwd(), "public", "storage", "file-manager"),
  ].filter((value): value is string => Boolean(value?.trim()))

  return { dryRun, delayMs, limit, legacyStoragePaths, tryLive }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function absLegacyUrl(url: string): string {
  if (url.startsWith("http")) return url
  return `https://donboscocollege.ac.in${url.startsWith("/") ? url : `/${url}`}`
}

function isLegacyImageUrl(url: string | null | undefined): url is string {
  if (!url) return false
  if (url.startsWith("/uploads/news/")) return false
  return (
    url.includes("storage/file-manager") ||
    /^https?:\/\/(www\.)?donboscocollege\.ac\.in\//i.test(url)
  )
}

function legacyUrlKey(url: string): string {
  const parsed = new URL(absLegacyUrl(url))
  const host = parsed.hostname.replace(/^www\./i, "").toLowerCase()
  const pathname = decodeURIComponent(parsed.pathname)
  return `${host}${pathname}`.toLowerCase()
}

function legacyStorageRelativePath(url: string): string {
  const parsed = new URL(absLegacyUrl(url))
  const marker = "/storage/file-manager/"
  const idx = parsed.pathname.toLowerCase().indexOf(marker)
  if (idx === -1) return decodeURIComponent(parsed.pathname.replace(/^\//, ""))
  return decodeURIComponent(parsed.pathname.slice(idx + marker.length))
}

function cdxLookupVariants(url: string): string[] {
  const parsed = new URL(absLegacyUrl(url))
  const host = parsed.hostname.replace(/^www\./i, "").toLowerCase()
  const decodedPath = decodeURIComponent(parsed.pathname)
  const encodedPath = parsed.pathname

  const variants = new Set<string>([
    `${host}${decodedPath}${parsed.search}`,
    `${host}${encodedPath}${parsed.search}`,
    `${host}${decodedPath.toLowerCase()}${parsed.search}`,
    `www.${host}${decodedPath}${parsed.search}`,
    `www.${host}${encodedPath}${parsed.search}`,
  ])

  return [...variants]
}

function safeFilenameFromUrl(imageUrl: string): string {
  const parsed = new URL(absLegacyUrl(imageUrl))
  const raw = decodeURIComponent(path.basename(parsed.pathname))
  const ext = path.extname(raw).toLowerCase() || ".jpg"
  const stem = path.basename(raw, path.extname(raw))
  const safeStem = stem
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
  return `${safeStem || "news-image"}${ext}`
}

function shortHash(input: string): string {
  return createHash("sha1").update(input).digest("hex").slice(0, 8)
}

function extFromContentType(contentType: string): string | null {
  const ct = contentType.toLowerCase()
  if (ct.includes("jpeg") || ct.includes("jpg")) return ".jpg"
  if (ct.includes("png")) return ".png"
  if (ct.includes("webp")) return ".webp"
  if (ct.includes("gif")) return ".gif"
  return null
}

function guessContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === ".png") return "image/png"
  if (ext === ".webp") return "image/webp"
  if (ext === ".gif") return "image/gif"
  return "image/jpeg"
}

type CdxHit = {
  timestamp: string
  original: string
}

async function queryCdx(lookup: string, requireImage = true): Promise<CdxHit | null> {
  const cdxApi = new URL("https://web.archive.org/cdx/search/cdx")
  cdxApi.searchParams.set("url", lookup)
  cdxApi.searchParams.set("output", "json")
  cdxApi.searchParams.set("filter", "statuscode:200")
  cdxApi.searchParams.set("limit", "1")
  cdxApi.searchParams.set("sort", "reverse")

  const res = await fetch(cdxApi.toString(), { headers: FETCH_HEADERS })
  if (!res.ok) return null

  const rows = (await res.json()) as string[][]
  if (rows.length < 2) return null

  const [, timestamp, original, mimetype] = rows[1]
  if (!timestamp || !original) return null
  if (requireImage && mimetype && !String(mimetype).startsWith("image/")) return null
  return { timestamp, original }
}

async function findWaybackCapture(legacyUrl: string): Promise<CdxHit | null> {
  for (const lookup of cdxLookupVariants(legacyUrl)) {
    const hit = await queryCdx(lookup, true)
    if (hit) return hit
  }
  return null
}

async function downloadWaybackImage(capture: CdxHit): Promise<DownloadResult | null> {
  const waybackUrl = `https://web.archive.org/web/${capture.timestamp}id_/${capture.original}`
  const res = await fetch(waybackUrl, { headers: FETCH_HEADERS, redirect: "follow" })
  if (!res.ok) return null

  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.startsWith("image/")) return null

  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.length === 0) return null

  return { buffer, contentType, source: "wayback" }
}

async function downloadFromWayback(legacyUrl: string): Promise<DownloadResult | null> {
  const capture = await findWaybackCapture(legacyUrl)
  if (!capture) return null
  return downloadWaybackImage(capture)
}

async function readFromLegacyStorage(
  legacyUrl: string,
  legacyStoragePaths: string[]
): Promise<DownloadResult | null> {
  const relativePath = legacyStorageRelativePath(legacyUrl)
  const basename = path.basename(relativePath)

  for (const root of legacyStoragePaths) {
    const candidates = [
      path.join(root, relativePath),
      path.join(root, "post", "feature_image", basename),
      path.join(root, basename),
    ]

    for (const candidate of candidates) {
      try {
        const buffer = await fs.readFile(candidate)
        if (buffer.length === 0) continue
        return {
          buffer,
          contentType: guessContentType(candidate),
          source: `legacy-storage (${candidate})`,
        }
      } catch {
        // try next candidate
      }
    }
  }

  return null
}

async function downloadDirect(legacyUrl: string): Promise<DownloadResult | null> {
  for (const candidate of [legacyUrl, absLegacyUrl(legacyUrl)]) {
    try {
      const res = await fetch(candidate, { headers: FETCH_HEADERS, redirect: "follow" })
      if (!res.ok) continue
      const contentType = res.headers.get("content-type") ?? ""
      if (!contentType.startsWith("image/")) continue
      const buffer = Buffer.from(await res.arrayBuffer())
      if (buffer.length === 0) continue
      return { buffer, contentType, source: "live-url" }
    } catch {
      // try next
    }
  }
  return null
}

let listingCaptureCache: CdxHit[] | null = null

async function getNewsListingCaptures(): Promise<CdxHit[]> {
  if (listingCaptureCache) return listingCaptureCache

  const cdxApi = new URL("https://web.archive.org/cdx/search/cdx")
  cdxApi.searchParams.set("url", "donboscocollege.ac.in/news-events")
  cdxApi.searchParams.set("output", "json")
  cdxApi.searchParams.set("filter", "statuscode:200")
  cdxApi.searchParams.set("limit", "8")
  cdxApi.searchParams.set("sort", "reverse")

  const res = await fetch(cdxApi.toString(), { headers: FETCH_HEADERS })
  if (!res.ok) {
    listingCaptureCache = []
    return listingCaptureCache
  }

  const rows = (await res.json()) as string[][]
  listingCaptureCache = rows.slice(1).map((row) => ({
    timestamp: row[1],
    original: row[2],
  }))

  return listingCaptureCache
}

function extractListingImageForSlug(html: string, slug: string): string | null {
  const slugPath = `/post/${slug}`
  const chunks = html.split('<div class="col-md-4">')
  for (const chunk of chunks) {
    if (!chunk.includes(slugPath) || !chunk.includes("news-img")) continue
    const srcMatch = chunk.match(/\bsrc=["']([^"']+)["']/i)
    if (srcMatch?.[1]) return srcMatch[1].trim()
  }
  return null
}

function captureDate(timestamp: string): Date {
  const y = timestamp.slice(0, 4)
  const m = timestamp.slice(4, 6)
  const d = timestamp.slice(6, 8)
  return new Date(`${y}-${m}-${d}T00:00:00Z`)
}

async function downloadFromArchivedListing(
  slug: string,
  legacyUrl: string,
  publishedAt: Date | null
): Promise<DownloadResult | null> {
  const captures = await getNewsListingCaptures()
  for (const capture of captures) {
    if (publishedAt) {
      const capturedOn = captureDate(capture.timestamp)
      // Skip listing snapshots taken before the article existed.
      if (capturedOn < new Date(publishedAt.getTime() - 86_400_000)) continue
    }
    const pageUrl = `https://web.archive.org/web/${capture.timestamp}id_/${capture.original}`
    const res = await fetch(pageUrl, { headers: FETCH_HEADERS, redirect: "follow" })
    if (!res.ok) continue

    const html = await res.text()
    const imageSrc = extractListingImageForSlug(html, slug)
    if (!imageSrc) continue

    const resolved = absLegacyUrl(imageSrc)
    const fromWayback = await downloadFromWayback(resolved)
    if (fromWayback) {
      return { ...fromWayback, source: `archived listing (${capture.timestamp})` }
    }

    if (legacyUrlKey(resolved) === legacyUrlKey(legacyUrl)) {
      const hit = await findWaybackCapture(resolved)
      if (hit) {
        const image = await downloadWaybackImage(hit)
        if (image) return { ...image, source: `archived listing (${capture.timestamp})` }
      }
    }
  }

  return null
}

async function downloadLegacyImage(
  legacyUrl: string,
  slug: string,
  publishedAt: Date | null,
  options: Options
): Promise<DownloadResult | null> {
  const fromStorage = await readFromLegacyStorage(legacyUrl, options.legacyStoragePaths)
  if (fromStorage) return fromStorage

  const fromWayback = await downloadFromWayback(legacyUrl)
  if (fromWayback) return fromWayback

  const fromListing = await downloadFromArchivedListing(slug, legacyUrl, publishedAt)
  if (fromListing) return fromListing

  if (options.tryLive) {
    const fromLive = await downloadDirect(legacyUrl)
    if (fromLive) return fromLive
  }

  return null
}

async function ensureUniqueFilename(baseName: string, urlKey: string, reserved: Map<string, string>): Promise<string> {
  const existing = reserved.get(urlKey)
  if (existing) return existing

  let candidate = baseName
  const usedNames = new Set(reserved.values())
  if (usedNames.has(candidate)) {
    const ext = path.extname(baseName)
    const stem = path.basename(baseName, ext)
    candidate = `${stem}-${shortHash(urlKey)}${ext}`
  }

  let suffix = 2
  while (usedNames.has(candidate)) {
    const ext = path.extname(baseName)
    const stem = path.basename(baseName, ext)
    candidate = `${stem}-${shortHash(urlKey)}-${suffix}${ext}`
    suffix += 1
  }

  reserved.set(urlKey, candidate)
  return candidate
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function main() {
  const options = parseArgs()
  const { dryRun, delayMs, limit, legacyStoragePaths, tryLive } = options

  const rows = await prisma.news.findMany({
    where: { image: { not: null } },
    select: { id: true, title: true, slug: true, image: true, publishedAt: true },
  })

  const legacyRows = rows.filter((row) => isLegacyImageUrl(row.image))
  if (legacyRows.length === 0) {
    console.log("No legacy news image URLs found.")
    return
  }

  const groups = new Map<string, NewsGroup>()
  for (const row of legacyRows) {
    const key = legacyUrlKey(row.image!)
    const group = groups.get(key)
    if (group) {
      group.newsIds.push(row.id)
      group.titles.push(row.title)
    } else {
      groups.set(key, {
        sampleUrl: row.image!,
        slug: row.slug,
        publishedAt: row.publishedAt,
        newsIds: [row.id],
        titles: [row.title],
      })
    }
  }

  let groupEntries = [...groups.entries()]
  if (limit !== null) {
    groupEntries = groupEntries.slice(0, limit)
  }

  console.log(
    `Found ${legacyRows.length} news row(s) with legacy image URLs (${groups.size} unique file(s)).` +
      (limit !== null ? ` Processing first ${groupEntries.length} unique URL(s).` : "")
  )
  if (legacyStoragePaths.length > 0) {
    console.log(`Legacy storage search paths:\n  ${legacyStoragePaths.join("\n  ")}`)
  }
  if (tryLive) console.log("Direct live URL fetch enabled (--try-live).")
  if (dryRun) console.log("Dry run — no files will be written and no DB updates will be made.")
  console.log()

  if (!dryRun) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }

  const filenameByUrlKey = new Map<string, string>()
  const stats = { downloaded: 0, reused: 0, updated: 0, failed: 0, notArchived: 0 }
  const failedItems: string[] = []

  for (let i = 0; i < groupEntries.length; i++) {
    const [urlKey, group] = groupEntries[i]
    const baseName = safeFilenameFromUrl(group.sampleUrl)
    const filename = await ensureUniqueFilename(baseName, urlKey, filenameByUrlKey)
    const publicPath = `/uploads/news/${filename}`
    const absolutePath = path.join(UPLOAD_DIR, filename)

    console.log(`[${i + 1}/${groupEntries.length}] ${filename}`)
    console.log(`  legacy: ${group.sampleUrl}`)
    console.log(`  slug:   ${group.slug}`)
    console.log(`  rows:   ${group.newsIds.length}`)

    let targetPath: string | null = null

    if (await fileExists(absolutePath)) {
      console.log("  status: reusing existing file on disk")
      stats.reused += 1
      targetPath = publicPath
    } else if (dryRun) {
      console.log("  status: would download and update DB")
      targetPath = publicPath
    } else {
      try {
        const result = await downloadLegacyImage(group.sampleUrl, group.slug, group.publishedAt, options)
        if (!result) {
          const archived = await findWaybackCapture(group.sampleUrl)
          const reason = archived
            ? "Wayback lookup succeeded but image download failed"
            : "Not archived on Wayback (common for posts after ~Feb 2026). Copy old CMS storage with --legacy-storage=PATH"
          console.log(`  status: FAILED — ${reason}`)
          stats.failed += 1
          if (!archived) stats.notArchived += 1
          failedItems.push(`${filename} (${group.slug})`)
          if (delayMs > 0 && i < groupEntries.length - 1) await sleep(delayMs)
          continue
        }

        let finalName = filename
        const ext = extFromContentType(result.contentType)
        if (ext && !finalName.toLowerCase().endsWith(ext)) {
          const stem = path.basename(finalName, path.extname(finalName))
          finalName = `${stem}${ext}`
          filenameByUrlKey.set(urlKey, finalName)
        }

        const finalPath = path.join(UPLOAD_DIR, finalName)
        targetPath = `/uploads/news/${finalName}`

        await fs.writeFile(finalPath, result.buffer)
        console.log(`  status: downloaded via ${result.source} (${result.buffer.length} bytes)`)
        stats.downloaded += 1
      } catch (error) {
        console.log(`  status: FAILED — ${error instanceof Error ? error.message : String(error)}`)
        stats.failed += 1
        failedItems.push(`${filename} (${group.slug})`)
        if (delayMs > 0 && i < groupEntries.length - 1) await sleep(delayMs)
        continue
      }
    }

    if (targetPath && !dryRun) {
      const updated = await prisma.news.updateMany({
        where: { id: { in: group.newsIds } },
        data: { image: targetPath },
      })
      stats.updated += updated.count
      console.log(`  db:     updated ${updated.count} row(s) -> ${targetPath}`)
    }

    if (delayMs > 0 && i < groupEntries.length - 1) {
      await sleep(delayMs)
    }
  }

  console.log("\nSummary:")
  console.log(`  unique legacy URLs processed: ${groupEntries.length}`)
  console.log(`  downloaded: ${stats.downloaded}`)
  console.log(`  reused existing files: ${stats.reused}`)
  console.log(`  db rows updated: ${stats.updated}`)
  console.log(`  failed: ${stats.failed}`)
  if (stats.notArchived > 0) {
    console.log(`  not on Wayback: ${stats.notArchived}`)
    console.log(
      "\nRecent images may never have been crawled by archive.org." +
        "\nIf you have a backup of the old CMS, run:" +
        "\n  npm run migrate-news-images -- --legacy-storage=/path/to/storage/file-manager"
    )
  }
  if (failedItems.length > 0) {
    console.log("\nFailed items:")
    for (const item of failedItems) console.log(`  - ${item}`)
  }
  if (dryRun) {
    console.log("\nRe-run without --dry-run to apply changes.")
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
