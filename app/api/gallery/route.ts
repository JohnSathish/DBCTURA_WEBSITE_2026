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
    const { title, image, category, displayOrder } = data

    const galleryImage = await prisma.galleryImage.create({
      data: {
        title,
        image,
        category: category || null,
        displayOrder: displayOrder || 0,
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


