import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugifyCommitteeName } from "@/lib/committee-utils"
import {
  getCommitteeMeta,
  getCommittees,
  getExOfficioMembers,
} from "@/lib/committees-service"

export async function GET(request: NextRequest) {
  try {
    const includeDrafts = request.nextUrl.searchParams.get("includeDrafts") === "1"
    const search = request.nextUrl.searchParams.get("search")?.trim()

    if (!includeDrafts) {
      const meta = await getCommitteeMeta()
      if (!meta.published) {
        return NextResponse.json({ meta, exOfficio: [], committees: [] })
      }
    }

    const [meta, exOfficio, committees] = await Promise.all([
      getCommitteeMeta(),
      getExOfficioMembers(),
      getCommittees({ includeDrafts }),
    ])

    let filtered = committees
    if (search) {
      const q = search.toLowerCase()
      filtered = committees.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.members.some(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              (m.role?.toLowerCase().includes(q) ?? false)
          )
      )
    }

    return NextResponse.json({ meta, exOfficio, committees: filtered })
  } catch (error) {
    console.error("Error fetching committees:", error)
    return NextResponse.json({ error: "Failed to fetch committees" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { name, description, published = true, displayOrder = 0, members = [] } = data

    if (!name?.trim()) {
      return NextResponse.json({ error: "Committee name is required" }, { status: 400 })
    }

    const baseSlug = slugifyCommitteeName(name.trim())
    let slug = baseSlug
    let suffix = 1
    while (await prisma.committee.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`
    }

    const committee = await prisma.committee.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        published: Boolean(published),
        displayOrder: Number(displayOrder) || 0,
        members: {
          create: (members as Array<{ slNo?: number; name: string; role?: string; displayOrder?: number }>).map(
            (m, idx) => ({
              slNo: m.slNo ?? null,
              name: m.name.trim(),
              role: m.role?.trim() || null,
              displayOrder: m.displayOrder ?? idx,
            })
          ),
        },
      },
      include: { members: { orderBy: [{ displayOrder: "asc" }, { slNo: "asc" }] } },
    })

    return NextResponse.json(committee, { status: 201 })
  } catch (error) {
    console.error("Error creating committee:", error)
    return NextResponse.json({ error: "Failed to create committee" }, { status: 500 })
  }
}
