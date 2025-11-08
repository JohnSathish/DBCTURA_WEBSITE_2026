import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const STREAMS = {
  Arts: ["Education", "Economics", "English", "Garo", "Geography", "Environment", "History", "Philosophy"],
  Science: ["Botany", "Chemistry", "Mathematics", "Physics", "Zoology"],
  Commerce: ["Commerce"],
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const staff = await prisma.staffProfile.findUnique({
      where: { id },
    })

    if (!staff) {
      return NextResponse.json({ error: "Staff profile not found" }, { status: 404 })
    }

    return NextResponse.json({ staff })
  } catch (error) {
    console.error("Error fetching staff profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff profile" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()
    const { name, designation, department, stream, photo, category = "teaching" } = data
    const normalizedCategory = category === "non-teaching" ? "non-teaching" : "teaching"

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Staff name is required" },
        { status: 400 }
      )
    }

    if (!designation || !designation.trim()) {
      return NextResponse.json(
        { error: "Designation is required" },
        { status: 400 }
      )
    }

    if (normalizedCategory === "teaching" && !stream) {
      return NextResponse.json(
        { error: "Stream is required" },
        { status: 400 }
      )
    }

    if (!department || !department.trim()) {
      return NextResponse.json(
        { error: "Department is required" },
        { status: 400 }
      )
    }

    let streamValue: string | null = stream || null

    if (normalizedCategory === "teaching") {
      if (!stream) {
        return NextResponse.json({ error: "Stream is required" }, { status: 400 })
      }
      const validDepartments = STREAMS[stream as keyof typeof STREAMS]
      if (!validDepartments || !validDepartments.includes(department)) {
        return NextResponse.json(
          { error: "Invalid department for selected stream" },
          { status: 400 }
        )
      }
    } else {
      streamValue = null
    }

    const staff = await prisma.staffProfile.update({
      where: { id },
      data: {
        name: name.trim(),
        designation: designation.trim(),
        department: department.trim(),
        stream: streamValue,
        category: normalizedCategory,
        photo: photo || null,
      },
    })

    return NextResponse.json({ staff })
  } catch (error: any) {
    console.error("Error updating staff profile:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update staff profile" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await prisma.staffProfile.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting staff profile:", error)
    return NextResponse.json(
      { error: "Failed to delete staff profile" },
      { status: 500 }
    )
  }
}

