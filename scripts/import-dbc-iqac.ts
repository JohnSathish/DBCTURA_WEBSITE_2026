export {}

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
  const u = new URL(url)
  const ext = path.extname(u.pathname) || ".pdf"
  const base = path.basename(u.pathname, ext) || "file"
  const filename = `${safeFilename(base)}${ext}`

  const publicDir = path.join(process.cwd(), "public", "downloads", "iqac")
  await fs.mkdir(publicDir, { recursive: true })

  const destAbs = path.join(publicDir, filename)
  const destPublic = `/downloads/iqac/${filename}`

  try {
    await fs.stat(destAbs)
    return destPublic
  } catch {
    // continue
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  const res = await fetch(url, { signal: controller.signal })
  clearTimeout(timeout)
  if (!res.ok) throw new Error(`Failed downloading PDF (${res.status}): ${url}`)

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

  // capture <a ... href="...pdf">label</a>
  const anchorRe = /<a\b[^>]*href="([^"]+\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi
  for (const match of html.matchAll(anchorRe)) {
    const href = normalizeUrl(match[1])
    const label = stripHtml(match[2]) || path.basename(new URL(href).pathname)
    results.push({ remote: href, label })
  }

  // Dedup by remote URL
  const seen = new Set<string>()
  return results.filter((l) => {
    if (seen.has(l.remote)) return false
    seen.add(l.remote)
    return true
  })
}

async function main() {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./prisma/dev.db"
  }

  const sourceUrl = "https://donboscocollege.ac.in/administration/iqac"
  const html = await fetchTextWithTimeout(sourceUrl, 20000)

  const pdfLinks = extractPdfLinks(html).slice(0, 40)

  const localPdfLinks: Array<{ label: string; href: string }> = []

  // Many IQAC pages link to lots of PDFs; downloading all can be slow/hang.
  // Download a limited number of reachable PDFs and still publish the page content.
  const MAX_PDFS_TO_DOWNLOAD = 12
  for (const link of pdfLinks) {
    if (localPdfLinks.length >= MAX_PDFS_TO_DOWNLOAD) break
    try {
      const ok = await headOk(link.remote, 7000)
      if (!ok) continue
      const local = await downloadPdfToPublic(link.remote)
      localPdfLinks.push({ label: link.label, href: local })
    } catch {
      // ignore
    }
  }

  // Visible text content (from the page’s main sections).
  // Source: https://donboscocollege.ac.in/administration/iqac
  let content = `
    <h2>Internal Quality Assurance Cell (IQAC)</h2>

    <h3>Objective</h3>
    <p>IQAC plays the most important role in the overall development of the institution. The primary aim of the IQAC is to build up a system for cognisant, consistent and catalytic action to improve the academic and administrative performance in all fields of the institution.</p>

    <h3>Functions</h3>
    <ol>
      <li>Enhancement and application of quality parameters for the diverse academic and administrative activities of the institution.</li>
      <li>Organisation of seminars and workshops on quality enhancement themes.</li>
      <li>Documentation of the various programmes / activities leading to quality improvement of the institution.</li>
      <li>Preparation of the Annual Quality Assurance Report (AQAR) to be submitted to NAAC based on the quality parameters as prescribed by NAAC.</li>
      <li>Organising faculty development / orientation programmes for Teaching and Non-Teaching Staff.</li>
      <li>Communication of information through National Survey on Higher Education - All India Survey on Higher Education (AISHE) initiated by MHRD, Government of India and other similar agencies.</li>
      <li>Administering Feedback Mechanism for the institution from all its stakeholders.</li>
    </ol>

    <h3>Strategies</h3>
    <p><strong>IQAC shall develop mechanisms and measures for:</strong></p>

    <h3>Benefits</h3>
    <ol>
      <li>Ensuring timely, efficient and progressive performance of academic, administrative and financial tasks.</li>
      <li>Optimization and incorporation of modern methods of teaching, learning and evaluation using ICT.</li>
      <li>Ensuring the adequacy, maintenance and functioning of the support structure of the institution.</li>
    </ol>

    <p><strong>IQAC will facilitate/ contribute:</strong></p>
    <ol start="4">
      <li>To increase the level of clarity and focus in institutional functioning towards quality enhancement and facilitation of the quality culture in the institution.</li>
      <li>To enhance and integrate the various activities of the institution and carry on the good practices of the institution and upscaling it.</li>
      <li>To provide a sound basis for decision-making to improve institutional functioning.</li>
      <li>To act as the agent of change in the institution.</li>
      <li>To act as the communicator among all the stakeholders of the institution.</li>
    </ol>

    <p><strong>SIGNIFICANT ACTIVITIES, CONTRIBUTIONS, PLAN OF ACTION &amp; ACHIEVEMENTS OF IQAC.</strong></p>
  `.trim()

  if (localPdfLinks.length > 0) {
    const list = localPdfLinks
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener noreferrer">${l.label}</a></li>`)
      .join("")
    content += `\n\n<h3>Documents</h3>\n<ul>${list}</ul>`
  }

  const { prisma } = await import("../lib/prisma")
  await prisma.page.upsert({
    where: { slug: "/administration/iqac" },
    update: {
      title: "IQAC",
      content,
      metaTitle: "IQAC",
      metaDescription: "Internal Quality Assurance Cell (IQAC) information and documents.",
      published: true,
    },
    create: {
      title: "IQAC",
      slug: "/administration/iqac",
      content,
      metaTitle: "IQAC",
      metaDescription: "Internal Quality Assurance Cell (IQAC) information and documents.",
      published: true,
    },
  })

  console.log("Updated page: /administration/iqac")
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

