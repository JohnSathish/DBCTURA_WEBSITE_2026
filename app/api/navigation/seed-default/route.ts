import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { seedDefaultNavigationMenus } from "@/lib/navigation-seed"

/**
 * One-time style import: copies `lib/navigation.ts` defaultNavigation into the DB
 * so the admin list and PUT/DELETE use real ids. Only runs when the table is empty.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(prisma as any).navigationMenu) {
      return NextResponse.json({ error: "NavigationMenu model not available" }, { status: 503 })
    }

    const count = await prisma.navigationMenu.count()
    if (count > 0) {
      return NextResponse.json(
        {
          error:
            "Navigation already has items. Remove them first if you want a full re-import, or add links manually.",
        },
        { status: 409 }
      )
    }

    const created = await seedDefaultNavigationMenus()
    return NextResponse.json({ ok: true, created })
  } catch (error: any) {
    console.error("seed-default navigation:", error)
    return NextResponse.json({ error: error?.message || "Failed to import default navigation" }, { status: 500 })
  }
}
