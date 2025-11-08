import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const albumId = formData.get("albumId") as string

    if (!albumId) {
      return NextResponse.json({ error: "Album ID is required" }, { status: 400 })
    }

    // Verify album exists
    const album = await prisma.galleryAlbum.findUnique({
      where: { id: albumId },
    })

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    // Create gallery directory if it doesn't exist
    const galleryDir = path.join(process.cwd(), "public", "gallery")
    await fs.mkdir(galleryDir, { recursive: true })

    const uploadedImages = []

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        continue
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        continue
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(7)
      const extension = path.extname(file.name)
      const filename = `${timestamp}-${randomStr}${extension}`
      const filepath = path.join(galleryDir, filename)

      await fs.writeFile(filepath, buffer)

      const publicPath = `/gallery/${filename}`

      // Get current max displayOrder for this album
      const maxOrder = await prisma.galleryImage.findFirst({
        where: { albumId },
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      })

      const image = await prisma.galleryImage.create({
        data: {
          image: publicPath,
          albumId,
          displayOrder: (maxOrder?.displayOrder ?? -1) + 1,
        },
      })

      uploadedImages.push(image)
    }

    return NextResponse.json(uploadedImages)
  } catch (error: any) {
    console.error("Error uploading images:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload images" },
      { status: 500 }
    )
  }
}

