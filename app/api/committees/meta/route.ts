import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCommitteeMeta, getExOfficioMembers, seedCommittees } from "@/lib/committees-service"

export async function GET() {
  try {
    const [meta, exOfficio] = await Promise.all([getCommitteeMeta(), getExOfficioMembers()])
    return NextResponse.json({ meta, exOfficio })
  } catch (error) {
    console.error("Error fetching committee meta:", error)
    return NextResponse.json({ error: "Failed to fetch committee settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { academicYear, published, exOfficio } = data

    const meta = await prisma.committeeMeta.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        academicYear: academicYear?.trim() || "2026 – 2027",
        published: published !== false,
      },
      update: {
        ...(academicYear !== undefined && { academicYear: academicYear.trim() }),
        ...(published !== undefined && { published: Boolean(published) }),
      },
    })

    if (Array.isArray(exOfficio)) {
      await prisma.committeeExOfficio.deleteMany()
      for (let i = 0; i < exOfficio.length; i++) {
        const m = exOfficio[i]
        if (!m.name?.trim()) continue
        await prisma.committeeExOfficio.create({
          data: {
            name: m.name.trim(),
            role: m.role?.trim() || "",
            displayOrder: m.displayOrder ?? i,
          },
        })
      }
    }

    const updatedExOfficio = await getExOfficioMembers()
    return NextResponse.json({ meta, exOfficio: updatedExOfficio })
  } catch (error) {
    console.error("Error updating committee meta:", error)
    return NextResponse.json({ error: "Failed to update committee settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json().catch(() => ({}))
    const replace = Boolean(data.replace)
    const result = await seedCommittees(replace)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error seeding committees:", error)
    return NextResponse.json({ error: "Failed to seed committees" }, { status: 500 })
  }
}
