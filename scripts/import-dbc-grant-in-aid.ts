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

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/pdf,application/octet-stream,*/*;q=0.8",
  Referer: "https://donboscocollege.ac.in/administration/grant-in-aid",
} as const

async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const timeoutMs = init.timeoutMs ?? 20000
  const { timeoutMs: _t, ...rest } = init
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...rest, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

async function fetchTextWithTimeout(url: string, timeoutMs = 20000) {
  const res = await fetchWithTimeout(url, { timeoutMs })
  if (!res.ok) throw new Error(`Failed fetching (${res.status}): ${url}`)
  return await res.text()
}

async function downloadPdfToPublic(url: string) {
  const normalized = normalizeUrl(url)
  const u = new URL(normalized)
  const ext = path.extname(u.pathname) || ".pdf"
  const base = path.basename(u.pathname, ext) || "grant-in-aid"
  const filename = `${safeFilename(base)}${ext}`

  const publicDir = path.join(process.cwd(), "public", "downloads", "grant-in-aid")
  await fs.mkdir(publicDir, { recursive: true })

  const destAbs = path.join(publicDir, filename)
  const destPublic = `/downloads/grant-in-aid/${filename}`

  try {
    await fs.stat(destAbs)
    return destPublic
  } catch {
    // continue
  }

  const res = await fetchWithTimeout(normalized, { headers: BROWSER_HEADERS, timeoutMs: 45000 })
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

  const sourceUrl = "https://donboscocollege.ac.in/administration/grant-in-aid"
  const html = await fetchTextWithTimeout(sourceUrl, 20000)

  let inner = extractTiptapInnerHtml(html)
  if (!inner) {
    inner = `<p>Unable to read page content from the source site. Please try again later.</p>`
  }

  const pdfLinks = extractPdfLinks(inner)
  const remoteToLocal = new Map<string, string>()
  let failures = 0

  for (const link of pdfLinks) {
    try {
      const local = await downloadPdfToPublic(link.remote)
      remoteToLocal.set(link.remote, local)
    } catch {
      failures++
    }
  }

  inner = rewritePdfHrefs(inner, remoteToLocal)

  const content = `
    <p class="text-slate-600">Grant-in Aid — document for Don Bosco College, Tura (synced from the <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">official website</a>).</p>
    ${inner}
  `.trim()

  const { prisma } = await import("../lib/prisma")
  await prisma.page.upsert({
    where: { slug: "/administration/grant-in-aid" },
    update: {
      title: "Grant-in Aid",
      content,
      metaTitle: "Grant-in Aid",
      metaDescription: "Grant-in Aid document — Don Bosco College, Tura.",
      published: true,
    },
    create: {
      title: "Grant-in Aid",
      slug: "/administration/grant-in-aid",
      content,
      metaTitle: "Grant-in Aid",
      metaDescription: "Grant-in Aid document — Don Bosco College, Tura.",
      published: true,
    },
  })

  console.log("Updated page: /administration/grant-in-aid")
  console.log(`PDFs found: ${pdfLinks.length}; saved under public/downloads/grant-in-aid: ${remoteToLocal.size}` +
    (failures ? ` (${failures} download(s) failed — links point to live site)` : ""))
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
