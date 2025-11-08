"use client"

import { useState } from "react"
import Link from "next/link"

type Logo = {
  src: string
  alt: string
  href?: string
}

function LogoImage({ logo }: { logo: Logo }) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative w-full h-32 md:h-40 lg:h-48 max-w-[200px] md:max-w-[240px] lg:max-w-[280px] flex-shrink-0">
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border-2 border-dashed border-purple-300">
          <span className="text-xs text-purple-600 text-center px-2 font-medium">{logo.alt}</span>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg animate-pulse">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={logo.src}
            alt={logo.alt}
            className={`w-full h-full object-contain rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}`}
            onError={() => {
              setHasError(true)
              setIsLoading(false)
            }}
            onLoad={() => setIsLoading(false)}
            loading="lazy"
          />
        </>
      )}
    </div>
  )
}

export default function LogoSlider({ logos, title }: { logos: Logo[]; title: string }) {
  const [isPaused, setIsPaused] = useState(false)

  if (logos.length === 0) return null

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...logos, ...logos]

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 text-center">
          {title}
        </h2>
        
        <div className="relative">
          {/* Scrolling Logos Container */}
          <div 
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className={`flex items-center gap-6 md:gap-8 lg:gap-12 animate-scroll-logos ${isPaused ? 'pause-animation' : ''}`}>
              {duplicatedLogos.map((logo, idx) => {
                const logoContent = (
                  <div className="flex-shrink-0 flex items-center justify-center transition-transform duration-300 hover:scale-105">
                    <LogoImage logo={logo} />
                  </div>
                )

                if (logo.href) {
                  return (
                    <Link
                      key={`${logo.alt}-${idx}`}
                      href={logo.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {logoContent}
                    </Link>
                  )
                }

                return (
                  <div key={`${logo.alt}-${idx}`}>
                    {logoContent}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

