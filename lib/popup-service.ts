import { prisma } from "@/lib/prisma"
import { sanitizePopupHtml } from "@/lib/popup-sanitize"

export type PopupPayload = {
  title?: string
  content?: string
  popupType?: string
  displayPosition?: string
  popupSize?: string
  overlayEnabled?: boolean
  autoCloseSeconds?: number | null
  startDate?: string | null
  endDate?: string | null
  displayOrder?: number
  enabled?: boolean
  published?: boolean
}

export function parsePopupPayload(data: PopupPayload) {
  return {
    title: data.title?.trim() ?? "",
    content: sanitizePopupHtml(data.content ?? ""),
    popupType: data.popupType || "information",
    displayPosition: data.displayPosition || "center",
    popupSize: data.popupSize || "medium",
    overlayEnabled: data.overlayEnabled !== false,
    autoCloseSeconds:
      data.autoCloseSeconds === null || data.autoCloseSeconds === 0
        ? null
        : Number(data.autoCloseSeconds) || null,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    displayOrder: Number(data.displayOrder) || 0,
    enabled: Boolean(data.enabled),
    published: Boolean(data.published),
  }
}

export async function getActivePublicPopup() {
  const now = new Date()
  const popups = await prisma.popupBanner.findMany({
    where: {
      enabled: true,
      published: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
    take: 1,
  })
  return popups[0] ?? null
}

export async function disableOtherPopups(exceptId?: string) {
  await prisma.popupBanner.updateMany({
    where: exceptId ? { enabled: true, id: { not: exceptId } } : { enabled: true },
    data: { enabled: false },
  })
}
