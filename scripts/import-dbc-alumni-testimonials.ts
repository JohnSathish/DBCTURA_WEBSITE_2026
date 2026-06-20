import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

type ImportedTestimonial = {
  id: string
  name: string
  designation: string
  testimonial: string
  image: string | null
}

const SOURCE_URL = "https://donboscocollege.ac.in/"
const OUTPUT_JSON = path.join(process.cwd(), "data", "alumni-testimonials.json")
const OUTPUT_PUBLIC_DIR = path.join(process.cwd(), "public", "alumni-testimonials")

function stripTags(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
}

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function downloadToPublic(url: string, baseName: string): Promise<string> {
  const absUrl = url.startsWith("http") ? url : new URL(url, SOURCE_URL).toString()
  const res = await fetch(absUrl)
  if (!res.ok) throw new Error(`Failed to download image: ${absUrl} (${res.status})`)

  const contentType = res.headers.get("content-type") ?? ""
  const ext =
    contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : contentType.includes("jpeg") ? "jpg" : "jpg"

  const fileName = `${baseName}.${ext}`
  const filePath = path.join(OUTPUT_PUBLIC_DIR, fileName)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(filePath, buf)
  return `/alumni-testimonials/${fileName}`
}

function extractTestimonialsFromHomeHtml(html: string): Array<{
  imgSrc: string | null
  name: string
  designation: string
  testimonial: string
}> {
  const startIdx = html.toLowerCase().indexOf('id="testimonialcarousel"')
  if (startIdx === -1) return []

  const slice = html.slice(startIdx, startIdx + 120_000) // enough to include all slides
  const marker = '<div class="carousel-item'
  const items: string[] = []
  const positions: number[] = []
  let cursor = 0
  while (true) {
    const i = slice.indexOf(marker, cursor)
    if (i === -1) break
    positions.push(i)
    cursor = i + marker.length
  }
  for (let i = 0; i < positions.length; i++) {
    const from = positions[i]
    const to = i + 1 < positions.length ? positions[i + 1] : slice.length
    items.push(slice.slice(from, to))
  }

  return items
    .map((block) => {
      const imgMatch = block.match(/<img[^>]*\ssrc="([^"]+)"[^>]*>/i)
      const imgSrc = imgMatch?.[1] ?? null

      const nameMatch = block.match(/<h5[^>]*>([\s\S]*?)<\/h5>/i)
      const name = stripTags(nameMatch?.[1] ?? "")

      const desigMatch = block.match(/<small[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/small>/i)
      const designation = stripTags(desigMatch?.[1] ?? "")

      const textMatch = block.match(/<div class="tiptap-content">([\s\S]*?)<\/div>/i)
      const testimonial = stripTags(textMatch?.[1] ?? "")

      return { imgSrc, name, designation, testimonial }
    })
    .filter((t) => t.name && t.testimonial)
}

async function main() {
  await mkdir(path.join(process.cwd(), "data"), { recursive: true })
  await mkdir(OUTPUT_PUBLIC_DIR, { recursive: true })

  const res = await fetch(SOURCE_URL)
  if (!res.ok) throw new Error(`Failed to fetch ${SOURCE_URL} (${res.status})`)
  const html = await res.text()

  const extracted = extractTestimonialsFromHomeHtml(html)
  if (extracted.length === 0) {
    throw new Error("No testimonials found in homepage HTML (testimonialCarousel).")
  }

  const imported: ImportedTestimonial[] = []

  for (const t of extracted) {
    const id = safeFileName(t.name) || `testimonial-${imported.length + 1}`
    let image: string | null = null

    if (t.imgSrc) {
      try {
        image = await downloadToPublic(t.imgSrc, id)
      } catch {
        image = null
      }
    }

    imported.push({
      id,
      name: t.name,
      designation: t.designation,
      testimonial: t.testimonial,
      image,
    })
  }

  await writeFile(OUTPUT_JSON, JSON.stringify(imported, null, 2) + "\n", "utf8")
  // eslint-disable-next-line no-console
  console.log(`Imported ${imported.length} alumni testimonials -> ${OUTPUT_JSON}`)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})

