import type { FyugAdmissionApplication } from "@/lib/prisma-generated/client"
import { createRequire } from "node:module"
import QRCode from "qrcode"
import { createWriteStream } from "fs"
import { mkdir, readFile } from "fs/promises"
import path from "path"
import type PDFKit from "pdfkit"
import { absoluteUrl } from "@/lib/site"
import { FYUG_PORTAL_PATH } from "./fyug-admission-constants"
import { resolvePublicFilePath } from "./serve-public-file"

const require = createRequire(import.meta.url)
const PDFDocument = require("pdfkit") as typeof import("pdfkit")

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 42
const CONTENT_W = PAGE_W - MARGIN * 2
const FOOTER_H = 52

const C = {
  blue: "#0F4C81",
  blueMid: "#1E5A96",
  blueLight: "#E8F0F8",
  bluePale: "#F1F6FB",
  dark: "#1E293B",
  gray: "#475569",
  muted: "#64748B",
  border: "#CBD5E1",
  rowAlt: "#F8FAFC",
  white: "#FFFFFF",
  amber: "#D97706",
  green: "#059669",
  red: "#DC2626",
}

type Doc = PDFKit.PDFDocument

type LayoutCtx = {
  doc: Doc
  y: number
  page: number
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return "—"
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
}

function formatDateShort(d: Date | null | undefined): string {
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
    hour12: true,
  })
}

function sessionLabel(session: string | null | undefined): string {
  if (!session) return "—"
  return session.replace("-", "–")
}

function val(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—"
  return String(v)
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

function drawWatermark(doc: Doc) {
  doc.save()
  doc.opacity(0.05)
  doc.fillColor(C.blue)
  doc.font("Helvetica-Bold").fontSize(36)
  doc.text("DON BOSCO COLLEGE", 0, PAGE_H / 2 - 50, { width: PAGE_W, align: "center" })
  doc.fontSize(28).text("TURA", 0, PAGE_H / 2 - 8, { width: PAGE_W, align: "center" })
  doc.restore()
  doc.opacity(1)
}

function drawFooter(doc: Doc, page: number, totalPages: number, generatedAt: Date) {
  const fy = PAGE_H - FOOTER_H
  doc.save()
  doc.strokeColor(C.border).lineWidth(0.75).moveTo(MARGIN, fy).lineTo(PAGE_W - MARGIN, fy).stroke()
  doc.fillColor(C.muted).font("Helvetica").fontSize(7.5)
  doc.text("Don Bosco College, Tura", MARGIN, fy + 8)
  doc.text("www.donboscocollege.ac.in", MARGIN, fy + 18)
  doc.text("FYUG Honours Application Portal", MARGIN, fy + 28)

  const centerX = PAGE_W / 2 - 60
  doc.text(`Page ${page} of ${totalPages}`, centerX, fy + 13, { width: 120, align: "center" })
  doc.text("System Generated Document", centerX, fy + 23, { width: 120, align: "center" })
  doc.text("No Physical Signature Required", centerX, fy + 33, { width: 120, align: "center" })

  doc.text(`Generated on ${formatDateTime(generatedAt)}`, PAGE_W - MARGIN - 155, fy + 13, {
    width: 155,
    align: "right",
  })
  doc.restore()
}

function statusRibbon(doc: Doc, status: string) {
  const map: Record<string, { bg: string; label: string }> = {
    SUBMITTED: { bg: C.blue, label: "Submitted" },
    UNDER_REVIEW: { bg: C.amber, label: "Under Review" },
    APPROVED: { bg: C.green, label: "Approved" },
    REJECTED: { bg: C.red, label: "Rejected" },
    DRAFT: { bg: C.gray, label: "Draft" },
  }
  const s = map[status] ?? { bg: C.blueMid, label: status }
  const w = 88
  const h = 22
  const x = PAGE_W - MARGIN - w
  const y = MARGIN - 4
  doc.save()
  doc.roundedRect(x, y, w, h, 3).fill(s.bg)
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8)
  doc.text(s.label, x, y + 7, { width: w, align: "center" })
  doc.restore()
}

