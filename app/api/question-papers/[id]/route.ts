import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { unlink } from "fs/promises"
import { join } from "path"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    if (!(prisma as any).questionPaper || typeof (prisma as any).questionPaper.delete !== "function") {
      console.warn("QuestionPaper model not available in Prisma client. Did you run 'npx prisma generate'?" )
      return NextResponse.json(
        { error: "QuestionPaper model not initialized. Run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const { id } = await params

    const paper = await prisma.questionPaper.findUnique({ where: { id } })

    if (!paper) {
      return NextResponse.json({ error: "Question paper not found" }, { status: 404 })
    }

    await prisma.questionPaper.delete({ where: { id } })

    if (paper.fileUrl) {
      const filePath = join(process.cwd(), "public", paper.fileUrl.replace(/^\/+/, ""))
      try {
        await unlink(filePath)
      } catch (error) {
        console.warn("Failed to delete file from disk", error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting question paper:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete question paper" },
      { status: 500 }
    )
  }
}

