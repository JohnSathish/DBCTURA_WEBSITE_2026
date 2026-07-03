import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { servePublicFile } from "@/lib/serve-public-file"
import { regenerateFyugPdf } from "@/lib/fyug-service"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const applicationNo = searchParams.get("applicationNo")?.trim()
  const mobile = searchParams.get("mobile")?.trim()

  const session = await getServerSession(authOptions)
  const app = await prisma.fyugAdmissionApplication.findUnique({ where: { id } })

  if (!app) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!session) {
    if (!applicationNo || !mobile || app.applicationNo !== applicationNo || app.mobile !== mobile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  let pdfUrl = app.pdfUrl
  if (!pdfUrl && app.status !== "DRAFT") {
    const updated = await regenerateFyugPdf(id)
    pdfUrl = updated.pdfUrl
  }

  if (!pdfUrl) {
    return NextResponse.json({ error: "PDF not available" }, { status: 404 })
  }

  return servePublicFile(pdfUrl, { downloadName: `${app.applicationNo ?? "application"}.pdf` })
}
