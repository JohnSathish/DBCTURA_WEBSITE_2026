import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { DEPARTMENTS, PROGRAMMES, slugifySegment } from "@/lib/academics-constants"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"
import { getSyllabusMaxFileSize, SYLLABUS_PDF_MIME } from "@/lib/syllabus-config"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!requirePermission(session.user?.role, PERMISSIONS.SYLLABUS_UPLOAD)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const department = formData.get("department") as string | null
    const programme = formData.get("programme") as string | null
    const academicYear = formData.get("academicYear") as string | null
    const courseCode = formData.get("courseCode") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!department || !programme || !academicYear || !courseCode) {
      return NextResponse.json(
        { error: "Department, programme, academic year, and course code are required" },
        { status: 400 }
      )
    }

    if (!DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) {
      return NextResponse.json({ error: "Invalid department" }, { status: 400 })
    }
    if (!PROGRAMMES.includes(programme as (typeof PROGRAMMES)[number])) {
      return NextResponse.json({ error: "Invalid programme" }, { status: 400 })
    }

    const maxSize = getSyllabusMaxFileSize()
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit` },
        { status: 400 }
      )
    }

    if (file.type !== SYLLABUS_PDF_MIME && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    const safeCode = slugifySegment(courseCode.trim().toUpperCase())
    const uploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      "syllabus",
      slugifySegment(academicYear),
      slugifySegment(programme),
      slugifySegment(department)
    )

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const originalName = file.name.replace(/[^\w.\-() ]+/g, "_")
    const storedName = `${safeCode}-${originalName.endsWith(".pdf") ? originalName : `${originalName}.pdf`}`
    const filePath = join(uploadDir, storedName)

    if (existsSync(filePath)) {
      return NextResponse.json(
        { error: "A file with this name already exists in the target folder" },
        { status: 409 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/syllabus/${slugifySegment(academicYear)}/${slugifySegment(programme)}/${slugifySegment(department)}/${storedName}`

    return NextResponse.json({
      success: true,
      fileUrl,
      originalName: storedName,
      fileType: SYLLABUS_PDF_MIME,
      fileSize: file.size,
    })
  } catch (error: unknown) {
    console.error("Error uploading syllabus PDF:", error)
    const message = error instanceof Error ? error.message : "Failed to upload file"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
