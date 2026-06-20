export {}

async function main() {
  // Ensure Prisma can run even if user has no .env yet.
  if (!process.env.DATABASE_URL) {
    // `lib/prisma.ts` resolves `file:./...` relative to the `prisma/` directory.
    process.env.DATABASE_URL = "file:./prisma/dev.db"
  }

  const { prisma } = await import("../lib/prisma")

  const slug = "/about/philosophy"
  const title = "Philosophy"

  // Pulled from: https://donboscocollege.ac.in/about-us/philosophy
  const content = `
    <p>The college is named after St. John Bosco, popularly known as Don Bosco, the founder of the religious and educational society “Salesians of Don Bosco.” Don Bosco was born of a very poor family in 1815, near Turin, Italy. By dint of hard work and heroic sacrifices he became a priest in 1841. He dedicated himself to the service of poor youth, offering them food, shelter and education. He opened for them schools, technical schools, hostels and churches. He founded a society of collaborators and extended his work to all Europe and eventually to all continents. Don Bosco died on 31st January 1888 and was declared a saint on 1st April 1934.</p>

    <p>Don Bosco based his system of education on the three pillars of “Reason, Religion and Kindness”. He looked after the youth as a caring father and dedicated himself totally to their welfare. He did not visualize education in isolation from the needs of the community. Vocational guidance, training and job placement were integral to his scheme of things.</p>

    <h2>Accordingly we at Don Bosco College believe in:</h2>
    <ul>
      <li>An education that is affordable to the average categories of society;</li>
      <li>Creating an educative family of students, staff and management marked by transparency, mutual respect, constant interaction and caring support;</li>
      <li>Aiming at the integrated development of our students and empowerment of our teachers;</li>
      <li>Building competence and skills for employability and quality of life;</li>
      <li>Inculcating the spiritual and moral value systems that sustain society;</li>
      <li>Extension services beyond the campus and beyond self.</li>
    </ul>
  `.trim()

  await prisma.page.upsert({
    where: { slug },
    update: {
      title,
      content,
      metaTitle: title,
      metaDescription: "Educational philosophy of Don Bosco College, Tura.",
      published: true,
    },
    create: {
      title,
      slug,
      content,
      metaTitle: title,
      metaDescription: "Educational philosophy of Don Bosco College, Tura.",
      published: true,
    },
  })

  console.log(`Updated page: ${slug}`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

