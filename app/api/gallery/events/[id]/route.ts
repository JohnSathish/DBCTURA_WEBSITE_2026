import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const event = await prisma.galleryEvent.findUnique({
      where: { id },
      include: {
        album: true,
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()
    const { title, description, eventDate, albumId, displayOrder, images } = data

    // Update event
    const event = await prisma.galleryEvent.update({
      where: { id },
      data: {
        title,
        description: description || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        albumId,
        displayOrder: displayOrder || 0,
      },
    })

    // Add new images if provided
    if (images && images.length > 0) {
      await prisma.galleryImage.createMany({
        data: images.map((imageUrl: string, index: number) => ({
          image: imageUrl,
          eventId: id,
          displayOrder: index,
        })),
      })
    }

    const updatedEvent = await prisma.galleryEvent.findUnique({
      where: { id },
      include: {
        images: true,
      },
    })

    return NextResponse.json(updatedEvent)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update event" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.galleryEvent.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    )
  }
}


