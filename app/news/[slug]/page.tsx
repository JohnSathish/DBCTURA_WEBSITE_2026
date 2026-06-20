import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"

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
    <div className="min-h-screen bg-brand-navy py-8 sm:py-12 md:py-14 px-4 sm:px-6">
      <BreadcrumbTitleSetter title={news.title} />
      <article
        lang="en"
        className="max-w-3xl mx-auto bg-brand-cream rounded-2xl border border-brand-gold/35 shadow-xl overflow-hidden"
      >
        <div className="px-6 sm:px-10 py-8 md:py-10">
          <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-brand-text/70 hover:text-brand-hover transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Link>

            <span className="text-brand-text/30 select-none">|</span>

            <div className="inline-flex items-center gap-2 min-w-0">
              <Link href="/" className="text-brand-navy/70 hover:text-brand-maroon transition-colors">
                Home
              </Link>
              <span className="text-brand-text/40 select-none">/</span>
              <Link href="/news" className="text-brand-navy/70 hover:text-brand-maroon transition-colors">
                News
              </Link>
            </div>
          </div>

          <h1 className="text-brand-navy text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-center sm:text-left mb-3">
            {news.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-sm text-brand-text/70 mb-6 pb-4 border-b border-brand-gold/30">
            <time dateTime={news.publishedAt.toISOString()}>
              {new Date(news.publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>

          {news.image && (
            <div className="relative aspect-video mb-8 rounded-xl overflow-hidden border border-brand-gold/25 shadow-md">
              <Image
                src={news.image}
                alt={news.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 42rem"
              />
            </div>
          )}

          {news.excerpt && (
            <p className="text-lg text-brand-text/90 leading-relaxed text-justify hyphens-auto mb-8 font-medium">
              {news.excerpt}
            </p>
          )}

          <div
            className="news-article-body text-base sm:text-lg text-brand-text leading-[1.75] hyphens-auto
              [&_p]:text-justify [&_p]:text-pretty [&_p]:mb-5 [&_p:last-child]:mb-0
              [&_strong]:text-brand-navy [&_a]:text-brand-hover [&_a]:underline underline-offset-2 [&_a:hover]:text-brand-maroon
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
              [&_li]:mb-1 [&_h2]:text-brand-navy [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </article>
    </div>
  )
}

