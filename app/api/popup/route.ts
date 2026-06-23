import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  disableOtherPopups,
  getActivePublicPopup,
  parsePopupPayload,
} from "@/lib/popup-service"

export async function GET() {
  try {
    const popup = await getActivePublicPopup()
    if (!popup) {
      return NextResponse.json({ popup: null })
    }
    return NextResponse.json({ popup })
  } catch (error) {
    console.error("Error fetching popup:", error)
    return NextResponse.json({ error: "Failed to fetch popup" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = parsePopupPayload(await request.json())
    if (!payload.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (!payload.content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (payload.enabled) {
      await disableOtherPopups()
    }

    const popup = await prisma.popupBanner.create({ data: payload })
    return NextResponse.json({ popup }, { status: 201 })
  } catch (error) {
    console.error("Error creating popup:", error)
    return NextResponse.json({ error: "Failed to create popup" }, { status: 500 })
  }
}
