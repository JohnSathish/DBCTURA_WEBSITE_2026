"use client"

import { useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export type LightboxImage = {
  id: string
  src: string
  alt: string
  title?: string | null
}

export default function GalleryLightbox({
  images,
  index,
  onClose,
  onChange,
}: {
  images: LightboxImage[]
  index: number | null
  onClose: () => void
  onChange: (index: number) => void
}) {
  const goPrev = useCallback(() => {
    if (index === null || images.length === 0) return
    onChange((index - 1 + images.length) % images.length)
  }, [index, images.length, onChange])

  const goNext = useCallback(() => {
    if (index === null || images.length === 0) return
    onChange((index + 1) % images.length)
  }, [index, images.length, onChange])

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [index, onClose, goPrev, goNext])

  if (index === null || !images[index]) return null

  const current = images[index]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 backdrop-blur-sm p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white ring-1 ring-white/20 transition hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white ring-1 ring-white/20 transition hover:bg-white/20 sm:left-6"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white ring-1 ring-white/20 transition hover:bg-white/20 sm:right-6"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      ) : null}

      <div
        className="relative flex max-h-[85vh] w-full max-w-5xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[70vh] w-full overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-2xl">
          <Image
            src={current.src}
            alt={current.alt}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 80vw"
            priority
          />
        </div>
        <div className="mt-4 flex w-full items-center justify-between gap-4 px-1 text-white/90">
          <p className="truncate text-sm font-medium">{current.title || current.alt}</p>
          {images.length > 1 ? (
            <p className="shrink-0 text-xs text-white/60">
              {index + 1} / {images.length}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
