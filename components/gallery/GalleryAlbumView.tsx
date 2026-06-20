"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Expand, Images } from "lucide-react"
import GalleryLightbox, { type LightboxImage } from "@/components/gallery/GalleryLightbox"

export type GalleryPhoto = {
  id: string
  src: string
  title: string | null
}

export default function GalleryAlbumView({
  title,
  description,
  parentAlbum,
  photos,
}: {
  title: string
  description: string | null
  parentAlbum: { id: string; title: string } | null
  photos: GalleryPhoto[]
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const lightboxImages: LightboxImage[] = photos.map((p) => ({
    id: p.id,
    src: p.src,
    alt: p.title || title,
    title: p.title,
  }))

  return (
    <div className="min-h-screen bg-brand-surface">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1E3A8A] to-[#4338ca] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Gallery
          </Link>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              {parentAlbum ? (
                <p className="text-sm text-white/70">
                  Part of{" "}
                  <Link href={`/gallery/albums/${parentAlbum.id}`} className="font-semibold text-cyan-200 hover:underline">
                    {parentAlbum.title}
                  </Link>
                </p>
              ) : null}
              <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">{title}</h1>
              {description ? <p className="mt-3 max-w-3xl text-base text-white/80">{description}</p> : null}
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-md">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Images className="h-4 w-4 text-cyan-300" aria-hidden />
                {photos.length} {photos.length === 1 ? "photo" : "photos"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {photos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center text-slate-500">
            No images in this album yet.
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                <div className="relative">
                  <Image
                    src={photo.src}
                    alt={photo.title || title}
                    width={800}
                    height={600}
                    className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="absolute bottom-3 right-3 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                    <Expand className="h-4 w-4" aria-hidden />
                  </div>
                  {photo.title ? (
                    <p className="absolute bottom-0 left-0 right-0 truncate px-3 py-2 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                      {photo.title}
                    </p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <GalleryLightbox
        images={lightboxImages}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChange={setLightboxIndex}
      />
    </div>
  )
}
