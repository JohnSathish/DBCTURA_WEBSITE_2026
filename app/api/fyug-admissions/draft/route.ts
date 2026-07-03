import { NextRequest, NextResponse } from "next/server"
import { parseFyugDraft } from "@/lib/fyug-admission-validate"
import { saveFyugDraft } from "@/lib/fyug-service"

function clientMeta(req: NextRequest) {
  return {
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = parseFyugDraft(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const app = await saveFyugDraft(parsed.data, clientMeta(req))
    return NextResponse.json({
      success: true,
      id: app.id,
      draftToken: app.draftToken,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to save draft"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
