import { NextResponse } from "next/server"

/** Redirect to a public file using a relative path (avoids 0.0.0.0 origin in Docker). */
export function redirectToPublicFile(filePath: string): NextResponse {
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return NextResponse.redirect(filePath)
  }

  const path = filePath.startsWith("/") ? filePath : `/${filePath}`

  return new NextResponse(null, {
    status: 302,
    headers: { Location: path },
  })
}
