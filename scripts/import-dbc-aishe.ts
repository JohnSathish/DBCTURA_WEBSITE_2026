export {}

import fs from "node:fs/promises"
import path from "node:path"

function normalizeUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url.replace(/(donboscocollege\.ac\.in)\/+/g, "$1/")
  if (url.startsWith("//")) return `https:${url}`.replace(/(donboscocollege\.ac\.in)\/+/g, "$1/")
  if (url.startsWith("/")) return `https://donboscocollege.ac.in${url}`
  return `https://donboscocollege.ac.in/${url.replace(/^\.?\//, "")}`
}

/** Safe for fetch() when path contains spaces. */
function urlForHttp(raw: string): string {
  const n = normalizeUrl(raw)
  return encodeURI(n)
}

function safeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140)
}

async function fetchTextWithTimeout(url: string, timeoutMs = 20000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const res = await fetch(url, { signal: controller.signal })
  clearTimeout(timeout)
  if (!res.ok) throw new Error(`Failed fetching (${res.status}): ${url}`)
  return await res.text()
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/pdf,application/octet-stream,*/*;q=0.8",
  Referer: "https://donboscocollege.ac.in/administration/aishe",
} as const

async function downloadPdfToPublic(url: string) {
  const normalized = normalizeUrl(url)
  const fetchUrl = urlForHttp(normalized)
  const u = new URL(fetchUrl)
  const ext = path.extname(u.pathname) || ".pdf"
  const base = path.basename(decodeURIComponent(u.pathname), ext) || "aishe-document"
  const filename = `${safeFilename(base)}${ext}`

  const publicDir = path.join(process.cwd(), "public", "downloads", "aishe")
  await fs.mkdir(publicDir, { recursive: true })

  const destAbs = path.join(publicDir, filename)
  const destPublic = `/downloads/aishe/${filename}`

  try {
    await fs.stat(destAbs)
    return destPublic
  } catch {
    // continue
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)
  const res = await fetch(fetchUrl, { signal: controller.signal, headers: BROWSER_HEADERS })
  clearTimeout(timeout)
  if (!res.ok) throw new Error(`Failed downloading PDF (${res.status}): ${fetchUrl}`)

  const buf = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(destAbs, buf)
  return destPublic
}

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

type PdfLink = { remote: string; label: string }

function extractPdfLinks(html: string): PdfLink[] {
  const results: PdfLink[] = []

  const anchorRe = /<a\b[^>]*href="([^"]+\.(?:pdf|PDF))"[^>]*>([\s\S]*?)<\/a>/gi
  for (const match of html.matchAll(anchorRe)) {
    const rawHref = match[1]
    const href = normalizeUrl(rawHref)
    let label: string
    try {
      label =
        stripHtml(match[2]) ||
        path.basename(decodeURIComponent(new URL(urlForHttp(href)).pathname))
    } catch {
      label = stripHtml(match[2]) || path.basename(href)
    }
    results.push({ remote: href, label })
  }

  const bareUrlRe = /(https?:\/\/[^\s<>"']+\.(?:pdf|PDF))/gi
  for (const match of html.matchAll(bareUrlRe)) {
    const href = normalizeUrl(match[1])
    let base: string
    try {
      base = path.basename(decodeURIComponent(new URL(urlForHttp(href)).pathname))
    } catch {
      base = path.basename(href)
    }
    results.push({ remote: href, label: base })
  }

  const seen = new Set<string>()
  return results.filter((l) => {
    if (seen.has(l.remote)) return false
    seen.add(l.remote)
    return true
  })
}

function extractTiptapInnerHtml(html: string): string | null {
  const m = html.match(/<div[^>]*\bclass="[^"]*tiptap-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
  return m ? m[1].trim() : null
}

function rewritePdfHrefs(fragment: string, remoteToLocal: Map<string, string>): string {
  let out = fragment
  const keys = [...remoteToLocal.keys()].sort((a, b) => b.length - a.length)
  for (const remote of keys) {
    const local = remoteToLocal.get(remote)!
    const escaped = remote.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    out = out.replace(new RegExp(escaped, "g"), local)
    const sloppy = remote.replace("https://donboscocollege.ac.in/", "https://donboscocollege.ac.in//")
    if (sloppy !== remote) {
      out = out.replace(new RegExp(sloppy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), local)
    }
  }
  return out
}

async function main() {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./prisma/dev.db"
  }

  const sourceUrl = "https://donboscocollege.ac.in/administration/aishe"
  const html = await fetchTextWithTimeout(sourceUrl, 20000)

  let inner = extractTiptapInnerHtml(html)
  if (!inner) {
    inner = `<p>Unable to read page content from the source site. Please try again later.</p>`
  }

  const pdfLinks = extractPdfLinks(inner)
  const remoteToLocal = new Map<string, string>()
  let downloadFailures = 0

  const MAX_PDFS_TO_DOWNLOAD = 32
  for (const link of pdfLinks) {
    if (remoteToLocal.size >= MAX_PDFS_TO_DOWNLOAD) break
    try {
      const local = await downloadPdfToPublic(link.remote)
      remoteToLocal.set(link.remote, local)
    } catch {
      downloadFailures++
    }
  }

  inner = rewritePdfHrefs(inner, remoteToLocal)

  const content = `
    <p class="text-slate-600">All India Survey on Higher Education (AISHE) — documents for Don Bosco College, Tura (synced from the <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">official website</a>).</p>
    ${inner}
  `.trim()

  const { prisma } = await import("../lib/prisma")
  await prisma.page.upsert({
    where: { slug: "/administration/aishe" },
    update: {
      title: "AISHE",
      content,
      metaTitle: "AISHE",
      metaDescription: "AISHE uploading and certificates — Don Bosco College, Tura.",
      published: true,
    },
    create: {
      title: "AISHE",
      slug: "/administration/aishe",
      content,
      metaTitle: "AISHE",
      metaDescription: "AISHE uploading and certificates — Don Bosco College, Tura.",
      published: true,
    },
  })

  console.log("Updated page: /administration/aishe")
  console.log(
    `PDFs in page: ${pdfLinks.length}; saved to public/downloads/aishe: ${remoteToLocal.size}` +
      (downloadFailures ? `; could not mirror (${downloadFailures}, often 403 — links kept to live site)` : "")
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
