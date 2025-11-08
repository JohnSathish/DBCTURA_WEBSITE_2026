import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(prisma as any).shortTermCourse) {
      return NextResponse.json({ error: "ShortTermCourse model not available" }, { status: 503 })
    }

    const { id } = await params
    const course = await (prisma as any).shortTermCourse.findUnique({
      where: { id },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const data = await request.json()
    const { title, code, description, image, duration, fees, displayOrder, published } = data

    const course = await (prisma as any).shortTermCourse.update({
      where: { id },
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
    return NextResponse.json(
      { error: error.message || "Failed to update course" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    await (prisma as any).shortTermCourse.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    )
  }
}

