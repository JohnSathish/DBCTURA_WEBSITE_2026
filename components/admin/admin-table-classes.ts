/** Shared table cell classes for admin list views with long text. */

/** Multi-line wrap for titles and body text in table cells. */
export const adminCellWrap =
  "whitespace-normal break-words [overflow-wrap:anywhere] align-top min-w-0 max-w-0"

/** Truncated preview (2 lines) for secondary columns. */
export const adminCellClamp =
  "whitespace-normal break-words [overflow-wrap:anywhere] align-top min-w-0 max-w-0"

/** Fixed-width action column — never shrinks or wraps. */
export const adminCellActions = "whitespace-nowrap w-[1%] text-right align-middle"

/** Single-line truncate for compact columns (slug, email, etc.). */
export const adminCellTruncate = "min-w-0 max-w-0 truncate align-middle whitespace-nowrap"
