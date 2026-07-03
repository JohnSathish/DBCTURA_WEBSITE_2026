import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { logFyugAdmissionAction } from "@/lib/fyug-audit"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const remarks = typeof body.remarks === "string" ? body.remarks : undefined

  const app = await prisma.fyugAdmissionApplication.update({
    where: { id },
    data: { status: "APPROVED", remarks: remarks ?? null },
  })

  await logFyugAdmissionAction({
    applicationId: id,
    action: "APPROVED",
    adminUserId: session.user?.id,
    adminEmail: session.user?.email ?? undefined,
    details: { remarks },
  })

  return NextResponse.json(app)
}
