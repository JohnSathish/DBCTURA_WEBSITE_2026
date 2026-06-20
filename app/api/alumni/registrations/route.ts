import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

import { prisma } from "@/lib/prisma"
import { parseAlumniRegistrationForm } from "@/lib/alumni-registration-parse"

const MAX_PHOTO_BYTES = 4 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Use multipart/form-data" }, { status: 400 })
    }

    const fd = await request.formData()

    let profilePhotoUrl: string | null = null
    const file = fd.get("profilePhoto")
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Profile photo must be an image file" }, { status: 400 })
      }
      if (file.size > MAX_PHOTO_BYTES) {
        return NextResponse.json({ error: "Profile photo must be 4MB or smaller" }, { status: 400 })
      }

      const dir = join(process.cwd(), "public", "alumni")
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
      const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg"
      const name = `alumni-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`
      const buf = Buffer.from(await file.arrayBuffer())
      await writeFile(join(dir, name), buf)
      profilePhotoUrl = `/alumni/${name}`
    }

    const parsed = parseAlumniRegistrationForm(fd, profilePhotoUrl)
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const d = parsed.data
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null
    const userAgent = request.headers.get("user-agent") || null

    const row = await prisma.alumniRegistration.create({
      data: {
        fullName: d.fullName,
        gender: d.gender,
        dateOfBirth: d.dateOfBirth,
        profilePhoto: d.profilePhoto,
        email: d.email,
        mobileNumber: d.mobileNumber,
        alternatePhone: d.alternatePhone,
        currentAddress: d.currentAddress,
        cityStateCountry: d.cityStateCountry,
        courseProgram: d.courseProgram,
        department: d.department,
        yearOfAdmission: d.yearOfAdmission,
        yearOfGraduation: d.yearOfGraduation,
        enrollmentRollNumber: d.enrollmentRollNumber,
        currentOccupation: d.currentOccupation,
        companyOrganizationName: d.companyOrganizationName,
        jobTitle: d.jobTitle,
        workLocation: d.workLocation,
        yearsOfExperience: d.yearsOfExperience,
        linkedInProfile: d.linkedInProfile,
        socialMedia: d.socialMedia,
        personalWebsite: d.personalWebsite,
        willingToMentor: d.willingToMentor,
        interestedInEvents: d.interestedInEvents,
        areasOfInterest: d.areasOfInterest,
        achievementsAwards: d.achievementsAwards,
        suggestionsFeedback: d.suggestionsFeedback,
        messageToInstitution: d.messageToInstitution,
        declarationAccepted: d.declarationAccepted,
        ipAddress: ip,
        userAgent,
      },
    })

    return NextResponse.json({ ok: true, id: row.id }, { status: 201 })
  } catch (error: any) {
    console.error("Alumni registration POST:", error)
    return NextResponse.json({ error: error?.message || "Failed to save registration" }, { status: 500 })
  }
}