function ensureSpace(ctx: LayoutCtx, needed: number): LayoutCtx {
  if (ctx.y + needed <= PAGE_H - FOOTER_H - 8) return ctx
  ctx.doc.addPage()
  drawWatermark(ctx.doc)
  return { doc: ctx.doc, y: MARGIN, page: ctx.page + 1 }
}

function drawHeaderWithSession(ctx: LayoutCtx, logo: Buffer | null, qr: Buffer, session: string): LayoutCtx {
  const { doc } = ctx
  let y = MARGIN

  if (logo) doc.image(logo, MARGIN, y, { width: 52, height: 52 })

  const cx = PAGE_W / 2
  doc.fillColor(C.blue).font("Helvetica-Bold").fontSize(16)
  doc.text("DON BOSCO COLLEGE, TURA", cx - 170, y + 2, { width: 340, align: "center" })
  doc.fillColor(C.dark).font("Helvetica").fontSize(8.5)
  doc.text("Affiliated to North Eastern Hill University (NEHU), Shillong", cx - 170, y + 22, {
    width: 340,
    align: "center",
  })
  doc.fillColor(C.muted).fontSize(7.5)
  doc.text("Re-accredited with 'B' Grade by NAAC, Bangalore", cx - 170, y + 34, {
    width: 340,
    align: "center",
  })
  doc.fillColor(C.blue).font("Helvetica-Bold").fontSize(8.5)
  doc.text(`Academic Session ${sessionLabel(session)}`, cx - 170, y + 46, { width: 340, align: "center" })

  const qrX = PAGE_W - MARGIN - 72
  doc.image(qr, qrX, y, { width: 58, height: 58 })
  doc.fillColor(C.muted).font("Helvetica").fontSize(6.5)
  doc.text("Scan to Verify", qrX - 4, y + 60, { width: 66, align: "center" })
  doc.fontSize(6).text("Application Verification", qrX - 4, y + 68, { width: 66, align: "center" })

  y += 82
  doc.strokeColor(C.blue).lineWidth(1.2).moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).stroke()
  return { ...ctx, y: y + 14 }
}

function drawTitleBar(ctx: LayoutCtx): LayoutCtx {
  const { doc } = ctx
  const y = ctx.y
  const h = 52
  doc.roundedRect(MARGIN, y, CONTENT_W, h, 4).fill(C.blue)

  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(11)
  doc.text("FOURTH YEAR UNDERGRADUATE HONOURS PROGRAMME", MARGIN, y + 10, {
    width: CONTENT_W,
    align: "center",
  })
  doc.font("Helvetica").fontSize(9)
  doc.text("(NEP 2020)", MARGIN, y + 24, { width: CONTENT_W, align: "center" })
  doc.font("Helvetica-Bold").fontSize(10)
  doc.text("APPLICATION FORM", MARGIN, y + 36, { width: CONTENT_W, align: "center" })

  return { ...ctx, y: y + h + 12 }
}

function drawSummaryCard(ctx: LayoutCtx, app: FyugAdmissionApplication): LayoutCtx {
  const { doc } = ctx
  const y = ctx.y
  const h = 58
  doc.roundedRect(MARGIN, y, CONTENT_W, h, 3).fill(C.bluePale)
  doc.roundedRect(MARGIN, y, CONTENT_W, h, 3).lineWidth(0.75).strokeColor(C.border).stroke()

  const cols = [
    { label: "Application No.", value: val(app.applicationNo) },
    { label: "Application Date", value: formatDate(app.submittedAt ?? app.createdAt) },
    { label: "Status", value: val(app.status) },
    { label: "Academic Year", value: sessionLabel(app.academicSession) },
  ]

  const colW = CONTENT_W / 4
  cols.forEach((c, i) => {
    const x = MARGIN + i * colW + 10
    doc.fillColor(C.muted).font("Helvetica").fontSize(7.5).text(c.label, x, y + 12)
    doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(9.5).text(c.value, x, y + 26, { width: colW - 14 })
  })

  return { ...ctx, y: y + h + 12 }
}

