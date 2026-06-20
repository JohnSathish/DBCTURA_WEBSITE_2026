/**
 * Set or reset the admin password (production-safe).
 *
 * Usage:
 *   ADMIN_EMAIL=admin@donboscocollege.ac.in ADMIN_PASSWORD='your-strong-password' npm run admin:set-password
 */
import "dotenv/config"
import bcrypt from "bcryptjs"

import { PrismaClient } from "../lib/prisma-generated/client"

const prisma = new PrismaClient()

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@donboscocollege.ac.in").trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD?.trim()

  if (!password || password.length < 12) {
    console.error("ADMIN_PASSWORD must be set and at least 12 characters.")
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: "admin" },
    create: { email, password: hashedPassword, role: "admin" },
  })

  console.log(`Admin account updated: ${user.email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
