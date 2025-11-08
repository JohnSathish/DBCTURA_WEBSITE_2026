import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(prisma as any).testimonial) {
      return NextResponse.json({ error: "Testimonial model not available" }, { status: 503 })
    }

    const { id } = await params
    const testimonial = await (prisma as any).testimonial.findUnique({
      where: { id },
    })

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json(testimonial)
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch testimonial" },
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
    if (!(prisma as any).testimonial) {
      return NextResponse.json(
        { error: "Testimonial model not available. Please run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const { id } = await params
    const data = await request.json()
    const { name, designation, testimonial, image, displayOrder, published } = data

    const updatedTestimonial = await (prisma as any).testimonial.update({
      where: { id },
      data: {
        name,
        designation,
        testimonial,
        image: image || null,
        displayOrder: displayOrder || 0,
        published: published !== undefined ? published : true,
      },
    })

    return NextResponse.json(updatedTestimonial)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update testimonial" },
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
    if (!(prisma as any).testimonial) {
      return NextResponse.json(
        { error: "Testimonial model not available. Please run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const { id } = await params
    await (prisma as any).testimonial.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    )
  }
}

