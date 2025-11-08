import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function generateUniqueSlug(title: string, excludeId?: string) {
  const baseSlug = slugify(title)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.news.findUnique({ where: { slug } })
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug
    }

    slug = `${baseSlug}-${counter++}`
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const published = searchParams.get("published")
  const session = await getServerSession(authOptions)

  // If published=true, return public news (no auth required)
  if (published === "true") {
    const news = await prisma.news.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      include: { author: { select: { email: true } } },
    })
    return NextResponse.json(news)
  }

  // Otherwise, require auth for admin access
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const news = await prisma.news.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { email: true } } },
  })

  return NextResponse.json(news)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { title, content, excerpt, image, featured, publishedAt } = data

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const slug = await generateUniqueSlug(title.trim())

    const news = await prisma.news.create({
      data: {
        title: title.trim(),
        slug,
        content,
        excerpt: excerpt?.trim() || null,
        image: image ? image : null,
        featured: featured ?? false,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        authorId: session.user.id,
      },
    })

    return NextResponse.json(news, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create news" },
      { status: 400 }
    )
  }
}

