import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { regenerateFyugPdf } from "@/lib/fyug-service"
import { logFyugAdmissionAction } from "@/lib/fyug-audit"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const app = await regenerateFyugPdf(id)

  await logFyugAdmissionAction({
    applicationId: id,
    action: "PDF_REGENERATED",
    adminUserId: session.user?.id,
    adminEmail: session.user?.email ?? undefined,
  })

  return NextResponse.json({ success: true, pdfUrl: app.pdfUrl })
}
