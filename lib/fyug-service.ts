import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"
import type { FyugDraftInput, FyugSubmitInput } from "./fyug-admission-validate"
import { FYUG_ACADEMIC_SESSION } from "./fyug-admission-constants"
import { computeFyugEligibility } from "./fyug-eligibility"
import { generateFyugApplicationNumber } from "./fyug-application-number"
import { generateFyugAdmissionPdf } from "./fyug-pdf"
import { sendMail } from "./email"
import { absoluteUrl } from "./site"
import { FYUG_PORTAL_PATH } from "./fyug-admission-constants"

function parseDob(dob?: string): Date | undefined {
  if (!dob) return undefined
  const d = new Date(dob)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function mapDraftToData(input: FyugDraftInput) {
  return {
    fullName: input.fullName || null,
    gender: input.gender || null,
    dob: parseDob(input.dob) ?? null,
    mobile: input.mobile || null,
    whatsapp: input.whatsapp || null,
    email: input.email || null,
    state: input.state || null,
    photoUrl: input.photoUrl || null,
    fatherName: input.fatherName || null,
    fatherMobile: input.fatherMobile || null,
    motherName: input.motherName || null,
    motherMobile: input.motherMobile || null,
    collegeName: input.collegeName || null,
    affiliatedUniversity: input.affiliatedUniversity || null,
    otherUniversityName: input.otherUniversityName || null,
    majorSubject: input.majorSubject || null,
    minorSubject: input.minorSubject || null,
    honoursSubject: input.honoursSubject || null,
    cuetScore: input.cuetScore ?? null,
    cgpa: input.cgpa ?? null,
    percentage: input.percentage ?? null,
    hasBackPaper: input.hasBackPaper ?? false,
    backPaperDetails: input.backPaperDetails || null,
    signatureUrl: input.signatureUrl || null,
    signatureTypedName: input.signatureTypedName || null,
    declarationAccepted: input.declarationAccepted ?? false,
  }
}

function mapSubmitToData(input: FyugSubmitInput) {
  return {
    ...mapDraftToData(input),
    fullName: input.fullName,
    gender: input.gender,
    dob: parseDob(input.dob)!,
    mobile: input.mobile,
    whatsapp: input.whatsapp || input.mobile,
    email: input.email,
    state: input.state,
    photoUrl: input.photoUrl,
    fatherName: input.fatherName,
    fatherMobile: input.fatherMobile,
    motherName: input.motherName,
    motherMobile: input.motherMobile,
    collegeName: input.collegeName,
    affiliatedUniversity: input.affiliatedUniversity,
    otherUniversityName: input.otherUniversityName || null,
    majorSubject: input.majorSubject,
    minorSubject: input.minorSubject,
    honoursSubject: input.honoursSubject,
    cuetScore: input.cuetScore,
    cgpa: input.cgpa,
    percentage: input.percentage ?? null,
    hasBackPaper: input.hasBackPaper,
    backPaperDetails: input.backPaperDetails || null,
    signatureUrl: input.signatureUrl || null,
    signatureTypedName: input.signatureTypedName || null,
    declarationAccepted: true,
    eligible: computeFyugEligibility(input.hasBackPaper),
  }
}

export async function saveFyugDraft(
  input: FyugDraftInput,
  meta?: { ipAddress?: string; userAgent?: string }
) {
  const data = mapDraftToData(input)
  const draftToken = input.draftToken || randomUUID()

  if (input.id) {
    const existing = await prisma.fyugAdmissionApplication.findUnique({
      where: { id: input.id },
    })
    if (existing && existing.status !== "DRAFT") {
      throw new Error("Cannot update a submitted application as draft")
    }
    if (existing) {
      return prisma.fyugAdmissionApplication.update({
        where: { id: input.id },
        data: { ...data, draftToken, status: "DRAFT" },
      })
    }
  }

  if (input.draftToken) {
    const byToken = await prisma.fyugAdmissionApplication.findUnique({
      where: { draftToken: input.draftToken },
    })
    if (byToken) {
      if (byToken.status !== "DRAFT") {
        throw new Error("This application has already been submitted")
      }
      return prisma.fyugAdmissionApplication.update({
        where: { id: byToken.id },
        data: { ...data, draftToken },
      })
    }
  }

  return prisma.fyugAdmissionApplication.create({
    data: {
      ...data,
      draftToken,
      status: "DRAFT",
      academicSession: FYUG_ACADEMIC_SESSION,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    },
  })
}

export async function submitFyugApplication(
  input: FyugSubmitInput,
  meta?: { ipAddress?: string; userAgent?: string }
) {
  const data = mapSubmitToData(input)

  const duplicate = await prisma.fyugAdmissionApplication.findFirst({
    where: {
      academicSession: FYUG_ACADEMIC_SESSION,
      status: { not: "DRAFT" },
      OR: [{ mobile: input.mobile }, { email: input.email }],
      ...(input.id ? { NOT: { id: input.id } } : {}),
      ...(input.draftToken
        ? { NOT: { draftToken: input.draftToken } }
        : {}),
    },
  })
  if (duplicate) {
    throw new Error(
      "An application with this mobile number or email has already been submitted for this session."
    )
  }

  let record = null as Awaited<ReturnType<typeof prisma.fyugAdmissionApplication.create>> | null

  if (input.id) {
    record = await prisma.fyugAdmissionApplication.findUnique({ where: { id: input.id } })
  } else if (input.draftToken) {
    record = await prisma.fyugAdmissionApplication.findUnique({
      where: { draftToken: input.draftToken },
    })
  }

  const applicationNo = record?.applicationNo ?? (await generateFyugApplicationNumber())

  const payload = {
    ...data,
    applicationNo,
    status: "SUBMITTED" as const,
    submittedAt: new Date(),
    ipAddress: meta?.ipAddress ?? record?.ipAddress,
    userAgent: meta?.userAgent ?? record?.userAgent,
    academicSession: FYUG_ACADEMIC_SESSION,
  }

  const app = record
    ? await prisma.fyugAdmissionApplication.update({
        where: { id: record.id },
        data: payload,
      })
    : await prisma.fyugAdmissionApplication.create({ data: payload })

  const pdfUrl = await generateFyugAdmissionPdf(app)
  const updated = await prisma.fyugAdmissionApplication.update({
    where: { id: app.id },
    data: { pdfUrl },
  })

  const pdfLink = absoluteUrl(pdfUrl)
  const html = `
    <p>Dear ${updated.fullName},</p>
    <p>Your registration for the Fourth-Year Undergraduate Honours Programme (NEP 2020) at Don Bosco College, Tura has been received successfully.</p>
    <p><strong>Application Number:</strong> ${updated.applicationNo}</p>
    <p><strong>Honours Applied:</strong> ${updated.honoursSubject}</p>
    <p><a href="${pdfLink}">Download your application PDF</a></p>
    <p>Thank you,<br/>Admissions Office<br/>Don Bosco College, Tura</p>
  `
  try {
    await sendMail({
      to: updated.email!,
      subject: `FYUG Honours Registration — ${updated.applicationNo}`,
      html,
      text: `Application ${updated.applicationNo} submitted. Download PDF: ${pdfLink}`,
    })
    const alertTo = process.env.FYUG_ADMISSION_ALERT_TO?.trim()
    if (alertTo) {
      await sendMail({
        to: alertTo,
        subject: `New FYUG Application — ${updated.applicationNo}`,
        html: `<p>New application from ${updated.fullName} (${updated.mobile}). Honours: ${updated.honoursSubject}.</p>`,
      })
    }
  } catch (e) {
    console.error("FYUG admission email failed:", e)
  }

  return updated
}

export async function regenerateFyugPdf(applicationId: string) {
  const app = await prisma.fyugAdmissionApplication.findUnique({
    where: { id: applicationId },
  })
  if (!app) throw new Error("Application not found")
  const pdfUrl = await generateFyugAdmissionPdf(app)
  return prisma.fyugAdmissionApplication.update({
    where: { id: applicationId },
    data: { pdfUrl },
  })
}
