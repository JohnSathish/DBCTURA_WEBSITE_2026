import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { sendMail } from "@/lib/email"

const contactSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Please provide more details in your message"),
  recaptchaToken: z.string().optional(),
})

async function verifyRecaptcha(token?: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) return true
  if (!token) return false

  const params = new URLSearchParams()
  params.append("secret", secret)
  params.append("response", token)

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })

  if (!response.ok) return false
  const data = await response.json()
  return Boolean(data.success)
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const parsed = contactSchema.safeParse(json)

    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(", ")
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { recaptchaToken, ...payload } = parsed.data

    if (!(await verifyRecaptcha(recaptchaToken))) {
      return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 })
    }

    const to =
      process.env.CONTACT_FORWARD_TO ||
      process.env.GRIEVANCE_FORWARD_TO ||
      "principal@donboscocollege.ac.in"

    const textBody = [
      `Name: ${payload.fullName}`,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : undefined,
      `Subject: ${payload.subject}`,
      "",
      payload.message,
    ]
      .filter(Boolean)
      .join("\n")

    try {
      await sendMail({
        to,
        subject: `[Contact Form] ${payload.subject} — ${payload.fullName}`,
        text: textBody,
        html: `
          <p><strong>Name:</strong> ${payload.fullName}</p>
          <p><strong>Email:</strong> ${payload.email}</p>
          ${payload.phone ? `<p><strong>Phone:</strong> ${payload.phone}</p>` : ""}
          <p><strong>Subject:</strong> ${payload.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${payload.message.replace(/\n/g, "<br />")}</p>
        `,
      })
    } catch (error) {
      console.error("Contact form email failed:", error)
      return NextResponse.json(
        { error: "Unable to send message right now. Please email us directly." },
        { status: 503 }
      )
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error: unknown) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 })
  }
}
