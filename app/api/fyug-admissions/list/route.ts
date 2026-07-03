import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  const status = searchParams.get("status")
  const honours = searchParams.get("honours")
  const major = searchParams.get("major")
  const minor = searchParams.get("minor")
  const state = searchParams.get("state")
  const gender = searchParams.get("gender")
  const college = searchParams.get("college")?.trim()
  const eligible = searchParams.get("eligible")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const where: Record<string, unknown> = {
    status: status ? status : { not: "DRAFT" },
  }

  if (honours) where.honoursSubject = honours
  if (major) where.majorSubject = major
  if (minor) where.minorSubject = minor
  if (state) where.state = state
  if (gender) where.gender = gender
  if (college) where.collegeName = { contains: college }
  if (eligible === "true") where.eligible = true
  if (eligible === "false") where.eligible = false

  if (from || to) {
    where.submittedAt = {}
    if (from) (where.submittedAt as Record<string, Date>).gte = new Date(from)
    if (to) {
      const end = new Date(to)
      end.setHours(23, 59, 59, 999)
      ;(where.submittedAt as Record<string, Date>).lte = end
    }
  }

  if (q) {
    where.OR = [
      { applicationNo: { contains: q } },
      { fullName: { contains: q } },
      { mobile: { contains: q } },
      { email: { contains: q } },
      { collegeName: { contains: q } },
    ]
  }

  const applications = await prisma.fyugAdmissionApplication.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    take: 500,
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const allSubmitted = await prisma.fyugAdmissionApplication.findMany({
    where: { status: { not: "DRAFT" } },
    select: {
      status: true,
      eligible: true,
      honoursSubject: true,
      collegeName: true,
      state: true,
      gender: true,
      submittedAt: true,
    },
  })

  const stats = {
    total: allSubmitted.length,
    submittedToday: allSubmitted.filter(
      (a) => a.submittedAt && a.submittedAt >= today && a.submittedAt < tomorrow
    ).length,
    eligible: allSubmitted.filter((a) => a.eligible).length,
    rejected: allSubmitted.filter((a) => a.status === "REJECTED").length,
    pending: allSubmitted.filter(
      (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
    ).length,
    byHonours: countBy(allSubmitted, (a) => a.honoursSubject),
    byCollege: countBy(allSubmitted, (a) => a.collegeName),
    byState: countBy(allSubmitted, (a) => a.state),
    byGender: countBy(allSubmitted, (a) => a.gender),
  }

  return NextResponse.json({ applications, stats })
}

function countBy<T>(items: T[], keyFn: (item: T) => string | null | undefined) {
  const map: Record<string, number> = {}
  for (const item of items) {
    const k = keyFn(item) || "Unknown"
    map[k] = (map[k] || 0) + 1
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))
}
