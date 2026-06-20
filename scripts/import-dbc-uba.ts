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
    .slice(0, 120)
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
  Referer: "https://donboscocollege.ac.in/administration/uba",
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

function extractTiptapInnerHtml(html: string): string | null {
  const m = html.match(/<div[^>]*\bclass="[^"]*tiptap-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
  return m ? m[1].trim() : null
}

/** Download college-hosted images and return map remote -> /images/uba/... */
async function mirrorCollegeImages(fragment: string): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const imgRe = /<img\b[^>]*\bsrc="([^"]+)"/gi
  const urls: string[] = []
  for (const m of fragment.matchAll(imgRe)) {
    const raw = m[1]
    if (!raw.includes("donboscocollege.ac.in")) continue
    const norm = normalizeUrl(raw)
    if (!urls.includes(norm)) urls.push(norm)
  }

  const publicDir = path.join(process.cwd(), "public", "images", "uba")
  await fs.mkdir(publicDir, { recursive: true })

  for (const remote of urls) {
    try {
      const u = new URL(remote)
      const ext = path.extname(u.pathname) || ".png"
      const base = path.basename(u.pathname, ext) || "uba-image"
      const filename = `${safeFilename(base)}${ext}`
      const destAbs = path.join(publicDir, filename)
      const destPublic = `/images/uba/${filename}`

      try {
        await fs.stat(destAbs)
        map.set(remote, destPublic)
        continue
      } catch {
        // fetch
      }

      const res = await fetchWithTimeout(remote, { headers: BROWSER_HEADERS, timeoutMs: 25000 })
      if (!res.ok) throw new Error(String(res.status))

      const buf = Buffer.from(await res.arrayBuffer())
      await fs.writeFile(destAbs, buf)
      map.set(remote, destPublic)
    } catch {
      // keep remote URL in HTML
    }
  }

  return map
}

function rewriteSrc(fragment: string, remoteToLocal: Map<string, string>): string {
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

  const sourceUrl = "https://donboscocollege.ac.in/administration/uba"
  const html = await fetchTextWithTimeout(sourceUrl, 20000)

  let inner = extractTiptapInnerHtml(html)
  if (!inner) {
    inner = `<p>Unable to read page content from the source site. Please try again later.</p>`
  }

  const imgMap = await mirrorCollegeImages(inner)
  inner = rewriteSrc(inner, imgMap)

  const content = `
    <p class="text-slate-600">Unnat Bharat Abhiyan (UBA) — content synced from the <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">official Don Bosco College website</a>.</p>
    ${inner}
  `.trim()

  const { prisma } = await import("../lib/prisma")
  await prisma.page.upsert({
    where: { slug: "/administration/uba" },
    update: {
      title: "UBA",
      content,
      metaTitle: "UBA",
      metaDescription: "Unnat Bharat Abhiyan (UBA) — adopted villages and activities, Don Bosco College, Tura.",
      published: true,
    },
    create: {
      title: "UBA",
      slug: "/administration/uba",
      content,
      metaTitle: "UBA",
      metaDescription: "Unnat Bharat Abhiyan (UBA) — adopted villages and activities, Don Bosco College, Tura.",
      published: true,
    },
  })

  console.log("Updated page: /administration/uba")
  console.log(`College images mirrored: ${imgMap.size}`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
