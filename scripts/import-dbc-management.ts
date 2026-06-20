export {}

async function main() {
  // Ensure Prisma can run even if user has no .env yet.
  if (!process.env.DATABASE_URL) {
    // `lib/prisma.ts` resolves `file:./...` relative to the `prisma/` directory.
    process.env.DATABASE_URL = "file:./prisma/dev.db"
  }

  const { prisma } = await import("../lib/prisma")

  const slug = "/about/management"
  const title = "Management"

  // Pulled from: https://donboscocollege.ac.in/about-us/management
  const content = `
    <p>Don Bosco College Tura is under the aegis of the Don Bosco Province of Guwahati situated at Panbazar, Guwahati. The Provincial of the Salesian Province of Guwahati is the President of the college. Presently Fr. Januarius S. Sangma is the Provincial of the Salesian Province of Guwahati and he is the President of the college. The Salesian congregation present in 132 countries of the world runs institutions of higher learning, colleges, higher secondary schools, high schools, technical and vocational schools and a big numbers of schools.</p>
  `.trim()

  await prisma.page.upsert({
    where: { slug },
    update: {
      title,
      content,
      metaTitle: title,
      metaDescription: "Management overview of Don Bosco College, Tura.",
      published: true,
    },
    create: {
      title,
      slug,
      content,
      metaTitle: title,
      metaDescription: "Management overview of Don Bosco College, Tura.",
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

