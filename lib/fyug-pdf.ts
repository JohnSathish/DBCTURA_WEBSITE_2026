import type { FyugAdmissionApplication } from "@/lib/prisma-generated/client"
import { createRequire } from "node:module"
import QRCode from "qrcode"
import { createWriteStream } from "fs"
import { mkdir, readFile } from "fs/promises"
import path from "path"
import { absoluteUrl } from "@/lib/site"
import { FYUG_PORTAL_PATH } from "./fyug-admission-constants"
import { resolvePublicFilePath } from "./serve-public-file"

const require = createRequire(import.meta.url)
// Load via require so Next.js does not bundle pdfkit (needs js/data/*.afm on disk).
const PDFDocument = require("pdfkit") as typeof import("pdfkit")

function formatDate(d: Date | null | undefined): string {
  if (!d) return "—"
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateTime(d: Date | null | undefined): string {
  if (!d) return "—"
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

async function tryReadPublicImage(publicPath: string | null | undefined): Promise<Buffer | null> {
  if (!publicPath) return null
  const filePath = await resolvePublicFilePath(publicPath)
  if (!filePath) return null
  try {
    return await readFile(filePath)
  } catch {
    return null
  }
}

export async function generateFyugAdmissionPdf(
  app: FyugAdmissionApplication
): Promise<string> {
  const pdfDir = path.join(process.cwd(), "public", "uploads", "fyug-admissions", "pdfs")
  await mkdir(pdfDir, { recursive: true })
  const fileName = `${app.applicationNo ?? app.id}.pdf`
  const filePath = path.join(pdfDir, fileName)
  const publicUrl = `/uploads/fyug-admissions/pdfs/${fileName}`

  const verifyUrl = absoluteUrl(
    `${FYUG_PORTAL_PATH}/verify?no=${encodeURIComponent(app.applicationNo ?? "")}`
  )
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 120 })
  const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "")
  const qrBuffer = Buffer.from(qrBase64, "base64")
  const photoBuf = await tryReadPublicImage(app.photoUrl)
  const sigBuf = await tryReadPublicImage(app.signatureUrl)

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" })
    const stream = createWriteStream(filePath)
    doc.pipe(stream)

    const logoPath = path.join(process.cwd(), "public", "logo.png")
    readFile(logoPath)
      .then((logo) => doc.image(logo, 50, 45, { width: 55 }))
      .catch(() => {})
      .finally(() => {
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text("Don Bosco College, Tura", 120, 50)
          .fontSize(9)
          .font("Helvetica")
          .text("Affiliated to North Eastern Hill University (NEHU), Shillong", 120, 68)
          .text("NAAC Accredited College", 120, 82)
          .text(`Academic Session ${app.academicSession}`, 120, 96)

        doc.image(qrBuffer, 480, 45, { width: 70, height: 70 })

        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("Registration for Fourth-Year Undergraduate Honours Programme (NEP 2020)", 50, 130, {
            align: "center",
            width: 500,
          })

        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(`Application No: ${app.applicationNo ?? "—"}`, 50, 155)

        let y = 180
        if (photoBuf) {
          doc.image(photoBuf, 480, y, { width: 70, height: 90, fit: [70, 90] })
        }

        const row = (label: string, value: string) => {
          doc.font("Helvetica-Bold").fontSize(9).text(label, 50, y, { width: 160 })
          doc.font("Helvetica").fontSize(9).text(value || "—", 210, y, { width: 260 })
          y += 18
        }

        doc.font("Helvetica-Bold").fontSize(11).text("Section A — Personal Information", 50, y)
        y += 22
        row("Full Name", app.fullName ?? "")
        row("Gender", app.gender ?? "")
        row("Date of Birth", formatDate(app.dob))
        row("Mobile", app.mobile ?? "")
        row("WhatsApp", app.whatsapp ?? "")
        row("Email", app.email ?? "")
        row("State", app.state ?? "")

        y += 8
        doc.font("Helvetica-Bold").fontSize(11).text("Section B — Parent Details", 50, y)
        y += 22
        row("Father's Name", app.fatherName ?? "")
        row("Father's Mobile", app.fatherMobile ?? "")
        row("Mother's Name", app.motherName ?? "")
        row("Mother's Mobile", app.motherMobile ?? "")

        y += 8
        doc.font("Helvetica-Bold").fontSize(11).text("Section C — Previous College", 50, y)
        y += 22
        row("College Last Attended", app.collegeName ?? "")
        row(
          "Affiliated University",
          app.affiliatedUniversity === "OTHER"
            ? app.otherUniversityName ?? "Other"
            : "NEHU, Shillong"
        )

        if (y > 600) {
          doc.addPage()
          y = 50
        }

        y += 8
        doc.font("Helvetica-Bold").fontSize(11).text("Section D — Academic Information", 50, y)
        y += 22
        row("Major Course", app.majorSubject ?? "")
        row("Minor Course", app.minorSubject ?? "")
        row("Honours Applied", app.honoursSubject ?? "")
        row("CUET 2026 Score", app.cuetScore != null ? String(app.cuetScore) : "")
        row("CGPA till Sem V", app.cgpa != null ? String(app.cgpa) : "")
        row("Percentage till Sem V", app.percentage != null ? String(app.percentage) : "")

        y += 8
        doc.font("Helvetica-Bold").fontSize(11).text("Section E — Back Papers", 50, y)
        y += 22
        row("Back Papers (Sem I–V)", app.hasBackPaper ? "Yes" : "No")
        if (app.backPaperDetails) row("Details", app.backPaperDetails)

        y += 8
        doc.font("Helvetica-Bold").fontSize(11).text("Section F — Declaration", 50, y)
        y += 22
        doc
          .font("Helvetica")
          .fontSize(8)
          .text(
            "I hereby declare that the information furnished above is true and correct to the best of my knowledge.",
            50,
            y,
            { width: 500 }
          )
        y += 30

        if (sigBuf) {
          doc.image(sigBuf, 50, y, { width: 120, height: 40, fit: [120, 40] })
          y += 50
        } else if (app.signatureTypedName) {
          doc.font("Helvetica-Oblique").fontSize(11).text(app.signatureTypedName, 50, y)
        }

        doc
          .fontSize(8)
          .font("Helvetica")
          .text(`Submitted: ${formatDateTime(app.submittedAt)}`, 50, 750)
          .text(`Status: ${app.status}`, 50, 762)

        doc.end()
      })

    stream.on("finish", () => resolve())
    stream.on("error", reject)
  })

  return publicUrl
}
