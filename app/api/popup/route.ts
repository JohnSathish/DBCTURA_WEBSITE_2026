import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const popup = await prisma.popupBanner.findFirst({
      orderBy: { updatedAt: "desc" },
    })

    if (!popup || !popup.enabled) {
      return NextResponse.json({ popup: null })
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { title, content, enabled } = data

    // Disable all other popups if this one is enabled
    if (enabled) {
      await prisma.popupBanner.updateMany({
        where: { enabled: true },
        data: { enabled: false },
      })
    }

    const popup = await prisma.popupBanner.create({
      data: {
        title,
        content,
        enabled: enabled || false,
      },
    })

    return NextResponse.json({ popup })
  } catch (error) {
    console.error("Error creating popup:", error)
    return NextResponse.json(
      { error: "Failed to create popup" },
      { status: 500 }
    )
  }
}



