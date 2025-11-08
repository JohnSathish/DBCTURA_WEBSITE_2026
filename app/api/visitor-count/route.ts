import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

const SETTING_KEY = "visitor_count"

async function ensureSetting() {
  if (!(prisma as any).setting || typeof (prisma as any).setting.upsert !== "function") {
    throw new Error("Setting model not initialized. Run 'npx prisma generate' and restart the server.")
  }

  const record = await prisma.setting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, value: "0" },
    update: {},
  })

  return record
}

export async function GET() {
  try {
    const record = await ensureSetting()
    const count = parseInt(record.value, 10) || 0
    return NextResponse.json({ count })
  } catch (error: any) {
    if (error.message?.includes("Setting model not initialized")) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    console.error("Failed to fetch visitor count:", error)
    return NextResponse.json({ error: "Unable to fetch visitor count" }, { status: 500 })
  }
}

export async function POST(_request: NextRequest) {
  try {
    const record = await ensureSetting()
    const current = parseInt(record.value, 10) || 0
    const updated = await prisma.setting.update({
      where: { key: SETTING_KEY },
      data: { value: String(current + 1) },
    })

    return NextResponse.json({ count: parseInt(updated.value, 10) })
  } catch (error: any) {
    if (error.message?.includes("Setting model not initialized")) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    console.error("Failed to increment visitor count:", error)
    return NextResponse.json({ error: "Unable to update visitor count" }, { status: 500 })
  }
}


