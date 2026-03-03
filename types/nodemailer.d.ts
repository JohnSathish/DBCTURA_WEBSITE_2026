declare module "nodemailer" {
  import * as SMTPTransport from "nodemailer/lib/smtp-transport"

  export interface SendMailOptions {
    from?: string
    to?: string | string[]
    subject?: string
    text?: string
    html?: string
  }

  export interface Transporter {
    sendMail(mailOptions: SendMailOptions): Promise<any>
  }

  export function createTransport(options: SMTPTransport.Options): Transporter

  const nodemailer: {
    createTransport: typeof createTransport
  }

  export default nodemailer
}

