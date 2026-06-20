"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

type Logo = {
  src: string
  alt: string
  href?: string
}

function useLogoImageState(src: string) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setHasError(false)
    setIsLoading(true)
    const img = imgRef.current
    if (!img) return

    if (img.complete) {
      if (img.naturalWidth > 0) {
        setIsLoading(false)
      } else {
        setHasError(true)
        setIsLoading(false)
      }
    }
  }, [src])

  return {
    imgRef,
    hasError,
    isLoading,
    onError: () => {
      setHasError(true)
      setIsLoading(false)
    },
    onLoad: () => setIsLoading(false),
  }
}

function MarqueeLogo({ logo }: { logo: Logo }) {
  const { imgRef, hasError, isLoading, onError, onLoad } = useLogoImageState(logo.src)

  const inner = (
    <div className="group relative flex h-[86px] w-[clamp(140px,16vw,220px)] items-center justify-center rounded-xl bg-white/90 p-3 shadow-sm ring-1 ring-black/[0.04] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:h-[98px] md:p-3.5">
      {hasError ? (
        <span className="text-center text-sm font-medium leading-snug text-brand-text">
          {logo.alt}
        </span>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-brand-gold/35 border-t-brand-gold-bright" />
            </div>
          )}
          <img
            ref={imgRef}
            src={logo.src}
            alt={logo.alt}
            className={[
              "h-auto w-auto max-w-full object-contain transition-all duration-300",
              "max-h-[66px] md:max-h-[76px]",
              "grayscale-[0.85] contrast-[0.95] group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-[1.06]",
              isLoading ? "opacity-0" : "opacity-100",
            ].join(" ")}
            onError={onError}
            onLoad={onLoad}
            loading="eager"
            decoding="async"
          />
        </>
      )}
    </div>
  )

  if (logo.href) {
    return (
      <Link
        href={logo.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg outline-none ring-brand-gold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-surface"
        aria-label={logo.alt}
        title={logo.alt}
      >
        {inner}
      </Link>
    )
  }

  return <div title={logo.alt}>{inner}</div>
}

function LogoCard({
  logo,
  className = "",
  imgClassName = "",
}: {
  logo: Logo
  className?: string
  imgClassName?: string
}) {
  const { imgRef, hasError, isLoading, onError, onLoad } = useLogoImageState(logo.src)

  const inner = (
    <div
      className={[
        "group flex flex-col overflow-hidden rounded-2xl border border-brand-gold/30 bg-white shadow-md ring-1 ring-black/[0.03] transition-all duration-200 hover:border-brand-gold/55 hover:shadow-xl",
        className,
      ].join(" ")}
    >
      <div className="relative flex flex-1 items-center justify-center p-2">
        {hasError ? (
          <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-brand-gold/45 bg-brand-surface/60 px-3 py-4">
            <span className="text-center text-sm font-medium leading-snug text-brand-text">
              {logo.alt}
            </span>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-2 flex items-center justify-center rounded-xl bg-brand-surface/90">
                <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-brand-gold/35 border-t-brand-gold-bright md:h-12 md:w-12" />
              </div>
            )}
            <img
              ref={imgRef}
              src={logo.src}
              alt={logo.alt}
              className={[
                "mx-auto h-auto w-auto max-w-full object-contain transition-opacity duration-300",
                imgClassName,
                isLoading ? "opacity-0" : "opacity-100",
              ].join(" ")}
              onError={onError}
              onLoad={onLoad}
              loading="eager"
              decoding="async"
            />
          </>
        )}
      </div>
    </div>
  )

  if (logo.href) {
    return (
      <Link
        href={logo.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full min-w-0 rounded-2xl outline-none ring-brand-gold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-surface"
      >
        {inner}
      </Link>
    )
  }

  return <div className="min-w-0">{inner}</div>
}

export default function LogoSlider({
  logos,
  title,
  subtitle,
}: {
  logos: Logo[]
  title: string
  subtitle?: string
}) {
  if (logos.length === 0) return null

  // Duplicate for seamless marquee loop.
  const loopLogos = [...logos, ...logos]

  return (
    <section className="border-y border-brand-gold/30 bg-gradient-to-b from-brand-surface via-brand-surface to-brand-cream/40 py-11 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-brand-navy md:text-3xl lg:text-[2rem]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mx-auto mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
              {subtitle}
            </p>
          ) : null}
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-brand-gold md:mt-4 md:w-20" aria-hidden />
        </div>

        <div className="marquee relative overflow-hidden">
          {/* Soft edge fade */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-brand-surface to-transparent md:w-16"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-brand-surface to-transparent md:w-16"
            aria-hidden
          />

          <div className="animate-marquee flex w-max flex-nowrap items-center gap-12 py-2 md:gap-16">
            {loopLogos.map((logo, idx) => (
              <div key={`${logo.src}-${logo.alt}-${idx}`} className="shrink-0">
                <MarqueeLogo logo={logo} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
