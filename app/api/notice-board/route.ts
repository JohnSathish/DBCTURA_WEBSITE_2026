import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    // Get current date (start of today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let where: any = { 
      published: true,
      // Always filter out past events
      eventDate: {
        gte: today,
      },
    }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

      // Combine: events must be in the specified month AND not passed yet
      where.eventDate = {
        gte: startDate >= today ? startDate : today, // Use today if startDate is in the past
        lte: endDate,
      }
    }

    const events = await prisma.noticeBoardEvent.findMany({
      where,
      orderBy: [
        { eventDate: "asc" },
        { displayOrder: "asc" },
      ],
    })

    return NextResponse.json(events)
  } catch (error: any) {
    console.error("Error fetching notice board events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { title, description, eventDate, displayOrder, published } = data

    const event = await prisma.noticeBoardEvent.create({
      data: {
        title,
        description: description || null,
        eventDate: new Date(eventDate),
        displayOrder: displayOrder || 0,
        published: published !== undefined ? published : true,
      },
    })

    return NextResponse.json(event)
  } catch (error: any) {
    console.error("Error creating notice board event:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 400 }
    )
  }
}

