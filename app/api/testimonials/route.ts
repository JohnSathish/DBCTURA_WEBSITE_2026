import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    if (!(prisma as any).testimonial) {
      return NextResponse.json([])
    }
    
    const testimonials = await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(testimonials)
  } catch (error: any) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
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
    if (!(prisma as any).testimonial) {
      return NextResponse.json(
        { error: "Testimonial model not available. Please run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const data = await request.json()
    const { name, designation, testimonial, image, displayOrder, published } = data

    const newTestimonial = await (prisma as any).testimonial.create({
      data: {
        name,
        designation,
        testimonial,
        image: image || null,
        displayOrder: displayOrder || 0,
        published: published !== undefined ? published : true,
      },
    })

    return NextResponse.json(newTestimonial)
  } catch (error: any) {
    console.error("Error creating testimonial:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create testimonial" },
      { status: 400 }
    )
  }
}

