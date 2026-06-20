import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { normalizeNavigationParentIdInput } from "@/lib/navigation-admin"

function validateTitle(title: unknown) {
  if (title === undefined) return undefined
  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error("Title is required")
  }
  return title.trim()
}

function validateOrder(order: unknown) {
  if (order === undefined || order === null || order === "") return undefined
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(prisma as any).navigationMenu || typeof (prisma.navigationMenu as any).update !== "function") {
      return NextResponse.json(
        { error: "NavigationMenu model not initialized. Run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.navigationMenu.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    const data: any = {}

    if (body.title !== undefined) {
      data.title = validateTitle(body.title)
    }
    if (body.href !== undefined) {
      data.href = validateHref(body.href)
    }
    if (body.order !== undefined) {
      data.order = validateOrder(body.order)
    }
    if (body.isVisible !== undefined) {
      data.isVisible = Boolean(body.isVisible)
    }

    // Resolve parent after deletes/recreates: never fail the whole update because parentId is stale.
    let nextParentId: string | null = existing.parentId

    if (body.parentId !== undefined) {
      nextParentId = normalizeNavigationParentIdInput(body.parentId) ?? null
    } else if (existing.parentId) {
      const parentStillThere = await prisma.navigationMenu.findUnique({ where: { id: existing.parentId } })
      if (!parentStillThere) {
        nextParentId = null
      }
    }

    if (nextParentId === id) {
      return NextResponse.json({ error: "A menu cannot be its own parent" }, { status: 400 })
    }

    if (nextParentId) {
      const parent = await prisma.navigationMenu.findUnique({ where: { id: nextParentId } })
      if (!parent) {
        nextParentId = null
      }
    }

    if (nextParentId !== existing.parentId) {
      data.parentId = nextParentId
    }

    const menu = await prisma.navigationMenu.update({
      where: { id },
      data,
    })

    return NextResponse.json({
      menu: {
        id: menu.id,
        label: menu.title,
        href: menu.href,
        order: menu.order,
        isVisible: menu.isVisible,
        parentId: menu.parentId,
      },
    })
  } catch (error: any) {
    console.error("Error updating navigation menu:", error)
    const message = error?.message || "Failed to update navigation menu"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(prisma as any).navigationMenu || typeof (prisma.navigationMenu as any).delete !== "function") {
      return NextResponse.json(
        { error: "NavigationMenu model not initialized. Run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const { id } = await params

    await prisma.navigationMenu.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting navigation menu:", error)
    const message = error?.message || "Failed to delete navigation menu"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

