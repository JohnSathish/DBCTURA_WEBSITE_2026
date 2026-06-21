/** Max PDF size in bytes (default 25 MB). Override with QUESTION_PAPER_MAX_PDF_MB env. */
export function getQuestionPaperMaxFileSize(): number {
  const mb = Number(process.env.QUESTION_PAPER_MAX_PDF_MB ?? "25")
  if (!Number.isFinite(mb) || mb <= 0) return 25 * 1024 * 1024
  return Math.floor(mb * 1024 * 1024)
}

export const QUESTION_PAPER_PDF_MIME = "application/pdf"
