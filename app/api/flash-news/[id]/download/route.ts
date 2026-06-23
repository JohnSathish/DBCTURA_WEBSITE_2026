import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { servePublicFile } from "@/lib/serve-public-file"

type RouteContext = { params: Promise<{ id: string }> }

/** Public download — increments counter and streams the PDF. */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const item = await prisma.flashNews.findUnique({ where: { id } })
    if (!item || !item.published || !item.file || item.fileType !== "pdf") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.flashNews.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    })

    return servePublicFile(item.file, { downloadName: item.file.split("/").pop() || "document.pdf" })
  } catch (error: unknown) {
    console.error("Flash news download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
