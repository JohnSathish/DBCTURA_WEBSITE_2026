import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/prisma-generated/client"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"
import { normalizeCourseCode, validateQuestionPaperFields } from "@/lib/question-paper-validation"

function buildWhere(searchParams: URLSearchParams, publishedOnly: boolean): Prisma.QuestionPaperWhereInput {
  const where: Prisma.QuestionPaperWhereInput = {}

  if (publishedOnly) {
    where.published = true
  } else {
    const status = searchParams.get("status")
    if (status === "published") where.published = true
    if (status === "draft") where.published = false
  }

  const fields = ["department", "programme", "academicYear", "examType"] as const
  for (const field of fields) {
    const val = searchParams.get(field)
    if (val) (where as Record<string, string>)[field] = val
  }

  const semester = searchParams.get("semester")
  if (semester) {
    const sem = Number(semester)
    if (!Number.isNaN(sem)) where.semester = sem
  }

  const examYear = searchParams.get("examYear")
  if (examYear) {
    const y = Number(examYear)
    if (!Number.isNaN(y)) where.examYear = y
  }

  const search = searchParams.get("search")?.trim()
  if (search) {
    where.OR = [
      { courseCode: { contains: search } },
      { courseName: { contains: search } },
      { department: { contains: search } },
    ]
  }

  return where
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const includeDrafts =
      request.nextUrl.searchParams.get("includeDrafts") === "1" &&
      session &&
      requirePermission(session.user?.role, PERMISSIONS.QUESTION_PAPER_VIEW)

    const where = buildWhere(request.nextUrl.searchParams, !includeDrafts)

    const papers = await prisma.questionPaper.findMany({
      where,
      orderBy: [
        { examYear: "desc" },
        { academicYear: "desc" },
        { department: "asc" },
        { semester: "asc" },
        { courseCode: "asc" },
      ],
    })

    return NextResponse.json(papers)
  } catch (error: unknown) {
    console.error("Error fetching question papers:", error)
    const message = error instanceof Error ? error.message : "Failed to fetch question papers"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!requirePermission(session.user?.role, PERMISSIONS.QUESTION_PAPER_UPLOAD)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validationError = validateQuestionPaperFields(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const canPublish = requirePermission(session.user?.role, PERMISSIONS.QUESTION_PAPER_PUBLISH)

    const paper = await prisma.questionPaper.create({
      data: {
        academicYear: body.academicYear,
        department: body.department,
        programme: body.programme,
        semester: body.semester,
        courseName: body.courseName.trim(),
        courseCode: normalizeCourseCode(body.courseCode),
        examType: body.examType,
        examMonth: body.examMonth?.trim() || null,
        examYear: body.examYear,
        description: body.description?.trim() || null,
        fileUrl: body.fileUrl,
        originalName: body.originalName,
        fileType: body.fileType || "application/pdf",
        fileSize: body.fileSize ?? null,
        published: canPublish ? Boolean(body.published) : false,
      },
    })

    return NextResponse.json(paper, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Duplicate question paper entry" }, { status: 409 })
    }
    console.error("Error creating question paper:", error)
    const message = error instanceof Error ? error.message : "Failed to create question paper"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
