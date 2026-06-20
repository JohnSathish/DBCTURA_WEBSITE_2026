import path from "node:path"

async function main() {
  // Ensure Prisma can run even if user has no .env yet.
  if (!process.env.DATABASE_URL) {
    // `lib/prisma.ts` resolves `file:./...` relative to the `prisma/` directory.
    process.env.DATABASE_URL = "file:./prisma/dev.db"
  }

  const { prisma } = await import("../lib/prisma")

  const slug = "/about/vision-mission"
  const title = "Vision & Mission"

  // Pulled from: https://donboscocollege.ac.in/about-us/vision-mission
  const content = `
    <h2>Vision</h2>
    <p>“Inspired by the benign and noble teachings of the Lord Jesus Christ who said,</p>
    <p>“Iam the Way, the Truth and the Life,” and guided by the educational philosophy of St. John Bosco, the college has the avowed vision of bringing holistic, quality higher education within the reach of all.”</p>

    <h2>Mission</h2>
    <p>“To provide an education that is participatory in nature, intellectual competence, multi-skill oriented, value based and socially committed for the development of persons and enrichment of society.”</p>

    <h2>Coat of Arms</h2>
    <p>The Coat of Arms of the college contains the motto of the college, “In Pursuit of Excellence” and three distinct components – sun, eagle and mountains. The radiant sun is the source, the giver that bestows light, energy, inspiration and divine guidance. The soaring eagle is the seeker that looks for all that is good, noble and uplifting in the world of knowledge, skills and values. The green mountains and valleys represent the process whereby the seeker ascends, descends and strives until he/she arrives at the top. True to our motto, we are passionate about excellence in every sphere of our academic, professional and social life.</p>
  `.trim()

  // Upsert by unique slug.
  await prisma.page.upsert({
    where: { slug },
    update: {
      title,
      content,
      metaTitle: title,
      metaDescription:
        "Vision, mission, and the meaning of the Coat of Arms of Don Bosco College, Tura.",
      published: true,
    },
    create: {
      title,
      slug,
      content,
      metaTitle: title,
      metaDescription:
        "Vision, mission, and the meaning of the Coat of Arms of Don Bosco College, Tura.",
      published: true,
    },
  })

  console.log(`Updated page: ${slug}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

