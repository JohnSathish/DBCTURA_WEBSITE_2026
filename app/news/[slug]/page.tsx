import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import Image from "next/image"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const news = await prisma.news.findUnique({
    where: { slug },
  })

  if (!news) {
    return {}
  }

  return {
    title: news.title,
    description: news.excerpt || undefined,
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const news = await prisma.news.findUnique({
    where: { slug },
    include: { author: { select: { email: true } } },
  })

  if (!news || !news.publishedAt) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">{news.title}</h1>
      
      <div className="flex items-center gap-4 text-gray-600 mb-6">
        <time dateTime={news.publishedAt.toISOString()}>
          {new Date(news.publishedAt).toLocaleDateString()}
        </time>
        {news.category && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
            {news.category}
          </span>
        )}
      </div>

      {news.image && (
        <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
          <Image
            src={news.image}
            alt={news.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {news.excerpt && (
        <p className="text-xl text-gray-600 mb-6">{news.excerpt}</p>
      )}

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: news.content }}
      />
    </article>
  )
}

