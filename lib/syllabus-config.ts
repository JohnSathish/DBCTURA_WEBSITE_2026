/** Max PDF size in bytes (default 20 MB). Override with SYLLABUS_MAX_PDF_MB env. */
export function getSyllabusMaxFileSize(): number {
  const mb = Number(process.env.SYLLABUS_MAX_PDF_MB ?? "20")
  if (!Number.isFinite(mb) || mb <= 0) return 20 * 1024 * 1024
  return Math.floor(mb * 1024 * 1024)
}

export const SYLLABUS_PDF_MIME = "application/pdf"
