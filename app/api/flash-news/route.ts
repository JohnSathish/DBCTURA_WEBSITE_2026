import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    if (!(prisma as any).flashNews) {
      return NextResponse.json([])
    }
    
    const flashNews = await prisma.flashNews.findMany({
      where: { published: true },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(flashNews)
  } catch (error: any) {
    console.error("Error fetching flash news:", error)
    return NextResponse.json(
      { error: "Failed to fetch flash news" },
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
    // Check if flashNews model exists
    if (!('flashNews' in prisma)) {
      return NextResponse.json(
        { 
          error: "FlashNews model not available. Please stop the dev server, run 'npx prisma generate', and restart the server." 
        },
        { status: 503 }
      )
    }

    const data = await request.json()
    const { title, description, file, fileType, displayOrder, published } = data

    // Use type assertion to access the model
    const flashNews = await (prisma as any).flashNews.create({
      data: {
        title,
        description: description || null,
        file: file || null,
        fileType: fileType || null,
        displayOrder: displayOrder || 0,
        published: published !== undefined ? published : true,
      },
    })

    return NextResponse.json(flashNews)
  } catch (error: any) {
    console.error("Error creating flash news:", error)
    
    // Provide helpful error message if model doesn't exist
    if (error.message?.includes("flashNews") || error.message?.includes("Cannot read")) {
      return NextResponse.json(
        { 
          error: "FlashNews model not available. Please stop the dev server, run 'npx prisma generate', and restart the server." 
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to create flash news" },
      { status: 400 }
    )
  }
}

