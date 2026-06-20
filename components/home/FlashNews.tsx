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

  return (
    <div
      className="bg-[#0c2340] text-white py-2.5 md:py-3 overflow-hidden relative border-b border-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Fixed labels — never overlap the scrolling ticker */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <MegaphoneIcon className="h-5 w-5 md:h-6 md:w-6 shrink-0 text-amber-400 drop-shadow-sm" />
            <span className="shrink-0 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              New
            </span>
          </div>

          {/* Ticker only — clipped so text cannot slide under the icons/badges */}
          <div className="relative min-w-0 flex-1 overflow-hidden">
            <Link
              href={`/flash-news/${currentItem.id}`}
              className="block overflow-hidden hover:opacity-90 transition-opacity"
            >
              <div
                className={`animate-marquee inline-flex w-max whitespace-nowrap ${isHovered ? "pause-animation" : ""}`}
              >
                {[0, 1].map((dup) => (
                  <span
                    key={dup}
                    className="inline-flex items-center gap-2 pr-10 text-sm md:text-base font-medium leading-relaxed"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/flash-news.gif"
                      alt=""
                      width={24}
                      height={24}
                      className="h-5 w-5 md:h-6 md:w-6 object-contain shrink-0"
                    />
                    {currentItem.title}
                  </span>
                ))}
              </div>
            </Link>
          </div>

          <Link
            href="/notice-board"
            className="shrink-0 rounded-lg border border-white/35 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:px-3 sm:text-sm"
          >
            View All Notices
          </Link>
        </div>
      </div>
    </div>
  )
}
