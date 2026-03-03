import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { sendMail } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { BLOOD_GROUPS, bloodDonorSchema, sanitizeBloodDonorInput } from "@/lib/validation/blood-donor"

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null
  }
  return request.headers.get("x-real-ip") || null
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(prisma as any).bloodDonor || typeof (prisma as any).bloodDonor.findMany !== "function") {
      return NextResponse.json(
        { error: "BloodDonor model not initialized. Run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const bloodGroup = searchParams.get("bloodGroup")
    const search = searchParams.get("search")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    if (bloodGroup && bloodGroup !== "all") {
      if (!(BLOOD_GROUPS as readonly string[]).includes(bloodGroup)) {
        return NextResponse.json({ error: "Invalid blood group filter" }, { status: 400 })
      }
      where.bloodGroup = bloodGroup
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
        { addressCity: { contains: search, mode: "insensitive" as const } },
      ]
    }

    if (startDate || endDate) {
      const createdAt: Record<string, Date> = {}
      if (startDate) {
        const start = new Date(startDate)
        if (Number.isNaN(start.getTime())) {
          return NextResponse.json({ error: "Invalid start date" }, { status: 400 })
        }
        createdAt.gte = start
      }
      if (endDate) {
        const end = new Date(endDate)
        if (Number.isNaN(end.getTime())) {
          return NextResponse.json({ error: "Invalid end date" }, { status: 400 })
        }
        createdAt.lte = end
      }
      where.createdAt = createdAt
    }

    const donors = await prisma.bloodDonor.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(donors)
  } catch (error: any) {
    console.error("Error fetching blood donors:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch donors" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(prisma as any).bloodDonor || typeof (prisma as any).bloodDonor.create !== "function") {
      return NextResponse.json(
        { error: "BloodDonor model not initialized. Run 'npx prisma generate' and restart the server." },
        { status: 503 }
      )
    }

    const ip = getClientIp(request)
    if (ip) {
      const rate = checkRateLimit(`blood-donor-${ip}`)
      if (!rate.allowed) {
        return NextResponse.json(
          { error: "Too many submissions. Please try again in a minute." },
          { status: 429 }
        )
      }
    }

    const json = await request.json()
    const parsed = bloodDonorSchema.safeParse(json)

    if (!parsed.success) {
      const formattedErrors = parsed.error.flatten().fieldErrors
      return NextResponse.json({ error: "Validation failed", details: formattedErrors }, { status: 400 })
    }

    const sanitized = sanitizeBloodDonorInput(parsed.data)

    const donor = await prisma.bloodDonor.create({
      data: {
        ...sanitized,
        ipAddress: ip,
        userAgent: request.headers.get("user-agent"),
      },
    })

    const adminEmail =
      process.env.BLOOD_DONOR_ADMIN_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER

    const donorEmailHtml = `
      <p>Dear ${donor.fullName},</p>
      <p>Thank you for registering as a blood donor with Don Bosco College.</p>
      <p><strong>Blood Group:</strong> ${donor.bloodGroup}</p>
      <p><strong>Preferred Contact:</strong> ${donor.preferredContact}</p>
      <p>We will reach out if a matching donation request arises.</p>
      <p>Warm regards,<br/>Don Bosco College</p>
    `

    const adminEmailHtml = `
      <p>A new blood donor registration has been received.</p>
      <ul>
        <li><strong>Name:</strong> ${donor.fullName}</li>
        <li><strong>Email:</strong> ${donor.email}</li>
        <li><strong>Phone:</strong> ${donor.phone}</li>
        <li><strong>Blood Group:</strong> ${donor.bloodGroup}</li>
        <li><strong>Preferred Contact:</strong> ${donor.preferredContact}</li>
      </ul>
    `

    try {
      if (donor.email) {
        await sendMail({
          to: donor.email,
          subject: "Thank you for registering as a blood donor",
          html: donorEmailHtml,
          text: donorEmailHtml.replace(/<[^>]+>/g, ""),
        })
      }

      if (adminEmail) {
        await sendMail({
          to: adminEmail,
          subject: "New blood donor registration",
          html: adminEmailHtml,
          text: adminEmailHtml.replace(/<[^>]+>/g, ""),
        })
      }
    } catch (emailError) {
      console.error("Failed to send blood donor emails:", emailError)
      // Do not fail the request if emails fail
    }

    return NextResponse.json({ id: donor.id, success: true }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating blood donor:", error)
    return NextResponse.json(
      { error: error.message || "Failed to submit donor information" },
      { status: 500 }
    )
  }
}

