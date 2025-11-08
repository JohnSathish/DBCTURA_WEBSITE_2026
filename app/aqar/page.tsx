import { prisma } from "@/lib/prisma"

export default async function AQARPage() {
  const page = await prisma.page.findUnique({
    where: { slug: "aqar" },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article>
        <h1 className="text-4xl font-bold mb-6">AQAR</h1>
        {page && page.published ? (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <p className="text-gray-600">
            Content for this page is being prepared. Please check back soon.
          </p>
        )}
      </article>
    </div>
  )
}

