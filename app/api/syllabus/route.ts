import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/prisma-generated/client"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"
import { normalizeCourseCode, validateSyllabusFields } from "@/lib/syllabus-validation"

function buildWhere(searchParams: URLSearchParams, publishedOnly: boolean) {
  const where: Prisma.SyllabusWhereInput = {}

  if (publishedOnly) {
    where.published = true
  } else {
    const status = searchParams.get("status")
    if (status === "published") where.published = true
    if (status === "draft") where.published = false
  }

  const department = searchParams.get("department")
  const programme = searchParams.get("programme")
  const semester = searchParams.get("semester")
  const academicYear = searchParams.get("academicYear")
  const search = searchParams.get("search")?.trim()

  if (department) where.department = department
  if (programme) where.programme = programme
  if (academicYear) where.academicYear = academicYear
  if (semester) {
    const sem = Number(semester)
    if (!Number.isNaN(sem)) where.semester = sem
  }
  if (search) {
    where.OR = [
      { courseCode: { contains: search } },
      { courseName: { contains: search } },
      { description: { contains: search } },
    ]
  }

  return where
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const includeDrafts =
      searchParamsIncludeDrafts(request) &&
      session &&
      requirePermission(session.user?.role, PERMISSIONS.SYLLABUS_VIEW)

    const where = buildWhere(request.nextUrl.searchParams, !includeDrafts)

    const items = await prisma.syllabus.findMany({
      where,
      orderBy: [
        { displayOrder: "asc" },
        { academicYear: "desc" },
        { department: "asc" },
        { semester: "asc" },
        { courseCode: "asc" },
      ],
    })

    return NextResponse.json(items)
  } catch (error: unknown) {
    console.error("Error fetching syllabus:", error)
    const message = error instanceof Error ? error.message : "Failed to fetch syllabus"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function searchParamsIncludeDrafts(request: NextRequest) {
  return request.nextUrl.searchParams.get("includeDrafts") === "1"
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!requirePermission(session.user?.role, PERMISSIONS.SYLLABUS_UPLOAD)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validationError = validateSyllabusFields(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const canPublish = requirePermission(session.user?.role, PERMISSIONS.SYLLABUS_PUBLISH)
    const published = canPublish ? Boolean(body.published) : false

    const item = await prisma.syllabus.create({
      data: {
        department: body.department,
        programme: body.programme,
        academicYear: body.academicYear,
        curriculumVersion: body.curriculumVersion?.trim() || null,
        semester: body.semester,
        courseCode: normalizeCourseCode(body.courseCode),
        courseName: body.courseName.trim(),
        description: body.description?.trim() || null,
        fileUrl: body.fileUrl,
        originalName: body.originalName,
        fileSize: body.fileSize ?? null,
        published,
        displayOrder: body.displayOrder ?? 0,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "A syllabus entry already exists for this department, programme, semester, course code, and academic year" },
        { status: 409 }
      )
    }
    console.error("Error creating syllabus:", error)
    const message = error instanceof Error ? error.message : "Failed to create syllabus"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
