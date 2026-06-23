"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, Search } from "lucide-react"
import { formatNewsCardDate } from "@/lib/format-date"

type NewsItem = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  image: string | null
  publishedAt: Date | null
}

export default function NewsHighlights({ items }: { items: NewsItem[] }) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items
    const query = searchQuery.toLowerCase().trim()
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) || item.excerpt?.toLowerCase().includes(query)
    )
  }, [items, searchQuery])

  return (
    <section className="relative border-y border-slate-200/80 bg-white py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-slate-200/90 shadow-xl shadow-slate-900/5">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="font-heading text-xl text-white md:text-2xl">News &amp; Events</CardTitle>
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                <Input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-white/25 bg-white/10 pl-10 text-white placeholder:text-white/60 focus-visible:ring-amber-400"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {filteredItems.length > 0 ? (
              <>
                {searchQuery ? (
                  <p className="mb-4 text-sm text-slate-600">
                    {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
                  </p>
                ) : null}

                <div className="flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
                  {filteredItems.map((item) => {
                    const { day, month: mon } = formatNewsCardDate(item.publishedAt)

                    return (
                      <Link
                        key={item.id}
                        href={`/news/${item.slug}`}
                        className="group relative w-[min(100%,280px)] shrink-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="280px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                              No image
                            </div>
                          )}
                          {date ? (
                            <div className="absolute left-3 top-3 flex flex-col items-center rounded-lg bg-white/95 px-2.5 py-1.5 text-center shadow-md ring-1 ring-slate-200/80">
                              <span className="text-[10px] font-bold leading-none text-amber-600">{mon}</span>
                              <span className="font-heading text-lg font-bold leading-none text-slate-900">{day}</span>
                            </div>
                          ) : null}
                        </div>
                        <div className="p-4">
                          <h3 className="font-heading line-clamp-2 text-sm font-bold text-slate-900 transition-colors group-hover:text-[#1E3A8A]">
                            {item.title}
                          </h3>
                          {item.excerpt ? (
                            <p className="mt-2 line-clamp-2 text-xs text-slate-600">{item.excerpt}</p>
                          ) : null}
                          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB]">
                            Read story
                            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {!searchQuery ? (
                  <div className="mt-8 text-center">
                    <Button
                      asChild
                      className="rounded-xl bg-amber-500 px-8 py-6 text-base font-semibold text-slate-900 hover:bg-amber-400"
                    >
                      <Link href="/news">All News &amp; Events</Link>
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="py-10 text-center text-slate-500">
                {searchQuery ? <p>No news found.</p> : <p>No featured news available.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
