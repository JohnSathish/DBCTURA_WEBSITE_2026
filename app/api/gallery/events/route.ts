import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const prismaAny = prisma as any

  if (!prismaAny.galleryEvent || typeof prismaAny.galleryEvent.findMany !== "function") {
    return NextResponse.json(
      { error: "GalleryEvent model not initialized. Run 'npx prisma generate' and restart the server." },
      { status: 503 }
    )
  }

  const events = await prismaAny.galleryEvent.findMany({
    include: {
      album: true,
      _count: {
        select: { images: true }
      }
    },
    orderBy: { displayOrder: "asc" },
  })

  return NextResponse.json(events)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const prismaAny = prisma as any

    if (!prismaAny.galleryEvent || typeof prismaAny.galleryEvent.create !== "function") {
      return NextResponse.json(
        { error: "GalleryEvent model not initialized. Run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const data = await request.json()
    const { title, description, eventDate, albumId, displayOrder, images } = data

    const event = await prismaAny.galleryEvent.create({
      data: {
        title,
        description: description || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        albumId,
        displayOrder: displayOrder || 0,
        images: {
          create: (images || []).map((imageUrl: string, index: number) => ({
            image: imageUrl,
            displayOrder: index,
          })),
        },
      },
      include: {
        images: true,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 400 }
    )
  }
}


