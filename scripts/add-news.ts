import { PrismaClient } from '../lib/prisma-generated/client'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.findFirst({ where: { email: 'admin@donbosco.edu.in' } })
  if (!admin) throw new Error('Admin user not found. Seed first.')

  const newsItems = [
    {
      title: 'December 12 & 13, 2025',
      slug: 'cpell-academic-leadership-training-dec-2025',
      excerpt: 'Centre for Professional Excellence and Life Long Learning (CPELL) Academic Leadership Training Programme for Principals, Administrators, Heads of Departments and Programme Coordinators of Higher Education Institutions',
      content: `<p>Centre for Professional Excellence and Life Long Learning (CPELL) Academic Leadership Training Programme for Principals, Administrators, Heads of Departments and Programme Coordinators of Higher Education Institutions <a href="#" target="_blank">[MORE DETAILS]</a></p>`,
      category: 'Training',
      featured: true,
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop',
      publishedAt: new Date('2025-12-12T00:00:00Z'),
    },
    {
      title: 'November 04, 2025',
      slug: 'invictus-management-fest-3',
      excerpt: 'Department of Professional Management Studies presents National Level Management Fest Invictus 3.O',
      content: `<p>Department of Professional Management Studies presents National Level Management Fest Invictus 3.O <a href="#" target="_blank">[MORE DETAILS]</a></p>`,
      category: 'Events',
      featured: true,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
      publishedAt: new Date('2025-11-04T00:00:00Z'),
    },
    {
      title: 'November 03 to 07, 2025',
      slug: 'fdp-viksit-bharat-2047',
      excerpt: 'School of Commerce, Accounting and Finance - Department of Commerce National Level Faculty Development Programme on Synergy of Sustainability and Technological Innovation Viksit Bharat 2047',
      content: `<p>School of Commerce, Accounting and Finance - Department of Commerce National Level Faculty Development Programme on Synergy of Sustainability and Technological Innovation Viksit Bharat 2047 <a href="#" target="_blank">[MORE DETAILS]</a></p>`,
      category: 'Academics',
      featured: true,
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop',
      publishedAt: new Date('2025-11-03T00:00:00Z'),
    },
    {
      title: 'Annual College Day Celebration 2025',
      slug: 'annual-college-day-celebration-2025',
      excerpt: 'Join us for the grand Annual College Day Celebration featuring cultural performances, award ceremonies, and special guest lectures',
      content: `<p>Join us for the grand Annual College Day Celebration featuring cultural performances, award ceremonies, and special guest lectures <a href="#" target="_blank">[MORE DETAILS]</a></p>`,
      category: 'Events',
      featured: true,
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop',
      publishedAt: new Date('2025-11-15T00:00:00Z'),
    },
    {
      title: 'Research Colloquium on Sustainable Development',
      slug: 'research-colloquium-sustainable-development',
      excerpt: 'Department of Environmental Science organizes National Research Colloquium on Sustainable Development Goals and Climate Action',
      content: `<p>Department of Environmental Science organizes National Research Colloquium on Sustainable Development Goals and Climate Action <a href="#" target="_blank">[MORE DETAILS]</a></p>`,
      category: 'Academics',
      featured: true,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      publishedAt: new Date('2025-11-20T00:00:00Z'),
    },
  ]

  for (const item of newsItems) {
    const existing = await prisma.news.findUnique({ where: { slug: item.slug } })
    if (existing) {
      const updated = await prisma.news.update({
        where: { slug: item.slug },
        data: {
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          category: item.category,
          featured: item.featured,
          image: item.image,
          publishedAt: item.publishedAt,
        },
      })
      console.log('Updated news:', updated.slug)
    } else {
      const created = await prisma.news.create({
        data: {
          ...item,
          authorId: admin.id,
        },
      })
      console.log('Created news:', created.slug)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
