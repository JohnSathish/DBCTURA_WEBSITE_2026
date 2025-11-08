import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function checkPages() {
  try {
    const count = await prisma.page.count()
    console.log('Total pages in database:', count)
    
    if (count > 0) {
      const pages = await prisma.page.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
        },
      })
      console.log('Sample pages:', pages)
    } else {
      console.log('No pages found in database.')
      console.log('Would you like to seed the navigation pages? Run: npm run db:seed')
    }
  } catch (error: any) {
    console.error('Error checking pages:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkPages()

