import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import {
  FYUG_ALLOWED_IMAGE_TYPES,
  FYUG_MAX_PHOTO_BYTES,
  FYUG_MAX_SIGNATURE_BYTES,
} from "@/lib/fyug-admission-constants"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")
    const kind = String(formData.get("kind") || "photo")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!FYUG_ALLOWED_IMAGE_TYPES.includes(file.type as (typeof FYUG_ALLOWED_IMAGE_TYPES)[number])) {
      return NextResponse.json({ error: "Only JPG and PNG images are allowed" }, { status: 400 })
    }

    const maxBytes = kind === "signature" ? FYUG_MAX_SIGNATURE_BYTES : FYUG_MAX_PHOTO_BYTES
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large (max ${Math.round(maxBytes / 1024)} KB)` },
        { status: 400 }
      )
    }

    const ext = file.type.includes("png") ? "png" : "jpg"
    const year = new Date().getFullYear()
    const folder = path.join(process.cwd(), "public", "uploads", "fyug-admissions", String(year), kind)
    await mkdir(folder, { recursive: true })

    const fileName = `${randomUUID()}.${ext}`
    const diskPath = path.join(folder, fileName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(diskPath, buffer)

    const url = `/uploads/fyug-admissions/${year}/${kind}/${fileName}`
    return NextResponse.json({ success: true, url })
  } catch (e) {
    console.error("FYUG upload error:", e)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
