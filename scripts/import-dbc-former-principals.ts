export {}

async function main() {
  // Ensure Prisma can run even if user has no .env yet.
  if (!process.env.DATABASE_URL) {
    // `lib/prisma.ts` resolves `file:./...` relative to the `prisma/` directory.
    process.env.DATABASE_URL = "file:./prisma/dev.db"
  }

  const { prisma } = await import("../lib/prisma")

  const slug = "/about/former-principals"
  const title = "Former Principals"

  // Pulled from: https://donboscocollege.ac.in/about-us/former-principals
  const content = `
    <div class="dbc-page-hero">
      <h2>Former Principals</h2>
      <p>Honoring the leaders who shaped our institution</p>
    </div>

    <p class="text-slate-600">You can update each image later by replacing the placeholder image path.</p>

    <div class="dbc-profile-grid">
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="VETTICKATHADAM CYRIAC" />
        <div>
          <p class="dbc-profile-name">VETTICKATHADAM CYRIAC</p>
          <p class="dbc-profile-meta">Former Principal</p>
          <p class="dbc-profile-meta">1986 – 2011</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="KATTAKAYAM ALEX MATHEW" />
        <div>
          <p class="dbc-profile-name">KATTAKAYAM ALEX MATHEW</p>
          <p class="dbc-profile-meta">Former Principal</p>
          <p class="dbc-profile-meta">2011 – 2013</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="PARANKIMALIL JOHN" />
        <div>
          <p class="dbc-profile-name">PARANKIMALIL JOHN</p>
          <p class="dbc-profile-meta">Former Principal</p>
          <p class="dbc-profile-meta">2013 – 2016</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="PLATHOTTAM GEORGE" />
        <div>
          <p class="dbc-profile-name">PLATHOTTAM GEORGE</p>
          <p class="dbc-profile-meta">Former Principal</p>
          <p class="dbc-profile-meta">2016 – 2017</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="BIVAN RODRIQUES MUKHIM" />
        <div>
          <p class="dbc-profile-name">BIVAN RODRIQUES MUKHIM</p>
          <p class="dbc-profile-meta">Former Principal</p>
          <p class="dbc-profile-meta">2017 – 2024</p>
        </div>
      </div>
    </div>
  `.trim()

  await prisma.page.upsert({
    where: { slug },
    update: {
      title,
      content,
      metaTitle: title,
      metaDescription: "List of former principals of Don Bosco College, Tura.",
      published: true,
    },
    create: {
      title,
      slug,
      content,
      metaTitle: title,
      metaDescription: "List of former principals of Don Bosco College, Tura.",
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