function drawProfileCard(ctx: LayoutCtx, app: FyugAdmissionApplication, photo: Buffer | null): LayoutCtx {
  const { doc } = ctx
  const y = ctx.y
  const h = 108
  doc.roundedRect(MARGIN, y, CONTENT_W, h, 3).lineWidth(0.75).strokeColor(C.border).stroke()

  const photoX = MARGIN + 12
  const photoY = y + 10
  const photoW = 72
  const photoH = 88
  doc.roundedRect(photoX, photoY, photoW, photoH, 2).strokeColor(C.border).lineWidth(0.5).stroke()
  if (photo) {
    doc.image(photo, photoX + 2, photoY + 2, { width: photoW - 4, height: photoH - 4, fit: [photoW - 4, photoH - 4] })
  } else {
    doc.fillColor(C.muted).font("Helvetica").fontSize(7)
    doc.text("PHOTO", photoX, photoY + 38, { width: photoW, align: "center" })
  }

  const infoX = photoX + photoW + 16
  const infoW = CONTENT_W - photoW - 40
  let iy = y + 14

  doc.fillColor(C.blue).font("Helvetica-Bold").fontSize(8).text("CANDIDATE PROFILE", infoX, iy)
  iy += 14

  const profileRows: [string, string][] = [
    ["Candidate Name", val(app.fullName)],
    ["Gender", val(app.gender)],
    ["Date of Birth", formatDateShort(app.dob)],
    ["Mobile", val(app.mobile)],
    ["Email", val(app.email)],
    ["State", val(app.state)],
  ]

  const col1W = infoW * 0.48
  profileRows.forEach((row, idx) => {
    const rowY = iy + Math.floor(idx / 2) * 14
    const x = idx % 2 === 0 ? infoX : infoX + col1W + 8
    doc.fillColor(C.muted).font("Helvetica").fontSize(7).text(row[0], x, rowY, { width: 70 })
    doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(8).text(row[1], x + 72, rowY - 1, { width: col1W - 76 })
  })

  return { ...ctx, y: y + h + 12 }
}

function drawSectionHeader(ctx: LayoutCtx, code: string, title: string): LayoutCtx {
  const { doc } = ctx
  const y = ctx.y
  const h = 24
  doc.rect(MARGIN, y, CONTENT_W, h).fill(C.blue)
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(7.5)
  doc.text(code, MARGIN + 10, y + 5)
  doc.fontSize(9).text(title, MARGIN + 10, y + 13)
  return { ...ctx, y: y + h }
}

function drawFieldTable(ctx: LayoutCtx, rows: [string, string][], labelW = 0.42): LayoutCtx {
  const { doc } = ctx
  let y = ctx.y
  const rowH = 20
  const labelPx = CONTENT_W * labelW
  const valuePx = CONTENT_W - labelPx

  rows.forEach(([label, value], i) => {
    ctx = ensureSpace(ctx, rowH)
    y = ctx.y
    const bg = i % 2 === 0 ? C.white : C.rowAlt
    doc.rect(MARGIN, y, CONTENT_W, rowH).fill(bg)
    doc.rect(MARGIN, y, CONTENT_W, rowH).lineWidth(0.25).strokeColor(C.border).stroke()
    doc.fillColor(C.muted).font("Helvetica").fontSize(8).text(label, MARGIN + 10, y + 6, { width: labelPx - 14 })
    doc.fillColor(C.dark).font("Helvetica").fontSize(8.5).text(value, MARGIN + labelPx + 6, y + 5, {
      width: valuePx - 14,
    })
    y += rowH
    ctx = { ...ctx, y }
  })

  return { ...ctx, y: y + 8 }
}

