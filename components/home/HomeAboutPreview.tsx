import Link from "next/link"
import Image from "next/image"
import NewsSidebar from "@/components/home/NewsSidebar"

type AboutPage = { content: string | null } | null

export default function HomeAboutPreview({
  about,
  noticeBoardNotices,
}: {
  about: AboutPage
  noticeBoardNotices: Array<{
    id: string
    title: string
    noticeType: string
    pdfUrl: string | null
    imageUrl: string | null
    publishDate: Date
    important: boolean
    pinned: boolean
  }>
}) {
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2 lg:h-[520px]">
            <div className="h-full overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/[0.06] ring-1 ring-slate-900/[0.04] transition-shadow duration-300 hover:shadow-2xl hover:shadow-slate-900/[0.08]">
              <div className="border-b border-amber-500/90 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-6 py-4">
                <h2 className="font-heading text-xl font-bold text-white md:text-2xl">
                  Welcome to Don Bosco College, Tura
                </h2>
              </div>
              <div className="p-6 sm:p-8">
                {about?.content ? (
                  <div className="prose prose-slate max-w-none text-slate-700 prose-headings:font-heading prose-p:leading-relaxed">
                    <div className="relative float-left mr-6 mb-4 w-48 md:w-64">
                      <div className="relative aspect-[256/340] w-full overflow-hidden rounded-2xl shadow-md">
                        <Image
                          src="/don-bosco.jpg"
                          alt="Saint John Bosco"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 192px, 256px"
                          priority
                        />
                      </div>
                    </div>
                    <div
                      className="overflow-auto pr-1"
                      dangerouslySetInnerHTML={{ __html: about.content }}
                      suppressHydrationWarning
                    />
                    <div className="clear-both" />
                  </div>
                ) : (
                  <div className="prose prose-slate max-w-none text-slate-700">
                    <div className="relative float-left mr-6 mb-4 w-48 md:w-64">
                      <div className="relative aspect-[256/340] w-full overflow-hidden rounded-2xl shadow-md">
                        <Image
                          src="/don-bosco.jpg"
                          alt="Saint John Bosco"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 192px, 256px"
                          priority
                        />
                      </div>
                    </div>
                    <p>
                      Saint John Bosco, popularly known as Don Bosco, was a priest of the Catholic Church, who came to
                      the rescue of the poor, disadvantaged youth of his time with his innovative method of educating
                      them through total immersion in their world, with personal involvement in their lives and
                      aspirations, with a dedication that was total.
                    </p>
                    <p>
                      The system of education that he envisioned aims to create generations of young men and women who are
                      intellectually competent, morally upright, socially committed, spiritually inspired and devoted to
                      their country and the world.
                    </p>
                  </div>
                )}
                <div className="mt-8 clear-both">
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center rounded-xl bg-[#1E3A8A] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#2563EB] hover:shadow-lg"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 lg:h-[520px]">
            <div className="h-full w-full">
              <NewsSidebar items={noticeBoardNotices || []} pageSize={4} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
