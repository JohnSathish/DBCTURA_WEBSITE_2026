import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.redirect(new URL("/admin/login", request.url))

  const { id } = await params
  await prisma.courseApplication.update({ where: { id }, data: { status: "Approved" } })
  return NextResponse.redirect(new URL("/admin/course-applications", request.url))
}

