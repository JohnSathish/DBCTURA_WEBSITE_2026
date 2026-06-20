export {}

async function main() {
  // Ensure Prisma can run even if user has no .env yet.
  if (!process.env.DATABASE_URL) {
    // `lib/prisma.ts` resolves `file:./...` relative to the `prisma/` directory.
    process.env.DATABASE_URL = "file:./prisma/dev.db"
  }

  const { prisma } = await import("../lib/prisma")

  const slug = "/about/objectives"
  const title = "Objectives"

  // Pulled from: https://donboscocollege.ac.in/about-us/objectives
  const content = `
    <h2>OBJECTIVES OF DON BOSCO COLLEGE, TURA</h2>
    <p>The objectives of Don Bosco College are rooted in the principles and values set forth by its founder, Don Bosco, who based his educational system on the three pillars of &quot;Reason, Religion, and Kindness.&quot; These objectives reflect his holistic approach to education and his commitment to the well-being of youth and the community. Here are the key objectives of Don Bosco College:</p>

    <h3>Holistic Education</h3>
    <p>Don Bosco College aims to provide holistic education that encompasses intellectual, spiritual, moral, and emotional development. The integration of reason, religion, and kindness ensures that students receive a well-rounded education that prepares them for success in various aspects of life.</p>

    <h3>Integration of Reason</h3>
    <p>Education at Don Bosco College emphasizes the development of critical thinking, problem-solving skills, and intellectual curiosity. By fostering the use of reason and logic, the college aims to empower students to make informed decisions and contribute positively to society.</p>

    <h3>Fostering Religious Values</h3>
    <p>Don Bosco College is committed to nurturing the spiritual dimension of students&apos; lives. The religious pillar encourages the development of values, ethics, and a sense of purpose, helping students become responsible and compassionate individuals.</p>

    <h3>Promotion of Kindness</h3>
    <p>Kindness, compassion, and empathy are integral to the educational philosophy at Don Bosco College. The emphasis on kindness encourages students to be socially responsible, respectful, and caring individuals who contribute positively to their communities.</p>

    <h3>Community Engagement</h3>
    <p>Don Bosco College recognizes that education cannot be isolated from the needs of the community. The college encourages students to actively engage with their communities and contribute to their development through various initiatives and service projects.</p>

    <h3>Vocational Guidance and Training</h3>
    <p>Following Don Bosco&apos;s vision, the college provides vocational guidance and training to help students discover their talents, interests, and potential career paths. This empowers students to make informed choices about their future and equips them with practical skills for the workforce.</p>

    <h3>Job Placement</h3>
    <p>Don Bosco College is committed to facilitating job placement for its students. By providing practical skills and networking opportunities, the college aims to enhance students&apos; employability and help them transition smoothly into the professional world.</p>

    <h3>Empowerment</h3>
    <p>The education provided by Don Bosco College is designed to empower students, enabling them to overcome challenges, achieve their goals, and become self-reliant individuals who contribute positively to society.</p>
  `.trim()

  await prisma.page.upsert({
    where: { slug },
    update: {
      title,
      content,
      metaTitle: title,
      metaDescription: "Objectives of Don Bosco College, Tura.",
      published: true,
    },
    create: {
      title,
      slug,
      content,
      metaTitle: title,
      metaDescription: "Objectives of Don Bosco College, Tura.",
      published: true,
    },
  })

  console.log(`Updated page: ${slug}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

