export {}

import fs from "node:fs/promises"
import path from "node:path"

function normalizeUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url.replace(/(donboscocollege\.ac\.in)\/+/g, "$1/")
  if (url.startsWith("//")) return `https:${url}`.replace(/(donboscocollege\.ac\.in)\/+/g, "$1/")
  if (url.startsWith("/")) return `https://donboscocollege.ac.in${url}`
  return `https://donboscocollege.ac.in/${url.replace(/^\.?\//, "")}`
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

async function headOk(url: string, timeoutMs = 7000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { method: "HEAD", signal: controller.signal })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

async function downloadPdfToPublic(url: string) {
  const normalized = normalizeUrl(url)
  const u = new URL(normalized)
  const ext = path.extname(u.pathname) || ".pdf"
  const base = path.basename(u.pathname, ext) || "nirf-document"
  const filename = `${safeFilename(base)}${ext}`

  const publicDir = path.join(process.cwd(), "public", "downloads", "nirf")
  await fs.mkdir(publicDir, { recursive: true })

  const destAbs = path.join(publicDir, filename)
  const destPublic = `/downloads/nirf/${filename}`

  try {
    await fs.stat(destAbs)
    return destPublic
  } catch {
    // continue
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  const res = await fetch(normalized, { signal: controller.signal })
  clearTimeout(timeout)
  if (!res.ok) throw new Error(`Failed downloading PDF (${res.status}): ${normalized}`)

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
    const href = normalizeUrl(match[1])
    const label = stripHtml(match[2]) || path.basename(new URL(href).pathname)
    results.push({ remote: href, label })
  }

  const bareUrlRe = /(https?:\/\/[^\s<>"']+\.(?:pdf|PDF))/gi
  for (const match of html.matchAll(bareUrlRe)) {
    const href = normalizeUrl(match[1])
    results.push({ remote: href, label: path.basename(new URL(href).pathname) })
  }

  const seen = new Set<string>()
  return results.filter((l) => {
    if (seen.has(l.remote)) return false
    seen.add(l.remote)
    return true
  })
}

/** Main body HTML from the college site (TipTap editor output). */
function extractTiptapInnerHtml(html: string): string | null {
  const m = html.match(/<div[^>]*\bclass="[^"]*tiptap-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
  return m ? m[1].trim() : null
}

/** Replace remote PDF URLs in HTML with locally cached paths. */
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

  const sourceUrl = "https://donboscocollege.ac.in/administration/nirf"
  const html = await fetchTextWithTimeout(sourceUrl, 20000)

  let inner = extractTiptapInnerHtml(html)
  if (!inner) {
    inner = `<p>Unable to read page content from the source site. Please try again later.</p>`
  }

  const pdfLinks = extractPdfLinks(inner)
  const remoteToLocal = new Map<string, string>()

  const MAX_PDFS_TO_DOWNLOAD = 24
  for (const link of pdfLinks) {
    if (remoteToLocal.size >= MAX_PDFS_TO_DOWNLOAD) break
    try {
      const ok = await headOk(link.remote, 10000)
      if (!ok) continue
      const local = await downloadPdfToPublic(link.remote)
      remoteToLocal.set(link.remote, local)
    } catch {
      // keep remote URL in content
    }
  }

  inner = rewritePdfHrefs(inner, remoteToLocal)

  const content = `
    <p class="text-slate-600">National Institutional Ranking Framework (NIRF) — documents and references for Don Bosco College, Tura (content synced from the <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">official website</a>).</p>
    ${inner}
  `.trim()

  const { prisma } = await import("../lib/prisma")
  await prisma.page.upsert({
    where: { slug: "/administration/nirf" },
    update: {
      title: "NIRF",
      content,
      metaTitle: "NIRF",
      metaDescription: "NIRF rankings and documents — Don Bosco College, Tura.",
      published: true,
    },
    create: {
      title: "NIRF",
      slug: "/administration/nirf",
      content,
      metaTitle: "NIRF",
      metaDescription: "NIRF rankings and documents — Don Bosco College, Tura.",
      published: true,
    },
  })

  console.log("Updated page: /administration/nirf")
  console.log(`PDFs linked: ${pdfLinks.length}, cached locally: ${remoteToLocal.size}`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
