import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(prisma as any).flashNews) {
      return NextResponse.json({ error: "FlashNews model not available" }, { status: 503 })
    }

    const { id } = await params
    const flashNews = await prisma.flashNews.findUnique({
      where: { id },
    })

    if (!flashNews) {
      return NextResponse.json({ error: "Flash news not found" }, { status: 404 })
    }

    return NextResponse.json(flashNews)
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch flash news" },
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
    if (!(prisma as any).flashNews) {
      return NextResponse.json(
        { error: "FlashNews model not available. Please run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const { id } = await params
    const data = await request.json()
    const { title, description, file, fileType, displayOrder, published } = data

    const flashNews = await prisma.flashNews.update({
      where: { id },
      data: {
        title,
        description: description || null,
        file: file || null,
        fileType: file || null ? fileType : null,
        displayOrder: displayOrder || 0,
        published: published !== undefined ? published : true,
      },
    })

    return NextResponse.json(flashNews)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update flash news" },
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
    if (!(prisma as any).flashNews) {
      return NextResponse.json(
        { error: "FlashNews model not available. Please run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const { id } = await params
    await prisma.flashNews.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete flash news" },
      { status: 500 }
    )
  }
}

