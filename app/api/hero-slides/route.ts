import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    if (!(prisma as any).heroSlide) {
      return NextResponse.json([])
    }
    
    const slides = await (prisma as any).heroSlide.findMany({
      where: { published: true },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(slides)
  } catch (error: any) {
    console.error("Error fetching hero slides:", error)
    return NextResponse.json(
      { error: "Failed to fetch hero slides" },
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
    if (!(prisma as any).heroSlide) {
      return NextResponse.json(
        { error: "HeroSlide model not available. Please run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const data = await request.json()
    const { image, caption, displayOrder, published } = data

    const slide = await (prisma as any).heroSlide.create({
      data: {
        image,
        caption: caption || null,
        displayOrder: displayOrder || 0,
        published: published !== undefined ? published : true,
      },
    })

    return NextResponse.json(slide)
  } catch (error: any) {
    console.error("Error creating hero slide:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create hero slide" },
      { status: 400 }
    )
  }
}

