"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, GraduationCap, PlayCircle } from "lucide-react"

const DEFAULT_ADMISSION_URL = "https://admissionsdbctura.com/register"
const FADE_MS = 700

type Slide = {
  src: string
  alt?: string
  caption?: string
}

export default function HeroPremium({
  slides,
  intervalMs = 9000,
}: {
  slides: Slide[]
  intervalMs?: number
}) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [paused, setPaused] = useState(false)
  const [applyNowUrl, setApplyNowUrl] = useState(DEFAULT_ADMISSION_URL)
  const transitioningRef = useRef(false)
  const list = slides.length > 0 ? slides : [{ src: "/hero/slide1.jpg" }]
  const current = list[index] ?? list[0]

  const transitionTo = useCallback(
    (nextIndex: number) => {
      if (list.length <= 1 || transitioningRef.current) return
      const normalized = ((nextIndex % list.length) + list.length) % list.length
      if (normalized === index) return

      transitioningRef.current = true
      setVisible(false)

      window.setTimeout(() => {
        setIndex(normalized)
        requestAnimationFrame(() => {
          setVisible(true)
          window.setTimeout(() => {
            transitioningRef.current = false
          }, FADE_MS)
        })
      }, FADE_MS)
    },
    [index, list.length]
  )

  const goNext = useCallback(() => transitionTo(index + 1), [index, transitionTo])
  const goPrev = useCallback(() => transitionTo(index - 1), [index, transitionTo])

  useEffect(() => {
    let cancelled = false
    fetch("/api/settings/admission-links", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        const url = String(j?.applyNowUrl || "").trim()
        setApplyNowUrl(url || DEFAULT_ADMISSION_URL)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (list.length <= 1 || paused) return
    const t = setInterval(goNext, intervalMs)
    return () => clearInterval(t)
  }, [list.length, intervalMs, paused, goNext])

  useEffect(() => {
    const preload = (src: string) => {
      const img = new window.Image()
      img.src = src
    }
    preload(list[index]?.src)
    preload(list[(index + 1) % list.length]?.src)
    preload(list[(index - 1 + list.length) % list.length]?.src)
  }, [list, index])

  if (!current?.src) return null

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0f172a]"
      aria-label="Hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[min(68vh,720px)] sm:h-[min(72vh,780px)] md:h-[min(75vh,820px)]">
        {/* Single slide — fade out, swap, fade in (no overlapping zoom = no shake) */}
        <div className="absolute inset-0 overflow-hidden bg-[#0a1628]">
          <div
            className="absolute inset-0 transition-opacity ease-in-out motion-reduce:transition-none"
            style={{
              opacity: visible ? 1 : 0,
              transitionDuration: `${FADE_MS}ms`,
            }}
          >
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt || current.caption || "Don Bosco College, Tura campus"}
              fill
              priority={index === 0}
              className="object-cover object-center"
              sizes="100vw"
              draggable={false}
            />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-r from-[#0a1628]/92 via-[#0a1628]/55 to-[#0a1628]/25" />
        <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-[#0a1628]/80 via-transparent to-[#0a1628]/20" />

        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/95 sm:text-sm">
                Don Bosco College, Tura
              </p>
              <h1 className="font-heading mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
                Empowering Minds.
              </h1>
              <p className="font-heading mt-1 text-4xl font-bold leading-[1.08] tracking-tight text-amber-400 sm:text-5xl md:text-6xl">
                Transforming Futures.
              </p>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base md:text-lg">
                A premier institution dedicated to academic excellence, character formation, and holistic development
                in the heart of Meghalaya.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/explore-courses"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:bg-amber-300 sm:text-base"
                >
                  <GraduationCap className="h-5 w-5" aria-hidden />
                  Explore Programs
                </Link>
                <Link
                  href="/gallery"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/50 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 sm:text-base"
                >
                  <PlayCircle className="h-5 w-5" aria-hidden />
                  Discover Campus
                </Link>
                <Link
                  href={applyNowUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center justify-center rounded-xl border border-amber-400/50 px-5 py-3.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/10"
                >
                  Apply Now →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {list.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 sm:left-6 sm:h-12 sm:w-12"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 sm:right-6 sm:h-12 sm:w-12"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center gap-2 sm:bottom-28">
              {list.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => transitionTo(i)}
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${
                    i === index ? "w-8 bg-amber-400" : "w-2 bg-white/70 hover:bg-white"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
