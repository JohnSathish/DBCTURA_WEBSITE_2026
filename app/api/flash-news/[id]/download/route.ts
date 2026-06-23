import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = { params: Promise<{ id: string }> }

/** Public download — increments counter and redirects to PDF. */
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

    const origin = new URL(_request.url).origin
    return NextResponse.redirect(`${origin}${item.file}`)
  } catch (error: unknown) {
    console.error("Flash news download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
