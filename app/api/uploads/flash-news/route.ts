import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import fs from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images and PDFs are allowed." },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      )
    }

    // Persist under /public/uploads (Docker volume) — not /flash-news (conflicts with app/flash-news/[id]).
    const uploadDir = path.join(process.cwd(), "public", "uploads", "flash-news")
    await fs.mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const extension = file.type === "application/pdf" ? ".pdf" : path.extname(file.name)
    const filename = `${timestamp}-${randomStr}${extension}`
    const filepath = path.join(uploadDir, filename)

    await fs.writeFile(filepath, buffer)

    const publicPath = `/uploads/flash-news/${filename}`
    const fileType = file.type === "application/pdf" ? "pdf" : "image"

    return NextResponse.json({
      filePath: publicPath,
      fileType,
    })
  } catch (error: any) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    )
  }
}

