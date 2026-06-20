import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendMail } from "@/lib/email"
import { absoluteUrl } from "@/lib/site"

function parseDateOrNull(value: unknown) {
  if (!value) return null
  const d = new Date(String(value))
  return isNaN(d.getTime()) ? null : d
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = (searchParams.get("q") || "").trim()
    const type = (searchParams.get("type") || "").trim() // document | image | text
    const includeAll = searchParams.get("all") === "1"

    const now = new Date()

    const session = includeAll ? await getServerSession(authOptions) : null
    const isAdmin = Boolean(session)

    const where: any = isAdmin
      ? {}
      : {
          active: true,
          publishDate: { lte: now },
          OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
        }

    if (type) {
      where.noticeType = type
    }

    if (q) {
      where.OR = [
        ...(where.OR || []),
        { title: { contains: q } },
        { content: { contains: q } },
      ]
    }

    const notices = await prisma.noticeBoardNotice.findMany({
      where,
      orderBy: [
        { pinned: "desc" },
        { important: "desc" },
        { publishDate: "desc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(notices)
  } catch (error: any) {
    console.error("Error fetching notices:", error)
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const data = await request.json()
    const {
      title,
      content,
      noticeType,
      pdfUrl,
      imageUrl,
      publishDate,
      expiryDate,
      active,
      important,
      pinned,
    } = data ?? {}

    if (!title || String(title).trim().length < 1) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const type = String(noticeType || "").trim()
    if (!["document", "image", "text"].includes(type)) {
      return NextResponse.json({ error: "Invalid notice type" }, { status: 400 })
    }

    const publish = parseDateOrNull(publishDate) ?? new Date()
    const expiry = parseDateOrNull(expiryDate)

    if (expiry && expiry <= publish) {
      return NextResponse.json({ error: "Expiry date must be after publish date" }, { status: 400 })
    }

    const pdf = pdfUrl ? String(pdfUrl) : null
    const img = imageUrl ? String(imageUrl) : null

    if (type === "document" && !pdf) {
      return NextResponse.json({ error: "PDF is required for Document notices" }, { status: 400 })
    }
    if (type === "image" && !img) {
      return NextResponse.json({ error: "Image is required for Image notices" }, { status: 400 })
    }

    const notice = await prisma.noticeBoardNotice.create({
      data: {
        title: String(title).trim(),
        content: content ? String(content) : null,
        noticeType: type,
        pdfUrl: type === "document" ? pdf : null,
        imageUrl: type === "image" ? img : null,
        publishDate: publish,
        expiryDate: expiry,
        active: typeof active === "boolean" ? active : true,
        important: typeof important === "boolean" ? important : false,
        pinned: typeof pinned === "boolean" ? pinned : false,
      },
    })

    // Optional: send email alert (fails silently if not configured)
    const alertTo = process.env.NOTICE_ALERT_TO
    if (alertTo) {
      try {
        const studentUrl = absoluteUrl("/notice-board")
        await sendMail({
          to: alertTo.split(",").map((s) => s.trim()).filter(Boolean),
          subject: `New Notice: ${notice.title}`,
          text: `A new notice was added.\n\nTitle: ${notice.title}\nType: ${notice.noticeType}\nPublish: ${notice.publishDate.toDateString()}\n\nView: ${studentUrl}`,
          html: `
            <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
              <h2 style="margin:0 0 8px;">New Notice Added</h2>
              <p style="margin:0 0 12px;"><strong>${notice.title}</strong></p>
              <p style="margin:0 0 6px;">Type: <strong>${notice.noticeType}</strong></p>
              <p style="margin:0 0 12px;">Publish: <strong>${notice.publishDate.toDateString()}</strong></p>
              ${studentUrl ? `<p style="margin:0;"><a href="${studentUrl}">Open Notice Board</a></p>` : ""}
            </div>
          `,
        })
      } catch (e) {
        console.warn("NOTICE_ALERT email failed:", (e as any)?.message || e)
      }
    }

    return NextResponse.json(notice)
  } catch (error: any) {
    console.error("Error creating notice:", error)
    return NextResponse.json({ error: error.message || "Failed to create notice" }, { status: 400 })
  }
}

