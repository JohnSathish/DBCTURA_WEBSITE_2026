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

  const publicDir = path.join(process.cwd(), "public", "downloads", "rusa")
  await fs.mkdir(publicDir, { recursive: true })

  const destAbs = path.join(publicDir, filename)
  const destPublic = `/downloads/rusa/${filename}`

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
  const anchorRe = /<a\b[^>]*href="([^"]+\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi
  for (const match of html.matchAll(anchorRe)) {
    const href = normalizeUrl(match[1])
    const label = stripHtml(match[2]) || path.basename(new URL(href).pathname)
    results.push({ remote: href, label })
  }
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

  const sourceUrl = "https://donboscocollege.ac.in/administration/rusa"
  const html = await fetchTextWithTimeout(sourceUrl, 20000)

  const pdfLinks = extractPdfLinks(html).slice(0, 40)
  const localPdfLinks: Array<{ label: string; href: string }> = []

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

  // Content from: https://donboscocollege.ac.in/administration/rusa
  let content = `
    <h2>Overview</h2>
    <p>Rashtriya Uchchatar Shiksha Abhiyan (RUSA) is a Centrally Sponsored Scheme (CSS), launched in 2013 aims at providing strategic funding to eligible state higher educational institutions. The central funding (in the ratio of 60:40 for general category States, 90:10 for special category states and 100% for union territories) would be norm based and outcome dependent. The funding would flow from the central ministry through the state governments/union territories to the State Higher Education Councils before reaching the identified institutions. The funding to states would be made on the basis of critical appraisal of State Higher Education Plans, which would describe each state’s strategy to address issues of equity, access and excellence in higher education.</p>

    <h2>Objectives</h2>
    <p><strong>The salient objectives of RUSA are to:</strong></p>
    <ol>
      <li>Improve the overall quality of state institutions by ensuring conformity to prescribed norms and standards and adopt accreditation as a mandatory quality assurance framework.</li>
      <li>Usher transformative reforms in the state higher education system by creating a facilitating institutional structure for planning and monitoring at the state level, promoting autonomy in State Universities and improving governance in institutions.</li>
      <li>Ensure reforms in the affiliation, academic and examination systems.</li>
      <li>Ensure adequate availability of quality faculty in all higher educational institutions and ensure capacity building at all levels of employment.</li>
      <li>Create an enabling atmosphere in the higher educational institutions to devote themselves to research and innovations.</li>
      <li>Expand the institutional base by creating additional capacity in existing institutions and establishing new institutions, in order to achieve enrolment targets.</li>
      <li>Correct regional imbalances in access to higher education by setting up institutions in unserved &amp; underserved areas.</li>
      <li>Improve equity in higher education by providing adequate opportunities of higher education to SC/STs and socially and educationally backward classes; promote inclusion of women, minorities, and differently abled persons.</li>
    </ol>

    <h2>Components</h2>
    <p>RUSA would create new universities through upgradation of existing autonomous colleges and conversion of colleges in a cluster. It would create new model degree colleges, new professional colleges and provide infrastructural support to universities and colleges. Faculty recruitment support, faculty improvements programmes and leadership development of educational administrators are also an important part of the scheme. In order to enhance skill development the existing central scheme of Polytechnics has been subsumed within RUSA. A separate component to synergise vocational education with higher education has also been included in RUSA. Besides these, RUSA also supports reforming, restructuring and building capacity of institutions in participating state.</p>
    <p>The following are the primary components of RUSA that capture the key action and funding areas that must be pursued for the fulfilment of the targets:</p>
    <ol>
      <li>Up gradation of existing autonomous colleges to Universities</li>
      <li>Conversion of colleges to Cluster Universities</li>
      <li>Infrastructure grants to Universities</li>
      <li>New Model Colleges (General)</li>
      <li>Upgradation of existing degree colleges to model colleges</li>
      <li>New Colleges (Professional)</li>
      <li>Infrastructure grants to colleges</li>
      <li>Research, innovation and quality improvement</li>
      <li>Equity initiatives</li>
      <li>Faculty Recruitment Support</li>
      <li>Faculty improvements</li>
      <li>Vocationalisation of Higher Education</li>
      <li>Leadership Development of Educational Administrators</li>
      <li>Institutional restructuring &amp; reforms</li>
      <li>Capacity building &amp; preparation, data collection &amp; planning</li>
    </ol>

    <h2>Members</h2>
    <div class="overflow-x-auto dbc-table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Dr. Sabindra Barman</td><td>Coordinator</td></tr>
          <tr><td>2</td><td>Mr. Mahidhar Rajbongshi</td><td>Asst. Coordinator</td></tr>
          <tr><td>3</td><td>Ms. Westerley R. Marak</td><td>Member</td></tr>
          <tr><td>4</td><td>Mr. Shiv R. Marak</td><td>Member</td></tr>
          <tr><td>5</td><td>Mr. Jevilline A Sangma</td><td>Member</td></tr>
        </tbody>
      </table>
    </div>
  `.trim()

  if (localPdfLinks.length > 0) {
    const list = localPdfLinks
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener noreferrer">${l.label}</a></li>`)
      .join("")
    content += `\n\n<h2>Documents</h2>\n<ul>${list}</ul>`
  }

  const { prisma } = await import("../lib/prisma")
  await prisma.page.upsert({
    where: { slug: "/administration/rusa" },
    update: {
      title: "RUSA",
      content,
      metaTitle: "RUSA",
      metaDescription: "RUSA overview, objectives, components, and members.",
      published: true,
    },
    create: {
      title: "RUSA",
      slug: "/administration/rusa",
      content,
      metaTitle: "RUSA",
      metaDescription: "RUSA overview, objectives, components, and members.",
      published: true,
    },
  })

  console.log("Updated page: /administration/rusa")
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

