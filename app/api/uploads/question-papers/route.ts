import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { DEPARTMENTS, PROGRAMMES, slugifySegment } from "@/lib/academics-constants"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"
import { getQuestionPaperMaxFileSize, QUESTION_PAPER_PDF_MIME } from "@/lib/question-paper-config"
import { normalizeCourseCode } from "@/lib/question-paper-validation"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!requirePermission(session.user?.role, PERMISSIONS.QUESTION_PAPER_UPLOAD)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const department = formData.get("department") as string | null
    const programme = formData.get("programme") as string | null
    const academicYear = formData.get("academicYear") as string | null
    const examYear = formData.get("examYear") as string | null
    const courseCode = formData.get("courseCode") as string | null

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (!department || !programme || !academicYear || !examYear || !courseCode) {
      return NextResponse.json({ error: "Missing required upload metadata" }, { status: 400 })
    }

    if (!DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) {
      return NextResponse.json({ error: "Invalid department" }, { status: 400 })
    }
    if (!PROGRAMMES.includes(programme as (typeof PROGRAMMES)[number])) {
      return NextResponse.json({ error: "Invalid programme" }, { status: 400 })
    }

    const maxSize = getQuestionPaperMaxFileSize()
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit` },
        { status: 400 }
      )
    }

    if (file.type !== QUESTION_PAPER_PDF_MIME && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    const code = normalizeCourseCode(courseCode)
    const uploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      "question-papers",
      slugifySegment(academicYear),
      slugifySegment(programme),
      slugifySegment(department),
      String(examYear)
    )

    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

    const safeName = file.name.replace(/[^\w.\-() ]+/g, "_")
    const storedName = `${code}-${safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`}`
    const filePath = join(uploadDir, storedName)

    if (existsSync(filePath)) {
      return NextResponse.json({ error: "A file with this name already exists in the folder" }, { status: 409 })
    }

    await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

    const fileUrl = `/uploads/question-papers/${slugifySegment(academicYear)}/${slugifySegment(programme)}/${slugifySegment(department)}/${examYear}/${storedName}`

    return NextResponse.json({
      success: true,
      fileUrl,
      originalName: storedName,
      fileType: QUESTION_PAPER_PDF_MIME,
      fileSize: file.size,
    })
  } catch (error: unknown) {
    console.error("Error uploading question paper:", error)
    const message = error instanceof Error ? error.message : "Failed to upload file"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
