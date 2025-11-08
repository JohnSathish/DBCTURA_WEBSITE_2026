import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    if (!(prisma as any).shortTermCourse) {
      return NextResponse.json([])
    }
    
    const courses = await (prisma as any).shortTermCourse.findMany({
      where: { published: true },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(courses)
  } catch (error: any) {
    console.error("Error fetching short-term courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
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
    if (!(prisma as any).shortTermCourse) {
      return NextResponse.json(
        { error: "ShortTermCourse model not available. Please run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const data = await request.json()
    const { title, code, description, image, duration, fees, displayOrder, published } = data

    const course = await (prisma as any).shortTermCourse.create({
      data: {
        title,
        code: code || null,
        description: description || null,
        image: image || null,
        duration: duration || null,
        fees: fees || null,
        displayOrder: displayOrder || 0,
        published: published !== undefined ? published : true,
      },
    })

    return NextResponse.json(course)
  } catch (error: any) {
    console.error("Error creating course:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 400 }
    )
  }
}

