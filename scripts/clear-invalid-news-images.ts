/**
 * Removes logo/favicon URLs mistakenly stored as news feature images.
 * Run: npx tsx scripts/clear-invalid-news-images.ts
 */
import "dotenv/config"
import { PrismaClient } from "../lib/prisma-generated/client"

const prisma = new PrismaClient()

async function main() {
  const n = await prisma.$executeRawUnsafe(
    `UPDATE News SET image = NULL WHERE image IS NOT NULL AND (
      LOWER(image) LIKE '%fav.png%' OR
      LOWER(image) LIKE '%/frontend/img/logo%' OR
      LOWER(image) LIKE '%/frontend/img/logo/%'
    )`
  )
  console.log("Cleared invalid image URLs, rows affected:", n)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
