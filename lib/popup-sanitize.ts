const ALLOWED_TAGS = new Set([
  "div",
  "span",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "img",
  "a",
  "table",
  "tbody",
  "thead",
  "tr",
  "td",
  "th",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "br",
  "hr",
])

const FORBIDDEN_TAGS = /(<\/?)(script|iframe|object|embed|form|input|button|link|meta|style|base)[^>]*>/gi

const ON_EVENT_ATTR = /\s(on\w+|javascript:)[^>]*/gi

/** Strip dangerous tags/attributes while keeping safe popup HTML. */
export function sanitizePopupHtml(html: string): string {
  if (!html?.trim()) return ""

  let out = html.replace(FORBIDDEN_TAGS, "")
  out = out.replace(ON_EVENT_ATTR, "")

  // Remove tags not in allowlist (simple pass — keeps inner text).
  out = out.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, tagName) => {
    const tag = String(tagName).toLowerCase()
    if (ALLOWED_TAGS.has(tag)) return match
    return ""
  })

  return out.trim()
}
