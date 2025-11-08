import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const download = await prisma.download.findUnique({
      where: { id },
    })

    if (!download) {
      return NextResponse.json({ error: "Download not found" }, { status: 404 })
    }

    return NextResponse.json(download)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch download" },
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
    const { id } = await params
    const data = await request.json()
    const { title, description, file, category } = data

    const download = await prisma.download.update({
      where: { id },
      data: {
        title,
        description: description || null,
        file,
        category: category || null,
      },
    })

    return NextResponse.json(download)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update download" },
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
    const { id } = await params
    await prisma.download.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete download" },
      { status: 500 }
    )
  }
}


