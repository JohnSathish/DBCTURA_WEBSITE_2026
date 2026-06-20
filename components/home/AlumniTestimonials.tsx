"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

type Testimonial = {
  id: string
  name: string
  designation: string
  testimonial: string
  image?: string | null
  rating?: number
}

export default function AlumniTestimonials({
  testimonials,
}: {
  testimonials: Testimonial[]
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const currentTestimonial = testimonials[currentIndex]

  useEffect(() => {
    if (testimonials.length <= 1) return
    if (isHovered) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000) // Auto-advance every 5 seconds
    return () => clearInterval(interval)
  }, [testimonials.length, isHovered])

  if (testimonials.length === 0) {
    return null
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  return (
    <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
      {/* Background (no external images) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0b1f52] via-[#1e3a8a] to-[#2563eb]">
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.35),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(245,158,11,0.22),transparent_60%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.16),transparent_55%)]" />
        {/* subtle abstract shapes */}
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-brand-sun/15 blur-2xl" aria-hidden />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-8 md:mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white/90 ring-1 ring-white/20 backdrop-blur-sm">
            <Star className="h-4 w-4 text-brand-sun" />
            <span className="text-sm font-semibold tracking-wide">Alumni Testimonials</span>
          </div>
          <h2 className="font-heading mt-4 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
            Trusted voices from our alumni
          </h2>
          <p className="mx-auto mt-2 max-w-3xl text-sm text-white/80 md:text-base">
            Real experiences from graduates shaping careers and communities.
          </p>
        </div>

        {/* Testimonial Card */}
        <div
          className="relative mx-auto max-w-3xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="group relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6 md:p-9 lg:p-10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
            {/* Quote icon */}
            <div className="absolute -top-5 left-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-sun text-white shadow-lg ring-4 ring-white/50">
              <Quote className="h-5 w-5" />
            </div>

            {/* Profile Picture */}
            <div className="flex justify-center pt-4 md:pt-2 mb-6">
              <div className="relative">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-brand-sun via-white/60 to-[#2563eb] opacity-90 blur-[2px]" />
                <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full bg-white p-1 shadow-xl">
                  <div className="relative h-full w-full overflow-hidden rounded-full ring-1 ring-black/5">
                    {currentTestimonial.image ? (
                      <Image
                        src={currentTestimonial.image}
                        alt={currentTestimonial.name}
                        fill
                        sizes="(max-width: 768px) 96px, 128px"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-500 text-sm">
                        {currentTestimonial.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Text */}
            <div
              key={currentTestimonial.id}
              className="text-center mb-7 animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              {/* Rating (optional) */}
              <div className="mb-4 flex justify-center gap-1" aria-label="Rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={[
                      "h-4 w-4",
                      i < (currentTestimonial.rating ?? 5) ? "text-brand-sun fill-brand-sun" : "text-slate-200",
                    ].join(" ")}
                  />
                ))}
              </div>
              <p className="text-slate-700 text-base md:text-lg leading-relaxed italic">
                &ldquo;{currentTestimonial.testimonial}&rdquo;
              </p>
            </div>

            {/* Name */}
            <div className="text-center">
              <div className="text-lg md:text-xl font-bold text-slate-900">
                {currentTestimonial.name}
              </div>
              <div className="mt-1 text-sm md:text-base text-slate-600">
                {currentTestimonial.designation}
              </div>
            </div>

            {/* Navigation Arrows */}
            {testimonials.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full md:-translate-x-12 lg:-translate-x-16 text-white hover:bg-white/15 rounded-full h-10 w-10 md:h-12 md:w-12 ring-1 ring-white/20 backdrop-blur-sm"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full md:translate-x-12 lg:translate-x-16 text-white hover:bg-white/15 rounded-full h-10 w-10 md:h-12 md:w-12 ring-1 ring-white/20 backdrop-blur-sm"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                </Button>
              </>
            )}

            {/* Dots Indicator */}
            {testimonials.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={[
                      "h-2 w-2 rounded-full transition-all",
                      index === currentIndex
                        ? "bg-[#2563eb] w-8 shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
                        : "bg-slate-300 hover:bg-slate-400",
                    ].join(" ")}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

