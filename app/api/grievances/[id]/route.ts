import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function ensureModel() {
  if (!(prisma as any).grievance || typeof (prisma as any).grievance.findUnique !== "function") {
    throw new Error("Grievance model not initialized. Run 'npx prisma generate' and restart the server.")
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await ensureModel()

    const grievance = await prisma.grievance.findUnique({
      where: { id: params.id },
    })

    if (!grievance) {
      return NextResponse.json({ error: "Grievance not found" }, { status: 404 })
    }

    return NextResponse.json(grievance)
  } catch (error: any) {
    if (error.message?.includes("Grievance model not initialized")) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }

    console.error("Error fetching grievance:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch grievance" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await ensureModel()

    await prisma.grievance.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message?.includes("Grievance model not initialized")) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }

    console.error("Error deleting grievance:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete grievance" },
      { status: 500 }
    )
  }
}


