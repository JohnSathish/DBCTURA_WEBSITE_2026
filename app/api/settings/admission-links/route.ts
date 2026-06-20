import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const DEFAULT_URL = "https://admissionsdbctura.com/register"

const KEYS = {
  applyNow: "admission_apply_now_url",
  onlineAdmission: "admission_online_admission_url",
} as const

function normalizeUrl(value: unknown) {
  const s = String(value ?? "").trim()
  if (!s) return ""
  return s
}

export async function GET() {
  try {
    const [applyNow, onlineAdmission] = await Promise.all([
      prisma.setting.findUnique({ where: { key: KEYS.applyNow } }),
      prisma.setting.findUnique({ where: { key: KEYS.onlineAdmission } }),
    ])

    return NextResponse.json({
      applyNowUrl: applyNow?.value || DEFAULT_URL,
      onlineAdmissionUrl: onlineAdmission?.value || DEFAULT_URL,
      defaults: { url: DEFAULT_URL },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch admission links" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const applyNowUrl = normalizeUrl(body?.applyNowUrl) || DEFAULT_URL
    const onlineAdmissionUrl = normalizeUrl(body?.onlineAdmissionUrl) || DEFAULT_URL

    const [applyNow, onlineAdmission] = await Promise.all([
      prisma.setting.upsert({
        where: { key: KEYS.applyNow },
        update: { value: applyNowUrl },
        create: { key: KEYS.applyNow, value: applyNowUrl },
      }),
      prisma.setting.upsert({
        where: { key: KEYS.onlineAdmission },
        update: { value: onlineAdmissionUrl },
        create: { key: KEYS.onlineAdmission, value: onlineAdmissionUrl },
      }),
    ])

    return NextResponse.json({
      applyNowUrl: applyNow.value,
      onlineAdmissionUrl: onlineAdmission.value,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update admission links" },
      { status: 400 }
    )
  }
}

