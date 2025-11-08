import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function ensureModel() {
  if (!(prisma as any).bloodDonor || typeof (prisma as any).bloodDonor.findUnique !== "function") {
    throw new Error("BloodDonor model not initialized. Run 'npx prisma generate' and restart the server.")
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

    const donor = await prisma.bloodDonor.findUnique({
      where: { id: params.id },
    })

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 })
    }

    return NextResponse.json(donor)
  } catch (error: any) {
    if (error.message?.includes("BloodDonor model not initialized")) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    console.error("Error fetching blood donor:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch donor" },
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

    await prisma.bloodDonor.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message?.includes("BloodDonor model not initialized")) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    console.error("Error deleting blood donor:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete donor" },
      { status: 500 }
    )
  }
}


