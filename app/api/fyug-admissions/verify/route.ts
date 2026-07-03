import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const no = searchParams.get("no")?.trim()
  if (!no) {
    return NextResponse.json({ error: "Application number required" }, { status: 400 })
  }

  const app = await prisma.fyugAdmissionApplication.findFirst({
    where: { applicationNo: no, status: { not: "DRAFT" } },
    select: {
      applicationNo: true,
      fullName: true,
      honoursSubject: true,
      academicSession: true,
      status: true,
      eligible: true,
      submittedAt: true,
    },
  })

  if (!app) {
    return NextResponse.json({ verified: false, error: "Application not found" }, { status: 404 })
  }

  return NextResponse.json({ verified: true, application: app })
}
