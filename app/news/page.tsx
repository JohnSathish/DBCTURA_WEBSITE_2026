import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

// Read live DB at request time (runtime volume), not build-time snapshot.
export const dynamic = "force-dynamic"

export default async function NewsPage() {
  const news = await prisma.news.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { email: true } } },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-2 text-sm text-brand-text/70 hover:text-brand-hover transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <h1 className="text-4xl font-bold mb-8">News & Updates</h1>

      {news.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No news available yet. Check back soon!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Link key={item.id} href={`/news/${item.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                {item.image && (
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden relative">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                  {item.excerpt && (
                    <CardDescription className="line-clamp-3">
                      {item.excerpt}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {item.publishedAt && (
                    <p className="text-sm text-gray-500">
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

