/** Sentinel for "no parent" in admin navigation forms (never a real DB id). */
export const NAV_NO_PARENT = "__nav_no_parent__"

/**
 * Coerce API body `parentId` to `null` or a trimmed string.
 * Treats legacy `"none"` and the admin sentinel as top-level.
 */
export function normalizeNavigationParentIdInput(value: unknown): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== "string") return null
  const t = value.trim()
  if (t === "" || t === "none" || t === NAV_NO_PARENT) return null
  return t
}
