import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  getFyugAdmissionSettings,
  setFyugAdmissionOpen,
  setFyugAdmissionSession,
  setFyugAdmissionClosedMessage,
} from "@/lib/fyug-settings"

export async function GET() {
  const settings = await getFyugAdmissionSettings()
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  if (typeof body.open === "boolean") await setFyugAdmissionOpen(body.open)
  if (typeof body.session === "string") await setFyugAdmissionSession(body.session)
  if (typeof body.closedMessage === "string") {
    await setFyugAdmissionClosedMessage(body.closedMessage)
  }

  const settings = await getFyugAdmissionSettings()
  return NextResponse.json(settings)
}
