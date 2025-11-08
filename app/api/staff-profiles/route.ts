import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const STREAMS = {
  Arts: ["Education", "Economics", "English", "Garo", "Geography", "Environment", "History", "Philosophy"],
  Science: ["Botany", "Chemistry", "Mathematics", "Physics", "Zoology"],
  Commerce: ["Commerce"],
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const department = searchParams.get("department")
    const stream = searchParams.get("stream")
    const search = searchParams.get("search")
    const category = searchParams.get("category")

    let where: any = {}

    if (department) {
      where.department = department
    }

    if (stream) {
      where.stream = stream
    }

    if (category && category !== "all") {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
      ]
    }

    const staff = await prisma.staffProfile.findMany({
      where,
      orderBy: [
        { createdAt: "desc" },
        { name: "asc" },
      ],
    })

    return NextResponse.json({ staff })
  } catch (error) {
    console.error("Error fetching staff profiles:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff profiles" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
      // Validate stream and department match
      const validDepartments = stream ? STREAMS[stream as keyof typeof STREAMS] : null
      if (!stream || !validDepartments || !validDepartments.includes(department)) {
        return NextResponse.json(
          { error: "Invalid department for selected stream" },
          { status: 400 }
        )
      }
    } else {
      streamValue = null
    }

    const staff = await prisma.staffProfile.create({
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
    console.error("Error creating staff profile:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create staff profile" },
      { status: 500 }
    )
  }
}

