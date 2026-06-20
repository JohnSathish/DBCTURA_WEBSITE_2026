export {}

async function main() {
  // Ensure Prisma can run even if user has no .env yet.
  if (!process.env.DATABASE_URL) {
    // `lib/prisma.ts` resolves `file:./...` relative to the `prisma/` directory.
    process.env.DATABASE_URL = "file:./prisma/dev.db"
  }

  const { prisma } = await import("../lib/prisma")

  const slug = "/about/former-vice-principals"
  const title = "Former Vice Principals"

  // Pulled from: https://donboscocollege.ac.in/about-us/former-vice-principals
  const content = `
    <div class="dbc-page-hero">
      <h2>Former Vice Principals</h2>
      <p>Honoring the leaders who shaped our institution</p>
    </div>

    <p class="text-slate-600">You can update each image later by replacing the placeholder image path.</p>
    <div class="dbc-profile-grid">
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR THOMAS MANOORAMPARAMPIL" />
        <div>
          <p class="dbc-profile-name">FR THOMAS MANOORAMPARAMPIL</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">1992 – 1994</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR THOMAS KUNNAPPALLIL" />
        <div>
          <p class="dbc-profile-name">FR THOMAS KUNNAPPALLIL</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">1994 – 2001</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR JOY KACHAPPILLY" />
        <div>
          <p class="dbc-profile-name">FR JOY KACHAPPILLY</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">2001 – 2005</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR JOBY MANJAKATTIL" />
        <div>
          <p class="dbc-profile-name">FR JOBY MANJAKATTIL</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">2004 – 2006</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR ALEX MATHEW KATTAKAYAM" />
        <div>
          <p class="dbc-profile-name">FR ALEX MATHEW KATTAKAYAM</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">2006 – 2011</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR JANUARIUS S. SANGMA" />
        <div>
          <p class="dbc-profile-name">FR JANUARIUS S. SANGMA</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">2008 – 2008</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR PIUS THARAKUNNEL" />
        <div>
          <p class="dbc-profile-name">FR PIUS THARAKUNNEL</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">2010 – 2015</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR PRADEEP EKKA" />
        <div>
          <p class="dbc-profile-name">FR PRADEEP EKKA</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">2014 – 2015</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR JOGESH B. SANGMA" />
        <div>
          <p class="dbc-profile-name">FR JOGESH B. SANGMA</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">2013 – 2016</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR ROBERT FAUSTIN LALFAKZUALA" />
        <div>
          <p class="dbc-profile-name">FR ROBERT FAUSTIN LALFAKZUALA</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">2015 – 2017</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR JIMMY T. SANGMA" />
        <div>
          <p class="dbc-profile-name">FR JIMMY T. SANGMA</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">2016 – 2017</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR ALBERT K. SANGMA" />
        <div>
          <p class="dbc-profile-name">FR ALBERT K. SANGMA</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">2016 – 2017</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR ALBINUS DHANWAR" />
        <div>
          <p class="dbc-profile-name">FR ALBINUS DHANWAR</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">2019 – 2020</p>
        </div>
      </div>
      <div class="dbc-profile-card">
        <img class="dbc-profile-avatar" src="/placeholders/profile-placeholder.svg" alt="FR. ABHILASH V J" />
        <div>
          <p class="dbc-profile-name">FR. ABHILASH V J</p>
          <p class="dbc-profile-meta">Former Vice Principal</p>
          <p class="dbc-profile-meta">2020 – 2022</p>
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
      metaDescription: "List of former vice principals of Don Bosco College, Tura.",
      published: true,
    },
    create: {
      title,
      slug,
      content,
      metaTitle: title,
      metaDescription: "List of former vice principals of Don Bosco College, Tura.",
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