function drawAcademicSection(ctx: LayoutCtx, app: FyugAdmissionApplication): LayoutCtx {
  let c = drawSectionHeader(ctx, "SECTION D", "ACADEMIC INFORMATION")
  c = ensureSpace(c, 130)

  const { doc } = c
  let y = c.y

  // Highlight badges row
  const badgeH = 36
  doc.roundedRect(MARGIN, y, CONTENT_W, badgeH, 2).fill(C.blueLight)
  doc.strokeColor(C.border).lineWidth(0.5).roundedRect(MARGIN, y, CONTENT_W, badgeH, 2).stroke()

  const badges = [
    { label: "MAJOR", value: val(app.majorSubject) },
    { label: "MINOR", value: val(app.minorSubject) },
    { label: "HONOURS APPLIED", value: val(app.honoursSubject) },
  ]
  const bw = CONTENT_W / 3
  badges.forEach((b, i) => {
    const bx = MARGIN + i * bw + 8
    doc.roundedRect(bx, y + 6, bw - 16, 24, 2).fill(C.white)
    doc.fillColor(C.blue).font("Helvetica-Bold").fontSize(6.5).text(b.label, bx + 6, y + 10)
    doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(9).text(b.value, bx + 6, y + 19, { width: bw - 28 })
  })

  y += badgeH + 6
  c = drawFieldTable(
    { ...c, y },
    [
      ["CUET 2026 Score", app.cuetScore != null ? String(app.cuetScore) : "—"],
      ["CGPA till Semester V", app.cgpa != null ? String(app.cgpa) : "—"],
      ["Percentage till Semester V", app.percentage != null ? String(app.percentage) : "—"],
    ]
  )
  return c
}

function drawDeclaration(ctx: LayoutCtx): LayoutCtx {
  ctx = ensureSpace(ctx, 72)
  const { doc } = ctx
  const y = ctx.y
  const h = 64

  doc.roundedRect(MARGIN, y, CONTENT_W, h, 3).lineWidth(0.75).strokeColor(C.border).stroke()
  doc.rect(MARGIN + 1, y + 1, CONTENT_W - 2, 18).fill(C.blueLight)
  doc.fillColor(C.blue).font("Helvetica-Bold").fontSize(8.5).text("DECLARATION", MARGIN + 12, y + 5)

  doc.fillColor(C.dark).font("Helvetica").fontSize(8)
  doc.text(
    "I hereby declare that all information furnished in this application is true and correct to the best of my knowledge. I understand that if any information is found false, my application is liable to be cancelled.",
    MARGIN + 12,
    y + 26,
    { width: CONTENT_W - 24, lineGap: 2 }
  )

  return { ...ctx, y: y + h + 10 }
}

