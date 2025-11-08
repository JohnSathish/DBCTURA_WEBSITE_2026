"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

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
    if (!searchQuery.trim()) {
      return items
    }

    const query = searchQuery.toLowerCase().trim()
    return items.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.excerpt?.toLowerCase().includes(query)
    )
  }, [items, searchQuery])

  return (
    <section className="py-6 md:py-10 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-2 border-purple-300 shadow-lg">
          <CardHeader className="pb-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <span className="text-2xl">■</span>
                <span>News Highlights</span>
              </CardTitle>
              {/* Search Bar */}
              <div className="relative w-full sm:w-auto sm:min-w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  type="text"
                  placeholder="Search news by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/90 text-gray-900 border-purple-200 focus:bg-white"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredItems.length > 0 ? (
              <>
                {searchQuery && (
                  <p className="text-sm text-gray-600 mb-4">
                    Found {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} for "{searchQuery}"
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  {filteredItems.map((item) => {
                    const date = item.publishedAt ? new Date(item.publishedAt) : null
                    const formattedDate = date
                      ? date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : ""

                    return (
                      <Link
                        key={item.id}
                        href={`/news/${item.slug}`}
                        className="border-2 border-purple-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:border-purple-400 transition-all bg-white flex flex-col transform hover:-translate-y-1"
                      >
                        <div className="relative w-full h-40">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 flex flex-col flex-grow">
                          {formattedDate && (
                            <p className="text-[10px] text-slate-500 mb-1.5">{formattedDate}</p>
                          )}
                          <h3 className="font-bold text-sm text-slate-900 mb-1.5 leading-tight hover:text-blue-700 transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          {item.excerpt && (
                            <p className="text-xs text-slate-600 line-clamp-2 flex-grow">
                              {item.excerpt}
                            </p>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
                {!searchQuery && (
                  <div className="text-center">
                    <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 rounded-lg shadow-lg">
                      <Link href="/news">Read More</Link>
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? (
                  <p>No news found matching "{searchQuery}"</p>
                ) : (
                  <p>No featured news available.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

