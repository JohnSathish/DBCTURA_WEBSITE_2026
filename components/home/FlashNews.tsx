"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Megaphone } from "lucide-react"

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

export default function FlashNews({ items }: FlashNewsProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Rotate through items every 5 seconds
  useEffect(() => {
    if (items.length === 0 || isHovered) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [items.length, isHovered])

  if (items.length === 0) {
    return null
  }

  const currentItem = items[currentIndex]

  return (
    <div
      className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white py-2 md:py-3 overflow-hidden relative shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="shrink-0 flex-shrink-0">
            <Megaphone className="h-5 w-5 md:h-6 md:w-6 text-white flex-shrink-0 drop-shadow-sm" strokeWidth={2} />
          </div>
          <div className="flex-1 overflow-hidden relative">
            <Link 
              href={`/flash-news/${currentItem.id}`}
              className="block hover:opacity-90 transition-opacity"
            >
              <div className={`animate-marquee whitespace-nowrap inline-block ${isHovered ? 'pause-animation' : ''}`}>
                <span className="inline-block text-sm md:text-base font-medium leading-relaxed pr-8 flex items-center gap-2">
                  <Image
                    src="/flash-news.gif"
                    alt=""
                    width={24}
                    height={24}
                    className="h-5 w-5 md:h-6 md:w-6 object-contain inline-block flex-shrink-0"
                    unoptimized
                    suppressHydrationWarning
                  />
                  {currentItem.title}
                </span>
                <span className="inline-block text-sm md:text-base font-medium leading-relaxed pr-8 flex items-center gap-2">
                  <Image
                    src="/flash-news.gif"
                    alt=""
                    width={24}
                    height={24}
                    className="h-5 w-5 md:h-6 md:w-6 object-contain inline-block flex-shrink-0"
                    unoptimized
                    suppressHydrationWarning
                  />
                  {currentItem.title}
                </span>
              </div>
            </Link>
            
            {/* Dots indicator */}
            {items.length > 1 && (
              <div className="absolute bottom-0 right-0 flex gap-1 mb-1">
                {items.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
