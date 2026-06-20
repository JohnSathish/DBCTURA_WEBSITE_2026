import 'dotenv/config'
import { PrismaClient } from '../lib/prisma-generated/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@donboscocollege.ac.in'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log('Admin user ready:', admin.email)
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('Warning: using default dev password. Set ADMIN_PASSWORD in production.')
  }

  // Seed some dummy news if none exist
  const existingNews = await prisma.news.count()
  console.log(`Existing news count: ${existingNews}`)
  if (existingNews === 0) {
    const now = new Date()
    const mkDate = (offset: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset)
    await prisma.news.createMany({
      data: [
        {
          title: 'National Level Faculty Development Programme on Synergy of Sustainability',
          slug: 'fdp-synergy-of-sustainability',
          excerpt: 'School of Commerce, Accounting and Finance organizes a national level FDP on Synergy of Sustainability and Technological Innovation.',
          content: '<p>Detailed programme schedule will be updated soon.</p>',
          image: null,
          featured: true,
          publishedAt: mkDate(1),
          authorId: admin.id,
        },
        {
          title: 'Academic Leadership Training Programme (CPELL)',
          slug: 'cpell-academic-leadership-training',
          excerpt: 'Training programme for Principals, Administrators, Heads of Departments and Programme Coordinators.',
          content: '<p>Two-day workshop focusing on leadership in higher education.</p>',
          image: null,
          featured: true,
          publishedAt: mkDate(5),
          authorId: admin.id,
        },
        {
          title: 'Invictus Management Fest 3.0',
          slug: 'invictus-management-fest-3',
          excerpt: 'Department of Professional Management Studies presents Invictus 3.0.',
          content: '<p>Join the national level management fest with diverse events.</p>',
          image: null,
          featured: true,
          publishedAt: mkDate(10),
          authorId: admin.id,
        },
      ],
    })
    console.log('Seeded dummy news entries')
  }

  // Seed flash news setting if it doesn't exist
  await prisma.setting.upsert({
    where: { key: "flash_news" },
    update: {},
    create: {
      key: "flash_news",
      value: "Library is Open from Monday to Friday from 06:00 am to 06:45 pm and Saturday from 06:00 am to 04:00 pm.",
    },
  })
  console.log('Flash news setting seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

