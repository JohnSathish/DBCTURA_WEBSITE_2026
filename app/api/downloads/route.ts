import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const downloads = await prisma.download.findMany({
    orderBy: { uploadedAt: "desc" },
  })

  return NextResponse.json(downloads)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { title, description, file, category } = data

    const download = await prisma.download.create({
      data: {
        title,
        description: description || null,
        file,
        category: category || null,
      },
    })

    return NextResponse.json(download, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create download" },
      { status: 400 }
    )
  }
}


