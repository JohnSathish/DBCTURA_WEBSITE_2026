import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { readdir, stat } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

interface FileInfo {
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
  folder: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const folder = searchParams.get("folder") // e.g., "2025-11"

    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({ files: [], folders: [] })
    }

    // If folder is specified, list files in that folder
    if (folder) {
      const folderPath = join(uploadsDir, folder)
      if (!existsSync(folderPath)) {
        return NextResponse.json({ files: [], folders: [] })
      }

      const files: FileInfo[] = []
      const entries = await readdir(folderPath, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isFile()) {
          const filePath = join(folderPath, entry.name)
          const stats = await stat(filePath)
          const fileUrl = `/uploads/${folder}/${entry.name}`
          
          // Determine file type from extension
          const ext = entry.name.split('.').pop()?.toLowerCase() || ''
          let fileType = 'application/octet-stream'
          if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            fileType = 'image'
          } else if (ext === 'pdf') {
            fileType = 'application/pdf'
          } else if (['doc', 'docx'].includes(ext)) {
            fileType = 'application/msword'
          }

          files.push({
            name: entry.name,
            url: fileUrl,
            size: Math.round(stats.size / 1024), // KB
            type: fileType,
            uploadedAt: stats.birthtime.toISOString(),
            folder: folder,
          })
        }
      }

      // Sort by upload date (newest first)
      files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

      return NextResponse.json({ files, folders: [] })
    }

    // List all folders (months)
    const entries = await readdir(uploadsDir, { withFileTypes: true })
    const folders = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort()
      .reverse() // Newest first

    return NextResponse.json({ files: [], folders })
  } catch (error: any) {
    console.error("Error listing files:", error)
    return NextResponse.json(
      { error: error.message || "Failed to list files" },
      { status: 500 }
    )
  }
}



