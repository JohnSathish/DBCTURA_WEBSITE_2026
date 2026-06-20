import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { buildTree, getNavigationItems } from "@/lib/navigation-server"
import { normalizeNavigationParentIdInput } from "@/lib/navigation-admin"

function validateTitle(title: unknown) {
  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error("Title is required")
  }
  return title.trim()
}

function validateOrder(order: unknown) {
  if (order === undefined || order === null || order === "") return 0
  const parsed = Number(order)
  if (!Number.isInteger(parsed)) {
    throw new Error("Order must be an integer")
  }
  return parsed
}

function validateHref(href: unknown) {
  if (href === undefined || href === null || href === "") return null
  if (typeof href !== "string") {
    throw new Error("URL must be a string")
  }
  return href.trim()
}

export async function GET(request: NextRequest) {
  const includeHidden = request.nextUrl.searchParams.get("includeHidden") === "true"

  // Admin panel must only receive real DB ids. When the DB is empty, getNavigationItems()
  // falls back to defaultNavigation (no ids) → client invents "db-0-*" ids and PUT returns 404.
  if (includeHidden) {
    try {
      if (!(prisma as any).navigationMenu) {
        return NextResponse.json({ items: [] })
      }
      const records = await prisma.navigationMenu.findMany({
        orderBy: [{ order: "asc" }, { title: "asc" }],
      })
      const items = records.length ? buildTree(records) : []
      return NextResponse.json({ items })
    } catch (error) {
      console.error("Admin navigation GET failed:", error)
      return NextResponse.json({ items: [], error: "Failed to load navigation" }, { status: 500 })
    }
  }

  const items = await getNavigationItems({ includeHidden: false })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(prisma as any).navigationMenu || typeof (prisma.navigationMenu as any).create !== "function") {
      return NextResponse.json(
        { error: "NavigationMenu model not initialized. Run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const body = await request.json()
    const title = validateTitle(body.title)
    const href = validateHref(body.href)
    const order = validateOrder(body.order)
    const isVisible = typeof body.isVisible === "boolean" ? body.isVisible : true
    const parentId = normalizeNavigationParentIdInput(body.parentId) ?? null

    let resolvedParentId = parentId
    if (resolvedParentId) {
      const parent = await prisma.navigationMenu.findUnique({ where: { id: resolvedParentId } })
      if (!parent) {
        resolvedParentId = null
      }
    }

    const menu = await prisma.navigationMenu.create({
      data: {
        title,
        href,
        order,
        isVisible,
        parentId: resolvedParentId,
      },
    })

    return NextResponse.json(
      {
        menu: {
          id: menu.id,
          label: menu.title,
          href: menu.href,
          order: menu.order,
          isVisible: menu.isVisible,
          parentId: menu.parentId,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating navigation menu:", error)
    const message = error?.message || "Failed to create navigation menu"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

