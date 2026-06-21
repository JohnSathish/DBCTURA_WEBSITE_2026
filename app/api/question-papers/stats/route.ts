import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCurrentCalendarYear } from "@/lib/academics-constants"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !requirePermission(session.user?.role, PERMISSIONS.QUESTION_PAPER_VIEW)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const currentYear = getCurrentCalendarYear()
    const [total, currentYearCount, deptGroups, downloadSum] = await Promise.all([
      prisma.questionPaper.count(),
      prisma.questionPaper.count({ where: { examYear: currentYear } }),
      prisma.questionPaper.groupBy({ by: ["department"], _count: true }),
      prisma.questionPaper.aggregate({ _sum: { downloadCount: true } }),
    ])

    return NextResponse.json({
      total,
      currentYear: currentYearCount,
      departmentsCovered: deptGroups.length,
      totalDownloads: downloadSum._sum.downloadCount ?? 0,
    })
  } catch (error: unknown) {
    console.error("Question paper stats error:", error)
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 })
  }
}
