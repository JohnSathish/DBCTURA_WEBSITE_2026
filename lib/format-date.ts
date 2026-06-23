/** Stable date formatting for SSR + client (avoids hydration mismatch). */
const DISPLAY_TZ = "Asia/Kolkata"

export function formatDisplayDate(value: string | Date | null | undefined): string {
  if (!value) return ""
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: DISPLAY_TZ,
  }).format(d)
}

export function formatNewsCardDate(value: string | Date | null | undefined): { day: string; month: string } {
  if (!value) return { day: "", month: "" }
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return { day: "", month: "" }
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    timeZone: DISPLAY_TZ,
  }).formatToParts(d)
  const day = parts.find((p) => p.type === "day")?.value ?? ""
  const month = (parts.find((p) => p.type === "month")?.value ?? "").toUpperCase()
  return { day, month }
}

export function isRecentNotice(publishDate: string | Date | null | undefined, withinDays = 3): boolean {
  if (!publishDate) return false
  const pub = publishDate instanceof Date ? publishDate : new Date(publishDate)
  if (Number.isNaN(pub.getTime())) return false
  const diff = Date.now() - pub.getTime()
  return diff >= 0 && diff <= withinDays * 24 * 60 * 60 * 1000
}
