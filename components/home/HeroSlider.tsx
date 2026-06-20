"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Slide = {
  src: string
  alt?: string
  caption?: string
}

export default function HeroSlider({
  slides,
  intervalMs = 6000,
}: {
  slides: Slide[]
  intervalMs?: number
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, intervalMs)
    return () => clearInterval(t)
  }, [slides.length, intervalMs])

  const current = slides[index] || slides[0]

  // Ensure we have a valid slide
  if (!current || !slides.length) {
    return null
  }

  return (
    <div className="relative w-full overflow-hidden bg-brand-navy-deep" suppressHydrationWarning>
      <div className="relative h-[360px] md:h-[580px] lg:h-[720px]">
        <Image
          src={current.src}
          alt={current.alt || current.caption || "Hero"}
          fill
          priority
          className="object-cover"
          suppressHydrationWarning
        />

        {/* Overlay removed: keep hero image true-to-color */}

        {/* Controls */}
        {slides.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous slide"
              onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next slide"
              onClick={() => setIndex((index + 1) % slides.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Caption */}
        {current?.caption && (
          <div className="absolute inset-0 flex items-end md:items-center justify-center z-20">
            <div className="px-4 sm:px-6 lg:px-8 w-full">
              <div className="flex justify-center pb-16 md:pb-0">
                <span className="inline-block bg-brand-navy-deep/88 text-white border border-brand-sun/40 px-4 md:px-6 py-2 md:py-3 rounded text-sm md:text-xl font-medium tracking-wide shadow-lg">
                  {current.caption}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              aria-label={`Go to slide ${i + 1}`}
            />)
          )}
        </div>
      )}
    </div>
  )
}


