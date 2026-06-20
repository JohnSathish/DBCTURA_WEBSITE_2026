export {}

async function main() {
  // Ensure Prisma can run even if user has no .env yet.
  if (!process.env.DATABASE_URL) {
    // `lib/prisma.ts` resolves `file:./...` relative to the `prisma/` directory.
    process.env.DATABASE_URL = "file:./prisma/dev.db"
  }

  const { prisma } = await import("../lib/prisma")

  // Local route requested by you:
  const slug = "/about/db-higher-education"
  const title = "DB Higher Education in India"

  // Pulled from: https://donboscocollege.ac.in/about-us/db-higher-edu-in-india
  const content = `
    <h2>University</h2>
    <p>Assam Don Bosco University, Guwahati</p>

    <h2>Autonomous College</h2>
    <p>Sacred Heart College, Tirupattur, Tamil Nadu</p>

    <h2>DB Higher Education in India</h2>
    <ol>
      <li>Don Bosco College, Sonada, West Bengal</li>
      <li>Don Bosco College, Siliguri, West Bengal</li>
      <li>Don Bosco College, Dimapur, Nagaland</li>
      <li>Don Bosco College of Teacher Education, Dimapur, Nagaland</li>
      <li>Don Bosco Institute, Jorhat, Assam</li>
      <li>Don Bosco Institute of Management, Guwahati, Assam</li>
      <li>Don Bosco College, Tura, Meghalaya</li>
      <li>Antony’s College, Shilling, Megha</li>
      <li>Don Bosco College of Teacher Education, Tura, Meghalaya</li>
      <li>Don Bosco College, Itanagar, Arunachal Pradesh</li>
      <li>Don Bosco College, Maram, Manipur</li>
      <li>Don Bosco Academy, Nalgonda, Telangana</li>
      <li>Don Bosco Degree College, Hyderabad, Telangana</li>
      <li>Don Bosco College, Narsipatnam, Visakhapatnam, Andhra Pradesh</li>
      <li>Don Bosco College, Angadikadavu, Kerala</li>
      <li>Don Bosco Arts &amp; Science College, Angadikadavu, Kerala</li>
      <li>Don Bosco College, Mannuthy, Kerala</li>
      <li>Don Bosco College, Sultan Bathery, Kerala</li>
      <li>Don Bosco IMAGE, Vennala, Kochi, Kerala</li>
      <li>Don Bosco College, Mampetta, Kerala</li>
      <li>Don Bosco College, Kottiyam, Kerala</li>
      <li>Don Bosco College of Education, Yadagiri, Karnataka</li>
      <li>SIGA Polytechnic College, Chennai, Tamil Nadu</li>
      <li>Don Bosco College of Education, Dharmapuri, Tamil Nadu</li>
      <li>Don Bosco College of Education, Karaikal, Tamil Nadu</li>
      <li>Don Bosco Polytechnic College, Thirukazhukundram, Tamil Nadu</li>
      <li>Mary’s College of Education, Katpadi, Vellore, Tamil Nadu</li>
      <li>Don Bosco Polytechnic College, Chennai, Tamil Nadu</li>
      <li>Don Bosco College of Art And Design, Chennai, Tamil Nadu</li>
      <li>Don Bosco College, Yelagiri Hills, Tamil Nadu</li>
      <li>Don Bosco College of Agriculture, Tamil Nadu</li>
      <li>Don Bosco Polytechnic College, Thirukazhukundram, Tamil Nadu.</li>
      <li>Pastor Lenssen Polytechnic College, Kuthenkuly, Tamil Nadu</li>
      <li>Don Bosco Polytechnic College, Kazhiappanallur, Tamil Nadu</li>
      <li>Don Bosco Arts &amp; Science College, Keela Eral, Tamil Nadu</li>
      <li>Don Bosco College, Panjim, Goa</li>
      <li>Don Bosco College of Engineering, Fatorda, Goa</li>
      <li>Don Bosco Institute of Technology, Kurla, Mumbai, Maharashtra</li>
      <li>Don Bosco Institute of Management &amp; Research, Kurla, Mumbai, Maharashtra</li>
    </ol>
  `.trim()

  await prisma.page.upsert({
    where: { slug },
    update: {
      title,
      content,
      metaTitle: title,
      metaDescription: "List of Don Bosco higher education institutions in India.",
      published: true,
    },
    create: {
      title,
      slug,
      content,
      metaTitle: title,
      metaDescription: "List of Don Bosco higher education institutions in India.",
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

