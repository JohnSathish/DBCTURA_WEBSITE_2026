import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const departments = [
  "Botany",
  "Chemistry",
  "Commerce",
  "Economics",
  "Education",
  "English",
  "Garo",
  "Geography",
  "Environment",
  "History",
  "Mathematics",
  "Philosophy",
  "Physics",
  "Political Science",
  "Sociology",
  "Zoology",
]

const YEARS = Array.from({ length: 2025 - 2015 + 1 }, (_, i) => 2015 + i)

export async function GET(request: NextRequest) {
  try {
    if (!(prisma as any).questionPaper || typeof (prisma as any).questionPaper.findMany !== "function") {
      console.warn("QuestionPaper model not available in Prisma client. Did you run 'npx prisma generate'?" )
      return NextResponse.json(
        { error: "QuestionPaper model not initialized. Run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const yearParam = searchParams.get("year")
    const department = searchParams.get("department")

    const where: any = {}

    if (yearParam) {
      const year = Number(yearParam)
      if (!YEARS.includes(year)) {
        return NextResponse.json({ error: "Invalid year" }, { status: 400 })
      }
      where.year = year
    }

    if (department) {
      if (!departments.includes(department)) {
        return NextResponse.json({ error: "Invalid department" }, { status: 400 })
      }
      where.department = department
    }

    const papers = await prisma.questionPaper.findMany({
      where,
      orderBy: [{ year: "desc" }, { department: "asc" }, { originalName: "asc" }],
    })

    return NextResponse.json(papers)
  } catch (error: any) {
    console.error("Error fetching question papers:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch question papers" },
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
    if (!(prisma as any).questionPaper || typeof (prisma as any).questionPaper.create !== "function") {
      console.warn("QuestionPaper model not available in Prisma client. Did you run 'npx prisma generate'?" )
      return NextResponse.json(
        { error: "QuestionPaper model not initialized. Run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { year, department, fileUrl, originalName, fileType } = body

    if (!YEARS.includes(year)) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 })
    }

    if (!departments.includes(department)) {
      return NextResponse.json({ error: "Invalid department" }, { status: 400 })
    }

    if (!fileUrl || !originalName) {
      return NextResponse.json({ error: "File information is required" }, { status: 400 })
    }

    const paper = await prisma.questionPaper.create({
      data: {
        year,
        department,
        fileUrl,
        originalName,
        fileType: fileType || null,
      },
    })

    return NextResponse.json(paper, { status: 201 })
  } catch (error: any) {
    console.error("Error creating question paper:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create question paper" },
      { status: 500 }
    )
  }
}

