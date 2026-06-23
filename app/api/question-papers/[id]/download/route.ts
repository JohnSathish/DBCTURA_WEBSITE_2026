import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { redirectToPublicFile } from "@/lib/download-redirect"

type RouteContext = { params: Promise<{ id: string }> }

/** Public download — increments counter and redirects to PDF. */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const paper = await prisma.questionPaper.findUnique({ where: { id } })
    if (!paper || !paper.published) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.questionPaper.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    })

    return redirectToPublicFile(paper.fileUrl)
  } catch (error: unknown) {
    console.error("Download redirect error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
