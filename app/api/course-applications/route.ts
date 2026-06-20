import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { COURSE_CATALOG, isCourseCode } from "@/lib/courseCatalog"

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "").trim()
}

function generateApplicationNo(courseCode: string) {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${courseCode}-${y}${m}${d}-${rand}`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const course = (searchParams.get("course") || "").trim().toUpperCase()
    const status = (searchParams.get("status") || "").trim()
    const batchYear = searchParams.get("batchYear")
    const batchNo = searchParams.get("batchNo")

    const where: any = {}
    if (course) where.courseCode = course
    if (status) where.status = status
    if (batchYear) where.batchYear = Number(batchYear)
    if (batchNo) where.batchNo = Number(batchNo)

    const rows = await prisma.courseApplication.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
    })

    return NextResponse.json(rows)
  } catch (e: any) {
    console.error("course-applications GET failed:", e)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const courseCodeRaw = String(data?.course_code || data?.courseCode || "").trim().toUpperCase()

    if (!courseCodeRaw || !isCourseCode(courseCodeRaw)) {
      return NextResponse.json({ error: "Invalid course code" }, { status: 400 })
    }

    const studentName = String(data?.student_name || data?.studentName || "").trim()
    const mobile = normalizePhone(String(data?.mobile || "").trim())
    const email = String(data?.email || "").trim()
    const qualification = data?.qualification ? String(data.qualification).trim() : null
    const modeRaw = String(data?.mode || "").trim().toLowerCase()
    const department = data?.department ? String(data.department).trim() : null
    const message = data?.message ? String(data.message).trim() : null
    const batchYear = Number(data?.batchYear || new Date().getFullYear())
    const batchNo = Number(data?.batchNo || 1)

    if (!studentName) return NextResponse.json({ error: "Full Name is required" }, { status: 400 })
    if (!mobile || mobile.length < 10) return NextResponse.json({ error: "Mobile number is invalid" }, { status: 400 })
    if (!email || !email.includes("@")) return NextResponse.json({ error: "Email is invalid" }, { status: 400 })
    if (!["online", "offline"].includes(modeRaw)) {
      return NextResponse.json({ error: "Mode must be Online or Offline" }, { status: 400 })
    }
    if (!Number.isFinite(batchYear) || batchYear < 2000 || batchYear > 2100) {
      return NextResponse.json({ error: "Invalid batch year" }, { status: 400 })
    }
    if (![1, 2, 3].includes(batchNo)) {
      return NextResponse.json({ error: "Batch must be 1, 2, or 3" }, { status: 400 })
    }

    const applicationNo =
      String(data?.application_no || data?.applicationNo || "").trim() ||
      generateApplicationNo(courseCodeRaw)

    const created = await prisma.courseApplication.create({
      data: {
        applicationNo,
        studentName,
        mobile,
        email,
        courseCode: courseCodeRaw,
        courseName: COURSE_CATALOG[courseCodeRaw],
        batchYear,
        batchNo,
        department,
        qualification,
        mode: modeRaw,
        message,
        status: "Pending",
      },
    })

    return NextResponse.json(created)
  } catch (e: any) {
    console.error("course-applications POST failed:", e)
    return NextResponse.json({ error: e?.message || "Failed to create application" }, { status: 500 })
  }
}

