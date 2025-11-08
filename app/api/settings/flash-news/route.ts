import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "flash_news" },
    })

    return NextResponse.json({
      message: setting?.value || "",
      enabled: !!setting?.value,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch flash news" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { message } = await request.json()

    const setting = await prisma.setting.upsert({
      where: { key: "flash_news" },
      update: { value: message || "" },
      create: {
        key: "flash_news",
        value: message || "",
      },
    })

    return NextResponse.json(setting)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update flash news" },
      { status: 400 }
    )
  }
}



