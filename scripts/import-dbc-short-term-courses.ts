import fs from "node:fs/promises"
import path from "node:path"

type ParsedCourse = {
  title: string
  code?: string
  description?: string
  sourcePageUrl?: string
  imageUrl?: string
}

function normalizeText(input: string) {
  return input.replace(/\s+/g, " ").trim()
}

function stripHtml(input: string) {
  return normalizeText(input.replace(/<[^>]*>/g, " "))
}

function absoluteUrl(url: string) {
  if (!url) return url
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
    .slice(0, 80)
}

function parseShortTermCoursesFromHomeHtml(html: string): ParsedCourse[] {
  const courses: ParsedCourse[] = []

  const marker = '<h1 class="display-5 mb-4">short term courses</h1>'
  const sectionStartIdx = html.toLowerCase().indexOf(marker)
  if (sectionStartIdx === -1) return courses

  const after = html.slice(sectionStartIdx)
  const gridStart = after.toLowerCase().indexOf('<div class="custom-grid">')
  if (gridStart === -1) return courses
  const afterGrid = after.slice(gridStart)
  // The next section on the homepage starts with `<div class="container my-5">`
  const endMarker = '<div class="container my-5">'
  const gridEnd = afterGrid.toLowerCase().indexOf(endMarker)
  const sectionHtml = gridEnd === -1 ? afterGrid : afterGrid.slice(0, gridEnd)

  const blocks = sectionHtml.match(/<div class="office-item[\s\S]*?<\/div>\s*<\/div>/gi) ?? []

  for (const block of blocks) {
    const imgSrc = /<img[^>]+src="([^"]+)"/i.exec(block)?.[1]
    const cardHref = /<a[^>]+href="([^"]+)"[^>]*>\s*<h4/i.exec(block)?.[1]
    const title = stripHtml(/<h4[^>]*>([\s\S]*?)<\/h4>/i.exec(block)?.[1] ?? "")
    const pText = stripHtml(/<p[^>]*>([\s\S]*?)<\/p>/i.exec(block)?.[1] ?? "")

    if (!title) continue

    const matchCodeOnly = /^\(([^)]+)\)$/.exec(pText)
    const code = matchCodeOnly ? matchCodeOnly[1].trim() : undefined
    const description = !matchCodeOnly && pText ? pText : undefined

    courses.push({
      title,
      code,
      description,
      sourcePageUrl: cardHref ? absoluteUrl(cardHref) : undefined,
      imageUrl: imgSrc ? absoluteUrl(imgSrc) : undefined,
    })
  }

  // Deduplicate by title
  const seen = new Set<string>()
  return courses.filter((c) => {
    const key = c.title.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function downloadToPublicFolder(imageUrl: string, title: string) {
  const url = new URL(imageUrl)
  const ext = path.extname(url.pathname) || ".jpg"
  const filename = `${safeFilename(title) || safeFilename(path.basename(url.pathname, ext))}${ext}`

  const publicDir = path.join(process.cwd(), "public", "short-term-courses")
  await fs.mkdir(publicDir, { recursive: true })

  const destAbsolute = path.join(publicDir, filename)
  const destPublicPath = `/short-term-courses/${filename}`

  // Skip if already downloaded
  try {
    await fs.stat(destAbsolute)
    return { destPublicPath, destAbsolute }
  } catch {
    // continue
  }

  const res = await fetch(imageUrl)
  if (!res.ok) {
    throw new Error(`Failed downloading image (${res.status}): ${imageUrl}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(destAbsolute, buf)

  return { destPublicPath, destAbsolute }
}

async function main() {
  const homeHtmlPath = path.join(process.cwd(), ".cache_dbc_home.html")
  const html = await fs.readFile(homeHtmlPath, "utf8")

  const courses = parseShortTermCoursesFromHomeHtml(html)
  if (courses.length === 0) {
    throw new Error("No short-term courses found in .cache_dbc_home.html")
  }

  // Ensure Prisma can run even if user has no .env yet.
  if (!process.env.DATABASE_URL) {
    // Note: `lib/prisma.ts` resolves `file:./...` relative to the `prisma/` directory.
    // The repo DB lives at `prisma/prisma/dev.db`, so this must be `file:./prisma/dev.db`.
    process.env.DATABASE_URL = "file:./prisma/dev.db"
  }

  const { prisma } = await import("../lib/prisma")

  const importedTitles = courses.map((c) => c.title)
  // Hide any previously imported items (local image path) that are no longer present.
  await prisma.shortTermCourse.updateMany({
    where: {
      image: { startsWith: "/short-term-courses/" },
      title: { notIn: importedTitles },
    },
    data: { published: false },
  })

  let order = 0
  for (const course of courses) {
    order += 1
    let imagePath: string | undefined
    if (course.imageUrl) {
      const { destPublicPath } = await downloadToPublicFolder(course.imageUrl, course.title)
      imagePath = destPublicPath
    }

    // Upsert by title (no unique constraint in schema).
    const existing = await prisma.shortTermCourse.findFirst({
      where: { title: course.title },
      select: { id: true },
    })

    const data = {
      title: course.title,
      code: course.code ?? null,
      description: course.description ?? null,
      image: imagePath ?? null,
      duration: null,
      fees: null,
      displayOrder: order,
      published: true,
    }

    if (existing) {
      await prisma.shortTermCourse.update({ where: { id: existing.id }, data })
    } else {
      await prisma.shortTermCourse.create({ data })
    }
  }

  console.log(`Imported ${courses.length} short-term courses.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

