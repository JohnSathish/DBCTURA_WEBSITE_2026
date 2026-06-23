import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { servePublicFile } from "@/lib/serve-public-file"

type RouteContext = { params: Promise<{ id: string }> }

/** Public download — increments counter and streams the PDF. */
export async function GET(_request: NextRequest, { params }: RouteContext) {
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

    return servePublicFile(paper.fileUrl, { downloadName: paper.originalName || "question-paper.pdf" })
  } catch (error: unknown) {
    console.error("Download redirect error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
