import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import {
  ADMISSION_LINKS_DEFAULTS,
  ADMISSION_SETTING_KEYS,
  normalizeAdmissionUrl,
  normalizeHeaderCtaMode,
  type HeaderCtaMode,
} from "@/lib/admission-links-settings"
import { getAdmissionLinksConfig } from "@/lib/get-admission-links-config"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function upsertSetting(key: string, value: string) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}

export async function GET() {
  try {
    const config = await getAdmissionLinksConfig()
    return NextResponse.json({ ...config, defaults: ADMISSION_LINKS_DEFAULTS })
  } catch {
    return NextResponse.json({ error: "Failed to fetch admission links" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const headerCtaMode: HeaderCtaMode = normalizeHeaderCtaMode(body?.headerCtaMode)

    const values = {
      [ADMISSION_SETTING_KEYS.applyNow]: normalizeAdmissionUrl(
        body?.applyNowUrl,
        ADMISSION_LINKS_DEFAULTS.applyNowUrl
      ),
      [ADMISSION_SETTING_KEYS.onlineAdmission]: normalizeAdmissionUrl(
        body?.onlineAdmissionUrl,
        ADMISSION_LINKS_DEFAULTS.onlineAdmissionUrl
      ),
      [ADMISSION_SETTING_KEYS.prospectus]: normalizeAdmissionUrl(
        body?.prospectusUrl,
        ADMISSION_LINKS_DEFAULTS.prospectusUrl
      ),
      [ADMISSION_SETTING_KEYS.headerCtaMode]: headerCtaMode,
      [ADMISSION_SETTING_KEYS.fyugUrl]: normalizeAdmissionUrl(
        body?.fyugAdmissionUrl,
        ADMISSION_LINKS_DEFAULTS.fyugAdmissionUrl
      ),
      [ADMISSION_SETTING_KEYS.fyugLabel]: normalizeAdmissionUrl(
        body?.fyugAdmissionLabel,
        ADMISSION_LINKS_DEFAULTS.fyugAdmissionLabel
      ),
    }

    await Promise.all(Object.entries(values).map(([key, value]) => upsertSetting(key, value)))

    const config = await getAdmissionLinksConfig()
    return NextResponse.json(config)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update admission links"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
