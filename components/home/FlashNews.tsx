"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface FlashNewsItem {
  id: string
  title: string
  description?: string | null
  file?: string | null
  fileType?: string | null
}

interface FlashNewsProps {
  items: FlashNewsItem[]
}

function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
      <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" />
      <path d="M8 6v8" />
    </svg>
  )
}

export default function FlashNews({ items }: FlashNewsProps) {
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || items.length === 0 || isHovered) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [mounted, items.length, isHovered])

  if (items.length === 0) {
    return null
  }

  const safeIndex = mounted ? currentIndex : 0
  const currentItem = items[safeIndex] ?? items[0]
  const title = currentItem.title.trim()

  return (
    <div
      className="flash-news-bar w-full max-w-[100vw] overflow-hidden border-b border-white/10 bg-[#0c2340] text-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <MegaphoneIcon className="h-5 w-5 shrink-0 text-amber-400 drop-shadow-sm md:h-6 md:w-6" />
            <span className="shrink-0 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              New
            </span>
          </div>

          {/* Clipped ticker — animation stays inside, never widens the page */}
          <div className="flash-news-ticker relative min-h-[1.75rem] min-w-0 flex-1 overflow-hidden md:min-h-[2rem]">
            <Link
              href={`/flash-news/${currentItem.id}`}
              className="absolute inset-0 flex items-center overflow-hidden hover:opacity-90"
              title={title}
            >
              <div
                className={`flash-news-marquee flex w-max items-center whitespace-nowrap ${isHovered ? "pause-animation" : ""}`}
              >
                {[0, 1].map((dup) => (
                  <span
                    key={dup}
                    className="inline-flex max-w-none items-center gap-2 pr-8 text-sm font-medium leading-snug md:pr-12 md:text-base"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/flash-news.gif"
                      alt=""
                      width={24}
                      height={24}
                      className="h-5 w-5 shrink-0 object-contain md:h-6 md:w-6"
                    />
                    <span>{title}</span>
                  </span>
                ))}
              </div>
            </Link>
          </div>

          <Link
            href="/notice-board"
            className="hidden shrink-0 rounded-lg border border-white/35 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:inline-block sm:px-3 sm:text-sm"
          >
            View All Notices
          </Link>
          <Link
            href="/notice-board"
            className="shrink-0 rounded-lg border border-white/35 bg-white/5 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:hidden"
          >
            Notices
          </Link>
        </div>
      </div>
    </div>
  )
}
