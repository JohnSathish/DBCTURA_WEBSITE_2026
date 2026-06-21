import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/prisma-generated/client"
import { unlink } from "fs/promises"
import { join } from "path"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"
import { normalizeCourseCode, validateSyllabusFields } from "@/lib/syllabus-validation"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const item = await prisma.syllabus.findUnique({ where: { id } })
    if (!item) {
      return NextResponse.json({ error: "Syllabus not found" }, { status: 404 })
    }

    const session = await getServerSession(authOptions)
    if (!item.published && !requirePermission(session?.user?.role, PERMISSIONS.SYLLABUS_VIEW)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error: unknown) {
    console.error("Error fetching syllabus item:", error)
    return NextResponse.json({ error: "Failed to fetch syllabus" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!requirePermission(session.user?.role, PERMISSIONS.SYLLABUS_EDIT)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const existing = await prisma.syllabus.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Syllabus not found" }, { status: 404 })
    }

    const body = await request.json()
    const validationError = validateSyllabusFields({ ...existing, ...body })
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const canPublish = requirePermission(session.user?.role, PERMISSIONS.SYLLABUS_PUBLISH)
    const published = canPublish && body.published !== undefined ? Boolean(body.published) : existing.published

    const item = await prisma.syllabus.update({
      where: { id },
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
        fileSize: body.fileSize ?? existing.fileSize,
        displayOrder: body.displayOrder ?? existing.displayOrder,
        published,
      },
    })

    if (existing.fileUrl !== body.fileUrl && existing.fileUrl) {
      try {
        await unlink(join(process.cwd(), "public", existing.fileUrl.replace(/^\/+/, "")))
      } catch {
        /* ignore missing old file */
      }
    }

    return NextResponse.json(item)
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Duplicate syllabus entry" }, { status: 409 })
    }
    console.error("Error updating syllabus:", error)
    const message = error instanceof Error ? error.message : "Failed to update syllabus"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!requirePermission(session.user?.role, PERMISSIONS.SYLLABUS_PUBLISH)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    if (typeof body.published !== "boolean") {
      return NextResponse.json({ error: "published boolean required" }, { status: 400 })
    }

    const item = await prisma.syllabus.update({
      where: { id },
      data: { published: body.published },
    })

    return NextResponse.json(item)
  } catch (error: unknown) {
    console.error("Error toggling syllabus publish:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!requirePermission(session.user?.role, PERMISSIONS.SYLLABUS_DELETE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const item = await prisma.syllabus.findUnique({ where: { id } })
    if (!item) {
      return NextResponse.json({ error: "Syllabus not found" }, { status: 404 })
    }

    await prisma.syllabus.delete({ where: { id } })

    if (item.fileUrl) {
      try {
        await unlink(join(process.cwd(), "public", item.fileUrl.replace(/^\/+/, "")))
      } catch {
        /* ignore */
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error deleting syllabus:", error)
    return NextResponse.json({ error: "Failed to delete syllabus" }, { status: 500 })
  }
}
