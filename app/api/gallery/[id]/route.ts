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
    const galleryImage = await prisma.galleryImage.findUnique({
      where: { id },
    })

    if (!galleryImage) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 })
    }

    return NextResponse.json(galleryImage)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch gallery image" },
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
    const { title, image, category, displayOrder } = data

    const galleryImage = await prisma.galleryImage.update({
      where: { id },
      data: {
        title,
        image,
        category: category || null,
        displayOrder: displayOrder || 0,
      },
    })

    return NextResponse.json(galleryImage)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update gallery image" },
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
    await prisma.galleryImage.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete gallery image" },
      { status: 500 }
    )
  }
}


