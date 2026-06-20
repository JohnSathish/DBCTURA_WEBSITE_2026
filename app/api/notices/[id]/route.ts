import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function parseDateOrNull(value: unknown) {
  if (!value) return null
  const d = new Date(String(value))
  return isNaN(d.getTime()) ? null : d
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const notice = await prisma.noticeBoardNotice.findUnique({ where: { id } })
    if (!notice) return NextResponse.json({ error: "Notice not found" }, { status: 404 })
    return NextResponse.json(notice)
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch notice" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await params
    const data = await request.json()
    const {
      title,
      content,
      noticeType,
      pdfUrl,
      imageUrl,
      publishDate,
      expiryDate,
      active,
      important,
      pinned,
    } = data ?? {}

    if (!title || String(title).trim().length < 1) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const type = String(noticeType || "").trim()
    if (!["document", "image", "text"].includes(type)) {
      return NextResponse.json({ error: "Invalid notice type" }, { status: 400 })
    }

    const publish = parseDateOrNull(publishDate) ?? new Date()
    const expiry = parseDateOrNull(expiryDate)
    if (expiry && expiry <= publish) {
      return NextResponse.json({ error: "Expiry date must be after publish date" }, { status: 400 })
    }

    const pdf = pdfUrl ? String(pdfUrl) : null
    const img = imageUrl ? String(imageUrl) : null
    if (type === "document" && !pdf) {
      return NextResponse.json({ error: "PDF is required for Document notices" }, { status: 400 })
    }
    if (type === "image" && !img) {
      return NextResponse.json({ error: "Image is required for Image notices" }, { status: 400 })
    }

    const notice = await prisma.noticeBoardNotice.update({
      where: { id },
      data: {
        title: String(title).trim(),
        content: content ? String(content) : null,
        noticeType: type,
        pdfUrl: type === "document" ? pdf : null,
        imageUrl: type === "image" ? img : null,
        publishDate: publish,
        expiryDate: expiry,
        active: typeof active === "boolean" ? active : true,
        important: typeof important === "boolean" ? important : false,
        pinned: typeof pinned === "boolean" ? pinned : false,
      },
    })

    return NextResponse.json(notice)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update notice" }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await params
    await prisma.noticeBoardNotice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete notice" }, { status: 500 })
  }
}

