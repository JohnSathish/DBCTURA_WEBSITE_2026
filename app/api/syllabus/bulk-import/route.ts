import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/prisma-generated/client"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"
import { normalizeCourseCode, validateSyllabusFields } from "@/lib/syllabus-validation"
import * as XLSX from "xlsx"
import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { slugifySegment } from "@/lib/academics-constants"
import { SYLLABUS_PDF_MIME, getSyllabusMaxFileSize } from "@/lib/syllabus-config"

type ImportRow = {
  department: string
  programme: string
  semester: number
  courseCode: string
  courseName: string
  academicYear: string
  curriculumVersion?: string
  description?: string
  displayOrder?: number
  published?: boolean
}

function parseRow(raw: Record<string, unknown>): ImportRow | null {
  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const val = raw[key] ?? raw[key.toLowerCase()] ?? raw[key.toUpperCase()]
      if (val != null && String(val).trim()) return String(val).trim()
    }
    return ""
  }

  const department = pick("Department", "department")
  const programme = pick("Programme", "Program", "programme", "program")
  const courseCode = pick("Course Code", "CourseCode", "course_code", "courseCode")
  const courseName = pick("Course Name", "CourseName", "course_name", "courseName")
  const academicYear = pick("Academic Year", "AcademicYear", "academic_year", "academicYear")
  const semesterRaw = pick("Semester", "semester")

  if (!department || !programme || !courseCode || !courseName || !academicYear || !semesterRaw) {
    return null
  }

  const semester = Number(semesterRaw)
  if (!Number.isFinite(semester)) return null

  return {
    department,
    programme,
    semester,
    courseCode,
    courseName,
    academicYear,
    curriculumVersion: pick("Curriculum Version", "CurriculumVersion", "curriculumVersion") || undefined,
    description: pick("Description", "Remarks", "description") || undefined,
    displayOrder: Number(pick("Display Order", "displayOrder")) || 0,
    published: pick("Status", "status").toLowerCase() === "published",
  }
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
    const formData = await request.formData()
    const excelFile = formData.get("excel") as File | null
    if (!excelFile) {
      return NextResponse.json({ error: "Excel file is required" }, { status: 400 })
    }

    const buffer = Buffer.from(await excelFile.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

    const pdfFiles = formData.getAll("pdfs") as File[]
    const pdfByCode = new Map<string, File>()
    for (const file of pdfFiles) {
      if (!file?.name) continue
      const base = file.name.replace(/\.pdf$/i, "").trim().toUpperCase()
      pdfByCode.set(base, file)
      const codePart = base.split(/[-_\s]/)[0]
      if (codePart) pdfByCode.set(codePart, file)
    }

    const maxSize = getSyllabusMaxFileSize()
    const canPublish = requirePermission(session.user?.role, PERMISSIONS.SYLLABUS_PUBLISH)
    const results = { created: 0, skipped: 0, errors: [] as string[] }

    for (let i = 0; i < rows.length; i++) {
      const parsed = parseRow(rows[i])
      if (!parsed) {
        results.skipped++
        results.errors.push(`Row ${i + 2}: missing required columns`)
        continue
      }

      const code = normalizeCourseCode(parsed.courseCode)
      const pdf = pdfByCode.get(code) ?? pdfByCode.get(code.replace(/\s/g, ""))

      let fileUrl = ""
      let originalName = ""
      let fileSize: number | null = null

      if (pdf) {
        if (pdf.size > maxSize) {
          results.errors.push(`Row ${i + 2}: PDF exceeds size limit for ${code}`)
          results.skipped++
          continue
        }
        if (pdf.type !== SYLLABUS_PDF_MIME && !pdf.name.toLowerCase().endsWith(".pdf")) {
          results.errors.push(`Row ${i + 2}: ${pdf.name} is not a PDF`)
          results.skipped++
          continue
        }

        const uploadDir = join(
          process.cwd(),
          "public",
          "uploads",
          "syllabus",
          slugifySegment(parsed.academicYear),
          slugifySegment(parsed.programme),
          slugifySegment(parsed.department)
        )
        if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

        const storedName = `${code}-${pdf.name.replace(/[^\w.\-() ]+/g, "_")}`
        await writeFile(join(uploadDir, storedName), Buffer.from(await pdf.arrayBuffer()))
        fileUrl = `/uploads/syllabus/${slugifySegment(parsed.academicYear)}/${slugifySegment(parsed.programme)}/${slugifySegment(parsed.department)}/${storedName}`
        originalName = storedName
        fileSize = pdf.size
      } else {
        results.errors.push(`Row ${i + 2}: no PDF matched for course code ${code}`)
        results.skipped++
        continue
      }

      const payload = {
        ...parsed,
        courseCode: code,
        fileUrl,
        originalName,
        fileSize,
        published: canPublish ? parsed.published ?? false : false,
      }

      const validationError = validateSyllabusFields(payload)
      if (validationError) {
        results.errors.push(`Row ${i + 2}: ${validationError}`)
        results.skipped++
        continue
      }

      try {
        await prisma.syllabus.create({
          data: {
            department: payload.department,
            programme: payload.programme,
            academicYear: payload.academicYear,
            curriculumVersion: payload.curriculumVersion || null,
            semester: payload.semester,
            courseCode: payload.courseCode,
            courseName: payload.courseName,
            description: payload.description || null,
            fileUrl: payload.fileUrl,
            originalName: payload.originalName,
            fileSize: payload.fileSize,
            published: payload.published,
            displayOrder: payload.displayOrder ?? 0,
          },
        })
        results.created++
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          results.errors.push(`Row ${i + 2}: duplicate entry for ${code}`)
        } else {
          results.errors.push(`Row ${i + 2}: failed to save`)
        }
        results.skipped++
      }
    }

    return NextResponse.json(results)
  } catch (error: unknown) {
    console.error("Syllabus bulk import error:", error)
    const message = error instanceof Error ? error.message : "Bulk import failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
