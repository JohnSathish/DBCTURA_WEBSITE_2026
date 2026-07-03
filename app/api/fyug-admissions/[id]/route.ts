import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { logFyugAdmissionAction } from "@/lib/fyug-audit"
import { regenerateFyugPdf } from "@/lib/fyug-service"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const app = await prisma.fyugAdmissionApplication.findUnique({
    where: { id },
    include: {
      auditLogs: { orderBy: { createdAt: "desc" } },
    },
  })
  if (!app) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({
    ...app,
    dob: app.dob?.toISOString().slice(0, 10) ?? null,
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.fyugAdmissionApplication.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  const fields = [
    "fullName", "gender", "mobile", "whatsapp", "email", "state", "photoUrl",
    "fatherName", "fatherMobile", "motherName", "motherMobile",
    "collegeName", "affiliatedUniversity", "otherUniversityName",
    "majorSubject", "minorSubject", "honoursSubject",
    "cuetScore", "cgpa", "percentage", "hasBackPaper", "backPaperDetails",
    "signatureUrl", "signatureTypedName", "remarks", "status",
  ] as const

  for (const f of fields) {
    if (body[f] !== undefined) data[f] = body[f]
  }
  if (body.dob) data.dob = new Date(body.dob)
  if (body.hasBackPaper !== undefined) {
    data.eligible = !body.hasBackPaper
  }

  const updated = await prisma.fyugAdmissionApplication.update({
    where: { id },
    data,
  })

  await logFyugAdmissionAction({
    applicationId: id,
    action: "ADMIN_EDIT",
    adminUserId: session.user?.id,
    adminEmail: session.user?.email ?? undefined,
    details: { fields: Object.keys(data) },
  })

  if (body.regeneratePdf) {
    await regenerateFyugPdf(id)
  }

  const final = await prisma.fyugAdmissionApplication.findUnique({ where: { id } })
  return NextResponse.json(final)
}
