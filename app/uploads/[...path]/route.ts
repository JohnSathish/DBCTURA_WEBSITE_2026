import { NextRequest } from "next/server"
import { servePublicFile } from "@/lib/serve-public-file"

type RouteContext = { params: Promise<{ path: string[] }> }

/** Serve uploaded files from /uploads/* (persistent Docker volume). */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { path } = await params
  const publicPath = `/uploads/${path.join("/")}`
  const inline = request.nextUrl.searchParams.get("download") !== "1"
  return servePublicFile(publicPath, { inline })
}
