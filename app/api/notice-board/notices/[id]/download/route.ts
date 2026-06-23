import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = { params: Promise<{ id: string }> }

/** Public download — increments counter and redirects to PDF. */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const notice = await prisma.noticeBoardNotice.findUnique({ where: { id } })
    if (!notice || !notice.active || notice.noticeType !== "document" || !notice.pdfUrl) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const now = new Date()
    if (notice.publishDate > now || (notice.expiryDate && notice.expiryDate <= now)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.noticeBoardNotice.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    })

    const origin = new URL(_request.url).origin
    const pdfUrl = notice.pdfUrl.startsWith("http")
      ? notice.pdfUrl
      : `${origin}${notice.pdfUrl.startsWith("/") ? "" : "/"}${notice.pdfUrl}`
    return NextResponse.redirect(pdfUrl)
  } catch (error: unknown) {
    console.error("Notice download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
