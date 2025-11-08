import 'dotenv/config'
import { PrismaClient } from '../lib/prisma-generated/client'

const prisma = new PrismaClient()

async function main() {
  // Sample testimonial based on the reference image
  const testimonial = await prisma.testimonial.upsert({
    where: {
      id: 'sample-testimonial-1',
    },
    update: {},
    create: {
      id: 'sample-testimonial-1',
      name: 'Sri Dorang Dekamra M Sangma',
      designation: 'WQM&S Coordinator under JJM in PHE',
      testimonial: 'Don Bosco College, Tura is a dynamic institution providing holistic development to its students and it caters to both learning and extracurricular activities, thus giving each student an opportunity to shine in their own field.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      displayOrder: 0,
      published: true,
    },
  })

  console.log('Testimonial created:', testimonial.name)

  // Add a few more sample testimonials
  const additionalTestimonials = [
    {
      name: 'Dr. Jane Smith',
      designation: 'Research Scientist',
      testimonial: 'My time at Don Bosco College, Tura shaped my career and instilled in me values that I carry to this day. The faculty and facilities are exceptional.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      displayOrder: 1,
    },
    {
      name: 'Mr. Robert Johnson',
      designation: 'Business Executive',
      testimonial: 'The comprehensive education and character development at Don Bosco College prepared me for challenges in the professional world. Highly recommended!',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      displayOrder: 2,
    },
  ]

  for (const item of additionalTestimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { name: item.name },
    })

    if (!existing) {
      const created = await prisma.testimonial.create({
        data: {
          ...item,
          published: true,
        },
      })
      console.log('Created testimonial:', created.name)
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

