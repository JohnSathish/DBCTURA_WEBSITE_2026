import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import * as XLSX from "xlsx"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import {
  fyugApplicationToExportRow,
  fyugApplicationsToSummaryExport,
  rowsToCsv,
} from "@/lib/fyug-export"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const format = searchParams.get("format") || "xlsx"
  const summary = searchParams.get("summary") === "true"
  const status = searchParams.get("status")
  const honours = searchParams.get("honours")
  const college = searchParams.get("college")?.trim()
  const eligible = searchParams.get("eligible")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const where: Record<string, unknown> = { status: { not: "DRAFT" } }
  if (status) where.status = status
  if (honours) where.honoursSubject = honours
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

  const apps = await prisma.fyugAdmissionApplication.findMany({
    where,
    orderBy: { submittedAt: "desc" },
  })

  const rows = summary
    ? apps.map(fyugApplicationsToSummaryExport)
    : apps.map(fyugApplicationToExportRow)

  const stamp = new Date().toISOString().slice(0, 10)

  if (format === "csv") {
    const csv = rowsToCsv(rows)
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="fyug-admissions-${stamp}.csv"`,
      },
    })
  }

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "FYUG Admissions")
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="fyug-admissions-${stamp}.xlsx"`,
    },
  })
}
