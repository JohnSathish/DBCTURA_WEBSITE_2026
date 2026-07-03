import { NextRequest, NextResponse } from "next/server"
import { parseFyugSubmit } from "@/lib/fyug-admission-validate"
import { submitFyugApplication } from "@/lib/fyug-service"
import { getFyugAdmissionSettings } from "@/lib/fyug-settings"

function clientMeta(req: NextRequest) {
  return {
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  }
}

export async function POST(req: NextRequest) {
  try {
    const settings = await getFyugAdmissionSettings()
    if (!settings.open) {
      return NextResponse.json({ error: "Registration is currently closed." }, { status: 403 })
    }

    const body = await req.json()
    const parsed = parseFyugSubmit(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const app = await submitFyugApplication(parsed.data, clientMeta(req))
    return NextResponse.json({
      success: true,
      applicationNo: app.applicationNo,
      id: app.id,
      pdfUrl: app.pdfUrl,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Submission failed"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
