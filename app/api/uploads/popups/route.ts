import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import fs from "fs/promises"
import path from "path"

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"])

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const popupId = formData.get("popupId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP, and SVG are allowed." }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Maximum file size is 5 MB." }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "popups")
    await fs.mkdir(uploadDir, { recursive: true })

    const ext = file.type === "image/svg+xml" ? ".svg" : path.extname(file.name) || ".jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const filepath = path.join(uploadDir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filepath, buffer)

    const imageUrl = `/uploads/popups/${filename}`

    if (popupId) {
      const { prisma } = await import("@/lib/prisma")
      await prisma.popupImage.create({
        data: { popupId, imageUrl },
      })
    }

    return NextResponse.json({ url: imageUrl, imageUrl, filePath: imageUrl })
  } catch (error: unknown) {
    console.error("Popup image upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
