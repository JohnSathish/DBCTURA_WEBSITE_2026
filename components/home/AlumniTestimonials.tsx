"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type Testimonial = {
  id: string
  name: string
  designation: string
  testimonial: string
  image?: string | null
}

export default function AlumniTestimonials({
  testimonials,
  backgroundImage = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop",
}: {
  testimonials: Testimonial[]
  backgroundImage?: string
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (testimonials.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000) // Auto-advance every 5 seconds
    return () => clearInterval(interval)
  }, [testimonials.length])

  if (testimonials.length === 0) {
    return null
  }

  const currentTestimonial = testimonials[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  return (
    <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt="Alumni Testimonials Background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay with blue tint */}
        <div className="absolute inset-0 bg-slate-900/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-8 md:mb-12 text-center bg-white py-4 px-6 inline-block mx-auto block w-fit">
          Alumni Testimonials
        </h2>

        {/* Testimonial Card */}
        <div className="relative max-w-2xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-6 md:p-8 lg:p-10">
            {/* Profile Picture */}
            {currentTestimonial.image && (
              <div className="flex justify-center mb-6">
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg">
                  <Image
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Testimonial Text */}
            <div className="text-center mb-6">
              <p className="text-slate-700 text-base md:text-lg lg:text-xl leading-relaxed italic">
                &ldquo;{currentTestimonial.testimonial}&rdquo;
              </p>
            </div>

            {/* Name */}
            <div className="text-center mb-2">
              <h3 className="text-white text-xl md:text-2xl font-bold bg-slate-800 px-4 py-2 inline-block rounded">
                {currentTestimonial.name}
              </h3>
            </div>

            {/* Designation */}
            <div className="text-center">
              <p className="text-white text-sm md:text-base bg-slate-700 px-4 py-1 inline-block rounded">
                {currentTestimonial.designation}
              </p>
            </div>

            {/* Navigation Arrows */}
            {testimonials.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full md:-translate-x-12 lg:-translate-x-16 text-white hover:bg-white/20 rounded-full h-10 w-10 md:h-12 md:w-12"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full md:translate-x-12 lg:translate-x-16 text-white hover:bg-white/20 rounded-full h-10 w-10 md:h-12 md:w-12"
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
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-slate-800 w-8"
                        : "bg-slate-400 hover:bg-slate-600"
                    }`}
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

