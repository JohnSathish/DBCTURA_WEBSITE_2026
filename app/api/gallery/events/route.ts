import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const events = await prisma.galleryEvent.findMany({
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
    const data = await request.json()
    const { title, description, eventDate, albumId, displayOrder, images } = data

    const event = await prisma.galleryEvent.create({
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


