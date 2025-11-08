import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(prisma as any).heroSlide) {
      return NextResponse.json({ error: "HeroSlide model not available" }, { status: 503 })
    }

    const { id } = await params
    const slide = await (prisma as any).heroSlide.findUnique({
      where: { id },
    })

    if (!slide) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 })
    }

    return NextResponse.json(slide)
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch hero slide" },
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
    if (!(prisma as any).heroSlide) {
      return NextResponse.json(
        { error: "HeroSlide model not available. Please run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const { id } = await params
    const data = await request.json()
    const { image, caption, displayOrder, published } = data

    const slide = await (prisma as any).heroSlide.update({
      where: { id },
      data: {
        image,
        caption: caption || null,
        displayOrder: displayOrder || 0,
        published: published !== undefined ? published : true,
      },
    })

    return NextResponse.json(slide)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update hero slide" },
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
    if (!(prisma as any).heroSlide) {
      return NextResponse.json(
        { error: "HeroSlide model not available. Please run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const { id } = await params
    await (prisma as any).heroSlide.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete hero slide" },
      { status: 500 }
    )
  }
}

