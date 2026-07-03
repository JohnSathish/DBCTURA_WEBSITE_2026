import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const applicationNo = searchParams.get("applicationNo")?.trim()
  const mobile = searchParams.get("mobile")?.trim()

  if (!applicationNo || !mobile) {
    return NextResponse.json(
      { error: "applicationNo and mobile are required" },
      { status: 400 }
    )
  }

  const app = await prisma.fyugAdmissionApplication.findFirst({
    where: {
      applicationNo,
      mobile,
      status: { not: "DRAFT" },
    },
    select: {
      applicationNo: true,
      fullName: true,
      honoursSubject: true,
      status: true,
      eligible: true,
      submittedAt: true,
      remarks: true,
      pdfUrl: true,
      id: true,
      mobile: true,
    },
  })

  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  return NextResponse.json(app)
}
