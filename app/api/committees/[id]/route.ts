import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugifyCommitteeName } from "@/lib/committee-utils"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const committee = await prisma.committee.findUnique({
      where: { id },
      include: {
        members: { orderBy: [{ displayOrder: "asc" }, { slNo: "asc" }, { name: "asc" }] },
      },
    })
    if (!committee) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(committee)
  } catch (error) {
    console.error("Error fetching committee:", error)
    return NextResponse.json({ error: "Failed to fetch committee" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const data = await request.json()
    const { name, description, published, displayOrder, members } = data

    const existing = await prisma.committee.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    let slug = existing.slug
    if (name?.trim() && name.trim() !== existing.name) {
      const baseSlug = slugifyCommitteeName(name.trim())
      slug = baseSlug
      let suffix = 1
      while (true) {
        const clash = await prisma.committee.findUnique({ where: { slug } })
        if (!clash || clash.id === id) break
        slug = `${baseSlug}-${suffix++}`
      }
    }

    await prisma.committeeMember.deleteMany({ where: { committeeId: id } })

    const committee = await prisma.committee.update({
      where: { id },
      data: {
        name: name?.trim() ?? existing.name,
        slug,
        description: description !== undefined ? description?.trim() || null : existing.description,
        published: published !== undefined ? Boolean(published) : existing.published,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : existing.displayOrder,
        members: Array.isArray(members)
          ? {
              create: members.map(
                (
                  m: { slNo?: number; name: string; role?: string; displayOrder?: number },
                  idx: number
                ) => ({
                  slNo: m.slNo ?? null,
                  name: m.name.trim(),
                  role: m.role?.trim() || null,
                  displayOrder: m.displayOrder ?? idx,
                })
              ),
            }
          : undefined,
      },
      include: {
        members: { orderBy: [{ displayOrder: "asc" }, { slNo: "asc" }, { name: "asc" }] },
      },
    })

    return NextResponse.json(committee)
  } catch (error) {
    console.error("Error updating committee:", error)
    return NextResponse.json({ error: "Failed to update committee" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    await prisma.committee.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting committee:", error)
    return NextResponse.json({ error: "Failed to delete committee" }, { status: 500 })
  }
}
