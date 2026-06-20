import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import * as XLSX from "xlsx"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

function formatDate(d: Date) {
  try {
    return d.toISOString().slice(0, 10)
  } catch {
    return ""
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rows = await prisma.alumniRegistration.findMany({
      orderBy: { createdAt: "desc" },
    })

    const sheetRows = rows.map((r) => ({
      Submitted: formatDate(r.createdAt),
      "Full Name": r.fullName,
      Gender: r.gender,
      "Date of Birth": formatDate(r.dateOfBirth),
      "Profile Photo URL": r.profilePhoto ?? "",
      Email: r.email,
      "Mobile Number": r.mobileNumber,
      "Alternate Phone": r.alternatePhone ?? "",
      "Current Address": r.currentAddress,
      "City / State / Country": r.cityStateCountry,
      "Course / Program": r.courseProgram,
      Department: r.department,
      "Year of Admission": r.yearOfAdmission,
      "Year of Graduation": r.yearOfGraduation,
      "Enrollment / Roll No": r.enrollmentRollNumber,
      "Current Occupation": r.currentOccupation,
      "Company / Organization": r.companyOrganizationName ?? "",
      "Job Title": r.jobTitle ?? "",
      "Work Location": r.workLocation ?? "",
      "Years of Experience": r.yearsOfExperience ?? "",
      LinkedIn: r.linkedInProfile ?? "",
      "Social (FB/IG)": r.socialMedia ?? "",
      Website: r.personalWebsite ?? "",
      "Willing to mentor": r.willingToMentor ? "Yes" : "No",
      "Interested in events": r.interestedInEvents ? "Yes" : "No",
      "Areas of interest": r.areasOfInterest ?? "",
      Achievements: r.achievementsAwards ?? "",
      Feedback: r.suggestionsFeedback ?? "",
      "Message to institution": r.messageToInstitution ?? "",
      "Declaration accepted": r.declarationAccepted ? "Yes" : "No",
      "IP (if captured)": r.ipAddress ?? "",
    }))

    const ws = XLSX.utils.json_to_sheet(sheetRows.length ? sheetRows : [{ Message: "No registrations yet" }])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Alumni")

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer
    const filename = `alumni-registrations-${new Date().toISOString().slice(0, 10)}.xlsx`

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error: any) {
    console.error("Alumni export:", error)
    return NextResponse.json({ error: error?.message || "Export failed" }, { status: 500 })
  }
}
