import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/prisma-generated/client"
import { unlink } from "fs/promises"
import { join } from "path"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"
import { normalizeCourseCode, validateQuestionPaperFields } from "@/lib/question-paper-validation"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const paper = await prisma.questionPaper.findUnique({ where: { id } })
    if (!paper) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const session = await getServerSession(authOptions)
    if (!paper.published && !requirePermission(session?.user?.role, PERMISSIONS.QUESTION_PAPER_VIEW)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(paper)
  } catch (error: unknown) {
    console.error("Error fetching question paper:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!requirePermission(session.user?.role, PERMISSIONS.QUESTION_PAPER_EDIT)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const existing = await prisma.questionPaper.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const body = await request.json()
    const validationError = validateQuestionPaperFields({ ...existing, ...body })
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

    const canPublish = requirePermission(session.user?.role, PERMISSIONS.QUESTION_PAPER_PUBLISH)
    const published =
      canPublish && body.published !== undefined ? Boolean(body.published) : existing.published

    const paper = await prisma.questionPaper.update({
      where: { id },
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
        fileType: body.fileType || existing.fileType,
        fileSize: body.fileSize ?? existing.fileSize,
        published,
      },
    })

    if (existing.fileUrl !== body.fileUrl && existing.fileUrl) {
      try {
        await unlink(join(process.cwd(), "public", existing.fileUrl.replace(/^\/+/, "")))
      } catch {
        /* ignore */
      }
    }

    return NextResponse.json(paper)
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Duplicate entry" }, { status: 409 })
    }
    console.error("Error updating question paper:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!requirePermission(session.user?.role, PERMISSIONS.QUESTION_PAPER_PUBLISH)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    if (typeof body.published !== "boolean") {
      return NextResponse.json({ error: "published boolean required" }, { status: 400 })
    }

    const paper = await prisma.questionPaper.update({
      where: { id },
      data: { published: body.published },
    })

    return NextResponse.json(paper)
  } catch (error: unknown) {
    console.error("Error toggling publish:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!requirePermission(session.user?.role, PERMISSIONS.QUESTION_PAPER_DELETE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const paper = await prisma.questionPaper.findUnique({ where: { id } })
    if (!paper) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.questionPaper.delete({ where: { id } })

    if (paper.fileUrl) {
      try {
        await unlink(join(process.cwd(), "public", paper.fileUrl.replace(/^\/+/, "")))
      } catch {
        /* ignore */
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error deleting question paper:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
