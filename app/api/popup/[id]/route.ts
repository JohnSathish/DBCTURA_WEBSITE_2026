import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const popup = await prisma.popupBanner.findUnique({
      where: { id },
    })

    if (!popup) {
      return NextResponse.json({ error: "Popup not found" }, { status: 404 })
    }

    return NextResponse.json({ popup })
  } catch (error) {
    console.error("Error fetching popup:", error)
    return NextResponse.json(
      { error: "Failed to fetch popup" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()
    const { title, content, enabled } = data

    // If enabling this popup, disable all others
    if (enabled) {
      await prisma.popupBanner.updateMany({
        where: {
          enabled: true,
          id: { not: id },
        },
        data: { enabled: false },
      })
    }

    const popup = await prisma.popupBanner.update({
      where: { id },
      data: {
        title,
        content,
        enabled: enabled || false,
      },
    })

    return NextResponse.json({ popup })
  } catch (error) {
    console.error("Error updating popup:", error)
    return NextResponse.json(
      { error: "Failed to update popup" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await prisma.popupBanner.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting popup:", error)
    return NextResponse.json(
      { error: "Failed to delete popup" },
      { status: 500 }
    )
  }
}



