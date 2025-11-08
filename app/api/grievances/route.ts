import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { sendMail } from "@/lib/email"
import { prisma } from "@/lib/prisma"

const categoryValues = ["Administrator", "Faculty", "Support Staff", "Student", "Others"] as const

const grievanceSchema = z.object({
  category: z.enum(categoryValues),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  message: z.string().min(10, "Please provide more details about your grievance"),
  recaptchaToken: z.string().optional(),
})

async function verifyRecaptcha(token?: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY

  if (!secret) {
    return true
  }

  if (!token) {
    return false
  }

  const params = new URLSearchParams()
  params.append("secret", secret)
  params.append("response", token)

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })

  if (!response.ok) {
    console.error("Failed to verify reCAPTCHA:", await response.text())
    return false
  }

  const data = await response.json()
  return Boolean(data.success)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(prisma as any).grievance || typeof (prisma as any).grievance.findMany !== "function") {
      return NextResponse.json(
        { error: "Grievance model not initialized. Run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const categoryParam = searchParams.get("category")
    const searchTerm = searchParams.get("search")
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    const where: any = {}

    if (categoryParam && categoryParam !== "all") {
      if (!(categoryValues as readonly string[]).includes(categoryParam)) {
        return NextResponse.json({ error: "Invalid category filter" }, { status: 400 })
      }
      where.category = categoryParam
    }

    if (searchTerm) {
      where.OR = [
        { fullName: { contains: searchTerm, mode: "insensitive" as const } },
        { email: { contains: searchTerm, mode: "insensitive" as const } },
        { phone: { contains: searchTerm, mode: "insensitive" as const } },
        { message: { contains: searchTerm, mode: "insensitive" as const } },
      ]
    }

    if (startDateParam || endDateParam) {
      const createdAt: Record<string, Date> = {}
      if (startDateParam) {
        const start = new Date(startDateParam)
        if (Number.isNaN(start.getTime())) {
          return NextResponse.json({ error: "Invalid start date" }, { status: 400 })
        }
        createdAt.gte = start
      }
      if (endDateParam) {
        const end = new Date(endDateParam)
        if (Number.isNaN(end.getTime())) {
          return NextResponse.json({ error: "Invalid end date" }, { status: 400 })
        }
        createdAt.lte = end
      }
      if (Object.keys(createdAt).length > 0) {
        where.createdAt = createdAt
      }
    }

    const grievances = await prisma.grievance.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(grievances)
  } catch (error: any) {
    console.error("Error fetching grievances:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch grievances" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(prisma as any).grievance || typeof (prisma as any).grievance.create !== "function") {
      console.warn("Grievance model not available in Prisma client. Did you run 'npx prisma generate'?")
      return NextResponse.json(
        { error: "Grievance model not initialized. Run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const json = await request.json()
    const parsed = grievanceSchema.safeParse(json)

    if (!parsed.success) {
      const message = parsed.error.errors.map((err) => err.message).join(", ")
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { recaptchaToken, ...payload } = parsed.data

    const recaptchaValid = await verifyRecaptcha(recaptchaToken)

    if (!recaptchaValid) {
      return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 })
    }

    const record = await prisma.grievance.create({
      data: {
        category: payload.category,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        message: payload.message,
      },
    })

    try {
      await sendMail({
        to: process.env.GRIEVANCE_FORWARD_TO || "johnsathish16@gmail.com",
        subject: `New grievance submitted by ${payload.fullName}`,
        text: [
          `Category: ${payload.category}`,
          `Name: ${payload.fullName}`,
          `Email: ${payload.email}`,
          payload.phone ? `Phone: ${payload.phone}` : undefined,
          "",
          payload.message,
        ]
          .filter(Boolean)
          .join("\n"),
        html: `
          <p><strong>Category:</strong> ${payload.category}</p>
          <p><strong>Name:</strong> ${payload.fullName}</p>
          <p><strong>Email:</strong> ${payload.email}</p>
          ${payload.phone ? `<p><strong>Phone:</strong> ${payload.phone}</p>` : ""}
          <p><strong>Message:</strong></p>
          <p>${payload.message.replace(/\n/g, "<br />")}</p>
        `,
      })
    } catch (error) {
      console.error("Failed to send grievance email:", error)
    }

    return NextResponse.json({ success: true, grievance: record }, { status: 201 })
  } catch (error: any) {
    console.error("Error submitting grievance:", error)
    return NextResponse.json(
      { error: error.message || "Failed to submit grievance" },
      { status: 500 }
    )
  }
}

