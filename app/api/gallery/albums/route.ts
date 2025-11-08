import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const albums = await prisma.galleryAlbum.findMany({
    include: {
      childAlbums: true,
      events: {
        include: {
          _count: {
            select: { images: true }
          }
        }
      },
    },
    orderBy: { displayOrder: "asc" },
  })

  return NextResponse.json(albums)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { title, description, coverImage, parentAlbumId, displayOrder } = data

    const album = await prisma.galleryAlbum.create({
      data: {
        title,
        description: description || null,
        coverImage: coverImage || null,
        parentAlbumId: parentAlbumId || null,
        displayOrder: displayOrder || 0,
      },
    })

    return NextResponse.json(album, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create album" },
      { status: 400 }
    )
  }
}


