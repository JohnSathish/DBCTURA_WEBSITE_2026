import { access, readFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"

const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
}

function isPathInsidePublic(resolvedPath: string): boolean {
  const publicRoot = path.resolve(process.cwd(), "public")
  return resolvedPath.startsWith(publicRoot + path.sep) || resolvedPath === publicRoot
}

/** Resolve a stored public URL/path to an on-disk file (supports legacy locations). */
export async function resolvePublicFilePath(publicPath: string): Promise<string | null> {
  const normalized = publicPath.replace(/^\/+/, "")
  const basename = path.basename(normalized)

  const candidates: string[] = [path.join(process.cwd(), "public", normalized)]

  if (normalized.startsWith("flash-news/")) {
    candidates.push(path.join(process.cwd(), "public", "uploads", "flash-news", basename))
  }

  if (normalized.startsWith("downloads/")) {
    candidates.push(path.join(process.cwd(), "public", "uploads", "downloads", basename))
  }

  if (normalized.startsWith("uploads/")) {
    // already covered by first candidate
  }

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate)
    if (!isPathInsidePublic(resolved)) continue
    try {
      await access(resolved)
      return resolved
    } catch {
      // try next location
    }
  }

  return null
}

/** Stream a file from public/ (or legacy paths) — avoids Next.js route conflicts and bad redirects. */
export async function servePublicFile(
  publicPath: string,
  options?: { downloadName?: string; inline?: boolean }
): Promise<NextResponse> {
  const filePath = await resolvePublicFilePath(publicPath)
  if (!filePath) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  const buffer = await readFile(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_BY_EXT[ext] || "application/octet-stream"
  const filename = options?.downloadName || path.basename(filePath)
  const disposition = options?.inline ? "inline" : "attachment"

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, max-age=3600",
    },
  })
}
