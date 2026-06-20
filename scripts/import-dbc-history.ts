export {}

async function main() {
  // Ensure Prisma can run even if user has no .env yet.
  if (!process.env.DATABASE_URL) {
    // `lib/prisma.ts` resolves `file:./...` relative to the `prisma/` directory.
    process.env.DATABASE_URL = "file:./prisma/dev.db"
  }

  const { prisma } = await import("../lib/prisma")

  const slug = "/about/history"
  const title = "History"

  // Pulled from: https://donboscocollege.ac.in/about-us/history
  const content = `
    <h2>ABOUT THE COLLEGE</h2>
    <p>The college was established by the Salesians of Don Bosco in 1987 to serve the cause of higher education for the people of Garo Hills in particular and North East India in general.</p>

    <p>It was in the month of March 1987 that a few lecturers joined Don Bosco College under the able guidance Fr. V. A. Cyriac SDB, the Founder-Principal. The students then numbered 88 boys, pursuing Pre-University Arts and Bachelor of Arts courses. The college at that time had neither a campus nor a building of its own to boast of. The classes began in the Sacred Heart Parish Hostel premises, thanks to the generosity of Rt. Rev. Dr. George Mamalassery, Bishop of Tura. The college was officially inaugurated by Late Shri P. A. Sangma, the then Union Minister for Labour, on 22.05.1987, and this date is observed as the College Foundation Day.</p>

    <p>In 1988 Don Bosco College was converted into a co-ed institution. The Science Stream was introduced at the Higher Secondary level in 1988 and at the Bachelor’s level in 1992. The Department of Commerce was established in 2000 at the Higher Secondary level and at the Bachelor’s level in 2002. With a view to solving the acutely felt need of preparing professionally trained personnel in the field of business administration, the College decided to offer in 2002 a course in Bachelor of Business Administration. In 2004 the Bachelor of Computer Application was introduced.</p>

    <p>In the meantime, the College took new strides in its location. In 1993, the college was shifted from Sacred Heart Parish premises to what is now Don Bosco College Boys’ Hostel. The Staff Quarters was constructed in 1994. In 2001 the college was shifted to its permanent campus. In 2005 Don Bosco College was instrumental in the establishment of Don Bosco College of Teacher Education. Margaret Bosco Girls’ Hostel was established in 2010.</p>

    <p>Today, with staff strength of about 110 teaching and support personnel, the college caters to over 3045 boys and girls from the various states of North East India.</p>

    <p>In the last 36 years, Don Bosco College has distinguished itself as one of the premier colleges of Meghalaya. It is the endeavour of everyone at Don Bosco College to keep the flag aloft and continue its tradition of pursuit of excellence and quality of service.</p>
  `.trim()

  await prisma.page.upsert({
    where: { slug },
    update: {
      title,
      content,
      metaTitle: title,
      metaDescription: "History and background of Don Bosco College, Tura.",
      published: true,
    },
    create: {
      title,
      slug,
      content,
      metaTitle: title,
      metaDescription: "History and background of Don Bosco College, Tura.",
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

