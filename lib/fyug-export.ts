import type { FyugAdmissionApplication } from "@/lib/prisma-generated/client"

function formatDate(d: Date | null | undefined): string {
  if (!d) return ""
  try {
    return d.toISOString().slice(0, 10)
  } catch {
    return ""
  }
}

export function fyugApplicationToExportRow(app: FyugAdmissionApplication) {
  return {
    "Application No": app.applicationNo ?? "",
    Name: app.fullName ?? "",
    Mobile: app.mobile ?? "",
    WhatsApp: app.whatsapp ?? "",
    Email: app.email ?? "",
    Gender: app.gender ?? "",
    "Date of Birth": formatDate(app.dob),
    State: app.state ?? "",
    College: app.collegeName ?? "",
    "Affiliated University": app.affiliatedUniversity ?? "",
    "Other University": app.otherUniversityName ?? "",
    Major: app.majorSubject ?? "",
    Minor: app.minorSubject ?? "",
    "Honours Applied": app.honoursSubject ?? "",
    "CUET Score": app.cuetScore ?? "",
    CGPA: app.cgpa ?? "",
    Percentage: app.percentage ?? "",
    "Back Papers": app.hasBackPaper ? "Yes" : "No",
    "Back Paper Details": app.backPaperDetails ?? "",
    Eligible: app.eligible ? "Yes" : "No",
    Status: app.status,
    Remarks: app.remarks ?? "",
    "Father Name": app.fatherName ?? "",
    "Father Mobile": app.fatherMobile ?? "",
    "Mother Name": app.motherName ?? "",
    "Mother Mobile": app.motherMobile ?? "",
    "Photo URL": app.photoUrl ?? "",
    "Signature URL": app.signatureUrl ?? "",
    "Typed Signature": app.signatureTypedName ?? "",
    "Submitted At": app.submittedAt ? app.submittedAt.toISOString() : "",
    "Academic Session": app.academicSession,
  }
}

export function fyugApplicationsToSummaryExport(app: FyugAdmissionApplication) {
  return {
    "Application No": app.applicationNo ?? "",
    Name: app.fullName ?? "",
    Mobile: app.mobile ?? "",
    Gender: app.gender ?? "",
    College: app.collegeName ?? "",
    Major: app.majorSubject ?? "",
    Minor: app.minorSubject ?? "",
    "Honours Applied": app.honoursSubject ?? "",
    "CUET Score": app.cuetScore ?? "",
    Eligible: app.eligible ? "Yes" : "No",
    Status: app.status,
  }
}

export function csvEscape(val: unknown): string {
  const s = String(val ?? "")
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
  ]
  return lines.join("\r\n")
}
