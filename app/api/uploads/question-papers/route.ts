import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"

const YEARS = Array.from({ length: 2025 - 2015 + 1 }, (_, i) => 2015 + i)

const departments = [
  "Botany",
  "Chemistry",
  "Commerce",
  "Economics",
  "Education",
  "English",
  "Garo",
  "Geography",
  "Environment",
  "History",
  "Mathematics",
  "Philosophy",
  "Physics",
  "Political Science",
  "Sociology",
  "Zoology",
]

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const yearParam = formData.get("year")
    const department = formData.get("department") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!yearParam || !department) {
      return NextResponse.json({ error: "Year and department are required" }, { status: 400 })
    }

    const year = Number(yearParam)

    if (!YEARS.includes(year)) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 })
    }

    if (!departments.includes(department)) {
      return NextResponse.json({ error: "Invalid department" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 20MB limit" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF or DOC files are allowed" }, { status: 400 })
    }

    const uploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      "question-papers",
      String(year),
      department.replace(/\s+/g, "-")
    )

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const originalName = file.name
    const filePath = join(uploadDir, originalName)

    if (existsSync(filePath)) {
      return NextResponse.json(
        { error: "A file with the same name already exists for this year and department" },
        { status: 409 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/question-papers/${year}/${department.replace(/\s+/g, "-")}/${originalName}`

    return NextResponse.json({ success: true, fileUrl, originalName, fileType: file.type })
  } catch (error: any) {
    console.error("Error uploading question paper:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    )
  }
}



