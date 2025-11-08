import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Image size exceeds 5MB limit" }, { status: 400 })
    }

    // Create gallery directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "gallery")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const ext = originalName.split(".").pop() || "jpg"
    const filename = `${timestamp}-${originalName}`
    const filepath = join(uploadDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return the public URL path
    const publicPath = `/gallery/${filename}`

    return NextResponse.json({ 
      success: true, 
      filePath: publicPath,
      fileName: file.name,
      fileSize: file.size 
    })
  } catch (error: any) {
    console.error("Image upload error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    )
  }
}


