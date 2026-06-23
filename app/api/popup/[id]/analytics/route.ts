import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const event = String(body.event || "view")
    const sessionId = String(body.sessionId || "")

    const popup = await prisma.popupBanner.findUnique({ where: { id } })
    if (!popup || !popup.enabled || !popup.published) {
      return NextResponse.json({ ok: true })
    }

    const data: Record<string, { increment: number }> = {}

    switch (event) {
      case "view":
        data.totalViews = { increment: 1 }
        if (sessionId) {
          try {
            await prisma.popupViewSession.create({
              data: { popupId: id, sessionId },
            })
            data.uniqueViews = { increment: 1 }
          } catch {
            // duplicate session — count view but not unique
          }
        }
        break
      case "click":
        data.totalClicks = { increment: 1 }
        break
      case "button_click":
        data.totalClicks = { increment: 1 }
        data.buttonClicks = { increment: 1 }
        break
      case "close":
        data.closeCount = { increment: 1 }
        break
      default:
        break
    }

    if (Object.keys(data).length > 0) {
      await prisma.popupBanner.update({ where: { id }, data })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Popup analytics error:", error)
    return NextResponse.json({ ok: true })
  }
}
