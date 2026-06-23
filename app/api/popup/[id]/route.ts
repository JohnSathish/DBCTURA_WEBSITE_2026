import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { disableOtherPopups, parsePopupPayload } from "@/lib/popup-service"
import { popupAnalyticsSummary } from "@/lib/popup-analytics"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const popup = await prisma.popupBanner.findUnique({
      where: { id },
      include: { images: { orderBy: { createdAt: "desc" } } },
    })

    if (!popup) {
      return NextResponse.json({ error: "Popup not found" }, { status: 404 })
    }

    return NextResponse.json({
      popup,
      analytics: popupAnalyticsSummary(popup),
    })
  } catch (error) {
    console.error("Error fetching popup:", error)
    return NextResponse.json({ error: "Failed to fetch popup" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const payload = parsePopupPayload(await request.json())

    if (payload.enabled) {
      await disableOtherPopups(id)
    }

    const popup = await prisma.popupBanner.update({
      where: { id },
      data: payload,
    })

    return NextResponse.json({ popup })
  } catch (error) {
    console.error("Error updating popup:", error)
    return NextResponse.json({ error: "Failed to update popup" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await prisma.popupBanner.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting popup:", error)
    return NextResponse.json({ error: "Failed to delete popup" }, { status: 500 })
  }
}
