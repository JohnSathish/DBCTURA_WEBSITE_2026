import { PrismaClient } from '../lib/prisma-generated/client'

const prisma = new PrismaClient()

async function main() {
  const message = "Library is Open from Monday to Friday from 06:00 am to 06:45 pm and Saturday from 06:00 am to 04:00 pm."
  
  await prisma.setting.upsert({
    where: { key: "flash_news" },
    update: { value: message },
    create: {
      key: "flash_news",
      value: message,
    },
  })

  console.log('Flash news seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



