import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const popups = await prisma.popupBanner.findMany({
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ popups })
  } catch (error) {
    console.error("Error fetching popups:", error)
    return NextResponse.json(
      { error: "Failed to fetch popups" },
      { status: 500 }
    )
  }
}