function drawDigitalSignature(
  ctx: LayoutCtx,
  app: FyugAdmissionApplication,
  sigBuf: Buffer | null
): LayoutCtx {
  ctx = ensureSpace(ctx, 100)
  const { doc } = ctx
  const y = ctx.y
  const h = 88

  doc.roundedRect(MARGIN, y, CONTENT_W, h, 3).lineWidth(0.75).strokeColor(C.border).stroke()
  doc.fillColor(C.blue).font("Helvetica-Bold").fontSize(8.5).text("DIGITAL SUBMISSION", MARGIN + 12, y + 10)

  const leftX = MARGIN + 12
  const sigX = PAGE_W / 2 + 10

  doc.fillColor(C.muted).font("Helvetica").fontSize(7.5)
  doc.text("Submitted Digitally", leftX, y + 26)
  doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(8)
  doc.text(`Date: ${formatDate(app.submittedAt ?? app.createdAt)}`, leftX, y + 38)
  doc.font("Helvetica").fontSize(8).fillColor(C.dark)
  doc.text(`Time: ${formatDateTime(app.submittedAt ?? app.createdAt).split(", ").pop() ?? "—"}`, leftX, y + 50)
  doc.fillColor(C.muted).fontSize(7).text("System Generated — No Physical Signature Required", leftX, y + 64)

  doc.fillColor(C.muted).font("Helvetica").fontSize(7.5).text("Applicant Signature", sigX, y + 26)
  if (sigBuf) {
    doc.image(sigBuf, sigX, y + 36, { width: 130, height: 42, fit: [130, 42] })
  } else if (app.signatureTypedName) {
    doc.fillColor(C.dark).font("Helvetica-Oblique").fontSize(11).text(app.signatureTypedName, sigX, y + 44)
  } else {
    doc.fillColor(C.muted).font("Helvetica").fontSize(8).text("—", sigX, y + 44)
  }

  return { ...ctx, y: y + h + 8 }
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
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 140 })
  const qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ""), "base64")

  const [logoBuf, photoBuf, sigBuf] = await Promise.all([
    readFile(path.join(process.cwd(), "public", "logo.png")).catch(() => null),
    tryReadPublicImage(app.photoUrl),
    tryReadPublicImage(app.signatureUrl),
  ])

  const generatedAt = new Date()

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: "A4", bufferPages: true })
    const stream = createWriteStream(filePath)
    doc.pipe(stream)

    drawWatermark(doc)
    statusRibbon(doc, app.status)

    let ctx: LayoutCtx = { doc, y: MARGIN, page: 1 }
    ctx = drawHeaderWithSession(ctx, logoBuf, qrBuffer, app.academicSession)
    ctx = drawTitleBar(ctx)
    ctx = drawSummaryCard(ctx, app)
    ctx = drawProfileCard(ctx, app, photoBuf)

    ctx = drawSectionHeader(ctx, "SECTION A", "PERSONAL INFORMATION")
    ctx = drawFieldTable(ctx, [
      ["Full Name", val(app.fullName)],
      ["Gender", val(app.gender)],
      ["Date of Birth", formatDateShort(app.dob)],
      ["Mobile Number", val(app.mobile)],
      ["WhatsApp Number", val(app.whatsapp)],
      ["Email Address", val(app.email)],
      ["State", val(app.state)],
    ])

    ctx = drawSectionHeader(ctx, "SECTION B", "PARENT / GUARDIAN DETAILS")
    ctx = drawFieldTable(ctx, [
      ["Father's Name", val(app.fatherName)],
      ["Father's Mobile", val(app.fatherMobile)],
      ["Mother's Name", val(app.motherName)],
      ["Mother's Mobile", val(app.motherMobile)],
    ])

    ctx = drawSectionHeader(ctx, "SECTION C", "PREVIOUS COLLEGE DETAILS")
    ctx = drawFieldTable(ctx, [
      ["College Last Attended", val(app.collegeName)],
      [
        "Affiliated University",
        app.affiliatedUniversity === "OTHER"
          ? val(app.otherUniversityName)
          : "North Eastern Hill University (NEHU), Shillong",
      ],
    ])

    ctx = drawAcademicSection(ctx, app)

    ctx = drawSectionHeader(ctx, "SECTION E", "BACK PAPERS (SEMESTER I – V)")
    ctx = drawFieldTable(ctx, [
      ["Any Back Papers?", app.hasBackPaper ? "Yes" : "No"],
      ...(app.backPaperDetails ? [["Details", app.backPaperDetails] as [string, string]] : []),
    ])

    ctx = drawDeclaration(ctx)
    ctx = drawDigitalSignature(ctx, app, sigBuf)

    const range = doc.bufferedPageRange()
    const totalPages = range.count
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i)
      drawFooter(doc, i - range.start + 1, totalPages, generatedAt)
    }

    doc.end()

    stream.on("finish", () => resolve())
    stream.on("error", reject)
  })

  return publicUrl
}
