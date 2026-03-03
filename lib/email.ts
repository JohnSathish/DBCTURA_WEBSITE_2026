import nodemailer, { Transporter } from "nodemailer"

type MailParams = {
  to: string | string[]
  subject: string
  html?: string
  text?: string
}

let transporter: Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !port || !user || !pass) {
    throw new Error(
      "SMTP configuration missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM environment variables."
    )
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })

  return transporter
}

export async function sendMail({ to, subject, html, text }: MailParams) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER

  if (!from) {
    throw new Error("SMTP_FROM or SMTP_USER environment variable must be set to send email.")
  }

  const transport = getTransporter()

  await transport.sendMail({
    from,
    to,
    subject,
    text,
    html,
  })
}


