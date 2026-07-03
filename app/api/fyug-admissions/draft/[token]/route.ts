import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const app = await prisma.fyugAdmissionApplication.findUnique({
    where: { draftToken: token },
  })
  if (!app || app.status !== "DRAFT") {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 })
  }
  return NextResponse.json({
    ...app,
    dob: app.dob?.toISOString().slice(0, 10) ?? null,
  })
}
