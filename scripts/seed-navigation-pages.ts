import 'dotenv/config'
import { prisma } from "@/lib/prisma"
import { defaultNavigation } from "@/lib/navigation"

// Helper function to flatten navigation items and get all paths
function getAllPaths(items: typeof defaultNavigation): Array<{ path: string; label: string }> {
  const paths: Array<{ path: string; label: string }> = []
  
  function traverse(item: typeof items[number]) {
    // Skip items without href or home page
    if (item.href && item.href !== "/") {
      paths.push({ path: item.href, label: item.label })
    }
    if (item.children && item.children.length > 0) {
      item.children.forEach(traverse)
    }
  }
  
  items.forEach(traverse)
  return paths
}

async function seedNavigationPages() {
  console.log("Starting to seed navigation pages...")
  
  const allPaths = getAllPaths(defaultNavigation)
  console.log(`Found ${allPaths.length} navigation paths to process`)

  let created = 0
  let skipped = 0

  for (const { path, label } of allPaths) {
    try {
      // Remove leading slash for slug
      const slug = path.startsWith("/") ? path.slice(1) : path
      // Use the full path as slug (with leading slash)
      const fullSlug = path

      // Check if page already exists
      const existing = await prisma.page.findUnique({
        where: { slug: fullSlug },
      })

      if (existing) {
        console.log(`Page already exists: ${fullSlug}`)
        skipped++
        continue
      }

      // Create page with default content
      await prisma.page.create({
        data: {
          title: label,
          slug: fullSlug,
          content: `<h2>${label}</h2><p>Content for this page is being prepared. Please check back soon.</p>`,
          published: false, // Set to false so pages need to be published manually
        },
      })

      console.log(`Created page: ${fullSlug}`)
      created++
    } catch (error: any) {
      console.error(`Error creating page ${path}:`, error.message)
    }
  }

  console.log(`\nSummary:`)
  console.log(`- Created: ${created} pages`)
  console.log(`- Skipped: ${skipped} pages (already exist)`)
  console.log(`- Total: ${allPaths.length} pages`)
}

// Run the seed function
seedNavigationPages()
  .then(() => {
    console.log("Seeding completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Seeding failed:", error)
    process.exit(1)
  })


