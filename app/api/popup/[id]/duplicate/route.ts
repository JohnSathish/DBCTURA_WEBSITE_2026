import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const source = await prisma.popupBanner.findUnique({ where: { id } })
    if (!source) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const popup = await prisma.popupBanner.create({
      data: {
        title: `${source.title} (Copy)`,
        content: source.content,
        popupType: source.popupType,
        displayPosition: source.displayPosition,
        popupSize: source.popupSize,
        overlayEnabled: source.overlayEnabled,
        autoCloseSeconds: source.autoCloseSeconds,
        startDate: source.startDate,
        endDate: source.endDate,
        displayOrder: source.displayOrder,
        enabled: false,
        published: false,
      },
    })

    return NextResponse.json({ popup }, { status: 201 })
  } catch (error) {
    console.error("Duplicate popup error:", error)
    return NextResponse.json({ error: "Failed to duplicate popup" }, { status: 500 })
  }
}
