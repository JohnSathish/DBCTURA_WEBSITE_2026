import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const images = await prisma.galleryImage.findMany({
    orderBy: { displayOrder: "asc" },
  })

  return NextResponse.json(images)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { title, image, displayOrder, albumId } = data

    let resolvedAlbumId: string | null = typeof albumId === "string" && albumId.trim() ? albumId.trim() : null

    if (!resolvedAlbumId) {
      const defaultAlbum = await prisma.galleryAlbum.findFirst({
        select: { id: true },
        orderBy: { createdAt: "asc" },
      })

      if (!defaultAlbum) {
        return NextResponse.json(
          { error: "No gallery album found. Please create an album before adding images." },
          { status: 400 }
        )
      }

      resolvedAlbumId = defaultAlbum.id
    }

    const galleryImage = await prisma.galleryImage.create({
      data: {
        title,
        image,
        displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
        album: {
          connect: { id: resolvedAlbumId },
        },
      },
    })

    return NextResponse.json(galleryImage, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create gallery image" },
      { status: 400 }
    )
  }
}


