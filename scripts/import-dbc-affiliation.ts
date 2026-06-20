import fs from "node:fs/promises"
import path from "node:path"

function normalizeUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("//")) return `https:${url}`
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

async function downloadPdfToPublic(url: string) {
  const u = new URL(url)
  const ext = path.extname(u.pathname) || ".pdf"
  const base = path.basename(u.pathname, ext) || "file"
  const filename = `${safeFilename(base)}${ext}`

  const publicDir = path.join(process.cwd(), "public", "downloads", "affiliation")
  await fs.mkdir(publicDir, { recursive: true })

  const destAbs = path.join(publicDir, filename)
  const destPublic = `/downloads/affiliation/${filename}`

  try {
    await fs.stat(destAbs)
    return destPublic
  } catch {
    // continue
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)
  const res = await fetch(url, { signal: controller.signal })
  clearTimeout(timeout)
  if (!res.ok) throw new Error(`Failed downloading PDF (${res.status}): ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(destAbs, buf)
  return destPublic
}

async function headOk(url: string, timeoutMs = 5000) {
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

async function fetchTextWithTimeout(url: string, timeoutMs = 15000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const res = await fetch(url, { signal: controller.signal })
  clearTimeout(timeout)
  if (!res.ok) throw new Error(`Failed fetching (${res.status}): ${url}`)
  return await res.text()
}

async function withRetries<T>(fn: () => Promise<T>, attempts = 6, baseDelayMs = 250) {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err: any) {
      lastErr = err
      const msg = String(err?.message ?? err)
      // SQLite contention can happen while dev server is running.
      const retryable = msg.includes("SQLITE_BUSY") || msg.includes("database is locked") || msg.includes("Unable to open the database file")
      if (!retryable || i === attempts - 1) break
      const delay = baseDelayMs * Math.pow(2, i)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastErr
}

async function main() {
  // Ensure Prisma can run even if user has no .env yet.
  if (!process.env.DATABASE_URL) {
    // `lib/prisma.ts` resolves `file:./...` relative to the `prisma/` directory.
    process.env.DATABASE_URL = "file:./prisma/dev.db"
  }

  const slug = "/about/affiliation"
  const title = "Affiliation"

  // Pull from: https://donboscocollege.ac.in/about-us/affiliation
  // Note: the page is mostly text; if PDFs are present in future, we support downloading and relinking.
  const sourceUrl = "https://donboscocollege.ac.in/about-us/affiliation"
  const pageText = await fetchTextWithTimeout(sourceUrl, 15000)

  // Find PDF links (if any) in the HTML.
  const pdfLinks = Array.from(pageText.matchAll(/href="([^"]+\.pdf)"/gi)).map((m) => normalizeUrl(m[1]))
  const uniquePdfLinks = Array.from(new Set(pdfLinks)).slice(0, 40)

  const localPdfMap = new Map<string, string>()
  // Download PDFs with a small concurrency limit (and quick HEAD pre-check).
  const concurrency = 5
  let idx = 0
  async function worker() {
    while (idx < uniquePdfLinks.length) {
      const current = uniquePdfLinks[idx++]
      try {
        const ok = await headOk(current, 5000)
        if (!ok) {
          console.warn(`Skipping PDF (not reachable): ${current}`)
          continue
        }
        const local = await downloadPdfToPublic(current)
        localPdfMap.set(current, local)
      } catch {
        // Some PDFs referenced in site chrome/footer can be stale or blocked. Don't fail the import.
        console.warn(`Skipping PDF download (failed): ${current}`)
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()))

  // Build content (based on the visible content on the page).
  let content = `
    <p>Don Bosco College is a Registered Society under the Societies Registration Act of 1860 and is permanently affiliated to North Eastern Hill University (NEHU). The college is recognized by UGC. National Assessment and Accreditation Council (NAAC) has awarded ‘B’ Grade to the college.</p>

    <h2>Departments' Affiliation</h2>
    <ul>
      <li>B.Com</li>
      <li>Botany</li>
      <li>Chemistry</li>
      <li>Economics</li>
      <li>Education</li>
      <li>English</li>
      <li>Garo</li>
      <li>Geography</li>
      <li>History</li>
      <li>Mathematics</li>
      <li>Philosophy</li>
      <li>Physics</li>
      <li>Political Science</li>
      <li>Sociology</li>
      <li>Zoology</li>
    </ul>

    <h2>UGC Recognition</h2>
    <ul>
      <li>2(f)</li>
      <li>12(b)</li>
    </ul>
  `.trim()

  // If we downloaded any PDFs, add a local links section.
  if (localPdfMap.size > 0) {
    const links = Array.from(localPdfMap.entries())
      .map(([remote, local]) => `<li><a href="${local}" target="_blank" rel="noopener noreferrer">${path.basename(new URL(remote).pathname)}</a></li>`)
      .join("")
    content += `\n\n<h2>Documents</h2>\n<ul>${links}</ul>`
  }

  const { prisma } = await import("../lib/prisma")

  await withRetries(() =>
    prisma.page.upsert({
      where: { slug },
      update: {
        title,
        content,
        metaTitle: title,
        metaDescription: "Affiliation details of Don Bosco College, Tura.",
        published: true,
      },
      create: {
        title,
        slug,
        content,
        metaTitle: title,
        metaDescription: "Affiliation details of Don Bosco College, Tura.",
        published: true,
      },
    })
  )

  console.log(`Updated page: ${slug}`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

