import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function csvEscape(value: unknown) {
  const s = String(value ?? "")
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const course = (sp.get("course") || "").trim().toUpperCase()
  const status = (sp.get("status") || "").trim()
  const batchYear = (sp.get("batchYear") || "").trim()
  const batchNo = (sp.get("batchNo") || "").trim()

  const where: any = {}
  if (course) where.courseCode = course
  if (status) where.status = status
  if (batchYear) where.batchYear = Number(batchYear)
  if (batchNo) where.batchNo = Number(batchNo)

  const rows = await prisma.courseApplication.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
  })

  const header = [
    "application_no",
    "student_name",
    "mobile",
    "email",
    "course_code",
    "course_name",
    "batch_year",
    "batch_no",
    "department",
    "qualification",
    "mode",
    "status",
    "created_at",
    "message",
  ]

  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.applicationNo,
        r.studentName,
        r.mobile,
        r.email,
        r.courseCode,
        r.courseName,
        r.batchYear,
        r.batchNo,
        r.department ?? "",
        r.qualification,
        r.mode,
        r.status,
        new Date(r.createdAt).toISOString(),
        r.message ?? "",
      ]
        .map(csvEscape)
        .join(",")
    ),
  ].join("\n")

  return new NextResponse(lines, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"course-applications${course ? `-${course}` : ""}.csv\"`,
    },
  })
}

